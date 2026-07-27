import { isSupportEnabled, getRegisterButtonConfig } from "@/lib/support/settings"
import { Navbar } from "./navbar"

export async function NavbarWrapper() {
  const [supportEnabled, registerConfig] = await Promise.all([
    isSupportEnabled(),
    getRegisterButtonConfig(),
  ])
  
  return <Navbar supportEnabled={supportEnabled} registerConfig={registerConfig} />
}
