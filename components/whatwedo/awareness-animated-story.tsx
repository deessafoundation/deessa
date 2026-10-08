import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { WhatWeDoVideoPlayer } from "@/components/what-we-do/what-we-do-video-player"
import styles from "./awareness-animated-story.module.css"

export function AwarenessAnimatedStory({ content }: { content: WhatWeDoSettings["animatedStory"] }) {
  return (
    <section
      id="understanding-a-new-friend"
      aria-labelledby="animated-story-title"
      className={`${styles.story} mt-10 rounded-3xl border border-sky-100 bg-sky-50/60 p-5 sm:p-8`}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <WhatWeDoVideoPlayer
          src={content.videoSrc}
          posterSrc={content.posterSrc}
          label={content.videoLabel}
          areaLabel={content.areaLabel}
          playButtonLabel={content.playButtonLabel}
        />
        <div className={styles.copy}>
          <p className="mb-3 font-comic text-xs font-bold uppercase tracking-widest text-sky-700">{content.eyebrow}</p>
          <h2 id="animated-story-title" className="font-marissa text-3xl leading-tight text-slate-900 sm:text-4xl">{content.title}</h2>
          <p className="mt-4 font-comic text-base leading-7 text-slate-600">{content.description}</p>
          <h3 className="mt-6 font-comic text-lg font-bold text-slate-800">{content.listTitle}</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-comic text-base leading-7 text-slate-600">
            {content.items.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
