import { Nunito_Sans, Atkinson_Hyperlegible } from "next/font/google"
import localFont from "next/font/local"

/**
 * Nunito Sans
 * Warm, friendly geometric sans-serif with subtle rounded terminals.
 * Ideal for welcoming, empathetic headings and key accents.
 */
export const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ["400", "600", "700", "800"],
  display: "swap",
})

/**
 * Atkinson Hyperlegible
 * Developed by the Braille Institute of America specifically for low-vision readers.
 * Unambiguous character distinctions for maximum reading clarity.
 */
export const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-atkinson",
  weight: ["400", "700"],
  display: "swap",
})

/**
 * Classic Brand Font: Comic Neue (served locally)
 */
export const comicNeue = localFont({
  src: [
    { path: "../public/fonts/comic-neue/ComicNeue-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/comic-neue/ComicNeue-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-comic-neue",
  display: "swap",
})
