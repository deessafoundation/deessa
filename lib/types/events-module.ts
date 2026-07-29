// =============================================
// Events Module — TypeScript Types
// =============================================
// These types mirror the database schema from 050-events-module-schema.sql.
// FormSchema/FormStep/FormField are imported from conference types (read-only).

import type {
  FormSchema,
  FormStep,
  FormField,
  FieldType,
} from "./conference-form-schema";

// Re-export for convenience
export type { FormSchema, FormStep, FormField, FieldType };

// =============================================
// Core Event Types
// =============================================

export type EventStatus = "draft" | "published" | "disabled" | "archived";

export type EventCategory =
  | "conference"
  | "workshop"
  | "seminar"
  | "meetup"
  | "general";

export interface EventModuleEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;

  // Dates & Location
  event_date: string; // ISO date string
  event_time: string | null;
  event_end_date: string | null;
  location: string;
  venue_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  // Media
  image: string | null; // Card thumbnail
  banner_url: string | null; // Hero image
  gallery: string[]; // Array of image URLs

  // Status & Type
  status: EventStatus;
  category: EventCategory;

  // Registration
  registration_enabled: boolean;
  registration_open_at: string | null; // ISO timestamp
  registration_close_at: string | null; // ISO timestamp
  max_capacity: number | null;

  // Pricing (DEC-005)
  is_free: boolean;

  // Payment method toggles
  allow_online_payment: boolean;
  allow_qr_payment: boolean;
  allow_pay_at_venue: boolean;

  // QR Payment
  payment_qr_image_url: string | null; // Admin-uploaded QR code image
  payment_instructions: string | null; // Payment instructions text

  // Bank Transfer (manual alternative to QR)
  payment_bank_name: string | null; // e.g. "Nabil Bank"
  payment_account_name: string | null; // e.g. "Deessha Foundation"
  payment_account_number: string | null; // e.g. "1234567890"

  // Contact
  contact_email: string | null;

  // Audit
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// Agenda Types (DEC-007: Single table with day_number)
// =============================================

export interface EventAgendaItem {
  id: string;
  event_id: string;

  // Multi-day support
  day_number: number;
  day_label: string | null;

  // Time slots (display text)
  start_time: string | null;
  end_time: string | null;

  // Session details
  title: string;
  description: string | null;
  speaker_name: string | null;
  speaker_title: string | null;
  track_or_room: string | null;

  // Highlighted / starred
  highlighted: boolean;

  // Ordering
  sort_order: number;

  created_at: string;
  updated_at: string;
}

// =============================================
// Form Schema Types
// =============================================

export interface EventFormSchema {
  id: string;
  event_id: string;
  version: number;
  is_active: boolean;
  form_config: FormSchema; // Same shape as conference FormSchema
  created_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface EventFormTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_public: boolean;
  form_config: FormSchema;
  created_by: string | null;
  created_at: string;
}

// =============================================
// Registration Types
// =============================================

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed" | "review";

export type PaymentProvider = "stripe" | "khalti" | "esewa";

export interface EventRegistration {
  id: string;
  event_id: string;

  // Core fields
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;

  // Dynamic fields
  custom_fields: Record<string, unknown>;
  form_schema_version: number | null;

  // Status
  status: RegistrationStatus;
  admin_notes: string | null;

  // Status timestamps
  confirmed_at: string | null;
  cancelled_at: string | null;
  confirmed_by: string | null;
  cancelled_by: string | null;

  // Payment
  payment_status: PaymentStatus;
  payment_amount: number | null;
  payment_currency: string | null;
  payment_provider: PaymentProvider | null;
  payment_id: string | null;
  provider_session_ref: string | null;

  // QR Payment screenshot
  payment_screenshot_url: string | null; // Storage path in private bucket

  // Payment method chosen during registration
  payment_method: "online" | "qr" | "venue" | null;

  // Payment timestamps
  payment_initiated_at: string | null;
  payment_paid_at: string | null;
  payment_failed_at: string | null;
  payment_review_at: string | null;
  payment_override_by: string | null;

  // Consent
  consent_terms: boolean;
  consent_marketing: boolean;

  // Expiry
  expires_at: string | null;

  // Check-in
  checked_in_at: string | null;
  checked_in_by: string | null;

  // Source & Ticket
  registration_source: string | null;
  ticket_type_id: string | null;

