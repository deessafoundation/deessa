import type React from "react"
import { NavbarWrapper } from "@/components/navbar-wrapper"
import { Footer } from "@/components/footer"
import { IntroVideo } from "@/components/intro-video"
import { DevelopmentNoticeModal } from "@/components/development-notice-modal"
import { VideoModalProvider } from "@/contexts/VideoModalContext"
import { GlobalVideoModal } from "@/components/global-video-modal"
import { AccessibilityRoot } from "@/components/accessibility/accessibility-root"
import { comicNeue } from "@/lib/fonts"

export const dynamic = "force-dynamic"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VideoModalProvider>
      {/* Owns accessibility preferences + text-to-speech for all public pages.
          `data-tts-root` marks the region the reader is allowed to read. */}
      <AccessibilityRoot>
        <div className={`${comicNeue.variable} ${comicNeue.className} website-layout relative flex min-h-screen w-full flex-col`}>
          <IntroVideo />
          <NavbarWrapper />
          <DevelopmentNoticeModal />
          <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <main className="flex-1" data-tts-root="">
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <GlobalVideoModal />
      </AccessibilityRoot>
    </VideoModalProvider>
  )
}
