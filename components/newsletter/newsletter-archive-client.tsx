"use client"

import { useState } from "react"
import { Calendar, Mail, ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { NewsletterForm } from "@/components/newsletter/newsletter-form"
import type { NewsletterCampaign } from "@/lib/data/newsletter"

interface NewsletterArchiveClientProps {
  campaigns: NewsletterCampaign[]
}

export function NewsletterArchiveClient({ campaigns }: NewsletterArchiveClientProps) {
  const [readingCampaign, setReadingCampaign] = useState<NewsletterCampaign | null>(null)

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
          <Sparkles className="size-3.5" />
          Community Bulletin
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Newsletter Archive
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Explore past community bulletins, family changemaker stories, ground-level milestones, and event highlights from deessa Foundation.
        </p>
      </section>

      {/* Campaigns Listing */}
      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">First Edition Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We are actively preparing our next community bulletin. Subscribe below to receive upcoming editions directly in your inbox.
          </p>
          <div className="mt-6 max-w-sm mx-auto">
            <NewsletterForm variant="inline" />
          </div>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <article
              key={camp.id}
              onClick={() => setReadingCampaign(camp)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <time dateTime={camp.sent_at || camp.created_at}>
                    {new Date(camp.sent_at || camp.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {camp.title}
                </h2>

                <p className="text-xs font-medium text-muted-foreground line-clamp-1 italic">
                  {camp.subject}
                </p>

                {camp.preview_text && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {camp.preview_text}
                  </p>
                )}
              </div>

              <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:underline">
                  Read Edition <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <BookOpen className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Subscription Banner Box */}
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-8 sm:p-10 max-w-3xl mx-auto shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Stay Connected with Our Mission
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get our monthly updates, community achievements, and inclusive neurodiversity resources delivered straight to your inbox.
          </p>
          <div className="pt-4 max-w-md mx-auto">
            <NewsletterForm variant="inline" />
          </div>
        </div>
      </section>

      {/* Reading Dialog Modal */}
      <Dialog open={Boolean(readingCampaign)} onOpenChange={(open) => !open && setReadingCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Calendar className="size-3.5" />
                <time>
                  {readingCampaign?.sent_at
                    ? new Date(readingCampaign.sent_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </time>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {readingCampaign?.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-foreground/80 mt-1">
                {readingCampaign?.subject}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div
              className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: readingCampaign?.content_html || "" }}
            />
          </div>

          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReadingCampaign(null)}
              className="h-9 text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
