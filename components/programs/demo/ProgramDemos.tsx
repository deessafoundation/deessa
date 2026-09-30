import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Users,
  MapPin,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  Sun,
} from "lucide-react"
import { CommunicationBoard, DemoAction } from "./DemoInteractions"
import {
  demoPages,
  serviceSupport,
  serviceSteps,
  serviceFaqs,
  outreachStops,
  researchStages,
  type DemoCategory,
} from "./demo-content"
import s from "./programs.module.css"
import { CampaignConcept } from "./CampaignConcept"

const service = s
const outreach = s
const research = s

const photos = {
  children: "/twins-together.jpg",
  family: "/deessa-resources/IMG_8102.JPG",
  community: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85",
  learning: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=85",
  hands: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1800&q=85",
}

function Photo({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={`${s.photo} ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 60vw" priority={priority} />
    </div>
  )
}

function Shell({ category, children }: { category: DemoCategory; children: ReactNode }) {
  return (
    <div className={`${s.root} ${s[category]}`}>
      <div className={s.demoBar}>
        <div className={s.container}>
          <span>
            <span className={s.previewDot} /> DESIGN PREVIEW{" "}
            <span className={s.dummyLabel}>/ Sample content & illustrative imagery</span>
          </span>
          <Link href="/demo/programs">
            All concepts <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <nav className={s.switcher} aria-label="Program design concepts">
        <div className={s.container}>
          {demoPages.map((page) => (
            <Link
              key={page.slug}
              href={`/demo/${page.slug}`}
              aria-current={category === page.category ? "page" : undefined}
            >
              <span>{page.number}</span>
              {page.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
      <div className={`${s.container} ${s.nextConcept}`}>
        <span>FOUR WAYS TO TELL OUR STORY</span>
        <nav aria-label="Explore another category">
          {demoPages
            .filter((page) => page.category !== category)
            .map((page) => (
              <Link href={`/demo/${page.slug}`} key={page.slug}>
                {page.label}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
        </nav>
      </div>
    </div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className={s.kicker}>{children}</div>
}
function Anchor({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return (
    <a className={secondary ? s.textLink : s.button} href={href}>
      {children}
      {secondary ? <ArrowDown size={17} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
    </a>
  )
}
function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className={s.sectionHeading}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  )
}
function Faqs({ items }: { items: string[][] }) {
  return (
    <div className={s.faqs}>
      {items.map(([question, answer]) => (
        <details key={question}>
          <summary>
            {question}
            <Plus size={20} aria-hidden="true" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  )
}
function MetricGrid({ items }: { items: [string, string][] }) {
  return (
    <div className={s.metricGrid}>
      {items.map(([value, label]) => (
        <div className={s.metric} key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
function Gallery({
  eyebrow,
  title,
  text,
  items,
}: {
  eyebrow: string
  title: string
  text: string
  items: [string, string, string][]
}) {
  return (
    <section className={`${s.container} ${s.gallerySection}`}>
      <SectionTitle eyebrow={eyebrow} title={title} text={text} />
      <div className={s.galleryGrid}>
        {items.map(([src, alt, caption]) => (
          <figure key={caption}>
            <Photo src={src} alt={alt} />
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export function ServiceDemo() {
  return (
    <Shell category="service">
      <section className={`${s.container} ${service.serviceHero}`}>
        <div className={service.heroCopy}>
          <Eyebrow>
            <span className={service.tinyLine} /> SERVICES & PROGRAMS
          </Eyebrow>
          <h1>
            Every little
            <br />
            expression.
            <br />
            <em>A big possibility.</em>
          </h1>
          <p>
            Communication looks different for every child. We help families discover the tools, confidence and
            connections to find their own way.
          </p>
          <div className={s.actions}>
            <Anchor href="#support">Find support for your family</Anchor>
            <Anchor href="#about" secondary>
              Explore the program
            </Anchor>
          </div>
          <div className={s.heroNote}>
            <Heart size={18} aria-hidden="true" /> At your pace. By your side.
          </div>
        </div>
        <div className={service.servicePortrait}>
          <Photo src={photos.children} alt="Two children sharing a moment outdoors; illustrative photograph" priority />
          <span className={s.portraitSticker}>
            <Sparkles size={22} aria-hidden="true" /> Every mind
            <br />
            is a gift.
          </span>
          <div className={s.photoNote}>A connection can begin with the smallest moment.</div>
        </div>
      </section>
      <div className={`${s.container} ${service.serviceFacts}`}>
        <div>
          <span>THE PROGRAM</span>
          <strong>AAC communication support</strong>
        </div>
        <div>
          <span>WHO IT’S FOR</span>
          <strong>Children & their families</strong>
        </div>
        <div>
          <span>WHERE WE CONNECT</span>
          <strong>Lalitpur + online</strong>
        </div>
        <div>
          <span>OUR APPROACH</span>
          <strong>Family-centered, always</strong>
        </div>
      </div>
      <section id="about" className={`${s.container} ${s.section}`}>
        <SectionTitle
          eyebrow="A LITTLE UNDERSTANDING GOES A LONG WAY"
          title="More ways to say “this is me.”"
          text="AAC means augmentative and alternative communication. It can be a picture, a gesture or a digital tool. What matters is finding what feels right for your child."
        />
        <div className={s.supportGrid}>
          {serviceSupport.map((item, index) => {
            const Icon = [MessageCircle, Heart, Users][index]
            return (
              <article key={item.title}>
                <span className={s.serviceIcon}>
                  <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className={s.cardNumber}>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>
      <section className={service.serviceJourney}>
        <div className={`${s.container} ${s.journeyGrid}`}>
          <div>
            <Eyebrow>NO TWO JOURNEYS ARE THE SAME</Eyebrow>
            <h2>
              We start
              <br />
              where you are.
            </h2>
            <p>You don’t need all the answers before reaching out. We’ll figure out the next step together.</p>
            <span className={s.handwritten}>Small steps count, too.</span>
          </div>
          <ol className={s.steps}>
            {serviceSteps.map(([title, text], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${s.container} ${s.storySection}`}>
        <Photo
          src={photos.family}
          alt="Two children sitting together in front of bookshelves; illustrative photograph"
        />
        <div>
          <Eyebrow>THE MOMENTS THAT MATTER</Eyebrow>
          <blockquote>“It wasn’t just a new way to communicate. It was a new way to connect.”</blockquote>
          <p>A sample family story about finding everyday moments of understanding through a simple picture board.</p>
          <span className={s.storyCredit}>A parent’s perspective · Illustrative story</span>
          <div className={s.miniStats}>
            <div>
              <strong>120</strong>
              <span>families learning together</span>
            </div>
            <div>
              <strong>24</strong>
              <span>community sessions</span>
            </div>
          </div>
        </div>
      </section>
      <section id="support" className={`${s.container} ${s.faqSection}`}>
        <div>
          <Eyebrow>LET’S MAKE THE FIRST STEP EASIER</Eyebrow>
          <h2>
            A few things
            <br />
            you might wonder.
          </h2>
          <p>Every family’s questions are welcome.</p>
        </div>
        <Faqs items={serviceFaqs} />
      </section>
      <section className={`${s.container} ${s.serviceCta}`}>
        <div>
          <Eyebrow>YOU DON’T HAVE TO FIGURE IT OUT ALONE</Eyebrow>
          <h2>
            Let’s find your next
            <br />
            <em>small step.</em>
          </h2>
        </div>
        <div>
          <p>Start with a conversation about your family and the support you’re looking for.</p>
          <DemoAction
            label="Ask about communication support"
            message="In the live service, this would open a program-specific support enquiry."
          />
        </div>
      </section>
      <section className={`${s.container} ${s.metricSection}`}>
        <SectionTitle
          eyebrow="A SAMPLE IMPACT SNAPSHOT"
          title="Small steps, visible change."
          text="Example numbers show how an impact section could help families understand the scale of a program."
        />
        <MetricGrid
          items={[
            ["120+", "families learning together"],
            ["24", "community sessions"],
            ["850", "tools shared"],
            ["3", "ways to practice"],
          ]}
        />
      </section>
      <Gallery
        eyebrow="A GLIMPSE OF THE WORK"
        title="Support lives in everyday moments."
        text="A flexible gallery gives the CMS a place for event photos, family stories and practical resources. Images are illustrative."
        items={[
          [
            photos.children,
            "Two children sharing a moment outdoors; illustrative photograph",
            "Connection can begin with a look.",
          ],
          [photos.learning, "Children learning together; illustrative photograph", "Learning feels welcoming."],
          [
            photos.community,
            "Friends gathered outdoors; illustrative photograph",
            "Families are part of the solution.",
          ],
          [photos.hands, "Hands gathered together; illustrative photograph", "Small acts add up over time."],
        ]}
      />
    </Shell>
  )
}

