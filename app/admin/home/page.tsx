import { redirect } from "next/navigation"

/**
 * Route Alias: /admin/home -> /admin/homepage
 * Ensures links or manual address bar navigations to /admin/home
 * resolve cleanly to the CMS Homepage Manager without a 404 error.
 */
export default function AdminHomeRedirect() {
  redirect("/admin/homepage")
}
