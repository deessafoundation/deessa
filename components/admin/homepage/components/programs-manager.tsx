"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { HomepageProgramsSettings } from "@/lib/types/homepage-settings"

interface ProgramsManagerProps {
  programs: HomepageProgramsSettings
  onChange: (programs: HomepageProgramsSettings) => void
}

export default function ProgramsManager({ programs, onChange }: ProgramsManagerProps) {
  const updateProgram = (index: number, field: string, value: any) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Programs Section</CardTitle>
          <CardDescription>
            Edit the 3 main program blocks displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {programs.programs.map((program, index) => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle className="text-lg">{program.badge}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Badge</Label>
                  <Input
                    value={program.badge}
                    onChange={(e) => updateProgram(index, "badge", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={program.headline}
                    onChange={(e) => updateProgram(index, "headline", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea
                    value={program.body}
                    onChange={(e) => updateProgram(index, "body", e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Bullets</Label>
                  {program.bullets.map((bullet, bulletIndex) => (
                    <Input
                      key={bulletIndex}
                      value={bullet}
                      onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                      className="mt-2"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stat</Label>
                    <Input
                      value={program.stat}
                      onChange={(e) => updateProgram(index, "stat", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Stat Label</Label>
                    <Input
                      value={program.statLabel}
                      onChange={(e) => updateProgram(index, "statLabel", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={program.imageSrc}
                      onChange={(e) => updateProgram(index, "imageSrc", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Image Alt Text</Label>
                    <Input
                      value={program.imageAlt}
                      onChange={(e) => updateProgram(index, "imageAlt", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Link URL</Label>
                    <Input
                      value={program.link}
                      onChange={(e) => updateProgram(index, "link", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Link Text</Label>
                    <Input
                      value={program.linkText}
                      onChange={(e) => updateProgram(index, "linkText", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
