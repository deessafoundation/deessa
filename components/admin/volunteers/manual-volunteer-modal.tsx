"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserPlus, RefreshCw, Sparkles, Check } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { createManualVolunteer } from "@/lib/actions/admin-volunteers"

interface ManualVolunteerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

const SKILL_OPTIONS = [
  "Teaching/Education",
  "Healthcare/Medical",
  "IT/Technology",
  "Marketing/Communications",
  "Finance/Accounting",
  "Project Management",
  "Construction/Building",
  "Photography/Videography",
  "Legal",
  "Languages/Translation",
]

const INTEREST_OPTIONS = [
  "Education Programs",
  "Healthcare Initiatives",
  "Women Empowerment",
  "Disaster Relief",
  "Community Development",
  "Environmental Projects",
]

export function ManualVolunteerModal({
  open,
  onOpenChange,
  onCreated,
}: ManualVolunteerModalProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [occupation, setOccupation] = useState("")
  const [availability, setAvailability] = useState("Flexible")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"pending" | "approved">("approved")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      notifications.showError("Please enter applicant name, email, and phone number")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createManualVolunteer({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occupation: occupation.trim() || undefined,
        availability,
        skills: selectedSkills,
        interests: selectedInterests,
        status,
        adminNotes: notes.trim() || undefined,
      })

      if (res.success) {
        notifications.showSuccess("Volunteer recorded successfully!")
        onOpenChange(false)
        // Reset form
        setFullName("")
        setEmail("")
        setPhone("")
        setOccupation("")
        setSelectedSkills([])
        setSelectedInterests([])
        setNotes("")
        if (onCreated) onCreated()
      } else {
        notifications.showError(`Registration failed: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(`Error: ${err instanceof Error ? err.message : "Failed to record volunteer"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Manual Volunteer Registration
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Record an offline applicant, walk-in volunteer, or event recruit directly into the CRM
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-foreground">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Maya Shrestha"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Phone Number *</label>
                <Input
                  required
                  placeholder="+977 98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Occupation</label>
                <Input
                  placeholder="e.g. Nurse, High School Teacher, Student"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Availability</label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                    <SelectItem value="Weekends Only">Weekends Only</SelectItem>
                    <SelectItem value="Part-time (10-20 hrs/wk)">Part-time (10-20 hrs/wk)</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Emergency Response Only">Emergency Response Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills Multi-Select Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-medium text-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Select Skills
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map((skill) => {
                  const selected = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary font-medium"
                          : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
                      }`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Causes Multi-Select Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-medium text-foreground">Program Interests</label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = selectedInterests.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        selected
                          ? "bg-rose-600 text-white border-rose-600 font-medium"
                          : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
                      }`}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Review Notes & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-foreground">Internal Notes / Source</label>
                <Textarea
                  placeholder="e.g. Registered in person at Kathmandu Health Camp. Provided valid CPR certification."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs min-h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Initial Status</label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Directly Approved</SelectItem>
                    <SelectItem value="pending">Pending Document Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-10 px-4"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5 mr-1.5" />
                  Save Volunteer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
