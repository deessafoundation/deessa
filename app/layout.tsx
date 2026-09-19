import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import { StructuredData } from "@/components/seo/structured-data"
import { getOrganizationStructuredData, getWebSiteStructuredData } from "@/lib/seo/structured-data"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Deessa Foundation - Empowering Nepal Through Education & Social Development",
    template: "%s | Deessa Foundation",
  },
  description:
    "A non-profit organization dedicated to sustainable development, quality education, healthcare, and social upliftment for the most vulnerable communities in Nepal, with a special focus on children with disabilities and autism.",
  keywords: [
    "Nepal NGO",
    "autism support Nepal",
    "education Nepal",
    "disability rights",
    "child development",
    "sustainable development",
    "social welfare Nepal",
    "special education",
    "inclusive education",
    "community empowerment",
  ],
  authors: [{ name: "Deessa Foundation" }],
  creator: "Deessa Foundation",
  publisher: "Deessa Foundation",
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
    siteName: "Deessa Foundation",
    title: "Deessa Foundation - Empowering Nepal",
    description:
      "Dedicated to sustainable development, quality education, and social upliftment for the most vulnerable in Nepal.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Deessa Foundation - Empowering Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deessa Foundation - Empowering Nepal",
    description:
      "Dedicated to sustainable development, quality education, and social upliftment for the most vulnerable in Nepal.",
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
