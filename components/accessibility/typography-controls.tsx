'use client'

/**
 * Typography Controls Component
 * 
 * Provides sliders for adjusting line spacing and letter spacing.
 * Can be used standalone or embedded in accessibility panels.
 */

import { useAccessibility } from '@/lib/hooks/use-accessibility'
import { cn } from '@/lib/utils'

interface TypographyControlsProps {
  className?: string
  showLabels?: boolean
  compact?: boolean
}

export function TypographyControls({
  className,
  showLabels = true,
  compact = false,
}: TypographyControlsProps) {
  const { preferences, updatePreference } = useAccessibility()

  return (
    <div className={cn('space-y-4', className)}>
      {/* Line Spacing */}
      <div>
        {showLabels && (
          <label
            htmlFor="line-spacing-slider"
            className={cn(
              'font-semibold text-slate-700 mb-2 block',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            Line Spacing: {preferences.lineSpacing.toFixed(1)}
          </label>
        )}
        <div className="space-y-1">
          <input
            id="line-spacing-slider"
            type="range"
            min="1.5"
            max="2.5"
            step="0.1"
            value={preferences.lineSpacing}
            onChange={(e) =>
              updatePreference('lineSpacing', parseFloat(e.target.value))
            }
            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-primary/80
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:bg-primary/80"
            aria-label={`Line spacing: ${preferences.lineSpacing.toFixed(1)}`}
            aria-valuemin={1.5}
            aria-valuemax={2.5}
            aria-valuenow={preferences.lineSpacing}
          />
          {!compact && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>Compact (1.5)</span>
              <span>Default (2.0)</span>
              <span>Spacious (2.5)</span>
            </div>
          )}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        {showLabels && (
          <label
            htmlFor="letter-spacing-slider"
            className={cn(
              'font-semibold text-slate-700 mb-2 block',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            Letter Spacing: {(preferences.letterSpacing * 100).toFixed(0)}%
          </label>
        )}
        <div className="space-y-1">
          <input
            id="letter-spacing-slider"
            type="range"
            min="0"
            max="0.12"
            step="0.01"
            value={preferences.letterSpacing}
            onChange={(e) =>
              updatePreference('letterSpacing', parseFloat(e.target.value))
            }
            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-primary/80
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:bg-primary/80"
            aria-label={`Letter spacing: ${(preferences.letterSpacing * 100).toFixed(0)} percent`}
            aria-valuemin={0}
            aria-valuemax={12}
            aria-valuenow={preferences.letterSpacing * 100}
          />
          {!compact && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>Normal (0%)</span>
              <span>Wide (12%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Text (Optional) */}
      {!compact && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-semibold">Preview:</p>
          <p className="text-sm text-slate-700">
            The quick brown fox jumps over the lazy dog. Adjusting spacing
            improves readability for many users.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Preset Buttons Component
 * 
 * Quick presets for common typography needs
 */
interface TypographyPresetsProps {
  className?: string
}

export function TypographyPresets({ className }: TypographyPresetsProps) {
  const { updatePreferences } = useAccessibility()

  const presets = [
    {
      name: 'Default',
      description: 'Standard spacing',
      values: { lineSpacing: 1.5, letterSpacing: 0 },
    },
    {
      name: 'Comfortable',
      description: 'Slightly increased',
      values: { lineSpacing: 1.7, letterSpacing: 0.02 },
    },
    {
      name: 'Dyslexia',
      description: 'Optimized for dyslexia',
      values: { lineSpacing: 2.0, letterSpacing: 0.08 },
    },
    {
      name: 'Maximum',
      description: 'Most spacious',
      values: { lineSpacing: 2.5, letterSpacing: 0.12 },
    },
  ]

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-semibold text-slate-700 mb-2">Quick Presets:</p>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => updatePreferences(preset.values)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-left"
            title={preset.description}
          >
            <div className="font-semibold">{preset.name}</div>
            <div className="text-[10px] text-slate-500">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