export function CampaignDemo() {
  return (
    <Shell category="campaign">
      <CampaignConcept />
    </Shell>
  )
}

export function OutreachDemo() {
  return (
    <Shell category="outreach">
      <section className={`${s.container} ${outreach.outreachIntro}`}>
        <div>
          <Eyebrow>COMMUNITY & OUTREACH / FIELD JOURNAL 01</Eyebrow>
          <h1>
            Good things
            <br />
            happen <em>together.</em>
          </h1>
        </div>
        <div>
          <span className={outreach.outreachStamp}>
            LISTEN.
            <br />
            LEARN.
            <br />
            CONNECT.
          </span>
          <p>
            A community learning journey.
            <br />
            Three places. Many perspectives.
            <br />A little more understanding.
          </p>
        </div>
      </section>
      <section className={`${s.container} ${outreach.outreachCover}`}>
        <Photo
          src={photos.community}
          alt="A group of friends enjoying time together outdoors; illustrative stock photograph"
          priority
        />
        <span className={outreach.paperLabel}>
          <MapPin size={18} aria-hidden="true" /> Across the Kathmandu Valley
        </span>
        <div className={outreach.coverCaption}>
          <span>THE COMMUNITY CONNECTION SERIES</span>
          <span>APRIL 2026 · SAMPLE JOURNAL</span>
        </div>
      </section>
      <div className={outreach.outreachRibbon}>
        <div className={s.container}>
          <span>
            140 <small>people connected</small>
          </span>
          <span>
            3 <small>communities</small>
          </span>
          <span>
            1 <small>shared conversation</small>
          </span>
          <a href="#field-notes">
            Explore the journey <ArrowDown size={19} aria-hidden="true" />
          </a>
        </div>
      </div>
      <section className={`${s.container} ${outreach.outreachOpening}`}>
        <Eyebrow>IT STARTS WITH SHOWING UP</Eyebrow>
        <div>
          <h2>
            Not a lecture.
            <br />A conversation.
          </h2>
          <p>
            We brought families, teachers and local volunteers into the same space. To listen first. To try something
            new. To turn “I’m not sure” into “let’s find out together.”
          </p>
          <p>
            Through hands-on activities and honest conversations, our sample outreach series explores what inclusion can
            look like in everyday community life.
          </p>
        </div>
      </section>
      <section id="field-notes" className={`${s.container} ${s.section}`}>
        <SectionTitle eyebrow="POSTCARDS FROM THE JOURNEY" title="Different places. Shared hopes." />
        <div className={outreach.postcards}>
          {outreachStops.map((stop, index) => (
            <article key={stop.place}>
              <div className={outreach.postcardTop}>
                <span>STOP 0{index + 1}</span>
                <span>{stop.date}</span>
              </div>
              <MapPin size={24} aria-hidden="true" />
              <h3>{stop.place}</h3>
              <h4>{stop.title}</h4>
              <p>{stop.text}</p>
              <span className={s.participantCount}>{stop.count}</span>
            </article>
          ))}
        </div>
      </section>
      <section className={s.photoEssay}>
        <div className={s.container}>
          <SectionTitle
            eyebrow="THE LITTLE MOMENTS IN BETWEEN"
            title="Learning looks like this."
            text="Making, sharing, asking, laughing. A photo story brings the experience into focus. Images here are illustrative."
          />
          <div className={s.essayGrid}>
            <figure>
              <Photo
                src={photos.learning}
                alt="Children gathered in a learning setting; illustrative stock photograph"
              />
              <figcaption>
                <span>01</span> Space for curiosity. Space for questions.
              </figcaption>
            </figure>
            <figure>
              <Photo src={photos.family} alt="Two children embracing near bookshelves; illustrative photograph" />
              <figcaption>
                <span>02</span> Connection is where understanding begins.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className={`${s.container} ${outreach.outreachVoice}`}>
        <Eyebrow>COMMUNITY VOICES</Eyebrow>
        <blockquote>
          “We came with questions.
          <br />
          We left with ideas —<br />
          <em>and each other.”</em>
        </blockquote>
        <p>A community participant · Sample story</p>
      </section>
      <section className={`${s.container} ${outreach.outreachCta}`}>
        <span className={outreach.outreachAsterisk} aria-hidden="true">
          ✳
        </span>
        <div>
          <Eyebrow>LET’S KEEP THE CONVERSATION GOING</Eyebrow>
          <h2>
            Your community.
            <br />
            Our next chapter?
          </h2>
          <p>Bring a learning session to your school, neighborhood or community group.</p>
          <DemoAction
            label="Explore hosting a session"
            message="In the live page, you could tell us about your community and preferred session."
          />
        </div>
      </section>
      <section className={`${s.container} ${s.metricSection}`}>
        <SectionTitle
          eyebrow="BY THE NUMBERS"
          title="A journey you can feel."
          text="A simple impact block gives the field journal a clear sense of reach without losing the human stories."
        />
        <MetricGrid
          items={[
            ["140", "people connected"],
            ["3", "communities visited"],
            ["9", "local facilitators"],
            ["12h", "shared conversation"],
          ]}
        />
      </section>
      <Gallery
        eyebrow="FIELD NOTES / VISUAL EDITION"
        title="The details tell the story."
        text="The gallery can grow with each outreach stop, giving the admin team a flexible way to publish a living journal."
        items={[
          [photos.community, "Friends gathered outdoors; illustrative photograph", "Arriving with curiosity."],
          [photos.learning, "Children in a learning setting; illustrative photograph", "Making space to try."],
          [photos.hands, "Hands gathered together; illustrative photograph", "Working things out together."],
          [photos.family, "Family moment near bookshelves; illustrative photograph", "Taking the idea home."],
        ]}
      />
    </Shell>
  )
}

