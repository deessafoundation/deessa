/**
 * Utility for formatting raw audit logs into human-readable plain language
 * for administrative dashboards, detail modals, and activity feeds.
 */

export interface FormattedAuditAttribute {
  label: string
  value: string
  badge?: boolean
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "neutral"
}

export interface FormattedAuditLog {
  headline: string
  narrative: string
  attributes: FormattedAuditAttribute[]
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  EDITOR: "Content Editor",
  FINANCE: "Finance Manager",
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatAuditActionTitle(action: string): string {
  if (!action) return "System Activity"
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatAuditLogToPlainLanguage(log: {
  action: string
  entity_type: string
  entity_id?: string
  actor_name?: string
  actor_email?: string
  new_data?: Record<string, unknown>
}): FormattedAuditLog {
  const act = (log.action || "").toUpperCase()
  const data = log.new_data || {}
  const actor = log.actor_name || log.actor_email || "System Service"
  const entity = log.entity_type || "record"

  let headline = ""
  let narrative = ""
  const attributes: FormattedAuditAttribute[] = []

  // Extract common properties
  const ip = data.ip as string | undefined
  const email = (data.email as string) || (data.user_email as string)
  const fullName = (data.full_name as string) || (data.fullName as string)
  const role = data.role as string | undefined
  const previousRole = data.previous_role as string | undefined
  const isActive = data.is_active !== undefined ? Boolean(data.is_active) : undefined
  const count = (data.count as number) || (data.affected_count as number)
  const title = (data.title as string) || (data.name as string)

  // 1. Authentication & Logins
  if (act === "LOGIN" || act.includes("LOGIN_SUCCESS")) {
    headline = "Session Authenticated"
    narrative = `${actor} successfully signed in to the administration portal.`
    if (ip) attributes.push({ label: "Client IP", value: ip })
    if (data.user_agent) {
      attributes.push({ label: "Device / Agent", value: String(data.user_agent).slice(0, 40) + "..." })
    }
  } else if (act === "LOGIN_FAILED") {
    headline = "Authentication Failed"
    const targetEmail = email || "Unknown user"
    narrative = `Unsuccessful sign-in attempt for ${targetEmail}.`
    if (email) attributes.push({ label: "Attempted Email", value: email })
    if (ip) attributes.push({ label: "Source IP", value: ip, badge: true, badgeVariant: "warning" })
    if (data.reason) attributes.push({ label: "Failure Reason", value: String(data.reason) })
  } else if (act === "LOGOUT") {
    headline = "Session Terminated"
    narrative = `${actor} signed out of the administration console.`

  // 2. User Administration: CREATE
  } else if (act === "CREATE" && entity.includes("user")) {
    const roleLabel = role ? (ROLE_DISPLAY_NAMES[role] || role) : "Administrator"
    headline = `Provisioned ${roleLabel} Account`
    narrative = `${actor} created a new administrative account${fullName ? ` for ${fullName}` : ""}${email ? ` (${email})` : ""}.`
    if (fullName) attributes.push({ label: "Full Name", value: fullName })
    if (email) attributes.push({ label: "Email Address", value: email })
    if (role) attributes.push({ label: "Role Tier", value: roleLabel, badge: true, badgeVariant: "default" })

  // 3. User Administration: UPDATE
  } else if (act === "UPDATE" && entity.includes("user")) {
    // Check specific sub-actions in payload
    if (data.action === "PASSWORD_RESET" || data.password_reset) {
      headline = "Administrative Password Reset"
      narrative = `${actor} directly applied a new password for ${email || "user account"}.`
      if (email) attributes.push({ label: "Target User", value: email })
    } else if (role) {
      const newRoleLabel = ROLE_DISPLAY_NAMES[role] || role
      const prevRoleLabel = previousRole ? (ROLE_DISPLAY_NAMES[previousRole] || previousRole) : undefined
      headline = `Assigned Role: ${newRoleLabel}`
      narrative = prevRoleLabel
        ? `${actor} updated role clearance from ${prevRoleLabel} to ${newRoleLabel}.`
        : `${actor} assigned ${newRoleLabel} clearance to this user.`
      attributes.push({ label: "New Role", value: newRoleLabel, badge: true, badgeVariant: "default" })
      if (prevRoleLabel) attributes.push({ label: "Previous Role", value: prevRoleLabel })
    } else if (isActive !== undefined) {
      headline = isActive ? "Account Activated" : "Account Suspended"
      narrative = isActive
        ? `${actor} enabled and authorized account access.`
        : `${actor} suspended account access and revoked active sessions.`
      attributes.push({
        label: "Account Status",
        value: isActive ? "Active" : "Suspended",
        badge: true,
        badgeVariant: isActive ? "success" : "destructive",
      })
    } else {
      headline = "Updated Administrator Profile"
      narrative = `${actor} modified administrator account properties.`
      if (fullName) attributes.push({ label: "Updated Name", value: fullName })
    }

  // 4. Password Link Generation
  } else if (act === "GENERATE_RESET_LINK" || act.includes("RESET_LINK")) {
    headline = "Generated Single-Use Setup Link"
    narrative = `${actor} generated a secure, 24-hour cryptographic setup link for ${email || "account"}.`
    if (email) attributes.push({ label: "Recipient Email", value: email })
    attributes.push({ label: "Link Expiration", value: "24 hours", badge: true, badgeVariant: "neutral" })

  // 5. Bulk Operations
  } else if (act.startsWith("BULK_")) {
    const bulkAction = act.replace("BULK_", "")
    if (bulkAction === "ACTIVATE") {
      headline = `Bulk Activated ${count ? `${count} ` : ""}Accounts`
      narrative = `${actor} restored active access to ${count || "multiple"} administrator accounts.`
    } else if (bulkAction === "SUSPEND") {
      headline = `Bulk Suspended ${count ? `${count} ` : ""}Accounts`
      narrative = `${actor} suspended access for ${count || "multiple"} administrator accounts.`
    } else if (bulkAction === "SET_ROLE") {
      const targetRole = (data.new_role as string) || (data.role as string) || ""
      const roleLabel = ROLE_DISPLAY_NAMES[targetRole] || targetRole
      headline = `Bulk Assigned Role: ${roleLabel}`
      narrative = `${actor} batch assigned ${roleLabel} privileges to ${count || "multiple"} accounts.`
      if (roleLabel) attributes.push({ label: "Assigned Role", value: roleLabel, badge: true, badgeVariant: "default" })
    } else {
      headline = `Bulk Action: ${formatAuditActionTitle(bulkAction)}`
      narrative = `${actor} performed bulk update across multiple records.`
    }
    if (count) attributes.push({ label: "Accounts Modified", value: String(count) })

  // 6. User Deletion
  } else if (act === "DELETE" && entity.includes("user")) {
    headline = "Permanently Deleted Administrator"
    narrative = `${actor} permanently revoked and deleted account credentials${email ? ` for ${email}` : ""}.`
    if (email) attributes.push({ label: "Deleted Email", value: email, badge: true, badgeVariant: "destructive" })
    if (fullName) attributes.push({ label: "User Name", value: fullName })

  // 7. Donations & Finances
  } else if (entity.includes("donation") || act.includes("DONATION") || entity.includes("payment")) {
    const amount = data.amount as number | string | undefined
    const currency = (data.currency as string) || "NPR"
    const donor = (data.donor_name as string) || (data.name as string)
    if (act.includes("APPROVE") || act.includes("VERIFY")) {
      headline = "Donation Receipt Verified"
      narrative = `${actor} verified and approved donation${amount ? ` of ${currency} ${amount}` : ""}${donor ? ` from ${donor}` : ""}.`
    } else if (act.includes("REJECT") || act.includes("FAIL")) {
      headline = "Donation Rejected"
      narrative = `${actor} marked donation payment as rejected/failed.`
    } else {
      headline = `${formatAuditActionTitle(act)} Donation`
      narrative = `${actor} updated donation record.`
    }
    if (amount) attributes.push({ label: "Amount", value: `${currency} ${amount}` })
    if (donor) attributes.push({ label: "Donor", value: donor })

  // 8. CMS: Stories, Programs, Events
  } else if (["story", "program", "event", "artwork", "media"].some((k) => entity.includes(k))) {
    const entityLabel = humanizeKey(entity)
    if (act === "CREATE") {
      headline = `Created ${entityLabel}`
      narrative = `${actor} created a new ${entityLabel.toLowerCase()}${title ? ` "${title}"` : ""}.`
    } else if (act === "PUBLISH") {
      headline = `Published ${entityLabel}`
      narrative = `${actor} published ${entityLabel.toLowerCase()}${title ? ` "${title}"` : ""} to the live public site.`
    } else if (act === "UNPUBLISH") {
      headline = `Unpublished ${entityLabel}`
      narrative = `${actor} moved ${entityLabel.toLowerCase()}${title ? ` "${title}"` : ""} to drafts.`
    } else if (act === "DELETE") {
      headline = `Deleted ${entityLabel}`
      narrative = `${actor} permanently removed ${entityLabel.toLowerCase()}${title ? ` "${title}"` : ""}.`
    } else {
      headline = `Updated ${entityLabel}`
      narrative = `${actor} saved changes to ${entityLabel.toLowerCase()}${title ? ` "${title}"` : ""}.`
    }
    if (title) attributes.push({ label: "Item Title", value: title })

  // 9. Contact Submissions & Support Inquiries
  } else if (entity.includes("contact") || entity.includes("support") || act.includes("CONTACT") || act.includes("SUPPORT")) {
    const statusVal = (data.status as string) || (act.startsWith("CONTACT_STATUS_") ? act.replace("CONTACT_STATUS_", "").toLowerCase() : undefined)
    const formattedStatus = statusVal ? humanizeKey(statusVal) : undefined
    const senderName = (data.name as string) || (data.sender as string) || (data.email as string)

    if (act.includes("STATUS") || statusVal) {
      headline = `Contact Inquiry Status: ${formattedStatus || "Updated"}`
      narrative = `${actor} marked contact inquiry status as ${formattedStatus || "updated"}${senderName ? ` for ${senderName}` : ""}.`
      if (formattedStatus) {
        attributes.push({
          label: "Inquiry Status",
          value: formattedStatus,
          badge: true,
          badgeVariant: statusVal === "resolved" ? "success" : statusVal === "in_progress" ? "warning" : "default",
        })
      }
    } else if (act.includes("ASSIGN")) {
      const assignee = (data.assignee as string) || (data.assigneeEmail as string) || "team member"
      headline = "Assigned Contact Inquiry"
      narrative = `${actor} assigned inquiry to ${assignee}.`
      attributes.push({ label: "Assigned To", value: assignee })
    } else if (act.includes("REPL") || act.includes("EMAIL")) {
      headline = "Replied to Contact Inquiry"
      narrative = `${actor} dispatched an email response to ${senderName || "inquiry sender"}.`
    } else if (act === "DELETE" || act.includes("DELET")) {
      headline = "Deleted Contact Inquiry"
      narrative = `${actor} permanently deleted contact message.`
    } else {
      headline = "Updated Contact Record"
      narrative = `${actor} modified contact submission details.`
    }
    if (senderName) attributes.push({ label: "Sender / Contact", value: senderName })

  // 10. Volunteer Applications
  } else if (entity.includes("volunteer") || act.includes("VOLUNTEER")) {
    const statusVal = data.status as string | undefined
    const applicantName = (data.name as string) || fullName || email
    if (act.includes("STATUS") || statusVal) {
      const formattedStatus = statusVal ? humanizeKey(statusVal) : "Reviewed"
      headline = `Volunteer Status: ${formattedStatus}`
      narrative = `${actor} updated volunteer applicant status to "${formattedStatus}"${applicantName ? ` for ${applicantName}` : ""}.`
      if (statusVal) {
        attributes.push({
          label: "Volunteer Status",
          value: formattedStatus,
          badge: true,
          badgeVariant: statusVal === "approved" || statusVal === "accepted" ? "success" : statusVal === "rejected" ? "destructive" : "warning",
        })
      }
    } else if (act === "CREATE" || act.includes("MANUAL_REGISTRATION")) {
      headline = "Manual Volunteer Registration"
      narrative = `${actor} manually registered volunteer applicant${applicantName ? ` ${applicantName}` : ""}.`
    } else if (act === "DELETE" || act.includes("DELET")) {
      headline = "Deleted Volunteer Record"
      narrative = `${actor} removed volunteer application.`
    } else {
      headline = "Updated Volunteer Application"
      narrative = `${actor} updated volunteer application records.`
    }
    if (applicantName) attributes.push({ label: "Applicant", value: applicantName })

  // 11. Partners & Institutional Collaborations
  } else if (entity.includes("partner")) {
    const partnerName = (data.name as string) || title
    if (act === "CREATE") {
      headline = `Added Partner: ${partnerName || "Organization"}`
      narrative = `${actor} added new institutional partner${partnerName ? ` "${partnerName}"` : ""}.`
    } else if (act === "DELETE") {
      headline = `Deleted Partner: ${partnerName || "Organization"}`
      narrative = `${actor} removed partner listing.`
    } else {
      headline = `Updated Partner: ${partnerName || "Organization"}`
      narrative = `${actor} saved changes to partner organization records.`
    }
    if (partnerName) attributes.push({ label: "Partner Organization", value: partnerName })

  // 12. Newsletter Campaigns & Subscriptions
  } else if (entity.includes("newsletter") || act.includes("NEWSLETTER") || act.includes("BROADCAST")) {
    const subject = (data.subject as string) || (data.title as string)
    if (act.includes("BROADCAST") || act.includes("SEND")) {
      headline = "Dispatched Newsletter Broadcast"
      narrative = `${actor} broadcasted campaign${subject ? ` "${subject}"` : ""} to active subscribers.`
    } else if (act === "CREATE") {
      headline = "Created Newsletter Campaign"
      narrative = `${actor} drafted a new newsletter campaign${subject ? ` "${subject}"` : ""}.`
    } else {
      headline = "Updated Newsletter Configuration"
      narrative = `${actor} updated newsletter records.`
    }
    if (subject) attributes.push({ label: "Campaign Subject", value: subject })

  // 13. Platform Configuration & SEO
  } else if (entity.includes("setting") || entity.includes("seo") || entity.includes("stat")) {
    headline = "Updated Platform Configuration"
    narrative = `${actor} updated global system settings (${humanizeKey(entity)}).`

  // 14. Generic Fallback
  } else {
    headline = `${formatAuditActionTitle(act)} ${humanizeKey(entity)}`
    narrative = `${actor} performed ${act.toLowerCase()} operation on ${humanizeKey(entity)}.`
  }

  // Always add IP if present and not already added
  if (ip && !attributes.some((a) => a.label.includes("IP"))) {
    attributes.push({ label: "Network IP", value: ip })
  }

  // If attributes list is still sparse, extract other string/number primitives from new_data
  if (attributes.length < 2 && Object.keys(data).length > 0) {
    for (const [key, val] of Object.entries(data)) {
      if (
        val !== null &&
        val !== undefined &&
        typeof val !== "object" &&
        !["ip", "user_agent", "action"].includes(key) &&
        !attributes.some((a) => a.label.toLowerCase() === humanizeKey(key).toLowerCase())
      ) {
        attributes.push({
          label: humanizeKey(key),
          value: String(val),
        })
      }
    }
  }

  return {
    headline,
    narrative,
    attributes,
  }
}
