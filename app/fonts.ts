/**
 * Font Configuration
 * 
 * Configures custom fonts for the application using Next.js localFont.
 * Includes OpenDyslexic font for accessibility features.
 */

import localFont from 'next/font/local'

/**
 * OpenDyslexic Font
 * 
 * A font designed to increase readability for readers with dyslexia.
 * Features weighted bottoms, unique character shapes, and increased spacing.
 * 
 * LICENSE: SIL Open Font License (OFL)
 * AUTHOR: Abelardo Gonzalez
 * WEBSITE: https://opendyslexic.org/
 * 
 * Using OTF format from public/fonts/open_dyslexic/
 */
export const openDyslexic = localFont({
  src: [
    {
      path: '../public/fonts/open_dyslexic/OpenDyslexic-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/open_dyslexic/OpenDyslexic-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/open_dyslexic/OpenDyslexic-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/open_dyslexic/OpenDyslexic-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-dyslexic',
  display: 'swap', // Show fallback immediately, swap when dyslexic font loads
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
  preload: false, // Don't preload - only load when user enables it
  adjustFontFallback: 'Arial', // Minimize layout shift during font load
})
