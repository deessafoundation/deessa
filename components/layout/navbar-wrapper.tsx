import { isSupportEnabled, getRegisterButtonConfig } from "@/lib/support/settings"
import type { SiteUiFlags } from "@/lib/site-status/types"
import { Navbar } from "./navbar"

interface NavbarWrapperProps {
  /** Fetched once by the public layout and shared with the navbar. */
  siteFlags: SiteUiFlags
}

export async function NavbarWrapper({ siteFlags }: NavbarWrapperProps) {
  const [supportEnabled, registerConfig] = await Promise.all([
    isSupportEnabled(),
    getRegisterButtonConfig(),
  ])

  return (
    <Navbar
      supportEnabled={supportEnabled}
      registerConfig={registerConfig}
      showBetaBadge={siteFlags.betaBadge}
    />
  )
}
