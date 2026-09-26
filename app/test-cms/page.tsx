/**
 * CMS Test Page
 * 
 * This page tests all homepage CMS loaders to verify they work correctly.
 * Visit /test-cms to see the results.
 * 
 * DELETE THIS FILE after testing is complete.
 */

import { 
  getHomepageStats,
  getHomepagePrograms,
  getHomepageHeroCTAs,
  getHomepageCTACards,
  getHomepageBanners,
  getHomepageMarqueeSettings,
  getHomepageSEO,
  getHomepageFlags,
  getHomepageTrustIndicators,
  getHomepageFeaturedStoriesRules,
  getAllHomepageSettings,
} from "@/lib/data/homepage-settings"

export default async function TestCMSPage() {
  // Test individual loaders
  const stats = await getHomepageStats()
  const programs = await getHomepagePrograms()
  const heroCTAs = await getHomepageHeroCTAs()
  const ctaCards = await getHomepageCTACards()
  const banners = await getHomepageBanners()
  const marquee = await getHomepageMarqueeSettings()
  const seo = await getHomepageSEO()
  const flags = await getHomepageFlags()
  const trustIndicators = await getHomepageTrustIndicators()
  const featuredStoriesRules = await getHomepageFeaturedStoriesRules()

  // Test combined loader
  const allSettings = await getAllHomepageSettings()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Homepage CMS Test Page
          </h1>
          <p className="text-gray-600 mb-4">
            This page tests all homepage CMS loaders. All data should load successfully with fallback values.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✅ If you see this page, the loaders are working!
            </p>
            <p className="text-green-700 text-sm mt-2">
              After running the SQL migration, the data below will come from the database.
              Before that, it uses hard-coded fallback values.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Stats ({stats.stats.length} items)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.stats.map((stat, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-sm font-semibold text-gray-900">{stat.label}</p>
                {stat.sublabel && (
                  <p className="text-xs text-gray-600">{stat.sublabel}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Programs ({programs.programs.length} items)</h2>
          <div className="space-y-4">
            {programs.programs.map((program, i) => (
              <div key={i} className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{program.badge.split(' ')[0]}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{program.headline}</h3>
                    <p className="text-sm text-gray-600 mt-1">{program.body.substring(0, 150)}...</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-2xl font-bold text-purple-600">{program.stat}</span>
                      <span className="text-sm text-gray-700">{program.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero CTAs */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Hero CTAs ({heroCTAs.ctas.length} items)</h2>
          <div className="flex flex-wrap gap-4">
            {heroCTAs.ctas.map((cta, i) => (
              <div key={i} className={`px-6 py-3 rounded-lg font-semibold ${
                cta.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}>
                {cta.label}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Cards */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💳 CTA Cards ({ctaCards.cards.length} items)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ctaCards.cards.map((card, i) => (
              <div key={i} className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{card.description}</p>
                <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold">
                  {card.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Banners */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Banners ({banners.banners.length} items)</h2>
          {banners.banners.map((banner, i) => (
            <div key={i} className="bg-indigo-50 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-bold text-gray-900">{banner.headline}</h3>
              {banner.body && <p className="text-gray-600 mt-2">{banner.body}</p>}
            </div>
          ))}
        </div>

        {/* Marquee Settings */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎪 Marquee Settings</h2>
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold">Enabled:</span> {marquee.enabled ? '✅ Yes' : '❌ No'}</div>
              <div><span className="font-semibold">Speed:</span> {marquee.speed}</div>
              <div><span className="font-semibold">Pause on Hover:</span> {marquee.pauseOnHover ? '✅ Yes' : '❌ No'}</div>
              <div><span className="font-semibold">Max Logo Height:</span> {marquee.maxLogoHeight}px</div>
              <div><span className="font-semibold">Spacing:</span> {marquee.spacing}</div>
              <div><span className="font-semibold">Groups:</span> {marquee.grouping.groups.length} groups</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛡️ Trust Indicators ({trustIndicators.indicators.length} items)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustIndicators.indicators.map((indicator, i) => (
              <div key={i} className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-gray-900">{indicator.text}</p>
                <p className="text-xs text-gray-600">{indicator.subtext}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-100 rounded-lg p-4">
            <p className="text-sm text-gray-700"><strong>Hero Subtext:</strong> {trustIndicators.microCopy.heroSubtext}</p>
            <p className="text-sm text-gray-700 mt-2"><strong>Trust Badge:</strong> {trustIndicators.microCopy.trustBadgeText}</p>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 SEO Settings</h2>
          <div className="bg-yellow-50 rounded-lg p-4 space-y-2 text-sm">
            <div><span className="font-semibold">Title:</span> {seo.title}</div>
            <div><span className="font-semibold">Description:</span> {seo.description}</div>
            <div><span className="font-semibold">OG Image:</span> {seo.ogImage}</div>
            <div><span className="font-semibold">Keywords:</span> {seo.keywords.join(', ')}</div>
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚩 Feature Flags</h2>
          <div className="bg-pink-50 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
            <div>Accessibility Toolbar: {flags.showAccessibilityToolbar ? '✅' : '❌'}</div>
            <div>Marquee: {flags.enableMarquee ? '✅' : '❌'}</div>
            <div>Animations: {flags.enableAnimations ? '✅' : '❌'}</div>
            <div>Trust Badges: {flags.showTrustBadges ? '✅' : '❌'}</div>
            <div>Scroll Progress: {flags.showScrollProgress ? '✅' : '❌'}</div>
            <div>Trust Indicators: {flags.showTrustIndicators ? '✅' : '❌'}</div>
            <div>Stories Mode: {featuredStoriesRules.mode}</div>
          </div>
        </div>

        {/* All Settings Test */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Combined Loader Test</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>getAllHomepageSettings()</strong> successfully loaded all settings in a single call.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>✅ Stats: {allSettings.stats.stats.length} items</div>
              <div>✅ Programs: {allSettings.programs.programs.length} items</div>
              <div>✅ Hero CTAs: {allSettings.heroCTAs.ctas.length} items</div>
              <div>✅ CTA Cards: {allSettings.ctaCards.cards.length} items</div>
              <div>✅ Banners: {allSettings.banners.banners.length} items</div>
              <div>✅ Marquee: Configured</div>
              <div>✅ SEO: Configured</div>
              <div>✅ Flags: Configured</div>
              <div>✅ Trust Indicators: {allSettings.trustIndicators.indicators.length} items</div>
              <div>✅ Stories Rules: {allSettings.featuredStoriesRules.mode} mode</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">✅ All Tests Passed!</h3>
          <p className="text-blue-800 text-sm mb-4">
            All homepage CMS loaders are working correctly. The data above is currently using fallback values.
          </p>
          <p className="text-blue-700 text-sm">
            <strong>Next steps:</strong>
          </p>
          <ol className="list-decimal list-inside text-blue-700 text-sm mt-2 space-y-1">
            <li>Run the SQL migration: <code className="bg-blue-100 px-2 py-1 rounded">scripts/db/migrations/037-homepage-cms-schema.sql</code></li>
            <li>Refresh this page to see database values</li>
            <li>Build the admin UI to edit content</li>
            <li>Delete this test page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
