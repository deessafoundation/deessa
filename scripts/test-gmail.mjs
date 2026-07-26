/**
 * Standalone Gmail SMTP credential test.
 *
 *   node scripts/test-gmail.mjs
 *
 * Reads GOOGLE_EMAIL / GOOGLE_APP_PASSWORD from .env.local (falling back to
 * .env) and runs nodemailer's verify(). This isolates "are the email
 * credentials valid?" from the rest of the app, so you can confirm a fresh
 * Gmail app password works BEFORE retrying a donation.
 *
 * Exit 0 = credentials accepted. Exit 1 = rejected (prints the real reason).
 */
import fs from "node:fs"
import path from "node:path"
import nodemailer from "nodemailer"

function loadEnv() {
  const env = {}
  for (const f of [".env", ".env.local"]) {
    const p = path.join(process.cwd(), f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
    }
  }
  return env
}

const env = loadEnv()
const user = env.GOOGLE_EMAIL
const pass = env.GOOGLE_APP_PASSWORD

console.log("Testing Gmail SMTP credentials...")
console.log("  GOOGLE_EMAIL       :", user || "(missing)")
console.log("  GOOGLE_APP_PASSWORD:", pass ? `set, length ${pass.length}` : "(missing)")

if (!user || !pass) {
  console.error("\n❌ Missing GOOGLE_EMAIL or GOOGLE_APP_PASSWORD in .env.local")
  process.exit(1)
}
if (pass.replace(/\s/g, "").length !== 16) {
  console.warn(`\n⚠️  App passwords are 16 chars (spaces ignored). Yours is ${pass.replace(/\s/g, "").length}. Double-check it.`)
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass: pass.replace(/\s/g, "") },
})

try {
  await transporter.verify()
  console.log("\n✅ SUCCESS — Gmail accepted these credentials. Receipt emails will send.")
  process.exit(0)
} catch (err) {
  console.error("\n❌ REJECTED — Gmail refused the login:")
  console.error("   " + (err?.message || String(err)))
  if (String(err?.message).includes("535")) {
    console.error("\n   535-5.7.8 = wrong/expired app password. Fix:")
    console.error("   1. Confirm 2-Step Verification is ON at myaccount.google.com/security")
    console.error("   2. Generate a FRESH app password at myaccount.google.com/apppasswords")
    console.error("   3. Put it in .env.local as GOOGLE_APP_PASSWORD (spaces are fine)")
    console.error("   4. Restart the dev server, then re-run this script.")
  }
  process.exit(1)
}
