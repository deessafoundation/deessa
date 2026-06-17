"use server"

import { createClient } from "@/lib/supabase/server"

export type Event = {
  id: string
  title: string
  slug: string
  description: string
  image: string | null
  event_date: string
  event_time: string | null
  location: string
  category: string
  type: "upcoming" | "past"
  is_published: boolean
  max_capacity: number | null
  created_at: string
  updated_at: string
}

/**
 * Get all published events, sorted by date (upcoming first, then past)
 */
export async function getPublishedEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: false })
    
    if (error) {
      console.error("Failed to fetch events:", error)
      return []
    }
    
    return (data || []) as Event[]
  } catch (err) {
    console.error("Error fetching events:", err)
    return []
  }
}

/**
 * Get all events (admin only - includes unpublished)
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false })
    
    if (error) {
      console.error("Failed to fetch all events:", error)
      return []
    }
    
    return (data || []) as Event[]
  } catch (err) {
    console.error("Error fetching all events:", err)
    return []
  }
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) {
      console.error("Failed to fetch event:", error)
      return null
    }
    
    return data as Event
  } catch (err) {
    console.error("Error fetching event:", err)
    return null
  }
}

/**
 * Get the current/active event (upcoming event closest to today)
 */
export async function getCurrentEvent(): Promise<Event | null> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]
    
    // Try to get the closest upcoming event
    const { data: upcomingEvent, error: upcomingError } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .eq("type", "upcoming")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (!upcomingError && upcomingEvent) {
      return upcomingEvent as Event
    }
    
    // If no upcoming event, get the most recent past event
    const { data: pastEvent, error: pastError } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .eq("type", "past")
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (!pastError && pastEvent) {
      return pastEvent as Event
    }
    
    // If still nothing, get any published event
    const { data: anyEvent, error: anyError } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (!anyError && anyEvent) {
      return anyEvent as Event
    }
    
    return null
  } catch (err) {
    console.error("Error fetching current event:", err)
    return null
  }
}

