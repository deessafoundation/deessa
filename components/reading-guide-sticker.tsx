'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GUIDE_STICKERS, type GuideSticker } from '@/lib/types/accessibility'

/** A missing or broken optional PNG always leaves the friendly emoji visible. */
export function ReadingGuideSticker({ id }: { id: GuideSticker }) {
  const sticker = GUIDE_STICKERS.find(option => option.id === id) ?? GUIDE_STICKERS[0]
  const [failedSource, setFailedSource] = useState<string | null>(null)
  return <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: '100%', height: '100%' }}>
    {sticker.image && sticker.image !== failedSource
      ? <Image src={sticker.image} alt="" width={64} height={64} unoptimized draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setFailedSource(sticker.image)} />
      : sticker.emoji}
  </span>
}
