"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, Repeat, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import styles from "./donation-form.module.css"
import { cn } from "@/lib/utils"
import { startTransition } from "react"
import type { PaymentProvider } from "@/lib/payments/config"
import { startDonation } from "@/lib/actions/donation"
import { notifications } from "@/lib/notifications"

interface DonationTier {
  amount: number
  impact: string
  icon: string
}

interface DonationFormProps {
  tiers: DonationTier[]
  enabledProviders?: PaymentProvider[]
  primaryProvider?: PaymentProvider
  defaultCurrency?: "USD" | "NPR"
}

export function DonationForm({
  tiers,
  enabledProviders = [],
  primaryProvider = "stripe",
  defaultCurrency = "USD",
}: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [isMonthly, setIsMonthly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<PaymentProvider>(() => {
    // Ensure the initial provider is in the enabled list
    return enabledProviders.includes(primaryProvider) ? primaryProvider : enabledProviders[0] || "stripe"
  })

  // Update provider if enabledProviders change
  useEffect(() => {
    if (!enabledProviders.includes(provider)) {
      setProvider(enabledProviders[0] || "stripe")
    }
  }, [enabledProviders, provider])

  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })

  const presetAmounts = [25, 50, 100, 250, 500]

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value)
    setSelectedAmount(null)
  }

  const handleDonorInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonorInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProviderChange = (newProvider: PaymentProvider) => {
    if (enabledProviders.includes(newProvider)) {
      setProvider(newProvider)
    } else {
      notifications.showError({
        title: "Payment Method Unavailable",
        description: "This payment method is not currently available. Please select another option.",
      })
    }
  }

  // Parse and round to 2 decimal places to avoid floating-point precision issues
  const finalAmount = customAmount 
    ? Math.round(Number.parseFloat(customAmount) * 100) / 100
    : selectedAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!finalAmount || finalAmount <= 0) {
      notifications.showError({
        title: "Invalid Amount",
        description: "Please select or enter a donation amount.",
      })
      return
    }

    if (!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email) {
      notifications.showError({
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Ensure provider is available
    if (!enabledProviders.includes(provider)) {
      notifications.showError({
        title: "Payment Method Unavailable",
        description: "The selected payment method is not available. Please choose another option.",
      })
      return
    }

    setIsLoading(true)

    const payload = {
      amount: finalAmount,
      donorName: `${donorInfo.firstName} ${donorInfo.lastName}`.trim(),
      donorEmail: donorInfo.email,
      donorPhone: donorInfo.phone || undefined,
      donorMessage: donorInfo.message || undefined,
      isMonthly,
      provider,
    } as const

    // Use a transition to avoid blocking UI updates
    startTransition(async () => {
      try {
        notifications.showInfo({
          title: "Processing",
          description: "Redirecting you to the secure payment page...",
          duration: 2000,
        })

        const result = await startDonation(payload)

        if (result.ok && result.redirectUrl) {
          // Check if form POST is required (for eSewa v2)
          if (result.requiresFormSubmit && result.formData) {
            // Create and submit a form for eSewa v2
            const form = document.createElement("form")
            form.method = "POST"
            form.action = result.redirectUrl
            
            // Add form fields
            Object.entries(result.formData).forEach(([key, value]) => {
              const input = document.createElement("input")
              input.type = "hidden"
              input.name = key
              input.value = value
              form.appendChild(input)
            })
            
            document.body.appendChild(form)
            form.submit()
            return
          }
          
          // Simple redirect for other providers
          setTimeout(() => {
            window.location.href = result.redirectUrl!
          }, 500)
          return
        }

        notifications.showError({
          title: "Payment Error",
          description: result.message || "Unable to start payment. Please try again.",
        })
      } catch (err) {
        console.error("Donation submit error:", err)
        notifications.showError({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <form id="donation-form" aria-labelledby="donation-title" aria-busy={isLoading} onSubmit={handleSubmit} className={cn(styles.form, "scroll-mt-28 rounded-2xl p-5 sm:p-8")}>
      <div className="mb-7 flex items-start justify-between gap-4 border-b border-border pb-6">
        <div><h2 id="donation-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Make a difference</h2><p className="mt-2 text-sm text-foreground-muted">Choose your gift. We&apos;ll take care of the rest.</p></div>
        <Heart aria-hidden="true" className={cn(styles.accent, "mt-1 size-7 shrink-0")} />
      </div>

      <fieldset className="mb-7">
        <legend className="mb-3 text-sm font-bold">How often would you like to give?</legend>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1.5">
          <button type="button" aria-pressed={!isMonthly} onClick={() => setIsMonthly(false)} className={cn(styles.choice, "min-h-12 rounded-lg px-3 py-3 text-sm font-semibold")}>One-time</button>
          <button type="button" aria-pressed={isMonthly} onClick={() => setIsMonthly(true)} className={cn(styles.choice, "flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold")}><Repeat aria-hidden="true" className="size-4 shrink-0" />Monthly</button>
        </div>
      </fieldset>

      <fieldset className="mb-7">
        <legend className="mb-1 text-sm font-bold">Payment method</legend>
        <p className="mb-3 text-xs text-foreground-muted">Choose a provider to see the currency for your gift.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "stripe" as PaymentProvider, label: "Card / Stripe", currency: defaultCurrency || "USD" },
            { id: "khalti" as PaymentProvider, label: "Khalti", currency: "NPR" },
            { id: "esewa" as PaymentProvider, label: "eSewa", currency: "NPR" },
          ].filter((p) => enabledProviders.includes(p.id)).map((p) => {
            const isAvailable = enabledProviders.includes(p.id)
            return <button key={p.id} type="button" onClick={() => handleProviderChange(p.id)} disabled={!isAvailable} aria-pressed={provider === p.id && isAvailable} className={cn(styles.choice, "flex min-h-16 flex-1 flex-col items-start rounded-xl border border-border px-4 py-3 text-left")}><span className="text-sm font-semibold">{p.label}</span><span className="mt-1 text-xs">{isAvailable ? p.currency : "Unavailable"}</span></button>
          })}
        </div>
        {enabledProviders.length === 0 && <p role="status" className="mt-3 text-sm text-foreground-muted">Online payments are currently unavailable. Please use bank transfer below if offered, or <a href="/contact" className="underline underline-offset-4">contact our team</a>.</p>}
      </fieldset>

      <fieldset className="mb-7">
        <legend className="mb-3 text-sm font-bold">Choose an amount <span className="font-normal text-foreground-muted">({provider === "stripe" ? defaultCurrency || "USD" : "NPR"})</span></legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {presetAmounts.map((amount) => <button type="button" key={amount} aria-pressed={selectedAmount === amount} onClick={() => handleAmountSelect(amount)} className={cn(styles.choice, "min-h-12 rounded-lg border border-border px-2 py-3 text-base font-bold tabular-nums")}>{provider === "stripe" ? "$" : "₨"}{amount}</button>)}
        </div>
        <label htmlFor="donation-custom" className="mb-2 mt-4 block text-sm text-foreground-muted">Or enter your own amount</label>
        <div className="relative">
          <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-foreground-muted">{provider === "stripe" ? "$" : "₨"}</span>
          <input id="donation-custom" type="number" inputMode="decimal" placeholder="Custom amount" value={customAmount} onChange={handleCustomAmountChange} min="1" step="0.01" className={cn(styles.input, "min-h-12 w-full rounded-lg border border-border py-3 pl-10 pr-4")} />
        </div>
      </fieldset>

      <fieldset className="border-t border-border pt-6">
        <legend className="sr-only">Your information</legend>
        <h3 className="mb-1 text-lg font-bold">A little about you</h3>
        <p className="mb-5 text-xs text-foreground-muted">Fields marked * are required.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="donation-first" className="mb-2 block text-sm font-medium">First name <span aria-hidden="true">*</span></label><input id="donation-first" type="text" name="firstName" autoComplete="given-name" required aria-required="true" value={donorInfo.firstName} onChange={handleDonorInfoChange} className={cn(styles.input, "min-h-12 w-full rounded-lg border border-border px-4 py-3")} /></div>
          <div><label htmlFor="donation-last" className="mb-2 block text-sm font-medium">Last name <span aria-hidden="true">*</span></label><input id="donation-last" type="text" name="lastName" autoComplete="family-name" required aria-required="true" value={donorInfo.lastName} onChange={handleDonorInfoChange} className={cn(styles.input, "min-h-12 w-full rounded-lg border border-border px-4 py-3")} /></div>
          <div className="sm:col-span-2"><label htmlFor="donation-email" className="mb-2 block text-sm font-medium">Email address <span aria-hidden="true">*</span></label><input id="donation-email" type="email" name="email" autoComplete="email" required aria-required="true" value={donorInfo.email} onChange={handleDonorInfoChange} className={cn(styles.input, "min-h-12 w-full rounded-lg border border-border px-4 py-3")} /></div>
          <div className="sm:col-span-2"><label htmlFor="donation-phone" className="mb-2 block text-sm font-medium">Phone number <span className="font-normal text-foreground-muted">(optional)</span></label><input id="donation-phone" type="tel" name="phone" autoComplete="tel" value={donorInfo.phone} onChange={handleDonorInfoChange} className={cn(styles.input, "min-h-12 w-full rounded-lg border border-border px-4 py-3")} /></div>
          <div className="sm:col-span-2"><label htmlFor="donation-message" className="mb-2 block text-sm font-medium">Leave a message <span className="font-normal text-foreground-muted">(optional)</span></label><Textarea id="donation-message" name="message" placeholder="What inspired you to give?" value={donorInfo.message} onChange={(e) => setDonorInfo((prev) => ({ ...prev, message: e.target.value }))} rows={3} className={cn(styles.input, "w-full resize-y rounded-lg border border-border px-4 py-3")} /></div>
        </div>
      </fieldset>

      {finalAmount && finalAmount > 0 ? <div aria-live="polite" aria-atomic="true" className={cn(styles.summary, "mb-4 mt-6 flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm")}><span>{isMonthly ? "Your monthly gift" : "Your one-time gift"}</span><strong className="text-lg tabular-nums">{provider === "stripe" ? "$" : "₨"}{finalAmount.toFixed(2)}{isMonthly && <span className="text-sm font-normal"> / month</span>}</strong></div> : null}
      <Button type="submit" size="lg" className={cn(styles.submit, "mt-2 h-auto min-h-14 w-full whitespace-normal rounded-xl px-4 py-4 text-base font-bold")} disabled={!finalAmount || finalAmount <= 0 || isLoading || enabledProviders.length === 0}>
        {isLoading ? <><Loader2 aria-hidden="true" className="mr-2 size-5 shrink-0 animate-spin" />Processing...</> : <><Heart aria-hidden="true" className="mr-2 size-5 shrink-0" />{isMonthly ? `Donate ${provider === "stripe" ? "$" : "₨"}${finalAmount?.toFixed(2) || 0}/month` : `Donate ${provider === "stripe" ? "$" : "₨"}${finalAmount?.toFixed(2) || 0} Now`}</>}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-foreground-muted"><Lock aria-hidden="true" className="size-3 shrink-0" />Continue to secure payment</p>
      <p className="mt-5 text-center text-xs leading-relaxed text-foreground-muted">By donating, you agree to our <a href="/terms" className="underline underline-offset-4">terms</a> and <a href="/privacy" className="underline underline-offset-4">privacy policy</a>.</p>
    </form>
  )
}
