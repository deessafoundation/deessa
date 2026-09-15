'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Heart, Mic2, Play, Quote } from 'lucide-react';
import { useVideoModal } from '@/contexts/VideoModalContext';
import type { Podcast } from '@/lib/types/podcast';

// Replace these temporary Unsplash portraits with approved host photographs.
const hosts = [
  { name: 'Ms. Merina Panthi', role: 'President, deessa Foundation', description: 'Mother of children with autism · Podcast Host', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&h=560&q=85' },
  { name: 'Ms. Sarita Sapkota', role: 'Podcast Host', description: 'Mother of children with autism', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&h=560&q=85' },
];

export default function PodcastSeriesIntro({ latestEpisode }: { latestEpisode?: Podcast }) {
  const { openVideoModal } = useVideoModal();
  const watchLatest = () => {
    if (latestEpisode) openVideoModal(latestEpisode.youtubeId, latestEpisode.title);
  };

  return (
    <>
      <section aria-labelledby="podcast-title" className="relative isolate overflow-hidden rounded-[2rem] border border-brand-primary/15 bg-[#edf6fa] px-6 py-10 sm:px-10 lg:px-12 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[35rem] w-[35rem] rounded-full bg-[#e7e0f2]/70" />
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#276781]"><Mic2 className="h-4 w-4" aria-hidden="true" /> A parent-led video podcast</p>
            <h1 id="podcast-title" className="mt-5 font-heading text-4xl font-bold leading-[1.2] text-text-main sm:text-5xl lg:text-[3.3rem]">Living with Autism:<span className="mt-3 block text-[#2784aa]">Real Voices.<br />Real Stories.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-text-muted sm:text-lg sm:leading-8">Honest conversations about raising children with autism. The joy, the questions, and the hope that bring us together.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {latestEpisode && <button onClick={watchLatest} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 font-bold text-white shadow-lg shadow-brand-primary/20 transition-colors hover:bg-brand-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch latest episode</button>}
              {!latestEpisode && <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 font-bold text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-dark"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch on YouTube<span className="sr-only"> (opens in a new tab)</span></a>}
              <Link href="#episodes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#276781]/25 bg-white/70 px-6 py-3 font-semibold text-[#276781] transition-colors hover:bg-white">Browse episodes <ArrowDown className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <p className="mt-6 text-xs leading-6 text-text-muted">By <span className="font-semibold text-text-main">deessa Foundation</span><br />With technical support from <span className="font-semibold text-text-main">SDG Studio</span></p>
          </div>
          <div className="relative min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-xl shadow-[#34485b]/10">
              <Image src="/podcast_banner.png" alt="Living with Autism: Real Voices Real Stories — Sarita and Merina in the podcast studio" width={1672} height={941} priority sizes="(max-width: 1023px) 90vw, 580px" className="aspect-video w-full object-contain" />
              {latestEpisode ? (
                <button onClick={watchLatest} className="group flex w-full items-center gap-4 border-t border-brand-primary/10 p-5 text-left transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary sm:p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ebf5fa] text-[#2784aa] transition-colors group-hover:bg-brand-primary group-hover:text-white"><Play className="h-5 w-5 fill-current" aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-widest text-[#2784aa]">Latest conversation{latestEpisode.episodeNumber ? ` · Ep. ${latestEpisode.episodeNumber}` : ''}</span><span className="mt-1 line-clamp-2 block text-sm font-semibold leading-6 text-text-main">{latestEpisode.title}</span></span>
                </button>
              ) : <p className="p-5 text-center text-sm text-text-muted">A space for understanding, acceptance, and inclusion.</p>}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#5a5270]"><span>Parents’ experiences</span><span>Expert perspectives</span><span>Shared understanding</span></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="series-about" className="grid gap-8 px-2 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2784aa]">More than a conversation</p><h2 id="series-about" className="mt-3 font-heading text-3xl font-bold leading-snug text-text-main sm:text-4xl">Listening is the first step towards understanding.</h2></div>
        <div className="space-y-4 text-base leading-8 text-text-muted">
          <p>Created to bring lived experiences of autism into the conversation, this series shares the real journeys of families — the love and joy, the challenges they navigate, and the hope that keeps them moving forward.</p>
          <p>Alongside parents’ stories, expert insights help challenge misconceptions and build empathy, acceptance, and inclusion. At deessa Foundation, we believe every family’s story matters.</p>
          <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#2784aa] underline decoration-brand-primary/30 underline-offset-4 hover:decoration-brand-primary">Visit our YouTube channel <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </section>

      <section aria-labelledby="hosts-title" className="rounded-[2rem] bg-[#f0edf5] px-6 py-10 sm:px-10 lg:p-12">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#756091]">Meet the hosts</p><h2 id="hosts-title" className="mt-3 font-heading text-3xl font-bold text-text-main sm:text-4xl">Parents leading the conversation</h2></div><Heart className="hidden h-9 w-9 text-[#9b83b4] lg:block" strokeWidth={1.3} aria-hidden="true" /></div>
        <div className="grid gap-5 md:grid-cols-2">
          {hosts.map((host) => (
            <article key={host.name} className="flex flex-col overflow-hidden rounded-2xl border border-white bg-white/90 sm:flex-row md:flex-col xl:flex-row">
              <div className="relative h-56 shrink-0 sm:h-auto sm:w-40 md:h-56 md:w-auto xl:h-auto xl:w-40">
                <Image src={host.image} alt="Temporary stock portrait; not a photograph of the host" fill unoptimized sizes="(min-width: 1280px) 160px, (min-width: 768px) 40vw, 90vw" className="object-cover object-[center_30%]" />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Temporary portrait</span>
              </div>
              <div className="flex flex-col justify-center p-6 lg:py-8"><span className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#756091]">Your host</span><h3 className="text-xl font-bold text-text-main">{host.name}</h3><p className="mt-2 text-sm font-semibold text-[#756091]">{host.role}</p><p className="mt-2 text-sm leading-6 text-text-muted">{host.description}</p></div>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-7 flex max-w-3xl items-start justify-center gap-3 text-center text-sm leading-7 text-[#635271] sm:text-base"><Quote className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />Two mothers. Two journeys. One shared commitment to acceptance, understanding, and inclusion.</p>
      </section>
    </>
  );
}
