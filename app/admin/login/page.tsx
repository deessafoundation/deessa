"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Mail,
  KeyRound,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toast"
import { adminLogin, requestAdminPasswordReset } from "@/lib/actions/admin-auth"
import styles from "./admin-login.module.css"

function AdminLoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  // Forgot password dialog states
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false)

  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  const setupSuccess = searchParams.get("setup") === "success"
  const redirectTo = searchParams.get("redirect") || "/admin"

  const displayError =
    urlError === "authentication_unavailable"
      ? "Sign-in is temporarily unavailable. Please try again in a few minutes."
      : urlError === "unauthorized"
        ? "You do not have active administrator access."
        : urlError

  // Toast notifications for URL search params on mount
  useEffect(() => {
    if (displayError) {
      showToast.error({
        title: "Access Denied",
        description: displayError,
      })
    } else if (setupSuccess) {
      showToast.success({
        title: "Account Configured",
        description: "Admin account established successfully. Please sign in below.",
      })
    }
  }, [displayError, setupSuccess])

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setIsCapsLockOn(e.getModifierState("CapsLock"))
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    const result = await adminLogin(formData)

    if (result?.error) {
      showToast.error({
        title: "Sign In Failed",
        description: result.error,
      })
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || isSubmittingForgot) return

    setIsSubmittingForgot(true)

    try {
      const res = await requestAdminPasswordReset(forgotEmail)
      if (res?.error) {
        showToast.error({
          title: "Recovery Request Failed",
          description: res.error,
        })
      } else {
        showToast.success({
          title: "Recovery Link Dispatched",
          description:
            res.message ||
            "If an active administrator account matches this email, a recovery link has been dispatched.",
        })
        setShowForgotModal(false)
        setForgotEmail("")
      }
    } catch {
      showToast.success({
        title: "Recovery Link Dispatched",
        description:
          "If an active administrator account is associated with this email, a recovery link has been dispatched.",
      })
      setShowForgotModal(false)
      setForgotEmail("")
    } finally {
      setIsSubmittingForgot(false)
    }
  }

  return (
    <main id="main-content" className={styles.mainWrapper}>
      <div className={styles.ambientGlow} aria-hidden="true" />

      <Card className={styles.loginCard}>
        <CardHeader className={styles.brandHeader}>
          {/* Trust & Security Badge */}
          <div className={styles.trustBadge}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>256-Bit Encrypted Administrative Session</span>
          </div>

          {/* Foundation Brand Identity */}
          <div className={styles.brandLogoRow}>
            <Image
              src="/favicon.png"
              alt="deessa Foundation Emblem"
              width={32}
              height={32}
              priority
              className="shrink-0"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              deessa Foundation
            </span>
          </div>

          <h1 className={styles.title}>Admin Console Login</h1>
          <p className={styles.subtitle}>
            Authorized foundation operators & staff credentials required
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <form action={handleSubmit} className="space-y-4">
            {/* Preserves deep-link redirect target safely */}
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="admin@deessafoundation.org"
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  className="h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={styles.passwordToggle}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {isCapsLockOn && (
                <div className={styles.capsLockBadge} role="status">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Caps Lock is active</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Verifying credentials...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>

          <div className="pt-3 border-t text-center">
            <Link
              href="/"
              className={styles.backLink}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to main website</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Self-Service Forgot Password Dialog */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-5 w-5 text-primary" />
              Reset Administrator Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Enter your registered administrator email address. If an active account matches, a cryptographically signed recovery link will be sent to your inbox.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-semibold">
                Administrator Email Address
              </Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@deessafoundation.org"
                required
                autoFocus
                disabled={isSubmittingForgot}
                className="h-10 text-xs sm:text-sm font-sans"
              />
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/30 p-2.5 rounded-lg border">
              <p>• Recovery links remain valid for 24 hours.</p>
              <p>• Please check both your inbox and spam folder.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotModal(false)}
                disabled={isSubmittingForgot}
                className="h-9 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!forgotEmail || isSubmittingForgot}
                className="h-9 text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingForgot ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Dispatching Link...
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    Send Recovery Link
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
