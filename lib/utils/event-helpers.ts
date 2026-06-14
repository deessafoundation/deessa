/**
 * Event utility functions
 * Pure functions that don't require server actions
 */

import type { Event } from "@/lib/actions/events"

/**
 * Helper to determine event status based on date and type
 */
export function getEventStatus(event: Event): "current" | "past" | "future" {
  const today = new Date()
  const eventDate = new Date(event.event_date)
  
  // Remove time for date-only comparison
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  
  if (event.type === "past") {
    return "past"
  }
  
  if (eventDate < today) {
    return "past"
  }
  
  // Check if event is within next 7 days (consider it "current")
  const oneWeekFromNow = new Date(today)
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
  
  if (eventDate <= oneWeekFromNow) {
    return "current"
  }
  
  return "future"
}
