import type { LucideProps } from "lucide-react"
import { Camera, Globe, Link2, MessageCircle, Video } from "lucide-react"

export function Facebook(props: LucideProps) {
  return <Globe aria-hidden="true" {...props} />
}

export function Twitter(props: LucideProps) {
  return <MessageCircle aria-hidden="true" {...props} />
}

export function Instagram(props: LucideProps) {
  return <Camera aria-hidden="true" {...props} />
}

export function Youtube(props: LucideProps) {
  return <Video aria-hidden="true" {...props} />
}

export function Linkedin(props: LucideProps) {
  return <Link2 aria-hidden="true" {...props} />
}