'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ArchiveThumbnailImageProps {
  src: string;
  youtubeId: string;
  alt: string;
  sizes?: string;
  className?: string;
}

export function ArchiveThumbnailImage({
  src,
  youtubeId,
  alt,
  sizes = '(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw',
  className = 'object-cover transition-transform duration-700 group-hover:scale-110',
}: ArchiveThumbnailImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const sources = [
    src,
    youtubeId ? `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg` : '',
    '/placeholder.svg',
  ].filter(Boolean);
  const currentSource = sources.find((source) => !failedSources.includes(source));

  if (!currentSource) {
    return <span className="sr-only">Thumbnail unavailable for {alt}</span>;
  }

  return (
    <Image
      src={currentSource}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setFailedSources((previous) => [...previous, currentSource])}
    />
  );
}
