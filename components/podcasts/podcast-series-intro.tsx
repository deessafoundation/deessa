'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Heart, Lightbulb, Mic2, Play, Plus, Quote, Users } from 'lucide-react';
import { useVideoModal } from '@/contexts/VideoModalContext';
import styles from './podcasts-page.module.css';
import type { Podcast } from '@/lib/types/podcast';

// Host information with actual photographs
const hosts = [
  {
    name: 'Merina Panthii',
    role: 'President, deessa Foundation',
    description: 'Parent & host — sharing real stories of raising children with autism',
    image: '/Merina Panthii.jpg'
  },
  {
    name: 'Sarita Sapkota',
    role: 'Parent & Host',
    description: 'Mother — bringing lived experiences to every conversation',
    image: '/Sarita Sapkota.jpg'
  },
];

// Conversation themes shown in the "Latest conversation" strip.
// Lucide icons tinted per theme rather than emoji, so the glyphs render
// identically on every OS instead of varying by platform font.
const conversationThemes = [
  { label: 'Parents’ experiences', Icon: Users, color: '#2F9BCA', fill: 'none' },
  { label: 'Expert perspectives', Icon: Lightbulb, color: '#D9A227', fill: 'none' },
  { label: 'Shared understanding', Icon: Heart, color: '#A8447F', fill: 'currentColor' },
];

export default function PodcastSeriesIntro({ latestEpisode }: { latestEpisode?: Podcast }) {
  const { openVideoModal } = useVideoModal();
  const watchLatest = () => {
    if (latestEpisode) openVideoModal(latestEpisode.youtubeId, latestEpisode.title);
  };

  return (
    <>
      <section aria-labelledby="podcast-title" className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}><Mic2 size={16} aria-hidden="true" />A parent-led video podcast</p>
            <h1 id="podcast-title" className={styles.heroTitle}>Living with Autism:<span>Real Voices.<br />Real Stories.</span></h1>
            <p className={styles.heroDescription}>Honest conversations about raising children with autism. The joy, the questions, and the hope that bring us together.</p>
            <div className={styles.actions}>
              {latestEpisode ? <button onClick={watchLatest} className={styles.primary}><Play size={16} fill="currentColor" aria-hidden="true" />Watch latest episode</button> : <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className={styles.primary}>Watch on YouTube<span className="sr-only"> (opens in a new tab)</span></a>}
              <Link href="#episodes" className={styles.secondary}>Browse episodes<ArrowDown size={16} aria-hidden="true" /></Link>
            </div>
            <div className={styles.credits}>
              <div><span>By</span><Image src="/logo.png" alt="deessa Foundation" width={138} height={47} /></div>
              <div><span>With technical support from</span><strong className={styles.sdgLogo}><span className={styles.sdgLetter} style={{ backgroundColor: '#12B2E9' }}>S</span><span className={styles.sdgLetter} style={{ backgroundColor: '#F7B52E' }}>D</span><span className={styles.sdgLetter} style={{ backgroundColor: '#82B94F' }}>G</span><span className={styles.sdgStudioWord}>Studio</span></strong></div>
            </div>
          </div>
          <div className={styles.banner}>
            <Image src="/podcast_banner.png" alt="Living with Autism: Real Voices Real Stories — Sarita and Merina in the podcast studio" width={1672} height={941} priority sizes="(max-width: 1023px) 92vw, 680px" />
          </div>
        </div>
        <div className={styles.conversationStrip}>
          {latestEpisode ? <button onClick={watchLatest} className={styles.latest}>
            <span className={styles.playCircle}><Play size={20} fill="currentColor" aria-hidden="true" /></span>
            <span><span className={styles.latestLabel}>Latest conversation{latestEpisode.episodeNumber ? ` · Ep. ${latestEpisode.episodeNumber}` : ''}</span><span className={styles.latestTitle}>{latestEpisode.title}</span></span>
          </button> : <p>A space for understanding, acceptance, and inclusion.</p>}
          <span className={styles.stripDivider} aria-hidden="true"><Plus size={18} strokeWidth={2.5} /></span>
          <ul className={styles.themes}>
            {conversationThemes.map(theme => (
              <li key={theme.label}>
                <span className={styles.themeIcon} style={{ color: theme.color }}>
                  <theme.Icon size={22} fill={theme.fill} strokeWidth={2} aria-hidden="true" />
                </span>
                <span>{theme.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className={styles.storyAndHosts}>
        <section aria-labelledby="series-about" className={styles.story}>
          <p className={styles.eyebrow}>More than a conversation</p>
          <h2 id="series-about" className={styles.sectionTitle}>Listening is the first step towards understanding.</h2>
          <p>Created to bring lived experiences of autism into the conversation, this series shares the real journeys of families — the love and joy, the challenges they navigate, and the hope that keeps them moving forward.</p>
          <p>Alongside parents’ stories, expert insights help challenge misconceptions and build empathy, acceptance, and inclusion. At deessa Foundation, we believe every family’s story matters.</p>
          <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className={styles.primary}>Visit our YouTube channel<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </section>
        <section aria-labelledby="hosts-title" className={styles.hosts}>
          <p className={styles.eyebrow}>Meet the hosts<Heart size={17} aria-hidden="true" /></p>
          <h2 id="hosts-title" className={styles.sectionTitle}>Parents leading the conversation</h2>
          <div className={styles.hostGrid}>
            {hosts.map(host => <article key={host.name} className={styles.hostCard}>
              <div className={styles.hostPhoto}><Image src={host.image} alt={host.name} fill sizes="(max-width: 639px) 85vw, (max-width: 1023px) 40vw, 260px" className="object-cover object-center" /></div>
              <div className={styles.hostBio}><span className={styles.hostLabel}>Your host</span><h3>{host.name}</h3><p className={styles.hostRole}>{host.role}</p><p>{host.description}</p></div>
            </article>)}
          </div>
          <p className={styles.hostQuote}><Quote size={17} aria-hidden="true" />Two mothers. Two journeys. One shared commitment to acceptance, understanding, and inclusion.</p>
        </section>
      </div>
    </>
  );
}
