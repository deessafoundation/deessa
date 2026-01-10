import { NextResponse } from "next/server"
import { submitSupportReport } from "@/lib/actions/support"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const result = await submitSupportReport(formData)

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error("Support submit route error:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}