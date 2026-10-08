"use client"

import { useState, type ReactNode } from "react"
import { Building2, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./donation-form.module.css"

export function GivingOptions({ online, bank, onlineAvailable }: {
  online: ReactNode
  bank?: ReactNode
  onlineAvailable: boolean
}) {
  const [method, setMethod] = useState<"online" | "bank">(!onlineAvailable && bank ? "bank" : "online")

  return (
    <div id="giving-options" className={cn(styles.options, "scroll-mt-32")}>
      {bank && (
        <div role="group" aria-label="How would you like to donate?" className="mx-auto mb-8 grid max-w-2xl grid-cols-2 gap-3">
          {([
            { id: "online", label: "Give online", description: "Pay through a secure gateway", icon: CreditCard },
            { id: "bank", label: "Bank transfer", description: "Transfer and share your details", icon: Building2 },
          ] as const).map(({ id, label, description, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={method === id} aria-controls={`giving-${id}`} onClick={() => setMethod(id)} className={cn(styles.choice, "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border px-3 py-4 text-center")}>
              <span className="flex items-center gap-2 font-bold"><Icon aria-hidden="true" className="size-5 shrink-0" />{label}</span>
              <span className="text-xs leading-relaxed sm:text-sm">{description}</span>
            </button>
          ))}
        </div>
      )}
      <div id="giving-online" hidden={method !== "online"} className="mx-auto max-w-3xl">{online}</div>
      {bank && <div id="giving-bank" hidden={method !== "bank"}>{bank}</div>}
    </div>
  )
}
