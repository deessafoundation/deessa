import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing asset id" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: asset, error } = await supabase
    .from("program_assets")
    .select("url, storage_path")
    .eq("id", id)
    .single()

  if (error || !asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 })
  }

  // If the asset has a stored URL, redirect to it
  if (asset.url) {
    return NextResponse.redirect(asset.url, 302)
  }

  // Fallback: construct public URL from storage path
  const { data: urlData } = supabase.storage
    .from("program-assets")
    .getPublicUrl(asset.storage_path)

  if (urlData?.publicUrl) {
    return NextResponse.redirect(urlData.publicUrl, 302)
  }

  return NextResponse.json({ error: "Could not resolve asset URL" }, { status: 500 })
}
