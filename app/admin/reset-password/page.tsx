"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  KeyRound,
  Check,
  X,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

function ResetPasswordContent() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAccountSuspended, setIsAccountSuspended] = useState(false)
  const [urlErrorDescription, setUrlErrorDescription] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGeneratePassword = () => {
    // Generate high-entropy 16-character password satisfying all NIST & local criteria
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const lowers = "abcdefghijkmnopqrstuvwxyz"
    const numbers = "23456789"
    const symbols = "!@#$%^&*-_+="
    const all = uppers + lowers + numbers + symbols

    const getSecureRandom = (charset: string) => {
      const buffer = new Uint32Array(1)
      window.crypto.getRandomValues(buffer)
      return charset[buffer[0] % charset.length]
    }

    const chars = [
      getSecureRandom(uppers),
      getSecureRandom(uppers),
      getSecureRandom(uppers),
      getSecureRandom(lowers),
      getSecureRandom(lowers),
      getSecureRandom(lowers),
      getSecureRandom(numbers),
      getSecureRandom(numbers),
      getSecureRandom(numbers),
      getSecureRandom(symbols),
      getSecureRandom(symbols),
    ]

    while (chars.length < 16) {
      chars.push(getSecureRandom(all))
    }

    // Cryptographic shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const buffer = new Uint32Array(1)
      window.crypto.getRandomValues(buffer)
      const j = buffer[0] % (i + 1)
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }

    const generated = chars.join("")
    setNewPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
    setShowConfirmPassword(true)
    setHasGenerated(true)
    setTimeout(() => setHasGenerated(false), 2400)
  }

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setIsCapsLockOn(e.getModifierState("CapsLock"))
    }
  }

  // 1. Verify Active Recovery Session on Mount
  useEffect(() => {
    let isMounted = true

    async function verifyAdminActive(user: { id: string; email?: string }) {
      try {
        const { data: adminRecord } = await supabase
          .from("admin_users")
          .select("is_active")
          .eq("user_id", user.id)
          .single()

        if (!isMounted) return

        if (adminRecord && !adminRecord.is_active) {
          setIsAccountSuspended(true)
          setHasValidSession(false)
        } else {
          setHasValidSession(true)
          setUserEmail(user.email || null)
        }
      } catch {
        if (isMounted) {
          setHasValidSession(true)
          setUserEmail(user.email || null)
        }
      }
    }

    async function checkSession() {
      try {
        // A. Extract potential error codes or descriptions from query string or hash fragment
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        const errorDesc =
          urlParams.get("error_description") ||
          hashParams.get("error_description") ||
          (urlParams.get("error") === "invalid_recovery_link"
            ? "This recovery link has expired or has already been used."
            : null)

        if (errorDesc) {
          if (isMounted) {
            setUrlErrorDescription(decodeURIComponent(errorDesc.replace(/\+/g, " ")))
            setHasValidSession(false)
            setIsLoadingSession(false)
          }
          return
        }

        // B. Handle PKCE code exchange if present in query parameters
        const code = urlParams.get("code")
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            if (isMounted) {
              setUrlErrorDescription(exchangeError.message || "Failed to exchange recovery credentials.")
              setHasValidSession(false)
              setIsLoadingSession(false)
            }
            return
          }
          if (data?.session?.user) {
            await verifyAdminActive(data.session.user)
            if (isMounted) setIsLoadingSession(false)
            return
          }
        }

        // C. Handle implicit access_token from hash fragment directly
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        if (accessToken) {
          const { data: hashSessionData, error: hashError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          })
          if (!hashError && hashSessionData?.session?.user) {
            await verifyAdminActive(hashSessionData.session.user)
            if (isMounted) setIsLoadingSession(false)
            return
          }
        }

        // D. Check active session or existing Supabase cookie
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          await verifyAdminActive(session.user)
        } else {
          setHasValidSession(false)
        }
      } catch {
        if (isMounted) setHasValidSession(false)
      } finally {
        if (isMounted) setIsLoadingSession(false)
      }
    }

    checkSession()

    // Also listen to auth state changes (e.g. if arriving via hash fragment)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (event === "PASSWORD_RECOVERY" || (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))) {
        if (session?.user) {
          await verifyAdminActive(session.user)
        }
        setIsLoadingSession(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // 2. Real-time criteria validation
  const criteria = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
  }

  const allCriteriaMet = Object.values(criteria).every(Boolean)
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  // Password strength calculation
  const strengthScore = [
    criteria.minLength,
    criteria.hasUpper && criteria.hasLower,
    criteria.hasNumber,
    criteria.hasSpecial,
  ].filter(Boolean).length

  const strengthLabel =
    strengthScore <= 1 ? "Weak" : strengthScore <= 2 ? "Fair" : strengthScore === 3 ? "Good" : "Strong"
  const strengthColor =
    strengthScore <= 1
      ? "bg-rose-500"
      : strengthScore <= 2
        ? "bg-amber-500"
        : strengthScore === 3
          ? "bg-blue-500"
          : "bg-emerald-500"

  // 3. Handle Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allCriteriaMet || !passwordsMatch || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setErrorMessage(error.message)
        setIsSubmitting(false)
        return
      }

      // Invalidate any older sessions on other devices
      try {
        await supabase.auth.signOut({ scope: "others" })
      } catch {
        // Non-blocking best-effort cleanup
      }

      setIsSuccess(true)

      // Smooth redirection to admin dashboard
      setTimeout(() => {
        router.push("/admin")
      }, 1600)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update password.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/15 to-background flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Ambient Radial Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-primary/[0.04] blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* 1. Sleek Top Navigation Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 shrink-0 z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/favicon.png"
            alt="deessa Foundation Emblem"
            width={28}
            height={28}
            priority
            className="shrink-0 transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">
              deessa Foundation
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              IAM Security Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-[11px] font-medium text-muted-foreground shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>256-Bit Encrypted Session</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 px-3.5 rounded-lg text-xs font-semibold border-border/80 bg-background/90 hover:bg-primary/[0.07] hover:border-primary/40 hover:text-primary shadow-2xs transition-all duration-200 group active:scale-95 cursor-pointer"
          >
            <Link href="/admin/login">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1 text-muted-foreground group-hover:text-primary" />
              <span>Admin Sign In</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* 2. Main Executive Reset Console */}
      <main className="w-full max-w-[540px] mx-auto my-auto py-8 z-10">
        <div className="rounded-3xl border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl p-6 sm:p-9 space-y-6 relative overflow-hidden">
          {/* Subtle Top Accent Hairline */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-indigo-500" />

          {/* Header Block */}
          <div className="text-center space-y-2.5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Set Administrator Password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Establish confidential operational credentials for your management portal account.
              </p>
            </div>
          </div>

          {/* Dynamic Content Views */}
          {isLoadingSession ? (
            <div className="py-14 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Verifying recovery credentials...</p>
            </div>
          ) : !hasValidSession ? (
            /* Invalid, Expired, or Suspended Account State */
            <div className="space-y-5 py-2">
              {isAccountSuspended ? (
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">Account Access Suspended</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This administrator account has been suspended by a Super Administrator. Passwords cannot be modified while an account is suspended.
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-2 text-center">
                  <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
                  <h3 className="text-sm font-bold text-destructive">
                    {urlErrorDescription ? "Verification Error" : "Recovery Link Expired or Invalid"}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {urlErrorDescription ||
                      "This single-use recovery link has either expired (links are valid for 24 hours), already been used, or is malformed."}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl border border-border/70 bg-muted/20 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <span className="font-semibold text-foreground block">Next Steps:</span>
                <p>• Contact a Super Administrator to generate a fresh recovery link or dispatch a new reset email.</p>
                <p>• If you already remember your password, you can sign in directly.</p>
              </div>

              <Button asChild className="w-full h-11 text-xs sm:text-sm font-medium shadow-xs">
                <Link href="/admin/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Admin Sign In
                </Link>
              </Button>
            </div>
          ) : isSuccess ? (
            /* Success Celebration State */
            <div className="py-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Password Set Successfully</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your new administrator credentials have been securely registered. Launching your management console...
                </p>
              </div>
              <div className="pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
              </div>
            </div>
          ) : (
            /* Interactive Password Setup Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Verified Identity Card */}
              {userEmail && (
                <div className="p-3 sm:p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        Target Administrator
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-foreground truncate block">
                        {userEmail}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Token
                  </span>
                </div>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* 1. New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>
                      New Password <span className="text-destructive">*</span>
                    </span>
                    {hasGenerated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> Auto-filled both fields
                      </span>
                    )}
                  </span>
                  {isCapsLockOn && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="h-3 w-3" /> Caps Lock active
                    </span>
                  )}
                </Label>

                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (hasGenerated) setHasGenerated(false)
                    }}
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    placeholder="Enter strong password"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className="h-11 pr-20 text-xs sm:text-sm font-mono bg-background"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      disabled={isSubmitting}
                      className={cn(
                        "h-7 w-7 rounded-md flex items-center justify-center transition-all cursor-pointer",
                        hasGenerated
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      )}
                      title="Generate strong password"
                      aria-label="Generate strong password"
                    >
                      <Sparkles className={cn("h-3.5 w-3.5 transition-transform", hasGenerated && "rotate-12")} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={0}
                      disabled={isSubmitting}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Meter & Checklist */}
                {newPassword.length > 0 && (
                  <div className="space-y-2.5 p-3.5 rounded-2xl border bg-muted/20 text-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">Security Strength:</span>
                      <span className="font-bold text-[11px]">{strengthLabel}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            "rounded-full h-full transition-all duration-300",
                            strengthScore >= step ? strengthColor : "bg-muted"
                          )}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <span className={cn("flex items-center gap-1.5", criteria.minLength ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                        {criteria.minLength ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <X className="h-3.5 w-3.5 opacity-50 shrink-0" />}
                        8+ characters
                      </span>
                      <span className={cn("flex items-center gap-1.5", criteria.hasUpper && criteria.hasLower ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                        {criteria.hasUpper && criteria.hasLower ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <X className="h-3.5 w-3.5 opacity-50 shrink-0" />}
                        Upper & lowercase
                      </span>
                      <span className={cn("flex items-center gap-1.5", criteria.hasNumber ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                        {criteria.hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <X className="h-3.5 w-3.5 opacity-50 shrink-0" />}
                        At least 1 number
                      </span>
                      <span className={cn("flex items-center gap-1.5", criteria.hasSpecial ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                        {criteria.hasSpecial ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <X className="h-3.5 w-3.5 opacity-50 shrink-0" />}
                        Special symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to match"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className={cn(
                      "h-11 pr-11 text-xs sm:text-sm font-mono bg-background",
                      passwordsMismatch ? "border-destructive focus-visible:ring-destructive/30" : ""
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={0}
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 pt-0.5">
                    <Check className="h-3.5 w-3.5" /> Passwords match
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="text-[11px] text-destructive font-medium flex items-center gap-1.5 pt-0.5">
                    <X className="h-3.5 w-3.5" /> Passwords do not match
                  </p>
                )}
              </div>

              {/* 3. Action Submit Button */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={!allCriteriaMet || !passwordsMatch || isSubmitting}
                  className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering Password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Save Password & Launch Console
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Saving will automatically terminate older sessions on other devices to safeguard your account.
                </p>
              </div>
            </form>
          )}

          {/* Footer Back Button */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-9 px-4 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200 group active:scale-95 cursor-pointer"
            >
              <Link href="/admin/login">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Back to Admin Sign In</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* 3. Global Security Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 text-center shrink-0 z-10 text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/40">
        <span>© {new Date().getFullYear()} deessa Foundation · Management Portal Identity Services</span>
        <span className="flex items-center gap-1 text-muted-foreground/80">
          <Sparkles className="h-3 w-3 text-primary" />
          Zero-Knowledge Security Architecture
        </span>
      </footer>
    </div>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
