"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { adminLogin } from "@/lib/actions/admin-auth"
import styles from "./admin-login.module.css"

function AdminLoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

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

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setIsCapsLockOn(e.getModifierState("CapsLock"))
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await adminLogin(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
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
          {setupSuccess && (
            <Alert className="border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <AlertDescription>
                Admin account established successfully. Please sign in below.
              </AlertDescription>
            </Alert>
          )}

          {(error || displayError) && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                {error || displayError}
              </AlertDescription>
            </Alert>
          )}

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
              <Label htmlFor="password">Password</Label>
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
