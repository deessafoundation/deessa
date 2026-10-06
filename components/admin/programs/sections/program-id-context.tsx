"use client"

import { createContext, useContext } from "react"

const ProgramIdContext = createContext<string | null>(null)

export function ProgramIdProvider({ programId, children }: { programId: string; children: React.ReactNode }) {
  return (
    <ProgramIdContext.Provider value={programId}>
      {children}
    </ProgramIdContext.Provider>
  )
}

export function useProgramId(): string {
  const id = useContext(ProgramIdContext)
  if (!id) throw new Error("useProgramId must be used within ProgramIdProvider")
  return id
}
