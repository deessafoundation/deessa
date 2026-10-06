import type React from "react"
import "@/app/public-accessibility.css"
import { NavbarWrapper } from "@/components/layout/navbar-wrapper"
import { Footer } from "@/components/layout/footer"
import { IntroVideo } from "@/components/layout/intro-video"
import { DevelopmentNoticeModal } from "@/components/layout/development-notice-modal"
import { VideoModalProvider } from "@/contexts/VideoModalContext"
import { GlobalVideoModal } from "@/components/layout/global-video-modal"
import { AccessibilityProvider } from "@/contexts/accessibility-provider"
import { AccessibilityPanel } from "@/components/accessibility/panel"
import { openDyslexic } from "@/app/fonts"
import { AccessibilityReadingAids } from "@/components/accessibility/reading-aids"
import { AccessibilityDictionary } from "@/components/accessibility/dictionary"
import { comicNeue } from "@/lib/fonts"

export const dynamic = "force-dynamic"

/**
 * Runs before the page markup is painted. If the intro video is going to play,
 * it hides the site so the homepage never flashes before the intro appears.
 * Mirrors the rules in components/intro-video.tsx; IntroVideo removes the class
 * when the intro is skipped, finishes, or is not shown. The timeout is a
 * failsafe so a JS failure can never leave the site hidden.
 */
const introGateScript = `(function(){try{
var d=document.documentElement;
if(location.pathname.indexOf('/demo')===0)return;
var raw=localStorage.getItem('deesha-a11y-preferences')||sessionStorage.getItem('deesha-a11y-preferences');
if(raw){var p=(JSON.parse(raw)||{}).preferences;if(p&&(p.reduceMotion||p.sensoryFriendly))return;}
var shown=localStorage.getItem('introShown'),last=localStorage.getItem('introLastShown');
if(shown&&!(last&&Date.now()-parseInt(last,10)>1800000))return;
d.classList.add('intro-pending');
setTimeout(function(){d.classList.remove('intro-pending')},30000);
}catch(e){}})();`

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={openDyslexic.variable}>
      <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
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
