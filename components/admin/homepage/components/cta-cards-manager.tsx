"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { HomepageCTACardsSettings, HomepageCTACard } from "@/lib/types/homepage-settings"

interface CTACardsManagerProps {
  ctaCards: HomepageCTACardsSettings
  onChange: (ctaCards: HomepageCTACardsSettings) => void
}

export default function CTACardsManager({ ctaCards, onChange }: CTACardsManagerProps) {
  const addCard = () => {
    const newCard: HomepageCTACard = {
      id: `card-${Date.now()}`,
      title: "New Card",
      description: "Card description",
      icon: "heart",
      ctaLabel: "Learn More",
      ctaUrl: "/",
      color: "teal",
      order: ctaCards.cards.length + 1,
      visible: true,
    }
    onChange({ cards: [...ctaCards.cards, newCard] })
  }

  const updateCard = (index: number, updates: Partial<HomepageCTACard>) => {
    const newCards = [...ctaCards.cards]
    newCards[index] = { ...newCards[index], ...updates }
    onChange({ cards: newCards })
  }

  const deleteCard = (index: number) => {
    const newCards = ctaCards.cards.filter((_, i) => i !== index)
    onChange({ cards: newCards })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CTA Cards</CardTitle>
          <CardDescription>
            Manage the "Get Involved" section cards displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ctaCards.cards.map((card, index) => (
            <Card key={card.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCard(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={card.title}
                    onChange={(e) => updateCard(index, { title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={card.description}
                    onChange={(e) => updateCard(index, { description: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <Input
                      value={card.icon}
                      onChange={(e) => updateCard(index, { icon: e.target.value })}
                      placeholder="e.g., heart, users"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <FancySelect
                      value={card.color}
                      onValueChange={(value) => updateCard(index, { color: value as any })}
                      options={[
                        { value: "orange", label: "Orange" },
                        { value: "teal", label: "Teal" },
                        { value: "white", label: "White" },
                        { value: "purple", label: "Purple" },
                        { value: "blue", label: "Blue" },
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Label</Label>
                    <Input
                      value={card.ctaLabel}
                      onChange={(e) => updateCard(index, { ctaLabel: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>CTA URL</Label>
                    <Input
                      value={card.ctaUrl}
                      onChange={(e) => updateCard(index, { ctaUrl: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Visible</Label>
                  <Switch
                    checked={card.visible}
                    onCheckedChange={(checked) => updateCard(index, { visible: checked })}
                  />
                </div>

                {/* Preview */}
                <div className={`p-6 rounded-lg bg-${card.color}-50 border border-${card.color}-200`}>
                  <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                  <Button size="sm">{card.ctaLabel}</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addCard} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add CTA Card
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
