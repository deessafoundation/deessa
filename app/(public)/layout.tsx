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
import { getSiteUiFlags } from "@/lib/site-status/settings"
import { getIntroVideoConfig } from "@/lib/data/intro-video"

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [siteFlags, introConfig] = await Promise.all([
    getSiteUiFlags(),
    getIntroVideoConfig(),
  ])

  // Build the pre-paint gate script dynamically based on introConfig
  let introGateScript: string | null = null
  if (introConfig.enabled) {
    const cooldownMs = (introConfig.behavior.cooldownMinutes || 30) * 60 * 1000
    const freq = introConfig.behavior.frequency
    const hpOnly = introConfig.behavior.homepageOnly

    introGateScript = `(function(){try{
var d=document.documentElement;
if(location.pathname.indexOf('/demo')===0)return;
${hpOnly ? "if(location.pathname!=='/')return;" : ""}
var raw=localStorage.getItem('deesha-a11y-preferences')||sessionStorage.getItem('deesha-a11y-preferences');
if(raw){var p=(JSON.parse(raw)||{}).preferences;if(p&&(p.reduceMotion||p.sensoryFriendly))return;}
${
  freq === "every_visit"
    ? ""
    : freq === "session"
      ? "if(sessionStorage.getItem('introSessionShown'))return;"
      : freq === "once_ever"
        ? "if(localStorage.getItem('introEverShown'))return;"
        : `var shown=localStorage.getItem('introShown'),last=localStorage.getItem('introLastShown');if(shown&&!(last&&Date.now()-parseInt(last,10)>${cooldownMs}))return;`
}
d.classList.add('intro-pending');
setTimeout(function(){d.classList.remove('intro-pending')},10000);
}catch(e){}})();`
  }

  return (
    <div className={openDyslexic.variable}>
      {introGateScript && <script dangerouslySetInnerHTML={{ __html: introGateScript }} />}
      {/* Skip to main content link - appears on Tab */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <AccessibilityProvider>
        <VideoModalProvider>
          <div
            className={`${comicNeue.variable} ${comicNeue.className} website-layout relative flex min-h-screen w-full flex-col`}
          >
            <IntroVideo config={introConfig} />
            <NavbarWrapper siteFlags={siteFlags} />
            <DevelopmentNoticeModal enabled={siteFlags.devNotice} />
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
