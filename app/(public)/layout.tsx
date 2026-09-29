import type React from "react"
import "@/app/public-accessibility.css"
import { NavbarWrapper } from "@/components/navbar-wrapper"
import { Footer } from "@/components/footer"
import { IntroVideo } from "@/components/intro-video"
import { DevelopmentNoticeModal } from "@/components/development-notice-modal"
import { VideoModalProvider } from "@/contexts/VideoModalContext"
import { GlobalVideoModal } from "@/components/global-video-modal"
import { AccessibilityProvider } from "@/contexts/accessibility-provider"
import { AccessibilityPanel } from "@/components/accessibility/panel"
import { openDyslexic } from "@/app/fonts"
import { AccessibilityReadingAids } from "@/components/accessibility/reading-aids"
import { AccessibilityDictionary } from "@/components/accessibility/dictionary"
import { comicNeue } from "@/lib/fonts"

export const dynamic = "force-dynamic"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={openDyslexic.variable}>
      {/* Skip to main content link - appears on Tab */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <AccessibilityProvider>
        <VideoModalProvider>
          <div
            className={`${comicNeue.variable} ${comicNeue.className} website-layout relative flex min-h-screen w-full flex-col`}
          >
            <IntroVideo />
            <NavbarWrapper />
            <DevelopmentNoticeModal />
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
              <main id="main-content" tabIndex={-1} className="flex-1" data-tts-root="">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <GlobalVideoModal />
          <AccessibilityPanel />
          <AccessibilityReadingAids />
          <AccessibilityDictionary />
        </VideoModalProvider>
      </AccessibilityProvider>
    </div>
  )
}
