"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Trash2, ImageIcon, ArrowUpRight } from "lucide-react"
import type { HomepageProgramsSettings } from "@/lib/types/homepage-settings"

interface ProgramsManagerProps {
  programs: HomepageProgramsSettings
  onChange: (programs: HomepageProgramsSettings) => void
}

export default function ProgramsManager({ programs, onChange }: ProgramsManagerProps) {
  const updateProgram = (index: number, field: string, value: unknown) => {
    const newPrograms = [...programs.programs]
    newPrograms[index] = { ...newPrograms[index], [field]: value }
    onChange({ programs: newPrograms })
  }

  const updateBullet = (programIndex: number, bulletIndex: number, value: string) => {
    const newPrograms = [...programs.programs]
    const newBullets = [...newPrograms[programIndex].bullets]
    newBullets[bulletIndex] = value
    newPrograms[programIndex] = { ...newPrograms[programIndex], bullets: newBullets }
    onChange({ programs: newPrograms })
  }

  const addBullet = (programIndex: number) => {
    const newPrograms = [...programs.programs]
    const newBullets = [...newPrograms[programIndex].bullets, "New milestone or objective point"]
    newPrograms[programIndex] = { ...newPrograms[programIndex], bullets: newBullets }
    onChange({ programs: newPrograms })
  }

  const removeBullet = (programIndex: number, bulletIndex: number) => {
    const newPrograms = [...programs.programs]
    const newBullets = newPrograms[programIndex].bullets.filter((_, i) => i !== bulletIndex)
    newPrograms[programIndex] = { ...newPrograms[programIndex], bullets: newBullets }
    onChange({ programs: newPrograms })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Core Program Feature Blocks
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure the 3 flagship program blocks displayed with bullets and metrics on the homepage.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {(programs.programs || []).map((program, index) => (
          <Card key={program.id || index} className="border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="py-3.5 px-4 sm:px-5 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-mono font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {program.headline || `Program #${index + 1}`}
                </span>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {program.badge || "Flagship Program"}
              </span>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium">Badge Category</Label>
                  <Input
                    value={program.badge}
                    onChange={(e) => updateProgram(index, "badge", e.target.value)}
                    placeholder="e.g. Education Initiative"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-medium">Program Headline</Label>
                  <Input
                    value={program.headline}
                    onChange={(e) => updateProgram(index, "headline", e.target.value)}
                    placeholder="e.g. Inclusive Classrooms for Autism"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Program Description</Label>
                <Textarea
                  value={program.body}
                  onChange={(e) => updateProgram(index, "body", e.target.value)}
                  rows={3}
                  placeholder="Overview of the program scope, approach, and target communities..."
                  className="mt-1.5 text-sm resize-none"
                />
              </div>

              {/* Bullets List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Program Key Bullets</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addBullet(index)}
                    className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Bullet
                  </Button>
                </div>
                <div className="space-y-2">
                  {(program.bullets || []).map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex items-center gap-2">
                      <span className="text-primary text-xs">•</span>
                      <Input
                        value={bullet}
                        onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                        placeholder="Bullet highlight..."
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBullet(index, bulletIndex)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics & Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border/60">
                <div>
                  <Label className="text-xs font-medium">Key Stat Number</Label>
                  <Input
                    value={program.stat}
                    onChange={(e) => updateProgram(index, "stat", e.target.value)}
                    placeholder="e.g. 15,000+"
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Stat Label</Label>
                  <Input
                    value={program.statLabel}
                    onChange={(e) => updateProgram(index, "statLabel", e.target.value)}
                    placeholder="e.g. Students Supported"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Link Destination</Label>
                  <Input
                    value={program.link}
                    onChange={(e) => updateProgram(index, "link", e.target.value)}
                    placeholder="e.g. /programs/education"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Link Text</Label>
                  <Input
                    value={program.linkText}
                    onChange={(e) => updateProgram(index, "linkText", e.target.value)}
                    placeholder="e.g. Explore Program"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Image URL & Thumbnail Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Cover Image Path / URL</Label>
                    <Input
                      value={program.imageSrc}
                      onChange={(e) => updateProgram(index, "imageSrc", e.target.value)}
                      placeholder="e.g. /home/hero/art_banner.jpeg or https://..."
                      className="mt-1.5 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Image Alt Description</Label>
                    <Input
                      value={program.imageAlt}
                      onChange={(e) => updateProgram(index, "imageAlt", e.target.value)}
                      placeholder="Descriptive image alternative text for screen readers..."
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Image Preview</Label>
                  <div className="mt-1.5 h-24 rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center relative">
                    {program.imageSrc ? (
                      <img
                        src={program.imageSrc}
                        alt={program.imageAlt || "Program cover"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground/60 text-xs">
                        <ImageIcon className="w-5 h-5 mb-1" />
                        <span>No image URL</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
