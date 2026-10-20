"use client"

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef } from "react"
import Link from "next/link"

interface GuardContext {
  register: (id: string, dirty: boolean, busy: boolean) => void
  unregister: (id: string) => void
  confirmLeave: (href: string) => boolean
}
const Context = createContext<GuardContext | null>(null)

export function AdminNavigationGuard({ children }: { children: React.ReactNode }) {
  const guards = useRef(new Map<string, { dirty: boolean; busy: boolean }>())
  const allowed = useRef<{ href: string; at: number } | null>(null)
  const register = useCallback((id: string, dirty: boolean, busy: boolean) => { guards.current.set(id, { dirty, busy }) }, [])
  const unregister = useCallback((id: string) => { guards.current.delete(id) }, [])
  const confirmLeave = useCallback((href: string) => {
    const destination = new URL(href, window.location.href)
    if (destination.pathname === window.location.pathname && destination.origin === window.location.origin) return true
    const state = [...guards.current.values()]
    if (state.some(item => item.busy)) {
      window.alert("Please wait for the current upload or save to finish.")
      return false
    }
    if (state.some(item => item.dirty) && !window.confirm("You have unsaved changes. Leave this page and discard them?")) return false
    allowed.current = { href: destination.href, at: Date.now() }
    return true
  }, [])
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if ([...guards.current.values()].some(item => item.dirty || item.busy)) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    const navigation = (window as Window & { navigation?: EventTarget }).navigation
    const navigate = (event: Event) => {
      const next = event as Event & { destination?: { url: string }; hashChange?: boolean }
      if (!next.cancelable || next.hashChange || !next.destination) return
      if (allowed.current?.href === next.destination.url && Date.now() - allowed.current.at < 1000) {
        allowed.current = null
        return
      }
      if (!confirmLeave(next.destination.url)) next.preventDefault()
    }
    window.addEventListener("beforeunload", unload)
    navigation?.addEventListener("navigate", navigate)
    return () => {
      window.removeEventListener("beforeunload", unload)
      navigation?.removeEventListener("navigate", navigate)
    }
  }, [confirmLeave])
  const value = useMemo(() => ({ register, unregister, confirmLeave }), [register, unregister, confirmLeave])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useUnsavedChanges(dirty: boolean, busy = false) {
  const context = useContext(Context)
  const id = useId()
  useEffect(() => {
    context?.register(id, dirty, busy)
    return () => context?.unregister(id)
  }, [context, id, dirty, busy])
  return () => context?.register(id, false, false)
}

export function AdminLink({ href, onNavigate, ...props }: React.ComponentProps<typeof Link>) {
  const context = useContext(Context)
  return <Link {...props} href={href} onNavigate={(event) => {
    const destination = typeof href === "string" ? href : href.pathname || "/admin"
    if (context && !context.confirmLeave(destination)) { event.preventDefault(); return }
    onNavigate?.(event)
  }} />
}
