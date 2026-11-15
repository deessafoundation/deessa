import { headers } from "next/headers"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"

export type AuditDomain =
  | "TREASURY"
  | "DONATION"
  | "CONTENT"
  | "EVENTS"
  | "EVENT"
  | "ACCESS"
  | "AUTH"
  | "SECURITY"
  | "MEDIA"
  | "SETTINGS"
  | "CRM"
  | "COMMUNICATION"
  | "COMMUNICATIONS"
  | "VOLUNTEER"
  | "SYSTEM"
  | (string & {})

export type AuditStatus = "SUCCESS" | "FAILURE" | "WARNING"

export interface AuditLogPayload {
  action: string
  domain: AuditDomain
  entityType: string
  entityId?: string | number | null
  summary?: string
  description?: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  status?: AuditStatus
  errorMessage?: string
  actorId?: string
  actorEmail?: string
  actorRole?: string
  ipAddress?: string
  userAgent?: string
  durationMs?: number
  requestId?: string
}

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "confirmpassword",
  "currentpassword",
  "secret",
  "token",
  "apikey",
  "stripesecretkey",
  "service_role_key",
  "cardnumber",
  "card_number",
  "cvv",
  "cvc",
  "authorization",
  "cookie",
])

/**
 * Recursively deep-clones an object while replacing sensitive security keys with [REDACTED].
 */
export function sanitizeAuditData<T>(data: T): T {
  if (data === null || data === undefined) return data
  if (typeof data !== "object") return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item)) as unknown as T
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes("password") || lowerKey.includes("secret")) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Computes a concise key-level delta between old and new state objects.
 */
export function computeAuditDiff(
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null
): Record<string, { old: unknown; new: unknown }> | null {
  if (!oldData || !newData) return null

  const diff: Record<string, { old: unknown; new: unknown }> = {}
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

  for (const key of allKeys) {
    const oldVal = oldData[key]
    const newVal = newData[key]

    // Skip identical values
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal ?? null, new: newVal ?? null }
    }
  }

  return Object.keys(diff).length > 0 ? diff : null
}

/**
 * Logs an administrative audit event to the centralized immutable ledger.
 * Non-blocking & fail-safe: failures are logged to console without crashing caller transactions.
 */
export async function logAdminActivity(payload: AuditLogPayload): Promise<void> {
  try {
    // 1. Resolve Actor Details (if not provided)
    let actorId = payload.actorId
    let actorEmail = payload.actorEmail
    let actorRole = payload.actorRole

    if (!actorId || !actorEmail) {
      try {
        const currentAdmin = await getCurrentAdmin()
        if (currentAdmin) {
          actorId = actorId || currentAdmin.id
          actorEmail = actorEmail || currentAdmin.email
          actorRole = actorRole || currentAdmin.role
        }
      } catch {
        // Background job or unauthenticated system task
      }
    }

    // 2. Resolve Telemetry Headers (IP, User Agent)
    let clientIp = payload.ipAddress
    let userAgent = payload.userAgent

    if (!clientIp || !userAgent) {
      try {
        const headerList = await headers()
        if (!clientIp) {
          const forwarded = headerList.get("x-forwarded-for")
          clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"
        }
        if (!userAgent) {
          userAgent = headerList.get("user-agent") || "Internal System"
        }
      } catch {
        clientIp = clientIp || "127.0.0.1"
        userAgent = userAgent || "System Service"
      }
    }

    // 3. Sanitize Payload & Compute State Delta
    const sanitizedOld = payload.oldData ? sanitizeAuditData(payload.oldData) : null
    const sanitizedNew = payload.newData ? sanitizeAuditData(payload.newData) : null
    const diff = computeAuditDiff(sanitizedOld, sanitizedNew)
    const summaryText = payload.summary || payload.description || payload.action

    const supabaseAdmin = createServiceRoleClient()

    // 4. Insert into centralized activity_logs
    const insertPayload: Record<string, unknown> = {
      user_id: actorId || null,
      actor_email: actorEmail || null,
      actor_role: actorRole || null,
      action: payload.action.toUpperCase(),
      domain: payload.domain,
      entity_type: payload.entityType,
      entity_id: payload.entityId ? String(payload.entityId) : null,
      summary: summaryText,
      old_data: sanitizedOld,
      new_data: sanitizedNew,
      diff: diff,
      status: payload.status || "SUCCESS",
      error_message: payload.errorMessage || null,
      ip_address: clientIp,
      user_agent: userAgent,
      duration_ms: payload.durationMs || null,
      request_id: payload.requestId || null,
      created_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabaseAdmin
      .from("activity_logs")
      .insert(insertPayload)

    if (insertError) {
      // Graceful fallback if extended columns (Migration 083) are not yet applied on production database
      if (insertError.code === "42703" || insertError.message?.includes("column")) {
        console.warn("[logAdminActivity] Falling back to core columns for activity_logs:", insertError.message)

        // Pack extended telemetry into new_data metadata
        const fallbackNew = {
          ...(sanitizedNew || {}),
          _audit_meta: {
            domain: payload.domain,
            summary: summaryText,
            actor_email: actorEmail,
            actor_role: actorRole,
            status: payload.status || "SUCCESS",
            user_agent: userAgent,
            diff: diff,
          },
        }

        // If entity_id is not a valid UUID in old schema, pass null to avoid type crash
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const safeEntityId =
          payload.entityId && uuidRegex.test(String(payload.entityId))
            ? String(payload.entityId)
            : null

        await supabaseAdmin.from("activity_logs").insert({
          user_id: actorId || null,
          action: payload.action.toUpperCase(),
          entity_type: payload.entityType,
          entity_id: safeEntityId,
          old_data: sanitizedOld,
          new_data: fallbackNew,
          ip_address: clientIp,
          created_at: new Date().toISOString(),
        })
      } else {
        console.error("[logAdminActivity] Failed to insert audit log:", insertError)
      }
    }
  } catch (err) {
    // Fail-safe: Audit logging should never bring down primary business operations
    console.error("[logAdminActivity Critical Error]:", err)
  }
}
