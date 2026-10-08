import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import Image from "next/image"
import styles from "./inclusive-learning.module.css"

export function InclusiveLearning({ content }: { content: WhatWeDoSettings["inclusiveLearning"] }) {
  return (
    <section
      id="inclusive-learning"
      aria-labelledby="inclusive-learning-title"
      className={`${styles.section} mt-10 grid items-center gap-8 rounded-3xl border border-sky-100 bg-sky-50/60 p-5 sm:p-8 lg:grid-cols-2 lg:gap-12`}
    >
      <Image
        src={content.imageSrc}
        unoptimized={content.imageSrc.startsWith("https://")}
        alt={content.imageAlt}
        width={1200}
        height={1200}
        sizes="(max-width: 1023px) 100vw, 560px"
        className="h-auto w-full rounded-2xl"
      />
      <div className={styles.copy}>
        <p className="mb-4 font-comic text-xs font-bold uppercase tracking-widest text-sky-700">{content.eyebrow}</p>
        <h2 id="inclusive-learning-title" className="font-marissa text-3xl leading-tight text-slate-900 sm:text-4xl">{content.title}</h2>
        <blockquote className="mt-5 border-l-4 border-sky-300 pl-5 font-comic text-lg leading-8 text-slate-700">{content.quote}</blockquote>
        <p className="mt-5 font-comic text-base leading-7 text-slate-600">{content.description}</p>
        <h3 className="mt-6 font-comic text-lg font-bold text-slate-900">{content.listTitle}</h3>
        <ul className="mt-3 list-disc space-y-3 pl-5 font-comic text-base leading-7 text-slate-700">
          {content.items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    </section>
  )
}
