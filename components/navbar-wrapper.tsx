import { isSupportEnabled } from "@/lib/support/settings"
import { Navbar } from "./navbar"

export async function NavbarWrapper() {
  const supportEnabled = await isSupportEnabled()
  
  return <Navbar supportEnabled={supportEnabled} />
}
