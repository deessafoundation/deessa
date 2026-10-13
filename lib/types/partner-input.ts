import { z } from "zod"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"

export const partnerInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a partner name.").max(200, "Keep the partner name under 200 characters."),
  type: z.enum(["partner", "donor", "sponsor"]),
  logo: z.string().trim().max(2048).refine(value => value === "" || isSafeMediaUrl(value), "Logo must use a local path or secure HTTPS URL."),
  website: z.string().trim().max(2048).refine(value => value === "" || isSafeWebsiteUrl(value), "Website must be a valid HTTP or HTTPS URL."),
  description: z.string().max(10000, "Keep the description under 10,000 characters."),
  is_published: z.boolean(),
})
