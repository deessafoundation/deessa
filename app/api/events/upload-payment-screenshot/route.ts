import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * POST /api/events/upload-payment-screenshot
 *
 * Uploads a payment screenshot to the private event-payment-screenshots bucket.
 * Used by public (unauthenticated) users during event registration to upload
 * proof of manual bank/wallet payment.
 *
 * Body: FormData with 'file' field
 *
 * Security:
 * - Server-side file type validation (images only)
 * - Magic-byte verification (validates file content matches claimed MIME type)
 * - Server-side file size validation (5MB max)
 * - Rate limiting (5 uploads per IP per 15 minutes)
 * - Service role upload (bypasses RLS for private bucket)
 * - Returns storage path only (not a signed URL)
 *
 * The storage path is stored in event_registrations.payment_screenshot_url.
 * Admin views the screenshot via a server-minted signed URL.
 */

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const BUCKET = "event-payment-screenshots";

// Magic bytes for file type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (bytes 0-3)
};

function verifyMagicBytes(buffer: ArrayBuffer, claimedType: string): boolean {
  const bytes = new Uint8Array(buffer);

  // Check JPEG: starts with FF D8 FF
  if (claimedType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  // Check PNG: starts with 89 50 4E 47
  if (claimedType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  // Check GIF: starts with GIF8 (GIF87a or GIF89a)
  if (claimedType === "image/gif") {
    return (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38
    );
  }

  // Check WEBP: starts with RIFF, bytes 8-12 should be "WEBP"
  if (claimedType === "image/webp") {
    const riff =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46;
    const webp =
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;
    return riff && webp;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = getClientIP(request) || "unknown";

    const rateLimit = await checkRateLimit({
      identifier: `event-payment-screenshot:ip:${ip}`,
      maxAttempts: 5,
      windowMinutes: 15,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Too many upload attempts. Please wait a few minutes before trying again.",
        },
        { status: 429 },
      );
    }

    // ── Parse form data ───────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // ── Validate file type ────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid file type. Allowed: JPEG, PNG, WEBP, GIF (received: ${file.type || "unknown"})`,
        },
        { status: 400 },
      );
    }

    // ── Validate file size ────────────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `File too large. Maximum size is ${MAX_SIZE_MB}MB (received: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        },
        { status: 400 },
      );
    }

    // ── Read file buffer for magic byte verification ──────────────────────
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ── Verify magic bytes match claimed MIME type ────────────────────────
    if (!verifyMagicBytes(fileBuffer.buffer, file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "File content does not match the claimed file type.",
        },
        { status: 400 },
      );
    }

    // ── Generate unique file path ─────────────────────────────────────────
    const timestamp = Date.now();
    const randomId = crypto.randomUUID();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `event-registrations/${fileName}`;

    // ── Upload to private bucket using service role ────────────────────────
    const supabase = createServiceRoleClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Payment screenshot upload error:", uploadError);
      return NextResponse.json(
        { ok: false, error: "Upload failed. Please try again." },
        { status: 500 },
      );
    }

    // ── Return storage path (NOT a signed URL) ────────────────────────────
    // The path is stored in event_registrations.payment_screenshot_url.
    // Admin generates signed URLs server-side when viewing the registration.
    return NextResponse.json({
      ok: true,
      path: filePath,
      message: "Screenshot uploaded successfully",
    });
  } catch (err) {
    console.error("Payment screenshot API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
