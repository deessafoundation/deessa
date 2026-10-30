'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      duration={2500}
      style={
        {
          '--normal-bg': '#ffffff',
          '--normal-text': '#0f172a',
          '--normal-border': '#e2e8f0',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
