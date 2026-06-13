/**
 * Template variable interpolation for event email templates.
 * Supports: {{full_name}}, {{email}}, {{event_title}}, {{event_date}},
 *           {{event_location}}, {{ticket_name}}, {{ticket_price}},
 *           {{registration_id}}, {{event_end_date}}, {{venue_name}},
 *           {{contact_email}}, {{event_url}}, {{site_url}}
 */

interface TemplateVars {
  full_name?: string
  email?: string
  event_title?: string
  event_date?: string
  event_location?: string
  ticket_name?: string
  ticket_price?: string
  registration_id?: string
  event_end_date?: string
  venue_name?: string
  contact_email?: string
  event_url?: string
  site_url?: string
  [key: string]: string | undefined
}

const VARIABLE_MAP: Record<string, keyof TemplateVars> = {
  "{{full_name}}": "full_name",
  "{{email}}": "email",
  "{{event_title}}": "event_title",
  "{{event_date}}": "event_date",
  "{{event_location}}": "event_location",
  "{{ticket_name}}": "ticket_name",
  "{{ticket_price}}": "ticket_price",
  "{{registration_id}}": "registration_id",
  "{{event_end_date}}": "event_end_date",
  "{{venue_name}}": "venue_name",
  "{{contact_email}}": "contact_email",
  "{{event_url}}": "event_url",
  "{{site_url}}": "site_url",
}

export function interpolateTemplate(
  template: string,
  vars: TemplateVars
): string {
  let result = template
  for (const [token, key] of Object.entries(VARIABLE_MAP)) {
    const value = vars[key] ?? ""
    result = result.replaceAll(token, value)
  }
  return result
}

export function getAvailableVariables(): { token: string; description: string }[] {
  return [
    { token: "{{full_name}}", description: "Registrant's full name" },
    { token: "{{email}}", description: "Registrant's email" },
    { token: "{{event_title}}", description: "Event title" },
    { token: "{{event_date}}", description: "Event date" },
    { token: "{{event_end_date}}", description: "Event end date (for multi-day events)" },
    { token: "{{event_location}}", description: "Event location" },
    { token: "{{venue_name}}", description: "Venue name" },
    { token: "{{contact_email}}", description: "Event contact email" },
    { token: "{{ticket_name}}", description: "Ticket type name" },
    { token: "{{ticket_price}}", description: "Ticket price" },
    { token: "{{registration_id}}", description: "Registration ID" },
    { token: "{{event_url}}", description: "Public event page URL" },
    { token: "{{site_url}}", description: "Site base URL (for logo links)" },
  ]
}