export function ResearchDemo() {
  return (
    <Shell category="research">
      <section className={`${s.container} ${research.researchHero}`}>
        <div className={research.researchMeta}>
          <Eyebrow>RESEARCH & INNOVATION</Eyebrow>
          <span>
            <span className={research.liveDot} /> CONCEPT / IN EXPLORATION
          </span>
        </div>
        <div className={research.researchHeroGrid}>
          <div>
            <h1>
              Designed for
              <br />
              the everyday.
              <br />
              <em>Built around you.</em>
            </h1>
            <p>
              Meet deessa Companion. An exploration of simple digital tools that support communication, routines and
              everyday independence.
            </p>
            <div className={s.actions}>
              <Anchor href="#interactive-concept">Explore the concept</Anchor>
              <Anchor href="#approach" secondary>
                Our approach
              </Anchor>
            </div>
            <div className={research.researchTags}>
              <span>Accessible by design</span>
              <span>Family-informed</span>
              <span>Locally grounded</span>
            </div>
          </div>
          <div className={research.researchVisual}>
            <div className={research.visualOrbit} aria-hidden="true" />
            <div className={research.conceptCard}>
              <span className={research.conceptCardLabel}>THE EVERYDAY TOOLKIT</span>
              <div className={research.conceptSymbols}>
                <MessageCircle />
                <Sun />
                <Heart />
              </div>
              <h2>
                A little clarity.
                <br />A little confidence.
              </h2>
              <div className={research.conceptRoutine}>
                <Check size={18} aria-hidden="true" /> A morning routine, made yours.
              </div>
              <div className={research.conceptRoutine}>
                <MessageCircle size={18} aria-hidden="true" /> A new way to say what you need.
              </div>
              <span className={research.conceptFoot}>
                companion <span>by deessa</span>
              </span>
            </div>
            <span className={research.figureLabel}>FIG. 01 — SMALL TOOLS, EVERYDAY POSSIBILITIES</span>
          </div>
        </div>
      </section>
      <div className={research.researchStrip}>
        <div className={s.container}>
          <span>THE QUESTION</span>
          <p>How might a simple tool make everyday expression a little easier?</p>
          <ArrowDown size={22} aria-hidden="true" />
        </div>
      </div>
      <section id="approach" className={`${s.container} ${s.section}`}>
        <SectionTitle
          eyebrow="DESIGNING WITH, NOT JUST FOR"
          title="An idea shaped by listening."
          text="Useful tools begin with real life. Our sample research process puts families’ experiences at the center, from the first question to the next iteration."
        />
        <div className={research.researchStages}>
          {researchStages.map(([number, title, text]) => (
            <article key={number}>
              <Eyebrow>{number}</Eyebrow>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="interactive-concept" className={research.interactiveSection}>
        <div className={`${s.container} ${research.interactiveGrid}`}>
          <div>
            <Eyebrow>LESS EXPLAINING. MORE EXPLORING.</Eyebrow>
            <h2>
              A small window
              <br />
              into the idea.
            </h2>
            <p>
              Tap a few cards and build a phrase. This simplified communication board shows how a familiar, visual
              interface could help someone express a choice.
            </p>
            <ul className={research.checkList}>
              <li>
                <Check size={17} aria-hidden="true" /> Clear words paired with familiar symbols
              </li>
              <li>
                <Check size={17} aria-hidden="true" /> Generous touch targets and calm colors
              </li>
              <li>
                <Check size={17} aria-hidden="true" /> Space to explore without getting it wrong
              </li>
            </ul>
            <p className={s.fineprint}>Interactive design study. Not the released Companion app.</p>
          </div>
          <CommunicationBoard />
        </div>
      </section>
      <section className={`${s.container} ${research.researchNotes}`}>
        <div>
          <Eyebrow>WHAT WE’RE LEARNING</Eyebrow>
          <h2>
            The next version
            <br />
            starts with a question.
          </h2>
        </div>
        <div>
          <article>
            <span>INSIGHT 01</span>
            <h3>Familiarity comes first.</h3>
            <p>Everyday words and recognizable symbols can make the first interaction feel less demanding.</p>
          </article>
          <article>
            <span>INSIGHT 02</span>
            <h3>Flexibility matters.</h3>
            <p>Different routines, languages and preferences call for tools that can grow with a person.</p>
          </article>
          <p className={s.fineprint}>Illustrative research themes, not published study findings.</p>
        </div>
      </section>
      <section className={`${s.container} ${s.resources}`}>
        <SectionTitle eyebrow="OPEN NOTEBOOK" title="Explore the thinking." />
        <Faqs
          items={[
            [
              "Design brief / A calmer everyday experience",
              "This concept explores communication cards and visual routines in a simple, accessible interface. The next step would be co-design sessions with families and educators.",
            ],
            [
              "Accessibility notes / Clear, flexible, familiar",
              "The prototype uses labeled controls, keyboard interaction, visible focus states and large touch targets. A production tool would also need usability testing with its intended users.",
            ],
            [
              "Research roadmap / From questions to learning",
              "Sample roadmap: listen to families, build a small prototype, run supported trials, document feedback and refine. No study results are represented here.",
            ],
          ]}
        />
      </section>
      <section className={research.researchCta}>
        <div className={s.container}>
          <div>
            <Eyebrow>BETTER QUESTIONS. BETTER POSSIBILITIES.</Eyebrow>
            <h2>Help shape what comes next.</h2>
            <p>Families, educators, researchers and thoughtful collaborators: there’s a place for your perspective.</p>
          </div>
          <DemoAction
            label="Explore a collaboration"
            message="The live page would open a research collaboration enquiry."
          />
        </div>
      </section>
      <section className={`${s.container} ${s.metricSection}`}>
        <SectionTitle
          eyebrow="EARLY RESULTS / SAMPLE ONLY"
          title="Learning that shapes the next version."
          text="A results area can make the research journey legible while separating exploratory metrics from published findings."
        />
        <MetricGrid
          items={[
            ["3", "prototype rounds"],
            ["18", "design conversations"],
            ["6", "everyday routines mapped"],
            ["100%", "questions still welcome"],
          ]}
        />
      </section>
      <Gallery
        eyebrow="RESEARCH ARTEFACTS"
        title="Ideas you can see and try."
        text="A visual evidence section can hold prototype snapshots, workshop notes or short videos once the research is live."
        items={[
          [photos.learning, "Children learning together; illustrative photograph", "A routine begins with listening."],
          [photos.hands, "Hands working together; illustrative photograph", "Prototypes make questions tangible."],
          [photos.community, "Community group outdoors; illustrative photograph", "Feedback belongs in the room."],
          [photos.family, "Family moment near bookshelves; illustrative photograph", "Design follows real life."],
        ]}
      />
    </Shell>
  )
}

export function ProgramDemoIndex() {
  return (
    <div className={`${s.root} ${s.index}`}>
      <div className={`${s.container} ${s.indexIntro}`}>
        <Link className={s.textLink} href="/demo">
          ← All demos
        </Link>
        <Eyebrow>deessa / PROGRAM DESIGN EXPLORATIONS</Eyebrow>
        <h1>
          One foundation.
          <br />
          <em>Four different stories.</em>
        </h1>
        <p>Explore four ways to bring our work to life. All pages use sample content and illustrative imagery.</p>
        <div className={s.indexCards}>
          {demoPages.map((page) => (
            <Link key={page.slug} href={`/demo/${page.slug}`} className={s[page.category]}>
              <div>
                <span>
                  {page.number} / {page.label}
                </span>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <h2>{page.title}</h2>
              <p>{page.description}</p>
              <span>
                Explore concept <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
