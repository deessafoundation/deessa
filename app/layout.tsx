import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import { StructuredData } from "@/components/seo/structured-data"
import { getOrganizationStructuredData, getWebSiteStructuredData } from "@/lib/seo/structured-data"
import "./globals.css"
import "./public-accessibility.css"
import "./print-styles.css"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
    template: "%s | deessa Foundation",
  },
  description:
    "A non-profit organization dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and their families across Nepal.",
  keywords: [
    "Nepal NGO",
    "autism Nepal",
    "autism support Nepal",
    "autistic children Nepal",
    "neurodiversity Nepal",
    "inclusive education",
    "special education Nepal",
    "disability rights Nepal",
    "child development Nepal",
    "community empowerment",
    "deessa Foundation",
  ],
  authors: [{ name: "deessa Foundation" }],
  creator: "deessa Foundation",
  publisher: "deessa Foundation",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "deessa Foundation",
    title: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
    description:
      "Dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and families across Nepal.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
    description:
      "Dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and families across Nepal.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@deessafoundation",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Generate structured data for the organization and website
  const organizationData = getOrganizationStructuredData()
  const websiteData = getWebSiteStructuredData()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData data={[organizationData, websiteData]} />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
