import localFont from "next/font/local"

// Serve the existing brand font locally so previews and production do not
// depend on Google Fonts being reachable during compilation.
export const comicNeue = localFont({
  src: [
    { path: "../public/fonts/comic-neue/ComicNeue-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/comic-neue/ComicNeue-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-comic-neue",
  display: "swap",
})