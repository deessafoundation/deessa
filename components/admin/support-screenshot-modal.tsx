'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'

interface Props {
  url: string
  alt?: string
  filename?: string
  trigger?: React.ReactNode
}

export default function SupportScreenshotModal({ url, alt = 'screenshot', filename, trigger }: Props) {
  const [open, setOpen] = React.useState(false)
  const [scale, setScale] = React.useState(1)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const gestureBaseRef = React.useRef<number | null>(null)

  function zoomIn() {
    setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))
  }
  function zoomOut() {
    setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))
  }
  function resetZoom() {
    setScale(1)
  }

  React.useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    function clamp(v: number) {
      return Math.max(0.5, Math.min(3, +v.toFixed(2)))
    }

    function onWheel(e: WheelEvent) {
      // Support pinch-to-zoom on some platforms (often ctrl/meta + wheel), and
      // allow ctrl/cmd + scroll as a zoom shortcut. Prevent default to avoid page zoom.
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = -e.deltaY
        const factor = delta > 0 ? 1.06 : 0.94
        setScale((s) => clamp(s * factor))
      }
    }

    function onGestureStart(e: any) {
      // Safari gesture events
      gestureBaseRef.current = scale
    }

    function onGestureChange(e: any) {
      if (gestureBaseRef.current == null) return
      e.preventDefault()
      const newScale = clamp((gestureBaseRef.current || 1) * (e.scale || 1))
      setScale(newScale)
    }

    function onGestureEnd() {
      gestureBaseRef.current = null
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    // Safari gesture events
    el.addEventListener('gesturestart', onGestureStart as EventListener)
    el.addEventListener('gesturechange', onGestureChange as EventListener)
    el.addEventListener('gestureend', onGestureEnd as EventListener)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('gesturestart', onGestureStart as EventListener)
      el.removeEventListener('gesturechange', onGestureChange as EventListener)
      el.removeEventListener('gestureend', onGestureEnd as EventListener)
    }
  }, [scale])

  // Keyboard shortcuts: + or = to zoom in, - to zoom out, 0 to reset
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      // Normalize keys: '+' or '=' for zoom in, '-' for zoom out, '0' reset
      const key = e.key
      if (key === '+' || key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (key === '-' || key === '_') {
        e.preventDefault()
        zoomOut()
      } else if (key === '0') {
        e.preventDefault()
        resetZoom()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetZoom() }}>
        <DialogTrigger asChild>
          {trigger ?? (
            <button className="w-full sm:w-48 rounded-md overflow-hidden border border-border bg-muted p-1 hover:shadow-sm">
              <img src={url} alt={alt} className="h-36 w-full object-cover" />
            </button>
          )}
        </DialogTrigger>

        <DialogContent className="!max-w-[81vw] !sm:max-w-[81vw] max-h-[85vh] p-0 overflow-auto">
          <DialogHeader className="flex items-center justify-between p-4">
            <div>
              <DialogTitle className="text-lg">{filename || 'Screenshot'}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                aria-label="Zoom out"
                className="rounded-md bg-muted px-2 py-1 text-sm hover:shadow"
              >
                −
              </button>
              <button
                onClick={resetZoom}
                aria-label="Reset zoom"
                className="rounded-md bg-muted px-2 py-1 text-sm hover:shadow"
              >
                Reset
              </button>
              <button
                onClick={zoomIn}
                aria-label="Zoom in"
                className="rounded-md bg-muted px-2 py-1 text-sm hover:shadow"
              >
                +
              </button>
              <DialogClose className="ml-2 rounded-md bg-muted px-2 py-1 text-sm hover:shadow">Close</DialogClose>
            </div>
          </DialogHeader>

          <div className="p-4 overflow-auto">
            <div ref={wrapperRef} className="mx-auto max-h-[80vh] w-full flex items-center justify-center">
              <div className="inline-block">
                <img
                  src={url}
                  alt={alt}
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 120ms ease', display: 'block', maxWidth: '100%', maxHeight: '72vh' }}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
