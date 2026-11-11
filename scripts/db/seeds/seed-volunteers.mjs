import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const client = createClient(supabaseUrl, supabaseKey)

const samples = [
  {
    full_name: "Maya Sharma",
    email: "maya.sharma@example.com",
    phone: "+977 9841234567",
    occupation: "Staff Nurse",
    skills: ["Healthcare/Medical", "Teaching/Education"],
    availability: "Weekends Only",
    interests: ["Healthcare Initiatives", "Women Empowerment"],
    message: "Passionate about mobile health clinics in remote districts. Available every weekend for rural health camps.",
    status: "pending",
    applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Rohan Adhikari",
    email: "rohan.adhikari@example.com",
    phone: "+977 9851122334",
    occupation: "Full-Stack Developer",
    skills: ["IT/Technology", "Project Management"],
    availability: "Flexible",
    interests: ["Education Programs", "Community Development"],
    message: "I want to mentor youth in computer literacy and web development. Excited to help digitalize foundation operations.",
    status: "approved",
    applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Sunita Thapa",
    email: "sunita.thapa@example.com",
    phone: "+977 9803344556",
    occupation: "Primary School Teacher",
    skills: ["Teaching/Education", "Languages/Translation"],
    availability: "Part-time (10-20 hrs/wk)",
    interests: ["Education Programs", "Women Empowerment"],
    message: "Experienced elementary educator. Would love to organize after-school reading programs in underprivileged schools.",
    status: "approved",
    applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Anil Shrestha",
    email: "anil.shrestha@example.com",
    phone: "+977 9812233445",
    occupation: "Chartered Accountant",
    skills: ["Finance/Accounting", "Legal"],
    availability: "Weekends Only",
    interests: ["Community Development", "Education Programs"],
    message: "I can offer financial literacy workshops to small women cooperatives and audit aid allocations.",
    status: "pending",
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Sarah Jenkins",
    email: "sarah.jenkins@example.org",
    phone: "+44 7911 123456",
    occupation: "Documentary Filmmaker",
    skills: ["Photography/Videography", "Marketing/Communications"],
    availability: "Flexible",
    interests: ["Environmental Projects", "Community Development"],
    message: "Currently visiting Nepal for 6 months. Offering free storytelling, photography, and video coverage for impact stories.",
    status: "approved",
    applied_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Bibek Gurung",
    email: "bibek.gurung@example.com",
    phone: "+977 9860112233",
    occupation: "Logistics Supervisor",
    skills: ["Project Management", "Construction/Building"],
    availability: "Full-time",
    interests: ["Disaster Relief", "Community Development"],
    message: "Former emergency response volunteer during the floods. Can lead field dispatch, warehousing, and transportation.",
    status: "pending",
    applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Pooja Khadka",
    email: "pooja.khadka@example.com",
    phone: "+977 9849988776",
    occupation: "Law Student",
    skills: ["Legal", "Languages/Translation"],
    availability: "Weekends Only",
    interests: ["Women Empowerment", "Community Development"],
    message: "Final year law student at Nepal Law Campus. Interested in human rights workshops and legal awareness campaigns.",
    status: "pending",
    applied_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Deepak Karki",
    email: "deepak.karki@example.com",
    phone: "+977 9823344556",
    occupation: "Civil Engineer",
    skills: ["Construction/Building", "Project Management"],
    availability: "Part-time (10-20 hrs/wk)",
    interests: ["Disaster Relief", "Community Development"],
    message: "Can inspect school infrastructure and assist with seismic retrofitting projects.",
    status: "approved",
    applied_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Ananya Joshi",
    email: "ananya.joshi@example.com",
    phone: "+977 9818877665",
    occupation: "Digital Growth Lead",
    skills: ["Marketing/Communications", "IT/Technology"],
    availability: "Flexible",
    interests: ["Education Programs", "Women Empowerment"],
    message: "Can run social media campaigns, design event banners, and coordinate newsletter outreach.",
    status: "approved",
    applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Ramesh KC",
    email: "ramesh.kc@example.com",
    phone: "+977 9801122334",
    occupation: "Student",
    skills: ["Languages/Translation"],
    availability: "Flexible",
    interests: ["Community Development"],
    message: "Looking for a short-term certificate. Unavailable for field visits.",
    status: "rejected",
    applied_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    full_name: "Dr. Sushil Poudel",
    email: "dr.sushil@example.com",
    phone: "+977 9851098765",
    occupation: "General Practitioner",
    skills: ["Healthcare/Medical", "Teaching/Education"],
    availability: "Weekends Only",
    interests: ["Healthcare Initiatives", "Disaster Relief"],
    message: "MBBS, MD. Interested in volunteering as supervising medical officer for pediatric eye & dental camps.",
    status: "approved",
    applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

async function seed() {
  const { data, error } = await client.from("volunteer_applications").insert(samples).select()
  if (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
  console.log(`Successfully seeded ${data.length} sample volunteer applications!`)
}

seed()
