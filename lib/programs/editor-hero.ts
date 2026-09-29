import type { ProgramDocument } from './content'

type Hero = ProgramDocument['hero']

/** Drafts before the CMS schema used cta/secondaryCta and a string image. */
export function readEditorHero(value: unknown, title: string, description: string): Hero {
  const hero = (value && typeof value === 'object' ? value : {}) as Partial<Hero> & {
    cta?: Hero['actions'][number]
    secondaryCta?: Hero['actions'][number]
    imageAlt?: string
  }
  const image = typeof hero.image === 'string'
    ? (hero.image ? { url: hero.image, alt: hero.imageAlt || hero.title || title } : undefined)
    : hero.image
  return {
    ...hero,
    title: hero.title || title,
    description: hero.description || description,
    image,
    actions: hero.actions || [hero.cta && { ...hero.cta, variant: hero.cta.variant || 'primary' }, hero.secondaryCta && { ...hero.secondaryCta, variant: hero.secondaryCta.variant || 'secondary' }].filter((action): action is Hero['actions'][number] => Boolean(action)),
  }
}
