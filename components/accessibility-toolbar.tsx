'use client';

import { useState } from 'react';
import { Type, Contrast, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/lib/hooks/use-accessibility';

interface AccessibilityToolbarProps {
  showTranscriptToggle?: boolean;
  onTranscriptToggle?: (show: boolean) => void;
}

export default function AccessibilityToolbar({
  showTranscriptToggle = false,
  onTranscriptToggle,
}: AccessibilityToolbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const { preferences, updatePreference } = useAccessibility();

  // Cycle through text size presets: 100%, 120%, 140%
  const cycleTextSize = () => {
    const sizes = [1.0, 1.2, 1.4];
    const currentIndex = sizes.indexOf(preferences.textScale);
    const nextIndex = (currentIndex + 1) % sizes.length;
    updatePreference('textScale', sizes[nextIndex]);
  };

  // Handle transcript toggle
  const handleTranscriptToggle = () => {
    const newValue = !showTranscript;
    setShowTranscript(newValue);
    onTranscriptToggle?.(newValue);
  };

  // Get text size label
  const getTextSizeLabel = () => {
    if (preferences.textScale === 1.0) return 'Normal';
    if (preferences.textScale === 1.2) return 'Large';
    if (preferences.textScale === 1.4) return 'X-Large';
    return `${Math.round(preferences.textScale * 100)}%`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 size-12 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-primary-dark transition-all duration-300 flex items-center justify-center"
        aria-label="Show accessibility tools"
      >
        <Type className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-bg-soft border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Label */}
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-sm font-medium text-text-main hidden sm:inline">
              Accessibility Tools
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Text Size */}
            <Button
              variant="outline"
              size="sm"
              onClick={cycleTextSize}
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                preferences.textScale !== 1.0 && "bg-brand-primary/10 border-brand-primary text-brand-primary"
              )}
              aria-label={`Text size: ${getTextSizeLabel()}`}
              aria-pressed={preferences.textScale !== 1.0}
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {getTextSizeLabel()}
              </span>
            </Button>

            {/* High Contrast */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePreference('highContrast', !preferences.highContrast)}
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                preferences.highContrast && "bg-brand-primary/10 border-brand-primary text-brand-primary"
              )}
              aria-label={`High contrast: ${preferences.highContrast ? 'on' : 'off'}`}
              aria-pressed={preferences.highContrast}
            >
              <Contrast className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {preferences.highContrast ? 'High Contrast' : 'Normal'}
              </span>
            </Button>

            {/* Transcript Toggle (conditional) */}
            {showTranscriptToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranscriptToggle}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  showTranscript && "bg-brand-primary/10 border-brand-primary text-brand-primary"
                )}
                aria-label={`Transcript: ${showTranscript ? 'visible' : 'hidden'}`}
                aria-pressed={showTranscript}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">
                  {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                </span>
              </Button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="hover:bg-red-50 hover:text-red-600"
              aria-label="Close accessibility tools"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions (removed localStorage check - now handled by Provider) */}
    </div>
  );
}
