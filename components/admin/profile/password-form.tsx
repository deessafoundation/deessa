"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Copy,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { changePassword, type PasswordHygieneMetrics } from "@/lib/actions/admin-profile"
import { notifications } from "@/lib/notifications"

interface PasswordFormProps {
  passwordHygiene?: PasswordHygieneMetrics
}

export function PasswordForm({ passwordHygiene }: PasswordFormProps = {}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setIsCapsLockOn(e.getModifierState("CapsLock"))
    }
  }

  // Real-time password criteria evaluation
  const criteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    }
  }, [newPassword])

  // 4-segment strength score matching reset-password portal
  const strengthScore = useMemo(() => {
    return [
      criteria.minLength,
      criteria.hasUpper && criteria.hasLower,
      criteria.hasNumber,
      criteria.hasSpecial,
    ].filter(Boolean).length
  }, [criteria])

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

  const allCriteriaMet = Object.values(criteria).every(Boolean)
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const sameAsCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword

  const isFormValid =
    currentPassword.length > 0 &&
    allCriteriaMet &&
    passwordsMatch &&
    !sameAsCurrent

  // Cryptographically strong generator matching reset-password portal
  const handleGeneratePassword = () => {
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
    setShowNew(true)
    setShowConfirm(true)
    setHasGenerated(true)
    setTimeout(() => setHasGenerated(false), 2400)

    notifications.showInfo({
      title: "Strong Password Generated",
      description: "Populated both new and confirmation password fields with a 16-character credential.",
    })
  }

  const handleCopyGenerated = () => {
    if (!newPassword) return
    navigator.clipboard.writeText(newPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
    notifications.showInfo({ description: "Generated password copied to clipboard." })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      notifications.showError({
        title: "Validation Error",
        description: "Please fulfill all password security requirements before saving.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.error) {
        notifications.showError({
          title: "Password Change Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Password Updated",
          description: "Your administrator account password has been updated securely.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to change password.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto w-full py-1">
      {/* 0. Credential Age & Hygiene Tracker */}
      {passwordHygiene && (
        <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Credential Age & Rotation Status
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5",
                passwordHygiene.status === "optimal"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  : passwordHygiene.status === "healthy"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  : passwordHygiene.status === "warning"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
              )}
            >
              {passwordHygiene.statusLabel}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Last rotated:{" "}
              <strong className="text-foreground font-semibold">
                {passwordHygiene.diffDays === 0
                  ? "Today"
                  : `${passwordHygiene.diffDays} day${passwordHygiene.diffDays === 1 ? "" : "s"} ago`}
              </strong>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Policy: 90-day rotation
            </span>
          </div>

          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                passwordHygiene.status === "optimal"
                  ? "bg-emerald-500"
                  : passwordHygiene.status === "healthy"
                  ? "bg-blue-500"
                  : passwordHygiene.status === "warning"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{
                width: `${Math.min(100, Math.max(5, (passwordHygiene.diffDays / 90) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 1. Current Password */}
      <div className="space-y-2">
        <Label
          htmlFor="current-password"
          className="text-xs font-semibold text-foreground flex items-center justify-between"
        >
          <span>
            Current Password <span className="text-destructive">*</span>
          </span>
          {isCapsLockOn && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="h-3 w-3" /> Caps Lock active
            </span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            required
            disabled={isSubmitting}
            placeholder="Enter your existing password"
            className="h-10 text-xs sm:text-sm pr-10 font-mono bg-background"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            tabIndex={0}
            disabled={isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title={showCurrent ? "Hide password" : "Show password"}
            aria-label={showCurrent ? "Hide password" : "Show password"}
          >
            {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. New Password */}
      <div className="space-y-2">
        <Label
          htmlFor="new-password"
          className="text-xs font-semibold text-foreground flex items-center justify-between"
        >
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
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              if (hasGenerated) setHasGenerated(false)
            }}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            required
            minLength={8}
            disabled={isSubmitting}
            placeholder="Enter new strong password"
            className="h-10 text-xs sm:text-sm pr-24 font-mono bg-background"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {newPassword && (
              <button
                type="button"
                onClick={handleCopyGenerated}
                disabled={isSubmitting}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Copy password"
                aria-label="Copy password"
              >
                {copiedPassword ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}

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
              onClick={() => setShowNew(!showNew)}
              tabIndex={0}
              disabled={isSubmitting}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              title={showNew ? "Hide password" : "Show password"}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic 4-Segment Strength Meter & Criteria Checklist */}
        {newPassword.length > 0 && (
          <div className="space-y-2.5 p-3.5 rounded-2xl border bg-muted/20 text-xs mt-2">
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
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  criteria.minLength ? "text-emerald-600 font-medium" : "text-muted-foreground"
                )}
              >
                {criteria.minLength ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                )}
                8+ characters
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  criteria.hasUpper && criteria.hasLower ? "text-emerald-600 font-medium" : "text-muted-foreground"
                )}
              >
                {criteria.hasUpper && criteria.hasLower ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                )}
                Upper & lowercase
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  criteria.hasNumber ? "text-emerald-600 font-medium" : "text-muted-foreground"
                )}
              >
                {criteria.hasNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                )}
                At least 1 number
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  criteria.hasSpecial ? "text-emerald-600 font-medium" : "text-muted-foreground"
                )}
              >
                {criteria.hasSpecial ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 opacity-50 shrink-0" />
                )}
                Special symbol
              </span>
            </div>

            {sameAsCurrent && (
              <p className="text-[11px] text-destructive font-medium pt-1">
                New password cannot be identical to your current password.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Confirm New Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="confirm-password"
            className="text-xs font-semibold text-foreground"
          >
            Confirm New Password <span className="text-destructive">*</span>
          </Label>
          {passwordsMatch && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" />
              Passwords match
            </span>
          )}
          {passwordsMismatch && (
            <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
              <X className="h-3 w-3" />
              Passwords do not match
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            required
            minLength={8}
            disabled={isSubmitting}
            placeholder="Re-enter your new password"
            className={cn(
              "h-10 text-xs sm:text-sm pr-10 font-mono bg-background",
              passwordsMismatch ? "border-destructive focus-visible:ring-destructive/30" : ""
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            tabIndex={0}
            disabled={isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title={showConfirm ? "Hide password" : "Show password"}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. Action Controls - Centered */}
      <div className="pt-5 border-t border-border/60 flex flex-col items-center justify-center gap-3 text-center">
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="h-10 px-6 text-xs sm:text-sm font-semibold gap-2 shadow-xs min-w-[200px] cursor-pointer active:scale-95 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Update Password</span>
            </>
          )}
        </Button>

        <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Protected with Argon2/bcrypt encryption and brute-force rate limits.</span>
        </div>
      </div>
    </form>
  )
}
