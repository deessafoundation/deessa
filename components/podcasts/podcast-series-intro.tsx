import Link from 'next/link';
import { Heart, Mic2, PlayCircle, UsersRound } from 'lucide-react';
import { Youtube } from '@/components/social-icons';

const hosts = [
  {
    initials: 'MP',
    name: 'Ms. Merina Panthi',
    role: 'President, deessa Foundation | Mother of children with autism | Podcast Host',
  },
  {
    initials: 'SS',
    name: 'Ms. Sarita Sapkota',
    role: 'Mother of children with autism | Podcast Host',
  },
];

export default function PodcastSeriesIntro() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-brand-primary/15 bg-gradient-to-br from-white via-bg-soft to-brand-primary/10 px-5 py-10 shadow-sm sm:px-8 md:py-14 lg:px-14">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-accent-education/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-white/80 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-brand-primary shadow-sm">
          <Mic2 className="h-4 w-4" />
          A parent-led podcast
        </div>

        <h1 className="font-heading text-4xl font-bold leading-tight text-text-main sm:text-5xl lg:text-6xl">
          Living with Autism:
          <span className="mt-2 block text-brand-primary">Real Voices. Real Stories.</span>
        </h1>

        <div className="mx-auto mt-7 max-w-4xl space-y-4 text-base leading-8 text-text-muted sm:text-lg">
          <p>
            A parent-led podcast by deessa Foundation, with technical support from SDG Studio,
            created to bring lived experiences of autism into the conversation.
          </p>
          <p>
            Through honest and meaningful conversations, the series shares the love, joy,
            challenges, questions, resilience, and hope of families raising children with autism.
            Expert insights help build understanding, challenge misconceptions, and promote
            empathy, acceptance, and inclusion.
          </p>
          <p className="font-semibold text-text-main">
            Every family&apos;s story matters, and listening is the first step towards understanding.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#episodes"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:bg-brand-primary-dark"
          >
            <PlayCircle className="h-5 w-5" />
            Explore all episodes
          </Link>
          <a
            href="https://www.youtube.com/@deessaFoundation/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand-primary/25 bg-white px-6 py-3 font-bold text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary/5"
          >
            <Youtube className="h-5 w-5" />
            Watch on YouTube
          </a>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-5xl">
        <div className="mb-7 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand-primary">
            Meet the hosts
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-text-main sm:text-4xl">
            Parents leading the conversation
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {hosts.map((host) => (
            <article
              key={host.name}
              className="group flex items-center gap-5 rounded-2xl border border-border/60 bg-white/90 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl sm:p-6"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-accent-education text-xl font-black text-white shadow-lg sm:h-24 sm:w-24 sm:text-2xl">
                {host.initials}
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-text-main sm:text-2xl">
                  {host.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">{host.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-brand-primary/15 bg-white/70 px-5 py-4 text-center font-semibold text-text-main">
          <UsersRound className="hidden h-5 w-5 shrink-0 text-brand-primary sm:block" />
          Two mothers. Two journeys. One shared commitment to acceptance, understanding, and inclusion.
          <Heart className="hidden h-5 w-5 shrink-0 text-brand-primary sm:block" />
        </div>
      </div>
    </section>
  );
}
