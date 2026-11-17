import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { getActivityHistory, getPasswordHygiene } from "@/lib/actions/admin-profile"
import { ProfileHub } from "@/components/admin/profile/profile-hub"

export const metadata = {
  title: "Admin Profile | Management Portal",
  description: "Manage your administrator account credentials, preferences, and security settings.",
}

function parseUserAgent(ua: string) {
  let browser = "Web Browser"
  if (ua.includes("Firefox/")) browser = "Firefox"
  else if (ua.includes("Edg/")) browser = "Microsoft Edge"
  else if (ua.includes("Chrome/")) browser = "Google Chrome"
  else if (ua.includes("Safari/")) browser = "Apple Safari"
  else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera"

  let os = "Desktop OS"
  if (ua.includes("Windows NT 10.0")) os = "Windows 10/11"
  else if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac OS X")) os = "macOS"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"
  else if (ua.includes("Linux")) os = "Linux"

  return { browser, os, device: `${browser} on ${os}` }
}

export default async function ProfilePage() {
  const adminUser = await getCurrentAdmin()

  if (!adminUser) {
    redirect("/admin/login")
  }

  // Extract client telemetry from request headers
  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"
  const rawUa = headerList.get("user-agent") || ""
  const clientInfo = parseUserAgent(rawUa)

  // Fetch recent activity audit log & credential hygiene metrics concurrently
  const [activityLogs, passwordHygiene] = await Promise.all([
    getActivityHistory(40),
    getPasswordHygiene(),
  ])

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-xl" />
          <div className="h-12 w-full bg-muted/60 rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 bg-muted/40 rounded-2xl" />
            <div className="lg:col-span-1 h-96 bg-muted/40 rounded-2xl" />
          </div>
        </div>
      }
    >
      <ProfileHub
        adminUser={adminUser}
        clientIp={clientIp}
        clientInfo={clientInfo}
        activityLogs={activityLogs}
        passwordHygiene={passwordHygiene}
      />
    </Suspense>
  )
}
