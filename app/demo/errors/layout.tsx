import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Error-page previews",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
}

export default function ErrorPreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