  // Email tracking
  last_registration_email_sent_at: string | null;
  last_confirmation_email_sent_at: string | null;
  last_cancellation_email_sent_at: string | null;
  last_custom_email_sent_at: string | null;

  // Audit
  created_at: string;
  updated_at: string;
}

// Registration email log
export interface EventRegistrationEmail {
  id: string;
  registration_id: string;
  event_id: string;
  template_type: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  sent_to: string;
  sent_by: string | null;
  created_at: string;
}

// Registration with event context (from view)
export interface EventRegistrationWithEvent extends EventRegistration {
  event_title: string;
  event_slug: string;
  event_date: string;
  event_time: string | null;
  event_location: string;
  event_is_free: boolean;
  event_status: EventStatus;
}

// =============================================
// Ticket Types
// =============================================

export interface EventTicketType {
  id: string;
  event_id: string;

  name: string;
  price: number;
  currency: string;
  capacity: number | null; // NULL = unlimited
  sold_count: number;
  sales_start: string | null;
  sales_end: string | null;
  is_active: boolean;
  sort_order: number;

  created_at: string;
}

// =============================================
// Email Templates
// =============================================

export type EmailTemplateType =
  | "confirmation"
  | "payment_receipt"
  | "reminder"
  | "cancellation"
  | "payment_reminder"
  | "custom";

export interface EventEmailTemplate {
  id: string;
  event_id: string;

  template_type: EmailTemplateType;
  label: string | null;
  subject: string;
  body_html: string;
  body_text: string | null;
  is_active: boolean;

  updated_at: string;
}

// =============================================
// Input Types (for server actions)
// =============================================

export interface CreateEventInput {
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  event_date: string;
  event_time?: string;
  event_end_date?: string;
  location: string;
  venue_name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  banner_url?: string;
  gallery?: string[];
  category?: EventCategory;
  registration_enabled?: boolean;
  registration_open_at?: string;
  registration_close_at?: string;
  max_capacity?: number;
  is_free?: boolean;
  allow_online_payment?: boolean;
  allow_qr_payment?: boolean;
  allow_pay_at_venue?: boolean;
  payment_qr_image_url?: string;
  payment_instructions?: string;
  payment_bank_name?: string;
  payment_account_name?: string;
  payment_account_number?: string;
  contact_email?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

export interface CreateAgendaItemInput {
  event_id: string;
  day_number?: number;
  day_label?: string;
  start_time?: string;
  end_time?: string;
  title: string;
  description?: string;
  speaker_name?: string;
  speaker_title?: string;
  track_or_room?: string;
  highlighted?: boolean;
  sort_order?: number;
}

export interface CreateTicketTypeInput {
  event_id: string;
  name: string;
  price?: number;
  currency?: string;
  capacity?: number;
  sales_start?: string;
  sales_end?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateEmailTemplateInput {
  id?: string;
  event_id: string;
  template_type: EmailTemplateType;
  label?: string;
  subject: string;
  body_html: string;
  body_text?: string;
  is_active?: boolean;
}

export interface RegisterForEventInput {
  event_id: string;
  full_name: string;
  email: string;
  phone?: string;
  custom_fields?: Record<string, unknown>;
  form_schema_version?: number;
  consent_terms: boolean;
  consent_marketing?: boolean;
  ticket_type_id?: string;
}

// =============================================
// Query Filter Types
// =============================================

export interface EventFilters {
  status?: EventStatus;
  category?: EventCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationFilters {
  event_id: string;
  status?: RegistrationStatus;
  payment_status?: PaymentStatus;
  payment_method?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// =============================================
// API Response Types
// =============================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================
// Helper Constants
// =============================================

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  disabled: "Disabled",
  archived: "Archived",
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  conference: "Conference",
  workshop: "Workshop",
  seminar: "Seminar",
  meetup: "Meetup",
  general: "General",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
  review: "Under Review",
};

export const EMAIL_TEMPLATE_TYPE_LABELS: Record<EmailTemplateType, string> = {
  confirmation: "Confirmation",
  payment_receipt: "Payment Receipt",
  reminder: "Reminder",
  cancellation: "Cancellation",
  payment_reminder: "Payment Reminder",
  custom: "Custom",
};

// Valid status transitions
export const VALID_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["published"],
  published: ["disabled", "archived"],
  disabled: ["published", "archived"],
  archived: ["draft"], // restore to draft
};
