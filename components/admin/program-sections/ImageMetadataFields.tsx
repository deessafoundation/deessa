"use client"

import { useId } from 'react'
import type { ProgramDocument } from '@/lib/programs/content'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ImageRef = NonNullable<ProgramDocument['hero']['image']>
export function ImageMetadataFields({ image, onChange }: { image: ImageRef; onChange: (image: ImageRef) => void }) {
  const id = useId()
  return <div className="space-y-2">{(['alt', 'caption', 'focalPoint'] as const).map(field => <div key={field} className="space-y-1">
    <Label htmlFor={`${id}-${field}`} className="text-xs">{{ alt: 'Image description (alt text)', caption: 'Photo caption', focalPoint: 'Focal point (for example: 75% center)' }[field]}</Label>
    <Input id={`${id}-${field}`} value={image[field] || ''} maxLength={{ alt: 180, caption: 300, focalPoint: 40 }[field]} onChange={event => onChange({ ...image, [field]: event.target.value })} />
  </div>)}</div>
}
