import { redirect } from 'next/navigation'

// Redirect /programs to /whatwedo
// Programs functionality remains available in admin panel at /admin/programs
export default function ProgramsPage() {
  redirect('/whatwedo')
}
