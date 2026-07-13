import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import { PaymentDetailClient } from "@/components/admin/payments/payment-detail-client"

export const metadata = {
  title: "Payment Detail | Admin",
}

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single()

  if (!adminUser) return null
  if (!canViewFinance(adminUser.role as AdminRole)) return null

  return adminUser.role as "SUPER_ADMIN" | "ADMIN" | "FINANCE" | "EDITOR"
}

async function getDonationData(id: string) {
  const supabase = await createClient()

  const { data: donation, error } = await supabase
    .from("donations")
    .select(`
      id, amount, currency, payment_status, provider, receipt_number,
      receipt_sent_at, created_at, confirmed_at, reviewed_at, reviewed_by,
      review_status, donor_name, donor_email, donor_phone, donor_message,
      payment_id, verification_id, is_monthly, stripe_session_id,
      khalti_pidx, esewa_transaction_uuid, archived_at
    `)
    .eq("id", id)
    .single()

  if (error || !donation) return null

  const [paymentEventsResult, paymentsResult, reviewNotesResult, statusChangesResult] = await Promise.all([
    supabase
      .from("payment_events")
      .select("*")
      .eq("donation_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("payments")
      .select("transaction_id, payment_intent_id, session_id, subscription_id, customer_id, provider")
      .eq("donation_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then((res) => (res.error ? null : res.data)),
    supabase
      .from("review_notes")
      .select(`
        id,
        note_text,
        created_at,
        admin_users!inner (
          full_name,
          email
        )
      `)
      .eq("donation_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("status_change_log")
      .select(`
        id,
        old_status,
        new_status,
        reason,
        created_at,
        admin_users!inner (
          full_name
        )
      `)
      .eq("donation_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
  ])

  let reviewedByName = null
  if (donation.reviewed_by) {
    const { data } = await supabase
      .from("admin_users")
      .select("full_name")
      .eq("id", donation.reviewed_by)
      .single()
    reviewedByName = data?.full_name || null
  }

  return {
    type: "donation" as const,
    id: donation.id,
    name: donation.donor_name || "Unknown",
    email: donation.donor_email || "",
    phone: donation.donor_phone,
    amount: donation.amount,
    currency: donation.currency || "NPR",
    provider: donation.provider,
    status: donation.payment_status,
    paymentId: donation.payment_id,
    verificationId: donation.verification_id,
    createdAt: donation.created_at,
    confirmedAt: donation.confirmed_at,
    context: "General Donation",
    contextDetail: donation.is_monthly ? "Monthly recurring" : "One-time donation",
    donorMessage: donation.donor_message,
    isMonthly: donation.is_monthly,
    receiptNumber: donation.receipt_number,
    receiptSentAt: donation.receipt_sent_at,
    reviewStatus: donation.review_status,
    reviewedAt: donation.reviewed_at,
    reviewedByName,
    sessionRefs: {
      stripeSessionId: donation.stripe_session_id,
      khaltiPidx: donation.khalti_pidx,
      esewaTransactionUuid: donation.esewa_transaction_uuid,
      paymentIntentId: paymentsResult?.payment_intent_id,
      sessionId: paymentsResult?.session_id,
      subscriptionId: paymentsResult?.subscription_id,
      customerId: paymentsResult?.customer_id,
    },
    paymentEvents: paymentEventsResult,
    reviewNotes: reviewNotesResult,
    statusChanges: statusChangesResult,
    paymentData: paymentsResult,
    registrationStatus: null,
    ticketName: null,
    eventTitle: null,
    eventDate: null,
    expiresAt: null,
    paymentOverrideBy: null,
    paymentInitiatedAt: null,
    paymentPaidAt: null,
    paymentFailedAt: null,
    archivedAt: donation.archived_at || null,
  }
}

async function getEventData(id: string) {
  const supabase = await createClient()

  const { data: reg, error } = await supabase
    .from("event_registrations")
    .select(`
      id, full_name, email, phone, payment_amount, payment_currency,
      payment_provider, payment_status, payment_id, created_at,
      payment_initiated_at, payment_paid_at, payment_failed_at,
      expires_at, status, stripe_session_id, khalti_pidx,
      esewa_transaction_uuid, organization, archived_at,
      review_status, reviewed_at, reviewed_by,
      event:events(id, title, event_date, slug),
      ticket_type:event_ticket_types(id, name, price)
    `)
    .eq("id", id)
    .single()

  if (error || !reg) return null

  const evt = (reg as any).event as { id: string; title: string; event_date: string; slug: string } | null
  const ticket = (reg as any).ticket_type as { id: string; name: string; price: number } | null

  const [paymentEvents, reviewNotes, statusChanges] = await Promise.all([
    supabase
      .from("payment_events")
      .select("*")
      .eq("event_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("review_notes")
      .select(`
        id, note_text, created_at,
        admin_users!inner ( full_name, email )
      `)
      .eq("event_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("status_change_log")
      .select(`
        id, old_status, new_status, reason, created_at,
        admin_users!inner ( full_name )
      `)
      .eq("event_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
  ])

  let reviewedByName = null
  if ((reg as any).reviewed_by) {
    const { data } = await supabase
      .from("admin_users")
      .select("full_name")
      .eq("id", (reg as any).reviewed_by)
      .single()
    reviewedByName = data?.full_name || null
  }

  return {
    type: "event" as const,
    id: reg.id,
    name: reg.full_name || "Unknown",
    email: reg.email || "",
    phone: reg.phone,
    amount: reg.payment_amount,
    currency: reg.payment_currency || "NPR",
    provider: reg.payment_provider,
    status: reg.payment_status || "unpaid",
    paymentId: reg.payment_id,
    verificationId: null,
    createdAt: reg.created_at,
    confirmedAt: null,
    context: evt?.title || "Event",
    contextDetail: ticket ? `${ticket.name} — ${reg.payment_currency || "NPR"} ${ticket.price}` : undefined,
    donorMessage: null,
    isMonthly: false,
    receiptNumber: null,
    receiptSentAt: null,
    reviewStatus: (reg as any).review_status || null,
    reviewedAt: (reg as any).reviewed_at || null,
    reviewedByName,
    sessionRefs: {
      stripeSessionId: reg.stripe_session_id,
      khaltiPidx: reg.khalti_pidx,
      esewaTransactionUuid: reg.esewa_transaction_uuid,
      paymentIntentId: null,
      sessionId: null,
      subscriptionId: null,
      customerId: null,
    },
    paymentEvents,
    reviewNotes,
    statusChanges,
    paymentData: null,
    registrationStatus: reg.status,
    ticketName: ticket?.name || null,
    eventTitle: evt?.title || null,
    eventDate: evt?.event_date || null,
    expiresAt: reg.expires_at,
    paymentOverrideBy: null,
    paymentInitiatedAt: reg.payment_initiated_at,
    paymentPaidAt: reg.payment_paid_at,
    paymentFailedAt: reg.payment_failed_at,
    archivedAt: (reg as any).archived_at || null,
  }
}

async function getConferenceData(id: string) {
  const supabase = await createClient()

  const { data: reg, error } = await supabase
    .from("conference_registrations")
    .select(`
      id, full_name, email, phone, organization, payment_amount,
      payment_currency, payment_provider, payment_status, payment_id,
      created_at, status, role, attendance_mode,
      stripe_session_id, khalti_pidx, esewa_transaction_uuid,
      payment_initiated_at, payment_paid_at, payment_failed_at,
      expires_at, payment_override_by, archived_at,
      review_status, reviewed_at, reviewed_by
    `)
    .eq("id", id)
    .single()

  if (error || !reg) return null

  const [paymentEvents, reviewNotes, statusChanges] = await Promise.all([
    supabase
      .from("payment_events")
      .select("*")
      .eq("conference_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("review_notes")
      .select(`
        id, note_text, created_at,
        admin_users!inner ( full_name, email )
      `)
      .eq("conference_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
    supabase
      .from("status_change_log")
      .select(`
        id, old_status, new_status, reason, created_at,
        admin_users!inner ( full_name )
      `)
      .eq("conference_registration_id", id)
      .order("created_at", { ascending: false })
      .then((res) => (res.error ? [] : res.data || [])),
  ])

  let reviewedByName = null
  if ((reg as any).reviewed_by) {
    const { data } = await supabase
      .from("admin_users")
      .select("full_name")
      .eq("id", (reg as any).reviewed_by)
      .single()
    reviewedByName = data?.full_name || null
  }

  return {
    type: "conference" as const,
    id: reg.id,
    name: reg.full_name || "Unknown",
    email: reg.email || "",
    phone: reg.phone,
    amount: reg.payment_amount,
    currency: reg.payment_currency || "NPR",
    provider: reg.payment_provider,
    status: reg.payment_status || "unpaid",
    paymentId: reg.payment_id,
    verificationId: null,
    createdAt: reg.created_at,
    confirmedAt: null,
    context: "Conference",
    contextDetail: [reg.role, reg.attendance_mode, reg.organization].filter(Boolean).join(" — "),
    donorMessage: null,
    isMonthly: false,
    receiptNumber: null,
    receiptSentAt: null,
    reviewStatus: (reg as any).review_status || null,
    reviewedAt: (reg as any).reviewed_at || null,
    reviewedByName,
    sessionRefs: {
      stripeSessionId: reg.stripe_session_id,
      khaltiPidx: reg.khalti_pidx,
      esewaTransactionUuid: reg.esewa_transaction_uuid,
      paymentIntentId: null,
      sessionId: null,
      subscriptionId: null,
      customerId: null,
    },
    paymentEvents,
    reviewNotes,
    statusChanges,
    paymentData: null,
    registrationStatus: reg.status,
    ticketName: null,
    eventTitle: null,
    eventDate: null,
    expiresAt: reg.expires_at,
    paymentOverrideBy: reg.payment_override_by,
    paymentInitiatedAt: reg.payment_initiated_at,
    paymentPaidAt: reg.payment_paid_at,
    paymentFailedAt: reg.payment_failed_at,
    archivedAt: (reg as any).archived_at || null,
  }
}

export default async function PaymentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { id } = await params
  const { type } = await searchParams

  const userRole = await checkFinancePermission()
  if (!userRole) redirect("/admin")

  let data = null
  if (type === "donation") {
    data = await getDonationData(id)
  } else if (type === "event") {
    data = await getEventData(id)
  } else if (type === "conference") {
    data = await getConferenceData(id)
  } else {
    // Try all three
    data = await getDonationData(id) || await getEventData(id) || await getConferenceData(id)
  }

  if (!data) notFound()

  return <PaymentDetailClient data={data as any} userRole={userRole} />
}
