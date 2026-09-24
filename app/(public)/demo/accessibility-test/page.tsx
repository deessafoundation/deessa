/**
 * Accessibility Test Page (V2 Schema)
 * 
 * Comprehensive test page for all accessibility features.
 * Shows visual examples of how sensory-friendly mode affects different elements.
 * 
 * V2 Changes:
 * - Text scale: 100-200% (was 80-140%)
 * - Font family: 3 options (was boolean toggle)
 * - Spacing: Can be null (site default)
 * - Auto-migration from V1
 */

import { HomeAccessibilityButton } from "@/components/home-accessibility-button"

export default function AccessibilityTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <HomeAccessibilityButton />
      
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            Accessibility System Test Page
          </h1>
          <p className="text-lg text-slate-600">
            Toggle accessibility features to see how they affect different elements
          </p>
          <div className="inline-block bg-blue-100 border border-blue-400 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-800">
              🎉 <strong>V2 Schema Active:</strong> Auto-migration, WCAG-compliant ranges, and enhanced font options
            </p>
          </div>
          <div className="inline-block bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-2 ml-2">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Open the accessibility panel on the right to test features
            </p>
          </div>
        </div>

        {/* Animations Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            🎬 Animations & Motion
          </h2>
          <p className="text-slate-600 mb-6">
            These animations should stop when Sensory-Friendly Mode or Reduce Motion is enabled:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pulse */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto animate-pulse mb-2"></div>
              <p className="text-sm text-slate-600">Pulse</p>
            </div>
            
            {/* Bounce */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto animate-bounce mb-2"></div>
              <p className="text-sm text-slate-600">Bounce</p>
            </div>
            
            {/* Spin */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto animate-spin mb-2 flex items-center justify-center text-white text-2xl">
                ↻
              </div>
              <p className="text-sm text-slate-600">Spin</p>
            </div>
            
            {/* Ping */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <div className="absolute inset-0 bg-red-500 rounded-full"></div>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm text-slate-600">Ping</p>
            </div>
          </div>
        </section>

        {/* Visual Effects Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            🎨 Visual Effects
          </h2>
          
          <div className="space-y-6">
            {/* Gradients */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Gradients (should become solid)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="gradient-ocean h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                  Gradient 1
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                  Gradient 2
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-green-500 h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                  Gradient 3
                </div>
              </div>
            </div>
            
            {/* Shadows */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Shadows (should soften)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white shadow-sm h-24 rounded-lg flex items-center justify-center border">
                  Small Shadow
                </div>
                <div className="bg-white shadow-md h-24 rounded-lg flex items-center justify-center">
                  Medium Shadow
                </div>
                <div className="bg-white shadow-lg h-24 rounded-lg flex items-center justify-center">
                  Large Shadow
                </div>
              </div>
            </div>
            
            {/* Patterns */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Patterns (should disappear)</h3>
              <div className="pattern-confetti h-32 rounded-lg border border-slate-200 flex items-center justify-center">
                <p className="text-slate-600 font-semibold bg-white px-4 py-2 rounded">Confetti Pattern</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            📝 Typography & Readability (V2)
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                💡 How to Test Typography Controls (V2 Features)
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Open the accessibility panel (right side)</li>
                <li>Adjust the sliders and watch this text change</li>
                <li><strong>NEW:</strong> Text Size: 100-200% (WCAG 2.2 AA compliant)</li>
                <li><strong>NEW:</strong> Font Family: Choose from 3 options (Default, System, OpenDyslexic)</li>
                <li>Line Spacing: Changes vertical space between lines (can use site default)</li>
                <li>Letter Spacing: Changes horizontal space between letters (can use site default)</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✨ V2 Schema Improvements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <p className="font-semibold mb-1">Before (V1):</p>
                  <ul className="space-y-1">
                    <li>• Text scale: 80-140%</li>
                    <li>• Dyslexia font: On/Off only</li>
                    <li>• Spacing: Always valued</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">After (V2):</p>
                  <ul className="space-y-1">
                    <li>✅ Text scale: 100-200%</li>
                    <li>✅ Font family: 3 choices</li>
                    <li>✅ Spacing: Can use default</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700">Sample Paragraph - Line Spacing Test</h3>
              <p className="text-slate-600">
                This is a sample paragraph designed to test line spacing adjustments. 
                When you increase line spacing, the vertical distance between these lines will grow, 
                making it easier to read for people with dyslexia or visual tracking difficulties. 
                Good line spacing prevents lines from blending together and helps maintain reading flow.
                The recommended range is 1.5 to 2.5, with 1.7 being particularly effective for 
                users with reading difficulties. Notice how the text becomes more comfortable 
                to read as you increase the spacing.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700">Sample Text - Letter Spacing Test</h3>
              <p className="text-slate-600">
                Letter spacing increases the horizontal distance between individual characters.
                This can significantly improve readability for people with dyslexia, as it
                prevents letters from crowding together. The effect is subtle but powerful.
                Try adjusting the letter spacing slider and notice how this text becomes
                easier to distinguish character by character. The range goes from 0% (normal)
                to 12% (wide spacing).
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700">Numbers and Special Characters</h3>
              <p className="text-slate-600">
                Test with different character types: 1234567890
                {` Symbols: !@#$%^&*()_+-=[]{}|;:,.<>? `}
                Mixed: The year 2026 has 365 days, and 52.14 weeks.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Benefits of Typography Controls</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ <strong>Dyslexia:</strong> Reduced crowding improves letter recognition</li>
                <li>✓ <strong>Low Vision:</strong> Larger text and spacing aids visibility</li>
                <li>✓ <strong>Cognitive Disabilities:</strong> Better spacing reduces mental load</li>
                <li>✓ <strong>Visual Tracking:</strong> Clearer lines prevent losing place</li>
                <li>✓ <strong>Aging Eyes:</strong> Enhanced readability for presbyopia</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Before Adjustments</h4>
                <p className="text-xs text-slate-600" style={{ lineHeight: '1.5', letterSpacing: '0' }}>
                  This text has default line spacing (1.5) and no letter spacing. 
                  It represents how the text appears without any accessibility adjustments.
                  Notice how compact it feels compared to adjusted text.
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">After Adjustments</h4>
                <p className="text-xs text-slate-600" style={{ lineHeight: '2.0', letterSpacing: '0.05em' }}>
                  This text has increased line spacing (2.0) and letter spacing (5%). 
                  It represents how the text appears with accessibility adjustments applied.
                  Notice how much more readable and comfortable it becomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* High Contrast Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            ⚫⚪ High Contrast Mode
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-600">
              Enable high contrast to see stark black and white colors with bold borders.
            </p>
            
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Button Example
              </button>
              
              <a href="#" className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Link Example
              </a>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                This info box should have strong borders and high contrast in HC mode.
              </p>
            </div>
          </div>
        </section>

        {/* Font Family Section (V2) */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            🔤 Font Family Options (V2 Feature)
          </h2>
          
          <div className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="text-sm text-purple-800 font-semibold mb-2">
                ✨ NEW in V2: Three Font Choices
              </p>
              <p className="text-sm text-purple-700 mb-2">
                V2 schema replaces the simple On/Off dyslexia toggle with a flexible font family selector:
              </p>
              <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                <li><strong>Default:</strong> Site's designed typography (Geist, Inter, etc.)</li>
                <li><strong>System Font:</strong> Your device's native font (-apple-system, Segoe UI, etc.)</li>
                <li><strong>OpenDyslexic:</strong> Dyslexia-friendly font with weighted bottoms</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Font Comparison - Try Each Option!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2 font-semibold">1. Default (Site Font)</p>
                  <p className="text-base">
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    <strong>Bold</strong> • <em>Italic</em>
                    <br />
                    0123456789
                  </p>
                </div>
                
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-700 mb-2 font-semibold">2. System Font</p>
                  <p className="text-base" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}>
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    <strong>Bold</strong> • <em>Italic</em>
                    <br />
                    0123456789
                  </p>
                </div>
                
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-700 mb-2 font-semibold">3. OpenDyslexic</p>
                  <p className="text-base dyslexia-font">
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    <strong>Bold</strong> • <em>Italic</em>
                    <br />
                    0123456789
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-3">OpenDyslexic Details</h3>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="text-sm text-purple-700">
                  OpenDyslexic is a font designed to increase readability for readers with dyslexia. 
                  It features weighted bottoms to prevent letter flipping, unique character shapes to 
                  reduce confusion, and increased letter spacing.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Character Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2 font-semibold">Standard Font</p>
                  <p className="text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    <strong>Bold text example</strong>
                    <br />
                    <em>Italic text example</em>
                    <br />
                    Numbers: 0123456789
                    <br />
                    Similar: b d p q | i l 1 | rn m
                  </p>
                </div>
                
                <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-700 mb-2 font-semibold">OpenDyslexic Font</p>
                  <p className="text-lg dyslexia-font">
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    <strong>Bold text example</strong>
                    <br />
                    <em>Italic text example</em>
                    <br />
                    Numbers: 0123456789
                    <br />
                    Similar: b d p q | i l 1 | rn m
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Sample Paragraph</h3>
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-slate-700 mb-4">
                  Regular Font: Reading this paragraph with a standard font may present 
                  challenges for people with dyslexia. Letters can appear to flip, swap, 
                  or blend together. The uniformity of traditional fonts makes it difficult 
                  to distinguish between similar characters like 'b' and 'd', or 'p' and 'q'.
                </p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-slate-700 dyslexia-font">
                    OpenDyslexic Font: Reading this paragraph with OpenDyslexic font should 
                    feel more comfortable. The weighted bottoms anchor each letter, preventing 
                    flipping. Unique character shapes make it easier to distinguish between 
                    similar letters. Increased spacing reduces visual crowding.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Benefits for Dyslexia</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ <strong>Weighted bottoms:</strong> Prevents letters from flipping</li>
                <li>✓ <strong>Unique shapes:</strong> Reduces b/d, p/q confusion</li>
                <li>✓ <strong>Increased spacing:</strong> Less visual crowding</li>
                <li>✓ <strong>Consistent style:</strong> Easier pattern recognition</li>
                <li>✓ <strong>Research-backed:</strong> Positive user feedback</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Note:</strong> If font files are not installed, the toggle will still work 
                but will fall back to Arial. See <code className="bg-yellow-100 px-1 rounded">public/fonts/opendyslexic/README.md</code> for 
                download instructions.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Elements Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            🎯 Interactive Elements
          </h2>
          
          <div className="space-y-6">
            {/* Hover Effects */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Hover Effects (should simplify)</h3>
              <div className="flex gap-4">
                <div className="bg-blue-100 px-6 py-4 rounded-lg hover:scale-105 transition-transform cursor-pointer">
                  Hover to Scale
                </div>
                <div className="bg-green-100 px-6 py-4 rounded-lg hover:rotate-3 transition-transform cursor-pointer">
                  Hover to Rotate
                </div>
                <div className="bg-purple-100 px-6 py-4 rounded-lg hover:shadow-xl transition-shadow cursor-pointer">
                  Hover for Shadow
                </div>
              </div>
            </div>
            
            {/* Focus Indicators */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Focus Indicators</h3>
              <p className="text-sm text-slate-600 mb-3">
                Tab through these elements to see focus rings:
              </p>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">
                  Button 1
                </button>
                <button className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">
                  Button 2
                </button>
                <input 
                  type="text" 
                  placeholder="Text input"
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            📊 Status Indicators
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-800">Success - Pulsing indicator</p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
              <p className="text-yellow-800">Warning - Ping indicator</p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="spinner w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-800">Loading - Spinner (becomes static emoji)</p>
            </div>
          </div>
        </section>

        {/* V2 Migration Test Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-500">
          <h2 className="text-2xl font-bold mb-6 text-purple-900">
            🔄 V2 Migration Testing
          </h2>
          
          <div className="space-y-4">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="text-sm text-purple-800 font-semibold mb-2">
                🧪 How to Test Auto-Migration
              </p>
              <ol className="text-sm text-purple-700 space-y-2 list-decimal list-inside">
                <li>Open browser DevTools (F12) → Application/Storage → Local Storage</li>
                <li>Find key: <code className="bg-purple-100 px-1 rounded">deesha-a11y-preferences</code></li>
                <li>Note the <code className="bg-purple-100 px-1 rounded">version</code> field (should be <code className="bg-purple-100 px-1 rounded">2</code>)</li>
                <li>Delete the key to test fresh V2 creation</li>
                <li>Manually create V1 data to test migration:</li>
              </ol>
            </div>

            <div className="bg-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <p className="text-slate-600 mb-2">// Paste this in DevTools Console to create V1 data:</p>
              <code className="text-slate-800">{`localStorage.setItem('deesha-a11y-preferences', JSON.stringify({
  version: "1.0",
  preferences: {
    textScale: 1.2,
    lineSpacing: 1.7,
    letterSpacing: 0.05,
    highContrast: false,
    reduceMotion: false,
    dyslexiaFont: true,  // V1 boolean
    sensoryFriendly: false
  }
}));`}</code>
              <p className="text-green-600 mt-2">// Then reload page - should auto-migrate to V2!</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Expected Migration Results</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <code className="bg-green-100 px-1 rounded">version</code>: "1.0" → 2</li>
                <li>• <code className="bg-green-100 px-1 rounded">textScale</code>: Clamped to 1.0-2.0 range</li>
                <li>• <code className="bg-green-100 px-1 rounded">dyslexiaFont: true</code> → <code className="bg-green-100 px-1 rounded">fontFamily: "opendyslexic"</code></li>
                <li>• <code className="bg-green-100 px-1 rounded">dyslexiaFont: false</code> → <code className="bg-green-100 px-1 rounded">fontFamily: "default"</code></li>
                <li>• All other values preserved</li>
                <li>• No data loss, no errors</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            ✅ Complete Testing Checklist (V2)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Core Features:</h3>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>✓ <strong>Text Scale (100-200%):</strong> Increase/decrease to see all text resize</li>
                <li>✓ <strong>Line Spacing:</strong> Adjust slider or use site default</li>
                <li>✓ <strong>Letter Spacing:</strong> Adjust slider or use site default</li>
                <li>✓ <strong>High Contrast:</strong> Should see black & white with bold borders</li>
                <li>✓ <strong>Reduce Motion:</strong> All animations should stop</li>
                <li>✓ <strong>Sensory-Friendly:</strong> Colors soften, patterns disappear</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">V2 Features:</h3>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>✓ <strong>Font Family (NEW):</strong> Test all 3 options</li>
                <li>✓ <strong>Auto-Migration:</strong> V1 data upgrades seamlessly</li>
                <li>✓ <strong>Settings Persist:</strong> Reload page - V2 format saved</li>
                <li>✓ <strong>Null Spacing:</strong> Shows "Default" when using site values</li>
                <li>✓ <strong>WCAG Compliant:</strong> Text scale range meets AA standards</li>
                <li>✓ <strong>Keyboard Navigation:</strong> All controls accessible via Tab</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="font-semibold text-white mb-2">Storage Testing:</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li>✓ Check localStorage for <code className="bg-white/20 px-1 rounded">version: 2</code></li>
              <li>✓ Verify <code className="bg-white/20 px-1 rounded">fontFamily</code> field exists (not <code className="bg-white/20 px-1 rounded">dyslexiaFont</code>)</li>
              <li>✓ Test migration by creating V1 data manually</li>
              <li>✓ Open in multiple tabs - changes sync across tabs</li>
              <li>✓ Reset all - should clear to V2 defaults</li>
            </ul>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-slate-500 text-sm pb-8">
          <p>This is a development test page. Not visible to end users.</p>
        </div>
      </div>
    </div>
  )
}
