"use client"

import React, { useState, useRef } from "react"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import type { SummitScheduleDay, AccessibilityFeature } from "@/lib/data/accessibility-summit"
import { cn } from "@/lib/utils"
import styles from "./accessibility-summit.module.css"

function getFeatureMeta(feature: AccessibilityFeature): { icon: string; shortLabel: string; label: string } {
  switch (feature) {
    case "sign-language":
      return { icon: "🤟", shortLabel: "Sign Language", label: "Nepali Sign Language (NSL) interpretation provided" }
    case "captions":
      return { icon: "💬", shortLabel: "Live Captions", label: "Real-time CART live speech-to-text captions" }
    case "audio-description":
      return { icon: "🎧", shortLabel: "Audio Description", label: "Audio description and assistive listening available" }
    case "wheelchair-accessible":
      return { icon: "♿", shortLabel: "Step-Free Access", label: "Step-free hall with wide doors and accessible seating" }
    case "sensory-friendly":
      return { icon: "🧠", shortLabel: "Quiet Space", label: "Sensory decompression quiet space available nearby" }
  }
}

export interface SummitScheduleViewerProps {
  schedule: SummitScheduleDay[]
}

export function SummitScheduleViewer({ schedule }: SummitScheduleViewerProps) {
  const [activeDay, setActiveDay] = useState(1)
  const [liveAnnouncement, setLiveAnnouncement] = useState("Showing Day 1 schedule: 6 sessions.")
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleDayChange = (dayNum: number) => {
    setActiveDay(dayNum)
    const targetDay = schedule.find((d) => d.dayNumber === dayNum)
    setLiveAnnouncement(
      `Showing ${targetDay?.dateLabel} schedule: ${targetDay?.sessions.length} sessions loaded.`
    )
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const totalDays = schedule.length
    let nextIndex = currentIndex

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % totalDays
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + totalDays) % totalDays
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = totalDays - 1
    }

    if (nextIndex !== currentIndex) {
      const nextDay = schedule[nextIndex].dayNumber
      handleDayChange(nextDay)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0275b1]">
            Full Program Schedule
          </p>
          <h2 id="schedule-heading" className={cn(styles.title, "mt-1 text-2xl sm:text-3xl md:text-4xl")}>
            Summit Schedule &amp; Agenda
          </h2>
          <p className={cn(styles.muted, "mt-2.5 max-w-2xl text-base sm:text-lg leading-relaxed")}>
            Every session is structured with universal access in mind. Select a day below to explore keynote plenaries,
            thematic tracks, and hands-on roundtables.
          </p>
        </div>

        {/* Accessible Tab List */}
        <div
          role="tablist"
          aria-label="Summit Schedule by Day"
          className={styles.dayTabList}
        >
          {schedule.map((day, idx) => {
            const isSelected = activeDay === day.dayNumber
            return (
              <button
                key={day.dayNumber}
                ref={(el) => {
                  tabRefs.current[idx] = el
                }}
                role="tab"
                id={`tab-day-${day.dayNumber}`}
                aria-selected={isSelected}
                aria-controls={`panel-day-${day.dayNumber}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleDayChange(day.dayNumber)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={cn(styles.dayTab, isSelected && styles.dayTabActive)}
              >
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                <span>{day.dateLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Screen reader live notification */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Schedule Tab Panels */}
      {schedule.map((day) => {
        const isSelected = activeDay === day.dayNumber
        return (
          <div
            key={day.dayNumber}
            role="tabpanel"
            id={`panel-day-${day.dayNumber}`}
            aria-labelledby={`tab-day-${day.dayNumber}`}
            tabIndex={0}
            hidden={!isSelected}
            className={cn(!isSelected && "hidden")}
          >
            {/* Day Overview Banner */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0275b1]">
                Day {day.dayNumber} Focus
              </span>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{day.fullDate}</h3>
              <p className="mt-1 text-base text-slate-700">
                Thematic Focus: <strong className="text-slate-900">{day.theme}</strong>
              </p>
            </div>

            {/* Ordered List of Sessions */}
            <ol
              aria-label={`${day.dateLabel} Sessions in chronological order`}
              className="space-y-4"
            >
              {day.sessions.map((session, sIdx) => (
                <li key={session.id} className={styles.sessionCard}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Session Left: Title, Track, Room, Description */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={styles.trackBadge}>{session.track}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <MapPin className="size-3.5 text-[#0275b1]" aria-hidden="true" />
                          <span>{session.room}</span>
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                        {session.title}
                      </h4>

                      {session.speaker && (
                        <p className="mt-1.5 text-sm font-semibold text-[#0275b1]">
                          Panel / Speakers:{" "}
                          <span className="font-normal text-slate-800">{session.speaker}</span>
                        </p>
                      )}

                      <p className="mt-2.5 text-sm leading-relaxed text-slate-700 sm:text-base">
                        {session.description}
                      </p>
                    </div>

                    {/* Session Right: Time & Accessibility Feature Badges */}
                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-bold text-slate-900">
                        <Clock className="size-4 text-[#0275b1]" aria-hidden="true" />
                        <time
                          dateTime={`2026-11-30T${session.startTime}:00`}
                          aria-label={`Time: ${session.time} Nepal Time`}
                        >
                          {session.time}
                        </time>
                      </div>

                      {/* Accessibility Services Available */}
                      <div
                        className="flex flex-wrap gap-1.5"
                        role="group"
                        aria-label={`Accessibility services provided for session ${sIdx + 1}`}
                      >
                        {session.accessibilityFeatures.map((feat) => {
                          const meta = getFeatureMeta(feat)
                          return (
                            <span
                              key={feat}
                              className={styles.featureBadge}
                              title={meta.label}
                            >
                              <span aria-hidden="true">{meta.icon}</span>
                              <span>{meta.shortLabel}</span>
                              <span className="sr-only"> ({meta.label})</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )
      })}
    </div>
  )
}
