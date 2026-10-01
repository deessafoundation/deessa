import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Check, Heart, MessageCircle, Users } from 'lucide-react'
import { DemoAction } from './DemoInteractions'
import s from './campaign-concept.module.css'

const milestones = [
  ['01', 'Listen & connect', 'Start with families, local educators and the questions that matter in their everyday lives.', 'Complete'],
  ['02', 'Learn & make', 'Bring practical workshops and communication resources into more communities.', 'In progress'],
  ['03', 'Keep showing up', 'Follow up with families and strengthen the local connections that help support last.', 'Up next'],
]

export function CampaignConcept() {
  return <div className={s.page}>
    <section className={s.hero}>
      <div className={s.heroCopy}>
        <span className={s.eyebrow}>CAMPAIGNS / THE 1,000 FAMILIES INITIATIVE</span>
        <h1>A little support.<br />A world of<br /><em>possibility.</em></h1>
        <p>Let’s bring communication tools, practical guidance and a sense of belonging to 1,000 families across Nepal.</p>
        <a className={s.primary} href="#campaign-participate">Find your part in the story <ArrowUpRight size={18} /></a>
        <a className={s.quiet} href="#campaign-why">Get to know the campaign <ArrowDown size={16} /></a>
      </div>
      <div className={s.heroVisual}>
        <Image src="/twins-together.jpg" alt="Two children together outdoors; illustrative campaign photograph" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
        <span className={s.photoLabel}><Heart size={17} /> Every family. Every possibility.</span>
        <div className={s.heroCaption}>ONE SHARED GOAL.<br /><strong>A thousand different stories.</strong></div>
      </div>
    </section>

    <section className={s.progress} aria-labelledby="campaign-progress-title">
      <div><span className={s.eyebrow}>OUR SHARED GOAL</span><h2 id="campaign-progress-title"><strong>820</strong> <span>of 1,000 families</span></h2><p>Connected with tools, learning and community.</p></div>
      <div className={s.progressTrack}><div><strong>82% of the way there</strong><span>180 families to go</span></div><progress value={820} max={1000} aria-label="Sample reach: 820 of 1000 families" /><p>Illustrative progress · September 2026</p></div>
    </section>

    <nav className={s.sections} aria-label="On this campaign page"><a href="#campaign-why">The purpose</a><a href="#campaign-journey">Our journey</a><a href="#campaign-stories">People & stories</a><a href="#campaign-participate">Get involved <ArrowUpRight size={15} /></a></nav>

    <section id="campaign-why" className={s.purpose}>
      <div><span className={s.eyebrow}>WHY THIS MATTERS</span><h2>No family should have to<br /><em>figure it all out alone.</em></h2></div>
      <div><p>A child has something to say. A parent is looking for a way to understand. Sometimes, the first step is a simple picture board. Sometimes, it is meeting someone who listens.</p><p>This campaign brings those first steps closer to home, with practical support that families can use in their own routines.</p></div>
    </section>
    <section className={s.promiseGrid} aria-label="What the campaign provides">
      {[[MessageCircle, 'Tools to express', 'Picture boards, visual routines and everyday resources that families can make their own.'], [Users, 'Space to connect', 'Welcoming workshops where families learn alongside educators and local facilitators.'], [Heart, 'Support to grow', 'Follow-up conversations and community connections that continue beyond the first session.']].map(([Icon, title, copy]) => { const Symbol = Icon as typeof Heart; return <article key={String(title)}><Symbol size={27} strokeWidth={1.5} /><h3>{String(title)}</h3><p>{String(copy)}</p></article> })}
    </section>

    <section id="campaign-journey" className={s.journey}>
      <header><span className={s.eyebrow}>STEP BY STEP, TOGETHER</span><h2>A goal becomes<br /><em>a journey.</em></h2><p>From the first conversation to the next community workshop, here is how the campaign moves forward.</p></header>
      <ol>{milestones.map(([number, title, copy, status]) => <li key={number}><span className={s.step}>{number === '01' ? <Check size={18} /> : number}</span><div><span className={s.status}>{status}</span><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
    </section>

    <section id="campaign-stories" className={s.story}>
      <div className={s.storyPhoto}><Image src="/deessa-resources/IMG_8102.JPG" alt="Children together near bookshelves; illustrative family photograph" fill sizes="(max-width: 760px) 100vw, 50vw" /><span>THE PEOPLE BEHIND THE PROGRESS</span></div>
      <div className={s.storyCopy}><span className={s.eyebrow}>A MOMENT FROM THE JOURNEY</span><h2>It starts with<br /><em>“I understand.”</em></h2><p>At a community session, a parent tries a picture board for the first time. A small choice becomes a conversation, and a new possibility to take home.</p><blockquote>“We left with something we could try together. That made the next step feel possible.”</blockquote><span className={s.note}>Illustrative family story and quote</span><details><summary>Read the workshop story <ArrowUpRight size={17} /></summary><p>Families explored visual choices through familiar activities: choosing a snack, planning a morning and asking for a break. The session ended with each family making a board to adapt at home, followed by a planned check-in with a facilitator.</p></details></div>
    </section>

    <section className={s.reach}><div><span className={s.eyebrow}>MORE THAN A NUMBER</span><h2>Connection, in many forms.</h2><p>Sample campaign reach · September 2026</p></div><dl>{[['820', 'families connected'], ['156', 'learning sessions'], ['25', 'districts reached']].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>

    <section className={s.gallery}><header><div><span className={s.eyebrow}>A FEW MOMENTS ALONG THE WAY</span><h2>This is what<br /><em>together looks like.</em></h2></div><p>Learning, listening and making space for each other. A glimpse of the everyday moments behind a shared goal.</p></header><div className={s.galleryGrid}>{[['/twins-together.jpg', 'Connection begins with being together.'], ['/deessa-resources/IMG_8102.JPG', 'Everyday moments. New possibilities.'], ['/twins-together.jpg', 'A little more confidence for tomorrow.']].map(([src, caption], i) => <figure key={caption}><div><Image src={src} alt={`Illustrative photograph: ${caption}`} fill sizes="(max-width: 760px) 100vw, 40vw" style={{ objectPosition: i === 2 ? '75% center' : 'center' }} /></div><figcaption><span>0{i + 1}</span>{caption}</figcaption></figure>)}</div><p className={s.note}>Illustrative imagery for this design preview.</p></section>

    <section id="campaign-participate" className={s.participate}><div><span className={s.eyebrow}>THERE IS A PLACE FOR YOU HERE</span><h2>Bring what you can.<br /><em>Be part of what’s next.</em></h2><p>Your time, your skills or a conversation can help this community grow.</p></div><div className={s.participationOptions}><article><span>01 / GIVE YOUR TIME</span><h3>Help a session happen.</h3><p>Support a workshop, translate a resource or connect us with your community.</p><DemoAction label="Explore ways to volunteer" message="Preview: workshop support, translation and community coordination are example volunteer roles. Enquiries will be available when the campaign launches." /></article><article><span>02 / START A CONVERSATION</span><h3>Help the story travel.</h3><p>Bring everyday communication into conversations with friends, schools and local groups.</p><DemoAction label="See a message to share" message="Every family deserves tools, connection and support. Discover the 1,000 Families campaign and imagine what we can make possible together. (Sample campaign message.)" /></article></div></section>
  </div>
}
