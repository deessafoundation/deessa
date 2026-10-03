"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  label: string
  value: { from: string; to?: string } | string
  onChange: (value: string) => void
  type: 'gradient' | 'solid'
  helpText?: string
}

const PRESET_COLORS = [
  { name: 'Primary Blue', from: '#3FABDE', to: '#2E8BC0' },
  { name: 'Education Orange', from: '#F7931E', to: '#F5A623' },
  { name: 'Empowerment Pink', from: '#E91E63', to: '#F06292' },
  { name: 'Environment Green', from: '#84CC16', to: '#65A30D' },
  { name: 'Purple', from: '#6F3E96', to: '#8B5CF6' },
  { name: 'Yellow', from: '#F7C52B', to: '#FBBF24' },
  { name: 'Red', from: '#EF4444', to: '#DC2626' },
  { name: 'Teal', from: '#14B8A6', to: '#0D9488' },
  { name: 'Indigo', from: '#6366F1', to: '#4F46E5' },
  { name: 'Gray', from: '#6B7280', to: '#4B5563' },
]

export function ColorPicker({ label, value, onChange, type, helpText }: ColorPickerProps) {
  const [customFrom, setCustomFrom] = useState('#3FABDE')
  const [customTo, setCustomTo] = useState('#2E8BC0')

  const parseCurrentValue = () => {
    if (type === 'solid') {
      // Parse bg-[#color] or bg-color-500
      const match = value.toString().match(/#[0-9A-Fa-f]{6}/)
      return match ? match[0] : '#3FABDE'
    } else {
      // Parse from-[#color] to-[#color]
      const fromMatch = value.toString().match(/from-\[?(#[0-9A-Fa-f]{6})\]?/)
      const toMatch = value.toString().match(/to-\[?(#[0-9A-Fa-f]{6})\]?/)
      return {
        from: fromMatch ? fromMatch[1] : '#3FABDE',
        to: toMatch ? toMatch[1] : '#2E8BC0'
      }
    }
  }

  const currentValue = parseCurrentValue()

  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    if (type === 'solid') {
      onChange(`bg-[${preset.from}]`)
    } else {
      onChange(`from-[${preset.from}] to-[${preset.to}]`)
    }
  }

  const applyCustom = () => {
    if (type === 'solid') {
      onChange(`bg-[${customFrom}]`)
    } else {
      onChange(`from-[${customFrom}] to-[${customTo}]`)
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <div className="flex items-center gap-2 w-full">
                {type === 'gradient' && typeof currentValue === 'object' ? (
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ 
                      background: `linear-gradient(to right, ${currentValue.from}, ${currentValue.to})` 
                    }}
                  />
                ) : (
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: typeof currentValue === 'string' ? currentValue : currentValue.from }}
                  />
                )}
                <span className="text-sm truncate flex-1 text-left">
                  {type === 'gradient' && typeof currentValue === 'object'
                    ? `${currentValue.from} → ${currentValue.to}`
                    : currentValue}
                </span>
                <Palette className="w-4 h-4 ml-auto" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-3">Preset Colors</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors text-left"
                    >
                      <div 
                        className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          background: type === 'gradient' 
                            ? `linear-gradient(to right, ${preset.from}, ${preset.to})`
                            : preset.from
                        }}
                      />
                      <span className="text-xs font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Custom Color</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">{type === 'gradient' ? 'From Color' : 'Color'}</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        placeholder="#3FABDE"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  {type === 'gradient' && (
                    <div>
                      <Label className="text-xs">To Color</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          placeholder="#2E8BC0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <Button onClick={applyCustom} className="w-full" size="sm">
                    Apply Custom Color
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  )
}
