"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TransactionHeader } from "@/components/admin/donations/transaction-header"
import { TransactionOverview } from "@/components/admin/donations/transaction-overview"
import { DonorInformation } from "@/components/admin/donations/donor-information"
import { PaymentTechnical } from "@/components/admin/donations/payment-technical"
import { ReviewStatusCard } from "@/components/admin/finance/review-status-card"
import { ReviewNotesSection } from "@/components/admin/finance/review-notes-section"
import { ActivityTimeline } from "@/components/admin/common/activity-timeline"
import { StatusChangeModal } from "@/components/admin/finance/status-change-modal"
import { ErrorBoundary } from "@/components/admin/common/error-boundary"
import { buildActivityTimeline } from "@/lib/utils/activity-timeline"
import { getProviderDashboardUrl } from "@/lib/utils/provider-dashboard"
import { resendReceipt, exportTransactionPDF } from "@/lib/actions/admin-donation-actions"
import { notifications } from "@/lib/notifications"

interface TransactionDetailClientProps {
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    donation: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewNotes: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusChanges: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentEvents: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentData: any
    reviewedByName: string | null
  }
  userRole: "SUPER_ADMIN" | "ADMIN" | "FINANCE" | "EDITOR"
}

export function TransactionDetailClient({ data, userRole }: TransactionDetailClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { donation, reviewNotes, statusChanges, paymentEvents, paymentData, reviewedByName } = data

  // Build activity timeline with error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timelineEvents: any[] = []
  try {
    timelineEvents = buildActivityTimeline({
      donation,
      reviewNotes,
      statusChanges,
      paymentEvents,
    })
  } catch (error) {
    console.error("Failed to build activity timeline:", error)
    notifications.showError({
      title: "Timeline Error",
      description: "Failed to load activity timeline. Some events may not be displayed.",
    })
  }

  // Handle resend receipt
  const handleResendReceipt = async () => {
    setIsLoading(true)
    try {
      const result = await resendReceipt({ donationId: donation.id })
      if (result.ok) {
        notifications.showSuccess({
          title: "Receipt Sent",
          description: result.message || "Tax receipt has been dispatched to donor email.",
        })
      } else {
        if (result.message?.toLowerCase().includes("rate limit")) {
          notifications.showError({
            title: "Rate Limit Exceeded",
            description: "You can only resend receipts 3 times per hour. Please try again later.",
            duration: 5000,
          })
        } else if (result.message?.toLowerCase().includes("no receipt")) {
          notifications.showError({
            title: "No Receipt Found",
            description: "This donation doesn't have an issued receipt yet. Generate one first.",
          })
        } else {
          notifications.showError({
            title: "Receipt Error",
            description: result.message || "Failed to resend receipt.",
          })
        }
      }
    } catch (error) {
      console.error("Resend receipt error:", error)
      notifications.showError({
        title: "Error",
        description: "Failed to resend receipt. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export PDF
  const handleExportPDF = async () => {
    setIsLoading(true)
    try {
      const result = await exportTransactionPDF({ donationId: donation.id })
      if (result.ok && result.pdfUrl) {
        const link = document.createElement("a")
        link.href = result.pdfUrl
        link.download = result.fileName || `transaction-${donation.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        notifications.showSuccess({
          title: "PDF Exported",
          description: result.message || "Transaction document downloaded.",
        })
      } else {
        notifications.showError({
          title: "Export Failed",
          description: result.message || "Failed to generate export file.",
        })
      }
    } catch (error) {
      console.error("Export PDF error:", error)
      notifications.showError({
        title: "Error",
        description: "Failed to export transaction. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view in provider dashboard
  const handleViewDashboard = () => {
    try {
      const donationData = {
        provider: donation.provider,
        payment_intent_id: paymentData?.payment_intent_id || null,
        session_id: paymentData?.session_id || null,
        payment_id: donation.payment_id || null,
      }
      const url = getProviderDashboardUrl(donation.provider, donationData)

      if (url) {
        window.open(url, "_blank")
      } else {
        notifications.showError({
          title: "Not Available",
          description: "Direct dashboard URL is not available for this transaction reference.",
        })
      }
    } catch (error) {
      console.error("View dashboard error:", error)
      notifications.showError({
        title: "Error",
        description: "Failed to open provider dashboard.",
      })
    }
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole)

  return (
    <main className="space-y-6 max-w-7xl mx-auto" role="main" aria-label="Transaction Detail Console">
      {/* Top Header & Quick Actions */}
      <header>
        <ErrorBoundary>
          <TransactionHeader
            donationId={donation.id}
            paymentStatus={donation.payment_status}
            paymentProvider={donation.provider}
            userRole={userRole}
            hasReceipt={!!donation.receipt_number}
            onResendReceipt={handleResendReceipt}
            onChangeStatus={() => setIsStatusModalOpen(true)}
            onExportPDF={handleExportPDF}
            onViewDashboard={handleViewDashboard}
            isLoading={isLoading}
          />
        </ErrorBoundary>
      </header>

      {/* Hero: Master Contribution Overview & Lifecycle Stepper */}
      <section aria-labelledby="transaction-overview-heading">
        <ErrorBoundary>
          <TransactionOverview donation={donation} reviewedByName={reviewedByName} />
        </ErrorBoundary>
      </section>

      {/* Main 2-Column Responsive Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (lg:col-span-2): Technical Proof & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <ErrorBoundary>
            <PaymentTechnical
              payment={{
                payment_intent_id: paymentData?.payment_intent_id,
                session_id: paymentData?.session_id,
                subscription_id: paymentData?.subscription_id,
                customer_id: paymentData?.customer_id,
                payment_id: donation.payment_id,
                verification_id: donation.verification_id,
                bank_account_id: donation.bank_account_id,
                bank_transfer_date: donation.bank_transfer_date,
                bank_proof_url: donation.bank_proof_url,
              }}
              provider={donation.provider}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <ActivityTimeline events={timelineEvents} />
          </ErrorBoundary>
        </div>

        {/* Right Column (lg:col-span-1): Donor Dossier, Governance & Notes */}
        <div className="space-y-6">
          <ErrorBoundary>
            <DonorInformation
              donor={{
                name: donation.donor_name,
                email: donation.donor_email,
                phone: donation.donor_phone,
                message: donation.donor_message,
              }}
            />
          </ErrorBoundary>

          {isAdmin && (
            <>
              <ErrorBoundary>
                <ReviewStatusCard
                  donationId={donation.id}
                  currentStatus={donation.review_status || "unreviewed"}
                  userRole={userRole}
                />
              </ErrorBoundary>

              <ErrorBoundary>
                <ReviewNotesSection donationId={donation.id} notes={reviewNotes} userRole={userRole} />
              </ErrorBoundary>
            </>
          )}
        </div>
      </div>

      {/* Status Change Modal with Smooth Transition */}
      <StatusChangeModal
        donationId={donation.id}
        currentStatus={donation.payment_status}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={() => {
          setIsStatusModalOpen(false)
          startTransition(() => {
            router.refresh()
          })
          notifications.showSuccess("Transaction status updated successfully")
        }}
      />
    </main>
  )
}
