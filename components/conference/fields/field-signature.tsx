"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import SignaturePad from "signature_pad"
import { FormField } from "@/lib/types/conference-form-schema"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PenTool, RotateCcw } from "lucide-react"

interface FieldSignatureProps {
  field: FormField
  value: string | null
  onChange: (value: string | null) => void
  onBlur?: () => void
  error?: string
}

export function FieldSignature({ field, value, onChange, error }: FieldSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match display
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(ratio, ratio)
    }

    const pad = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)",
    })

    // Load existing value
    if (value) {
      pad.fromDataURL(value)
      setHasDrawn(true)
    }

    pad.addEventListener("endStroke", () => {
      setHasDrawn(true)
      onChange(pad.toDataURL("image/png"))
    })

    padRef.current = pad

    return () => {
      pad.off()
    }
  }, []) // Only run once on mount

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas || !padRef.current) return

      const savedData = padRef.current.toDataURL()
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.scale(ratio, ratio)
      padRef.current.clear()
      padRef.current.fromDataURL(savedData)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClear = useCallback(() => {
    padRef.current?.clear()
    setHasDrawn(false)
    onChange(null)
  }, [onChange])

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className={`rounded-lg border overflow-hidden ${error ? "border-destructive" : "border-input"}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
          style={{ display: "block" }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <PenTool className="h-3 w-3" />
          {hasDrawn ? "Signature captured" : "Draw your signature above"}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-7 px-2 text-xs"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      {field.helpText && !error && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
