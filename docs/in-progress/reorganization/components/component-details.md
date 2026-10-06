# deessa Foundation — per-file component evidence

Generated from component-evidence.json. Paths are repository-relative. Consumers are syntactic edges, not proof of rendering. Route lists are transitive and module-level, not symbol-level; layout consumers affect descendant pages even though those descendants are not individually listed. Type-only imports are marked explicitly. Browser identifiers can be local variables. See analysis.md for interpretation and limitations.

<a id="c001"></a>

## `components/about-hero.module.css`

- Responsibility / candidate ownership: Style About hero media, controls and accessibility contrast / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/about-hero.tsx:8` (import).
- App-entry ancestors: `app/(public)/about/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `93ab717320a4b787bb9698856de11913e37a1d7967404f7a3f65f7288584c994`.

<a id="c002"></a>

## `components/about-hero.tsx`

- Responsibility / candidate ownership: Render the About CMS hero, image and navigation action / About.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `AboutHero`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/about/page.tsx:3` (import).
- App-entry ancestors: `app/(public)/about/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/types/about-settings` → `lib/types/about-settings.ts` (import, type-only, line 6); `@/lib/types/about-settings` → `lib/types/about-settings.ts` (import, line 7); `./about-hero.module.css` → `components/about-hero.module.css` (import, line 8).
- Hooks called: None found.
- JSX components: `Link`, `ArrowRight`, `Icon`, `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e7f982f02aa491ff4ed923a0edcae60f9390f8309aa3c0024e1a8ddbc78d5388`.

<a id="c003"></a>

## `components/accessibility/dictionary.module.css`

- Responsibility / candidate ownership: Style dictionary surfaces and contrast states / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/dictionary.tsx:11` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `63f3ea46e2eedce8df008b5592e6b17bbe0101cea82910cd0d469b33d04ffa02`.

<a id="c004"></a>

## `components/accessibility/dictionary.tsx`

- Responsibility / candidate ownership: Display a portal dictionary session with search, selection lookup and pronunciation / Accessibility.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AccessibilityDictionary`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:13` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `react-dom` → `package` (import, line 4); `next/navigation` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 7); `@/lib/types/accessibility` → `lib/types/accessibility.ts` (import, type-only, line 8); `@/lib/dictionary/terms` → `lib/dictionary/terms.ts` (import, line 9); `./use-dictionary-triggers` → `components/accessibility/use-dictionary-triggers.ts` (import, line 10); `./dictionary.module.css` → `components/accessibility/dictionary.module.css` (import, line 11).
- Hooks called: `useAccessibility`, `usePathname`, `useState`, `useRef`, `useCallback`, `useEffect`, `useDictionaryTriggers`, `useLayoutEffect`.
- JSX components: `DictionarySession`, `BookOpen`, `Search`, `X`, `Volume2`.
- Browser-name signals (not semantic proof): `document`, `window`, `speechSynthesis`, `navigator`, `ResizeObserver`.
- Source hash: `adc3d390805ae8a2e39ee8bc178139abc7fe041484efb72381f6ef3fe18bc21a`.

<a id="c005"></a>

## `components/accessibility/panel-primitives.tsx`

- Responsibility / candidate ownership: Provide controls and layout primitives local to accessibility settings/TTS / Accessibility.
- Usage / observed scope: USED / public + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `PanelSection`, `ControlButton`, `SegmentedOption`, `SegmentedToggle`, `SwitchRow`, `RangeField`, `SelectField`, `PanelNotice`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/tts-controls.tsx:31` (import).
- App-entry ancestors: `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 12); `@/lib/utils` → `lib/utils.ts` (import, line 13).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4ff5d80ee8265836b62185e1683f5631ff9c82155136c3264241db856bc7e70d`.

<a id="c006"></a>

## `components/accessibility/panel.tsx`

- Responsibility / candidate ownership: Compose preference controls, reading-guide previews and TTS surfaces / Accessibility.
- Usage / observed scope: USED / public + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AccessibilityPanel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/demo/accessibility-test/page.tsx:14` (import); `app/(public)/layout.tsx:10` (import).
- App-entry ancestors: `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `react-dom` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `./reading-guide-sticker` → `components/accessibility/reading-guide-sticker.tsx` (import, line 20); `./tts-controls` → `components/accessibility/tts-controls.tsx` (import, line 21); `./tts-mini-player` → `components/accessibility/tts-mini-player.tsx` (import, line 22); `next/navigation` → `package` (import, line 23); `@/lib/utils` → `lib/utils.ts` (import, line 24); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 25); `@/lib/dictionary/terms` → `lib/dictionary/terms.ts` (import, line 26); `@/lib/types/accessibility` → `lib/types/accessibility.ts` (import, line 27).
- Hooks called: `useState`, `usePathname`, `useSyncExternalStore`, `useAccessibility`, `useRef`, `useEffect`.
- JSX components: `Icon`, `RotateCcw`, `Accessibility`, `X`, `TtsControls`, `Type`, `ModifiedIndicator`, `SegmentedControl`, `ZoomOut`, `ZoomIn`, `Eye`, `Toggle`, `Wrench`, `BookOpen`, `ReadingGuideSticker`, `Keyboard`, `TtsMiniPlayer`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `dad9c37189e6afc4b2f7d70721138e7727b075ad0a70d4cf036b2e67c844f299`.

<a id="c007"></a>

## `components/accessibility/reading-aids.module.css`

- Responsibility / candidate ownership: Style reading overlays, guide markers and accessibility modes / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/reading-aids.tsx:7` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6dfdb4923b07066da1e697c57f97233b3ff62c58043fb415253a5e502eb99ca5`.

<a id="c008"></a>

## `components/accessibility/reading-aids.tsx`

- Responsibility / candidate ownership: Render preference-driven reading overlays using DOM measurement and portals / Accessibility.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AccessibilityReadingAids`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:12` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `react-dom` → `package` (import, line 4); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 5); `./reading-guide-sticker` → `components/accessibility/reading-guide-sticker.tsx` (import, line 6); `./reading-aids.module.css` → `components/accessibility/reading-aids.module.css` (import, line 7).
- Hooks called: `useAccessibility`, `useSyncExternalStore`, `useRef`, `useEffect`.
- JSX components: `ReadingGuideSticker`.
- Browser-name signals (not semantic proof): `window`, `document`.
- Source hash: `9672e2df6f5bcb263863db44cb2a82b6afe28bd695d9771c2dabdd5de3736d0c`.

<a id="c009"></a>

## `components/accessibility/reading-guide-sticker.tsx`

- Responsibility / candidate ownership: Render selectable reading-guide marker imagery with fallback state / Accessibility.
- Usage / observed scope: USED / public + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `ReadingGuideSticker`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/panel.tsx:20` (import); `components/accessibility/reading-aids.tsx:6` (import).
- App-entry ancestors: `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `@/lib/types/accessibility` → `lib/types/accessibility.ts` (import, line 5).
- Hooks called: `useState`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `71d4dc7706b06cb9813710503e6bb10a244d84a189bf18e9641b94be21266432`.

<a id="c010"></a>

## `components/accessibility/tts-controls.tsx`

- Responsibility / candidate ownership: Bind voice, playback, language and highlighting controls to the TTS provider / Accessibility.
- Usage / observed scope: USED / public + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `TtsControls`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/panel.tsx:21` (import).
- App-entry ancestors: `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 7); `lucide-react` → `package` (import, line 8); `@/contexts/accessibility-provider` → `contexts/accessibility-provider.tsx` (import, line 27); `@/lib/tts/types` → `lib/tts/types.ts` (import, line 28); `@/lib/utils` → `lib/utils.ts` (import, line 29); `./panel-primitives` → `components/accessibility/panel-primitives.tsx` (import, line 31); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 32).
- Hooks called: `useAccessibility`, `useId`, `useMemo`.
- JSX components: `Volume2`, `AudioLines`, `PanelNotice`, `AlertTriangle`, `Languages`, `Play`, `Repeat`, `ControlButton`, `SkipBack`, `Pause`, `Square`, `SkipForward`, `Gauge`, `SlidersHorizontal`, `ChevronDown`, `Mic`, `FancySelect`, `RangeField`, `SwitchRow`, `Highlighter`, `Info`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0ef6e0c190f1e6cf5b20eb9d10805458e17b6af5a60d2b7cf80e9ee3fecf8c3c`.

<a id="c011"></a>

## `components/accessibility/tts-mini-player.tsx`

- Responsibility / candidate ownership: Render a compact portal player bound to shared TTS state / Accessibility.
- Usage / observed scope: USED / public + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `TtsMiniPlayer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/panel.tsx:22` (import).
- App-entry ancestors: `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 8); `react-dom` → `package` (import, line 9); `lucide-react` → `package` (import, line 10); `@/contexts/accessibility-provider` → `contexts/accessibility-provider.tsx` (import, line 12); `@/lib/utils` → `lib/utils.ts` (import, line 13).
- Hooks called: `useSyncExternalStore`, `useAccessibility`.
- JSX components: `Loader2`, `AudioLines`, `Pause`, `SkipBack`, `Play`, `SkipForward`, `Square`, `SlidersHorizontal`.
- Browser-name signals (not semantic proof): `window`, `document`.
- Source hash: `abf37eb49e87ce2c2fd7be8e90867ce9ac46ad9b846d6f1fec6a91d5620e76cb`.

<a id="c012"></a>

## `components/accessibility/use-dictionary-triggers.ts`

- Responsibility / candidate ownership: Register selection and dictionary interaction triggers against document events / Accessibility.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `useDictionaryTriggers`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/dictionary.tsx:10` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/types/accessibility` → `lib/types/accessibility.ts` (import, type-only, line 4); `@/lib/dictionary/selection` → `lib/dictionary/selection.ts` (import, line 5).
- Hooks called: `useEffect`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `b6f0522e1c20c5610d5ce40adfddd87ab35932c758d849f581a67131d8007188`.

<a id="c013"></a>

## `components/admin/CampaignEditForm.tsx`

- Responsibility / candidate ownership: Edit campaign hero and section content in an older category-specific editor / Admin programs.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `CampaignEditForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/admin/program-sections/AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 8); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 9).
- Hooks called: `useState`.
- JSX components: `ChevronDown`, `ChevronRight`, `Label`, `Section`, `Field`, `Input`, `AssetPicker`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7a96426f5f33a0213ee026f809422b331228fea53a9e3abd04a3dc1572bbafb9`.

<a id="c014"></a>

## `components/admin/EditorialProgramEditor.tsx`

- Responsibility / candidate ownership: Edit editorial program hero/actions and category template sections / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `EditorialEditorData`, `EditorialProgramEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:8` (import); `app/admin/programs/[id]/edit/page.tsx:34` (import); `components/admin/ProgramEditorDemo.tsx:3` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./program-sections/TemplateSection` → `components/admin/program-sections/TemplateSection.tsx` (import, line 3); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 4); `./program-sections/TemplateSectionsEditor` → `components/admin/program-sections/TemplateSectionsEditor.tsx` (import, line 5); `./program-sections/AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `TemplateSection`, `AssetPicker`, `TextField`, `TemplateSectionsEditor`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `839943ddee3e25ca9c13e8e88c62339bd105548d4f1010b3f73411c3eae24efd`.

<a id="c015"></a>

## `components/admin/OutreachEditForm.tsx`

- Responsibility / candidate ownership: Edit outreach hero, journal, postcards and section content in an older editor / Admin programs.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `OutreachEditForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/admin/program-sections/AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 8); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 9).
- Hooks called: `useState`.
- JSX components: `ChevronDown`, `ChevronRight`, `Label`, `Section`, `Field`, `Input`, `AssetPicker`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d947166601da6b33f86e5d61cdc262687d697b567d6a746d95166a209743678a`.

<a id="c016"></a>

## `components/admin/ProgramEditorDemo.tsx`

- Responsibility / candidate ownership: Exercise admin editors with public demo fixtures and in-memory save/restore / Public program-editor fixture using admin components.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ProgramEditorDemo`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/demo/program-editor/page.tsx:2` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 2); `./EditorialProgramEditor` → `components/admin/EditorialProgramEditor.tsx` (import, line 3); `./ServiceEditForm` → `components/admin/ServiceEditForm.tsx` (import, line 4); `./program-sections/program-id-context` → `components/admin/program-sections/program-id-context.tsx` (import, line 5); `@/lib/programs/content` → `lib/programs/content.ts` (import, line 6); `@/data/programs/editorial-demo-documents` → `data/programs/editorial-demo-documents.ts` (import, line 7); `@/data/programs/service-demo-document` → `data/programs/service-demo-document.ts` (import, line 8).
- Hooks called: `useState`, `useCallback`.
- JSX components: `ProgramIdProvider`, `ServiceEditForm`, `EditorialProgramEditor`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `2870800d3f1592b99c7fd3b9e5e4c418523f18f041e3698ee983671f4b893071`.

<a id="c017"></a>

## `components/admin/ResearchEditForm.tsx`

- Responsibility / candidate ownership: Edit research hero, stages, insights and resources in an older editor / Admin programs.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ResearchEditForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/admin/program-sections/AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 8); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 9).
- Hooks called: `useState`.
- JSX components: `ChevronDown`, `ChevronRight`, `Label`, `Section`, `Field`, `Input`, `AssetPicker`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d492aa62797d7220815d93df8eda69dc8740ad39a07c8a1393fde80c82c3d939`.

<a id="c018"></a>

## `components/admin/ServiceEditForm.tsx`

- Responsibility / candidate ownership: Edit service program hero and sections using program asset metadata / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ServiceEditForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:1` (import); `app/admin/programs/[id]/edit/page.tsx:33` (import); `components/admin/ProgramEditorDemo.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./program-sections/types` → `components/admin/program-sections/types.ts` (import, line 3); `react` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/input` → `components/ui/input.tsx` (import, line 7); `@/components/ui/label` → `components/ui/label.tsx` (import, line 8); `@/components/admin/program-sections/ImageMetadataFields` → `components/admin/program-sections/ImageMetadataFields.tsx` (import, line 9); `@/components/admin/program-sections/AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 10); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 11).
- Hooks called: `useState`, `useId`.
- JSX components: `ChevronDown`, `ChevronRight`, `Label`, `Section`, `Field`, `AssetPicker`, `ImageMetadataFields`, `Input`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `25f42ae1530f135f792d103783a2bb7bf117df449017b772f015b6a73402eb79`.

<a id="c019"></a>

## `components/admin/about-manager/AboutManagerClient.tsx`

- Responsibility / candidate ownership: Load/edit/reset/save About CMS sections and previews / Admin about.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: AboutManagerClient`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/about/page.tsx:12` (import).
- App-entry ancestors: `app/admin/about/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/label` → `components/ui/label.tsx` (import, line 8); `@/components/ui/input` → `components/ui/input.tsx` (import, line 9); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 10); `@/lib/notifications` → `lib/notifications.ts` (import, line 11); `lucide-react` → `package` (import, line 12); `@/lib/types/about-settings` → `lib/types/about-settings.ts` (import, type-only, line 13).
- Hooks called: `useState`.
- JSX components: `Badge`, `Button`, `RotateCcw`, `Eye`, `Save`, `Card`, `CardContent`, `Tabs`, `TabsList`, `TabsTrigger`, `Users`, `Heart`, `Footprints`, `Milestone`, `TabsContent`, `CardHeader`, `CardTitle`, `CardDescription`, `Label`, `Input`, `Textarea`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `1d6024afd8981b53ad35e29738191493d7ebcf0aecf15e9c31a8950f26ef220c`.

<a id="c020"></a>

## `components/admin/admin-header.tsx`

- Responsibility / candidate ownership: Compose admin breadcrumbs, account actions and notification bell / Admin layout.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AdminHeader`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-layout-content.tsx:4` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `next/navigation` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 7); `@/components/ui/sheet` → `components/ui/sheet.tsx` (import, line 15); `lucide-react` → `package` (import, line 16); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 17); `@/lib/actions/admin-auth` → `lib/actions/admin-auth.ts` (import, line 18); `@/components/admin/admin-nav-config` → `components/admin/admin-nav-config.ts` (import, line 19); `@/components/admin/notification-bell` → `components/admin/notification-bell.tsx` (import, line 20).
- Hooks called: `usePathname`, `useState`.
- JSX components: `Sheet`, `SheetTrigger`, `Button`, `Menu`, `SheetContent`, `Heart`, `Link`, `ChevronRight`, `ExternalLink`, `NotificationBell`, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuItem`, `User`, `LogOut`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `79063e97847dc278a6a13ffe4ff1581cde0fc347a0422f0e000967d659ab658b`.

<a id="c021"></a>

## `components/admin/admin-layout-content.tsx`

- Responsibility / candidate ownership: Wrap admin shell in sidebar state and compose header/sidebar/content / Admin layout.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AdminLayoutContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/layout.tsx:4` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/admin/admin-sidebar` → `components/admin/admin-sidebar.tsx` (import, line 3); `@/components/admin/admin-header` → `components/admin/admin-header.tsx` (import, line 4); `@/contexts/SidebarContext` → `contexts/SidebarContext.tsx` (import, line 5); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: `useSidebar`.
- JSX components: `AdminSidebar`, `AdminHeader`, `SidebarProvider`, `AdminLayoutInner`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5db71c455c35c13fa8e6664120f305d4e17e857e9b8003febde45d77cc6bca4b`.

<a id="c022"></a>

## `components/admin/admin-nav-config.ts`

- Responsibility / candidate ownership: Define admin navigation groups and role-based navigation visibility / Admin layout.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AdminNavItem`, `AdminNavSection`, `adminNavSections`, `canAccessAdminNavItem`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-header.tsx:19` (import); `components/admin/admin-sidebar.tsx:17` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 1); `@/lib/types/admin` → `lib/types/admin.ts` (import, line 27).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e4986d7e314e99ee834fbf4e3cb14b8ba529d4eece052178d914d4e262a2201d`.

<a id="c023"></a>

## `components/admin/admin-sidebar.tsx`

- Responsibility / candidate ownership: Render permission-filtered admin navigation with collapse state / Admin layout.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `AdminSidebar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-layout-content.tsx:3` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `next/image` → `package` (import, line 5); `next/navigation` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 9); `@/components/ui/tooltip` → `components/ui/tooltip.tsx` (import, line 10); `@/contexts/SidebarContext` → `contexts/SidebarContext.tsx` (import, line 16); `@/components/admin/admin-nav-config` → `components/admin/admin-nav-config.ts` (import, line 17).
- Hooks called: `usePathname`, `useSidebar`, `useState`, `useEffect`.
- JSX components: `TooltipProvider`, `Image`, `PanelLeftClose`, `Link`, `Tooltip`, `TooltipTrigger`, `TooltipContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a6e728e913e247c1b732a0badd17f3751f00058ca5f09c4f65ebdf8c62825be2`.

<a id="c024"></a>

## `components/admin/admin-user-edit-form.tsx`

- Responsibility / candidate ownership: Update or delete an existing admin user / Admin users.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `AdminUserEditForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/users/[id]/page.tsx:4` (import).
- App-entry ancestors: `app/admin/users/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 8); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 9); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 10); `lucide-react` → `package` (import, line 11); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 12); `@/lib/actions/admin-users` → `lib/actions/admin-users.ts` (import, line 23).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Alert`, `AlertCircle`, `AlertDescription`, `Label`, `FancySelect`, `Switch`, `Button`, `Loader2`, `Save`, `AlertDialog`, `AlertDialogTrigger`, `Trash2`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `664ccb943bf16e1b92949f81ea8e680de3647206f6c216755683cbe189d724b2`.

<a id="c025"></a>

## `components/admin/admin-user-form.tsx`

- Responsibility / candidate ownership: Create an admin user through the admin-auth action / Admin users.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `AdminUserForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/users/new/page.tsx:3` (import).
- App-entry ancestors: `app/admin/users/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 9); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 10); `lucide-react` → `package` (import, line 11); `@/lib/actions/admin-auth` → `lib/actions/admin-auth.ts` (import, line 12).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `CheckCircle2`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `FancySelect`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d0065b62e8edce5b0ded4e521c4f92f7b027590034c227095a2088a88c6c4eff`.

<a id="c026"></a>

## `components/admin/artworks/artworks-manager-client.tsx`

- Responsibility / candidate ownership: Manage artworks, media, ordering, featured state and arts-page configuration / Admin arts.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ArtworksManagerClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/artworks/page.tsx:6` (import).
- App-entry ancestors: `app/admin/artworks/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `next/link` → `package` (import, line 5); `next/navigation` → `package` (import, line 6); `lucide-react` → `package` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 20); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 21); `@/components/ui/input` → `components/ui/input.tsx` (import, line 22); `@/components/ui/label` → `components/ui/label.tsx` (import, line 23); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 24); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 25); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 26); `@/components/admin/confirm-dialog` → `components/admin/confirm-dialog.tsx` (import, line 27); `@/lib/notifications` → `lib/notifications.ts` (import, line 28); `@/lib/utils` → `lib/utils.ts` (import, line 29); `@/lib/actions/artworks` → `lib/actions/artworks.ts` (import, line 30); `@/lib/arts/content` → `lib/arts/content.ts` (import, line 38); `@/lib/arts/types` → `lib/arts/types.ts` (import, line 39).
- Hooks called: `useRouter`, `useState`, `useTransition`, `useEffect`, `useMemo`, `useRef`.
- JSX components: `Button`, `Link`, `ExternalLink`, `Plus`, `AlertTriangle`, `ImagePlus`, `Image`, `Badge`, `Star`, `Switch`, `ArrowUp`, `ArrowDown`, `Loader2`, `Pencil`, `Trash2`, `SectionTextEditor`, `ArtworkEditor`, `ConfirmDialog`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Label`, `Upload`, `Input`, `Textarea`, `DialogFooter`, `Control`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `a4b21c0548d2118698dd7b63cf34223d50b070794cf45fe6acd1dd01941cbc89`.

<a id="c027"></a>

## `components/admin/conference-form-builder.tsx`

- Responsibility / candidate ownership: Edit and save conference form schemas using palette/canvas/field editor/preview / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceFormBuilder`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/settings/form-builder/page.tsx:3` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 6); `@/lib/actions/events` → `lib/actions/events.ts` (import, type-only, line 7); `@/lib/actions/conference-form-schema` → `lib/actions/conference-form-schema.ts` (import, line 8); `@/lib/validation/schema-validation` → `lib/validation/schema-validation.ts` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10); `@/components/ui/button` → `components/ui/button.tsx` (import, line 11); `./form-field-palette` → `components/admin/form-field-palette.tsx` (import, line 12); `./form-canvas` → `components/admin/form-canvas.tsx` (import, line 13); `./form-field-editor` → `components/admin/form-field-editor.tsx` (import, line 14); `./form-preview` → `components/admin/form-preview.tsx` (import, line 15); `./conference-form-builder/EventSelector` → `components/admin/conference-form-builder/EventSelector.tsx` (import, line 16).
- Hooks called: `useRouter`, `useState`, `useEffect`.
- JSX components: `EventSelector`, `Clock`, `AlertTriangle`, `AlertCircle`, `Button`, `Eye`, `Save`, `FormFieldPalette`, `FormCanvas`, `FormFieldEditor`, `FormPreview`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `5e8d3e873009917448dc10aea4c036038571ac0d817e94f14870b8b300c75159`.

<a id="c028"></a>

## `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx`

- Responsibility / candidate ownership: Edit compound schema conditions shared by conference and event builders / Admin schema-builder controls.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `EnhancedConditionalEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/form-field-editor.tsx:6` (import); `components/admin/form-step-editor.tsx:7` (import); `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:10` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/label` → `components/ui/label.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/input` → `components/ui/input.tsx` (import, line 11); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 12); `@/components/ui/card` → `components/ui/card.tsx` (import, line 13); `lucide-react` → `package` (import, line 14); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 15); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 20); `@/components/ui/tooltip` → `components/ui/tooltip.tsx` (import, line 21).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Info`, `Label`, `Switch`, `Badge`, `Button`, `Zap`, `FancySelect`, `Input`, `Card`, `CardContent`, `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `cd1969a77c6d865a5e7517c16f151be8bcac2907c435f3345fb1cc3f553f8b87`.

<a id="c029"></a>

## `components/admin/conference-form-builder/EventSelector.tsx`

- Responsibility / candidate ownership: Choose the event whose conference schema is being edited / Admin schema-builder controls.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventSelector`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder.tsx:16` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 7); `@/lib/actions/events` → `lib/actions/events.ts` (import, type-only, line 8); `@/lib/utils/event-helpers` → `lib/utils/event-helpers.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `Badge`, `FancySelect`, `CheckCircle2`, `Calendar`, `Alert`, `AlertCircle`, `AlertDescription`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6e26c5dfb660fa27b1770eb2654c61aa880e635fe47755012678671f8a969b2c`.

<a id="c030"></a>

## `components/admin/conference-form-builder/FormSchemaViewer.tsx`

- Responsibility / candidate ownership: Display schema structure and field metadata in a read-only viewer / Admin schema-builder controls.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `FormSchemaViewer`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 11); `@/components/ui/card` → `components/ui/card.tsx` (import, line 12); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 13); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 14).
- Hooks called: None found.
- JSX components: `Lock`, `Shuffle`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Badge`, `CheckCircle2`, `ScrollArea`, `Card`, `CardHeader`, `CardTitle`, `CardContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `159e0f6a7fad96e1ab8ba83f35f20c7be3ea100d2abc2c0ed0b9c21a7c12c1aa`.

<a id="c031"></a>

## `components/admin/conference-form-builder/FormTemplateChooser.tsx`

- Responsibility / candidate ownership: Load/save/select event form templates through event-module template actions / Admin schema-builder controls.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormTemplateChooser`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:33` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 5); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 14); `@/components/ui/input` → `components/ui/input.tsx` (import, line 15); `@/components/ui/label` → `components/ui/label.tsx` (import, line 16); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 17); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 18); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 19); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 20); `lucide-react` → `package` (import, line 21); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 30); `@/lib/actions/events-module/event-form-templates` → `lib/actions/events-module/event-form-templates.ts` (import, line 31); `@/lib/notifications` → `lib/notifications.ts` (import, line 38).
- Hooks called: `useState`, `useEffect`, `useMemo`.
- JSX components: `Dialog`, `DialogTrigger`, `LayoutGrid`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `FancySelect`, `ScrollArea`, `FileText`, `Users`, `CheckCircle2`, `Button`, `Loader2`, `Sparkles`, `Label`, `Input`, `Textarea`, `Save`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `314c10cf31344bf27855fe5985b4e3888dc33668e80cd3fbd208a846bff7a3eb`.

<a id="c032"></a>

## `components/admin/conference-notes.tsx`

- Responsibility / candidate ownership: Persist conference registration notes / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceNotes`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/[id]/page.tsx:24` (import).
- App-entry ancestors: `app/admin/conference/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/notifications` → `lib/notifications.ts` (import, line 5); `@/lib/actions/conference-registration` → `lib/actions/conference-registration.ts` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Button`, `Loader2`, `Save`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f3c0e88e444dc64c80ed6afe7dfde15daea6f40155b64e433d6825c93184a253`.

<a id="c033"></a>

## `components/admin/conference-quick-actions.tsx`

- Responsibility / candidate ownership: Provide registration communication, copy and quick-action controls / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceQuickActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/[id]/page.tsx:23` (import).
- App-entry ancestors: `app/admin/conference/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/notifications` → `lib/notifications.ts` (import, line 5); `@/lib/actions/conference-registration` → `lib/actions/conference-registration.ts` (import, line 6); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 12); `@/components/ui/button` → `components/ui/button.tsx` (import, line 20).
- Hooks called: `useState`.
- JSX components: `Info`, `Bell`, `MapPin`, `Check`, `Copy`, `Loader2`, `RefreshCw`, `Mail`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Button`, `X`, `Send`.
- Browser-name signals (not semantic proof): `navigator`.
- Source hash: `b4dac3c9c735da5d34a5a79014c2a8fca8d544b01d517b7e599ba1a1d46dfe17`.

<a id="c034"></a>

## `components/admin/conference-settings-form.tsx`

- Responsibility / candidate ownership: Edit conference configuration, agenda, payments and email templates / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceSettingsForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/settings/page.tsx:2` (import).
- App-entry ancestors: `app/admin/conference/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/notifications` → `lib/notifications.ts` (import, line 5); `@/lib/actions/conference-settings` → `lib/actions/conference-settings.ts` (import, line 6); `@/lib/conference-settings-defaults` → `lib/conference-settings-defaults.ts` (import, type-only, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/button` → `components/ui/button.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Calendar`, `CardContent`, `Field`, `Button`, `Loader2`, `Save`, `CreditCard`, `FancySelect`, `GripVertical`, `Plus`, `Star`, `Trash2`, `Mail`, `Icon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `58d5583ee29bae20da00cdbaeb4d7716ce73876f1a32be0aed233a5b5263c3ac`.

<a id="c035"></a>

## `components/admin/conference-status-actions.tsx`

- Responsibility / candidate ownership: Apply conference registration status changes / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceStatusActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/[id]/page.tsx:22` (import).
- App-entry ancestors: `app/admin/conference/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 14); `@/lib/notifications` → `lib/notifications.ts` (import, line 15); `@/lib/actions/conference-registration` → `lib/actions/conference-registration.ts` (import, line 16).
- Hooks called: `useRouter`, `useState`.
- JSX components: `CheckCircle`, `XCircle`, `Loader2`, `ShieldCheck`, `Mail`, `Clock`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `AlertTriangle`, `DialogDescription`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b7d68a8c62f8f1d2097bb662031d780a77c31c8ef0e32c9a8cff4de3d09784ae`.

<a id="c036"></a>

## `components/admin/confirm-dialog.tsx`

- Responsibility / candidate ownership: Present configurable deletion confirmation and delegate mutation to onConfirm / Admin common confirmation.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ConfirmDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/artworks/artworks-manager-client.tsx:27` (import); `components/admin/program-sections/AssetPicker.tsx:13` (import); `components/admin/team-delete-button.tsx:9` (import); `components/admin/team-member-form.tsx:16` (import); `components/admin/team-table.tsx:21` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 3).
- Hooks called: None found.
- JSX components: `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1f77b1ad20695b652c0dad2e2bfe44d4642577410ae1b6685bbb7e22815cbc57`.

<a id="c037"></a>

## `components/admin/dashboard/activity-feed.tsx`

- Responsibility / candidate ownership: Display recent admin/content activity with entity links / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ActivityFeed`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:6` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 4); `lucide-react` → `package` (import, line 5); `next/link` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7); `@/lib/utils/date` → `lib/utils/date.ts` (import, line 8); `react` → `package` (import, line 9).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Icon`, `Link`, `Badge`, `ChevronDown`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a48b0bedd4ffb29125d8164d8288a6ec6a0f39a26fa975680f212de7c39555fe`.

<a id="c038"></a>

## `components/admin/dashboard/content-activity-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart content-activity counts / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ContentActivityChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:3` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 4); `recharts` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `Bar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7a691e8ff23e53fae99cea6464bbcf9786e55f658b04273e8f489dfbb8930075`.

<a id="c039"></a>

## `components/admin/dashboard/dashboard-date-filter.tsx`

- Responsibility / candidate ownership: Select dashboard time range through URL navigation / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DashboardDateFilter`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:8` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/navigation` → `package` (import, line 3).
- Hooks called: `useRouter`, `useSearchParams`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c72e97515aec4a149b2e1d0548c981949fbdf2d06d8422bbb8a3f2d43b48a925`.

<a id="c040"></a>

## `components/admin/dashboard/dashboard-stat-card.tsx`

- Responsibility / candidate ownership: Render a dashboard metric, trend and optional destination / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DashboardStatCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:1` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `lucide-react` → `package` (import, line 4); `next/link` → `package` (import, line 22); `@/lib/utils` → `lib/utils.ts` (import, line 23).
- Hooks called: None found.
- JSX components: `Link`, `Card`, `CardHeader`, `CardTitle`, `Icon`, `CardContent`, `TrendingUp`, `TrendingDown`, `Minus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `af0e80a7ab954dee6685dc1d9198fc22641f6919a85c49fdc256c8828df61d31`.

<a id="c041"></a>

## `components/admin/dashboard/donation-by-category-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart donations by category / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DonationByCategoryChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:13` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 4); `recharts` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `PieChart`, `ChartTooltip`, `ChartTooltipContent`, `Pie`, `Cell`, `ChartLegend`, `ChartLegendContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a8935a8036f900c73058458573fec5bcd8c530e22b91cf1849aed8db2321174a`.

<a id="c042"></a>

## `components/admin/dashboard/donation-trend-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart donation time series / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DonationTrendChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:2` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 4); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 5); `recharts` → `package` (import, line 6); `react` → `package` (import, line 7); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 8).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `Tabs`, `TabsList`, `TabsTrigger`, `CardContent`, `ChartContainer`, `AreaChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `Area`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `96a75700e60d5579113279dcb645e61526d86eaedab49ba69411ade4a9951054`.

<a id="c043"></a>

## `components/admin/dashboard/event-capacity-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart event registration/capacity information / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventCapacityChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:12` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 4); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 5); `recharts` → `package` (import, line 6); `react` → `package` (import, line 7); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 8).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `Bar`, `Cell`, `Badge`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0ffb984548f90d849771c52c27b78902287083880803444b4c0865f34900c3d4`.

<a id="c044"></a>

## `components/admin/dashboard/fundraising-progress-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart fundraising progress / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FundraisingProgressChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:9` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 4); `recharts` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `Bar`, `Cell`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ca34c1c5c23ea7190881b013004ed7789b6b50dbf6e5c427df6b25417fa78eba`.

<a id="c045"></a>

## `components/admin/dashboard/index.ts`

- Responsibility / candidate ownership: Re-export dashboard widgets for the admin home route / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DashboardStatCard`, `DonationTrendChart`, `ContentActivityChart`, `ProviderBreakdownChart`, `PendingActions`, `ActivityFeed`, `SystemHealthCard`, `DashboardDateFilter`, `FundraisingProgressChart`, `VolunteerSkillsChart`, `MonthlyVsOneTimeChart`, `EventCapacityChart`, `DonationByCategoryChart`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/page.tsx:31` (import).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./dashboard-stat-card` → `components/admin/dashboard/dashboard-stat-card.tsx` (re-export, line 1); `./donation-trend-chart` → `components/admin/dashboard/donation-trend-chart.tsx` (re-export, line 2); `./content-activity-chart` → `components/admin/dashboard/content-activity-chart.tsx` (re-export, line 3); `./provider-breakdown-chart` → `components/admin/dashboard/provider-breakdown-chart.tsx` (re-export, line 4); `./pending-actions` → `components/admin/dashboard/pending-actions.tsx` (re-export, line 5); `./activity-feed` → `components/admin/dashboard/activity-feed.tsx` (re-export, line 6); `./system-health-card` → `components/admin/dashboard/system-health-card.tsx` (re-export, line 7); `./dashboard-date-filter` → `components/admin/dashboard/dashboard-date-filter.tsx` (re-export, line 8); `./fundraising-progress-chart` → `components/admin/dashboard/fundraising-progress-chart.tsx` (re-export, line 9); `./volunteer-skills-chart` → `components/admin/dashboard/volunteer-skills-chart.tsx` (re-export, line 10); `./monthly-vs-onetime-chart` → `components/admin/dashboard/monthly-vs-onetime-chart.tsx` (re-export, line 11); `./event-capacity-chart` → `components/admin/dashboard/event-capacity-chart.tsx` (re-export, line 12); `./donation-by-category-chart` → `components/admin/dashboard/donation-by-category-chart.tsx` (re-export, line 13).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `fb31bf0a194bc6bb2bbdcf140309d083049904ae124f23915f0aa5c776c3ae7f`.

<a id="c046"></a>

## `components/admin/dashboard/monthly-vs-onetime-chart.tsx`

- Responsibility / candidate ownership: Fetch and compare recurring versus one-time donations / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `MonthlyVsOneTimeChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:11` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 4); `recharts` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `AreaChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `Area`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1fe4e813d30346a4039a78d4b566bc2d45a7ac326171df9aa9c0bcb3e42b937f`.

<a id="c047"></a>

## `components/admin/dashboard/pending-actions.tsx`

- Responsibility / candidate ownership: Render linked pending admin tasks with relative timestamps / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `PendingActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:5` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 4); `lucide-react` → `package` (import, line 5); `next/link` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7); `@/lib/utils/date` → `lib/utils/date.ts` (import, line 8).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Badge`, `CardDescription`, `CardContent`, `Link`, `Icon`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2ebe3576cac341a5c05299e104181ceb8a746a613e2263466f580aa0ddb9ae5c`.

<a id="c048"></a>

## `components/admin/dashboard/provider-breakdown-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart donation payment-provider distribution / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProviderBreakdownChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:4` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 4); `recharts` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `ChartContainer`, `PieChart`, `ChartTooltip`, `ChartTooltipContent`, `Pie`, `Cell`, `ChartLegend`, `ChartLegendContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0a4fb58188a1bb5fabf9acb5a30159997e0bbfaacf2f5b48a94003794a0c466e`.

<a id="c049"></a>

## `components/admin/dashboard/system-health-card.tsx`

- Responsibility / candidate ownership: Render supplied system-health indicators and rates / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SystemHealthCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:7` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ab3b85f5557fa381adace3d12a3b10650bbd3c0f4b5a1c92463657b6cf78b10d`.

<a id="c050"></a>

## `components/admin/dashboard/volunteer-skills-chart.tsx`

- Responsibility / candidate ownership: Fetch and chart volunteer skill distribution / Admin dashboard.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `VolunteerSkillsChart`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/index.ts:10` (re-export).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 4); `@/components/ui/chart` → `components/ui/chart.tsx` (import, line 5); `recharts` → `package` (import, line 6); `react` → `package` (import, line 7); `@/lib/actions/admin-dashboard` → `lib/actions/admin-dashboard.ts` (import, line 8).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `Tabs`, `TabsList`, `TabsTrigger`, `CardContent`, `ChartContainer`, `BarChart`, `CartesianGrid`, `XAxis`, `YAxis`, `ChartTooltip`, `ChartTooltipContent`, `Bar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `176312fb81182fda560cfd73b1b9575023ec835ca144316a9546a0cb3465c5e3`.

<a id="c051"></a>

## `components/admin/delete-podcast-button.tsx`

- Responsibility / candidate ownership: Delete or unpublish a podcast through the podcast API / Admin podcasts.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: DeletePodcastButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/podcasts/[id]/page.tsx:8` (import).
- App-entry ancestors: `app/admin/podcasts/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 7); `@/lib/notifications` → `lib/notifications.ts` (import, line 17).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Button`, `Trash2`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `EyeOff`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `51c2721c80222d1753ba2a5a537aa33c7dffe9149819adca111d3f2e5fbf7113`.

<a id="c052"></a>

## `components/admin/delete-registration-button.tsx`

- Responsibility / candidate ownership: Delete a conference registration with confirmation / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DeleteRegistrationButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/[id]/page.tsx:25` (import).
- App-entry ancestors: `app/admin/conference/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/actions/conference-registration` → `lib/actions/conference-registration.ts` (import, line 5); `@/lib/notifications` → `lib/notifications.ts` (import, line 6).
- Hooks called: `useState`.
- JSX components: `Trash2`, `AlertTriangle`, `X`, `Loader2`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `1b08d44b9009f80b2c6f28a58e39c6a58ed642737dffc8e58f3e07cf7b5f1d14`.

<a id="c053"></a>

## `components/admin/delete-story-button.tsx`

- Responsibility / candidate ownership: Delete or unpublish a story through the story API / Admin stories.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: DeleteStoryButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/stories/page.tsx:8` (import).
- App-entry ancestors: `app/admin/stories/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 7); `@/lib/notifications` → `lib/notifications.ts` (import, line 17).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Button`, `Trash2`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `EyeOff`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c48cc3ffab379d5bb0a5a3bd7f1e8b63ae47e877ea1c9e2976d0143b909ecdf5`.

<a id="c054"></a>

## `components/admin/donations/activity-timeline.tsx`

- Responsibility / candidate ownership: Filter/expand typed activity events for donations, payments and support / Admin cross-domain activity presentation.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ActivityTimeline`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:10` (import); `components/admin/payments/payment-detail-client.tsx:45` (import); `components/admin/support/support-detail-client.tsx:21` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `@/lib/utils/date-formatting` → `lib/utils/date-formatting.ts` (import, line 18); `@/lib/utils/activity-timeline` → `lib/utils/activity-timeline.ts` (import, type-only, line 19).
- Hooks called: `useState`.
- JSX components: `Cog`, `User`, `Zap`, `Receipt`, `Mail`, `FileText`, `Badge`, `ArrowRight`, `Card`, `CardHeader`, `CardTitle`, `Button`, `CardContent`, `ChevronUp`, `ChevronDown`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `92d6d52044564c57a557bcfef04a926a56cc108c42f3027f270b0d2f09cd3551`.

<a id="c055"></a>

## `components/admin/donations/donations-table-client.tsx`

- Responsibility / candidate ownership: Filter/page/export donation records and compose donation metrics / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `DonationsDashboard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/donations/page.tsx:7` (import).
- App-entry ancestors: `app/admin/donations/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/input` → `components/ui/input.tsx` (import, line 7); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 8); `@/components/ui/table` → `components/ui/table.tsx` (import, line 9); `lucide-react` → `package` (import, line 17); `@/lib/utils/currency` → `lib/utils/currency.ts` (import, line 32); `@/lib/notifications` → `lib/notifications.ts` (import, line 33).
- Hooks called: `useState`, `useRef`, `useCallback`, `useEffect`.
- JSX components: `DollarSign`, `Clock`, `AlertCircle`, `Card`, `CardContent`, `StatCard`, `TrendingUp`, `CardHeader`, `CardTitle`, `Button`, `RotateCcw`, `Loader2`, `Download`, `Search`, `Input`, `X`, `Filter`, `FancySelect`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `HandHeart`, `Badge`, `Calendar`, `ChevronDown`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `552ca79d801d87f47bd6d8b45fb4580ba8614c99effab7c39107a5e1098c9817`.

<a id="c056"></a>

## `components/admin/donations/donor-information.tsx`

- Responsibility / candidate ownership: Present donor identity and contact details / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `DonorInformation`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:6` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `lucide-react` → `package` (import, line 4).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `User`, `Mail`, `Phone`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `99010b30c5112383f521cd5da7ae834506e8ed2abdf056d64981192066a57f72`.

<a id="c057"></a>

## `components/admin/donations/error-boundary.tsx`

- Responsibility / candidate ownership: Catch descendant render errors and show fallback/refresh controls for finance views / Admin common error boundary.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ErrorBoundary`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:12` (import); `components/admin/payments/payment-detail-client.tsx:47` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`, `app/admin/payments/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/card` → `components/ui/card.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `AlertCircle`, `CardContent`, `Button`, `RefreshCw`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `6ffc32080760641f063e5b5629dbfbb3e814fadd7c8a40b9b9ad93a69790d32d`.

<a id="c058"></a>

## `components/admin/donations/payment-technical.tsx`

- Responsibility / candidate ownership: Display and copy technical donation/payment reference fields / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `PaymentTechnical`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:7` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `@/lib/utils/clipboard` → `lib/utils/clipboard.ts` (import, line 7); `@/lib/notifications` → `lib/notifications.ts` (import, line 8).
- Hooks called: `useState`.
- JSX components: `Button`, `Check`, `Copy`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `TechnicalField`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `56e001098e99168b1ccf3626794640da8d8b181d65ee95e2c94ae8b83ab75b06`.

<a id="c059"></a>

## `components/admin/donations/review-action-dialog.tsx`

- Responsibility / candidate ownership: Confirm or reject donation review items through review actions / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ReviewActionDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/review-dashboard-client.tsx:20` (import).
- App-entry ancestors: `app/admin/donations/review/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 12); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 13); `@/components/ui/label` → `components/ui/label.tsx` (import, line 14); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 15); `lucide-react` → `package` (import, line 16); `sonner` → `package` (import, line 17); `@/lib/actions/admin-donation-review` → `lib/actions/admin-donation-review.ts` (import, line 18); `@/lib/utils/currency` → `lib/utils/currency.ts` (import, line 19).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `CheckCircle2`, `XCircle`, `DialogDescription`, `Alert`, `AlertCircle`, `AlertDescription`, `Label`, `Textarea`, `DialogFooter`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3db880e19df3425c4f8b026ee79e07f9ea2f760529430bbf4eabbef4715ad77b`.

<a id="c060"></a>

## `components/admin/donations/review-dashboard-client.tsx`

- Responsibility / candidate ownership: Compose pending review records, mismatch details and review dialogs / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ReviewDashboardClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/donations/review/page.tsx:4` (import).
- App-entry ancestors: `app/admin/donations/review/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `sonner` → `package` (import, line 18); `@/lib/utils/currency` → `lib/utils/currency.ts` (import, line 19); `./review-action-dialog` → `components/admin/donations/review-action-dialog.tsx` (import, line 20).
- Hooks called: `useState`.
- JSX components: `Alert`, `CheckCircle2`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `Badge`, `Clock`, `CardDescription`, `AlertTriangle`, `CardContent`, `AlertCircle`, `ChevronUp`, `ChevronDown`, `CardFooter`, `Button`, `XCircle`, `ReviewActionDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8ae787982cfe5d1d2caf01762c3aec2a4422b4847072cbe13204a1dd0a04ec84`.

<a id="c061"></a>

## `components/admin/donations/review-notes-section.tsx`

- Responsibility / candidate ownership: Display/add notes using donation or polymorphic finance actions / Admin finance review.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ReviewNotesSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:9` (import); `components/admin/payments/payment-detail-client.tsx:44` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`, `app/admin/payments/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `@/lib/actions/admin-donation-actions` → `lib/actions/admin-donation-actions.ts` (import, line 8); `@/lib/actions/admin-payment-actions` → `lib/actions/admin-payment-actions.ts` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10); `@/lib/utils/date-formatting` → `lib/utils/date-formatting.ts` (import, line 11); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 12).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Button`, `Plus`, `CardContent`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Textarea`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `62b2e4975e8697aa173f7cafb9f52065e7b6b82b8afc151a7193c8ddc833b47c`.

<a id="c062"></a>

## `components/admin/donations/review-status-card.tsx`

- Responsibility / candidate ownership: Update review status using donation or polymorphic finance actions / Admin finance review.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ReviewStatusCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:8` (import); `components/admin/payments/payment-detail-client.tsx:43` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`, `app/admin/payments/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 5); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 6); `@/lib/actions/admin-donation-actions` → `lib/actions/admin-donation-actions.ts` (import, line 7); `@/lib/actions/admin-payment-actions` → `lib/actions/admin-payment-actions.ts` (import, line 8); `@/lib/notifications` → `lib/notifications.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7f2d13e89b04ff3905071ed4a6fade056a9020f1308e93a0cfab177f04ba71bc`.

<a id="c063"></a>

## `components/admin/donations/status-change-modal.tsx`

- Responsibility / candidate ownership: Confirm payment status changes with reason and entity-specific action routing / Admin finance review.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `StatusChangeModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:11` (import); `components/admin/payments/payment-detail-client.tsx:46` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`, `app/admin/payments/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 12); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 13); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 14); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 15); `lucide-react` → `package` (import, line 16); `@/lib/actions/admin-donation-actions` → `lib/actions/admin-donation-actions.ts` (import, line 17); `@/lib/actions/admin-payment-actions` → `lib/actions/admin-payment-actions.ts` (import, line 18); `@/lib/notifications` → `lib/notifications.ts` (import, line 19).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `FancySelect`, `Textarea`, `Alert`, `AlertTriangle`, `AlertDescription`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a8b3d5ae4189ed34810077d04e6516886657d69f202698bb5a49d60f9df5d99d`.

<a id="c064"></a>

## `components/admin/donations/transaction-detail-client.tsx`

- Responsibility / candidate ownership: Compose donation transaction details and review/status actions / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TransactionDetailClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/donations/[id]/page.tsx:4` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/admin/donations/transaction-header` → `components/admin/donations/transaction-header.tsx` (import, line 4); `@/components/admin/donations/transaction-overview` → `components/admin/donations/transaction-overview.tsx` (import, line 5); `@/components/admin/donations/donor-information` → `components/admin/donations/donor-information.tsx` (import, line 6); `@/components/admin/donations/payment-technical` → `components/admin/donations/payment-technical.tsx` (import, line 7); `@/components/admin/donations/review-status-card` → `components/admin/donations/review-status-card.tsx` (import, line 8); `@/components/admin/donations/review-notes-section` → `components/admin/donations/review-notes-section.tsx` (import, line 9); `@/components/admin/donations/activity-timeline` → `components/admin/donations/activity-timeline.tsx` (import, line 10); `@/components/admin/donations/status-change-modal` → `components/admin/donations/status-change-modal.tsx` (import, line 11); `@/components/admin/donations/error-boundary` → `components/admin/donations/error-boundary.tsx` (import, line 12); `@/lib/utils/activity-timeline` → `lib/utils/activity-timeline.ts` (import, line 13); `@/lib/utils/provider-dashboard` → `lib/utils/provider-dashboard.ts` (import, line 14); `@/lib/actions/admin-donation-actions` → `lib/actions/admin-donation-actions.ts` (import, line 15); `@/lib/notifications` → `lib/notifications.ts` (import, line 16).
- Hooks called: `useState`.
- JSX components: `ErrorBoundary`, `TransactionHeader`, `TransactionOverview`, `DonorInformation`, `PaymentTechnical`, `ReviewStatusCard`, `ReviewNotesSection`, `ActivityTimeline`, `StatusChangeModal`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `a169fc6e197b0c93896376b6a1ff07579ca3fe0afd022960eea73ce082d6126a`.

<a id="c065"></a>

## `components/admin/donations/transaction-header.tsx`

- Responsibility / candidate ownership: Display transaction identity/status and receipt/email/provider controls / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TransactionHeader`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:4` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 5); `next/link` → `package` (import, line 6).
- Hooks called: None found.
- JSX components: `Link`, `Button`, `ArrowLeft`, `Badge`, `Mail`, `FileDown`, `ExternalLink`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `be6bc92956b32e18a0becab9afa81028f1f139039eab1c9524e6d78608f85c14`.

<a id="c066"></a>

## `components/admin/donations/transaction-overview.tsx`

- Responsibility / candidate ownership: Display donation transaction amounts, dates and status metadata / Admin donations.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TransactionOverview`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/donations/transaction-detail-client.tsx:5` (import).
- App-entry ancestors: `app/admin/donations/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 4); `@/lib/utils/date-formatting` → `lib/utils/date-formatting.ts` (import, line 5).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e0266d131210d31a40bdeac4f3ef114764a52aeccd4426c1afef81ca410d07cf`.

<a id="c067"></a>

## `components/admin/event-form.tsx`

- Responsibility / candidate ownership: Create/update events using the older admin-events action contract / Legacy admin events; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 11); `@/components/ui/date-time-picker` → `components/ui/date-time-picker.tsx` (import, line 12); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 13); `lucide-react` → `package` (import, line 14); `@/lib/actions/admin-events` → `lib/actions/admin-events.ts` (import, line 15); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 16); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 17).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Textarea`, `FileUpload`, `DateTimePicker`, `Switch`, `FancySelect`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c032b329ad6fc2ce0a046b99aa23fb83d29101f76c2678ae7a7d4df910e26fab`.

<a id="c068"></a>

## `components/admin/file-upload.tsx`

- Responsibility / candidate ownership: Upload authenticated files to a caller-selected storage bucket and clean up removed media / Admin media.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FileUpload`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/event-form.tsx:16` (import); `components/admin/media-picker.tsx:41` (import); `components/admin/partner-form.tsx:15` (import); `components/admin/project-form.tsx:15` (import); `components/admin/rich-text-editor/image-dialog.tsx:20` (import); `components/admin/site-settings-form.tsx:46` (import); `components/admin/story-form.tsx:16` (import); `components/admin/team-member-form.tsx:15` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/media/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/utils` → `lib/utils.ts` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10).
- Hooks called: `useState`, `useRef`.
- JSX components: `Label`, `Button`, `ExternalLink`, `Input`, `X`, `Loader2`, `ImageIcon`, `Upload`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c1313002056842dece4ee3fa7235d5e7f9134dc9f4489752a16d4a9043795aac`.

<a id="c069"></a>

## `components/admin/form-canvas.tsx`

- Responsibility / candidate ownership: Render/reorder/remove fields in the conference schema canvas / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormCanvas`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder.tsx:13` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `Lock`, `ChevronUp`, `ChevronDown`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `64f91b98a064ca4f53fde0e038e091c3a8c34753e33891be6142986f618e681e`.

<a id="c070"></a>

## `components/admin/form-conditional-editor.tsx`

- Responsibility / candidate ownership: Edit the older single-field conditional visibility contract / Admin conference.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `FormConditionalEditor`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 5).
- Hooks called: None found.
- JSX components: `Info`, `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `64c63012302fe8d7e4df5004f9d329ac35d1c467618f764b01a292dcc5de2753`.

<a id="c071"></a>

## `components/admin/form-field-editor.tsx`

- Responsibility / candidate ownership: Edit conference field properties/options and enhanced conditions / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FormFieldEditor`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder.tsx:14` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `./conference-form-builder/EnhancedConditionalEditor` → `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `X`, `Lock`, `Button`, `Plus`, `GripVertical`, `Trash2`, `EnhancedConditionalEditor`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1e44a562528e4c797e0b35a9f32da7a9cdb958545ad86fd2f8fb8f54487dd3ec`.

<a id="c072"></a>

## `components/admin/form-field-palette.tsx`

- Responsibility / candidate ownership: Add configured conference fields and expose step editing / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormFieldPalette`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder.tsx:12` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 7); `./form-step-editor` → `components/admin/form-step-editor.tsx` (import, line 8).
- Hooks called: `useState`.
- JSX components: `FormStepEditor`, `FancySelect`, `Icon`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9c78c20bedf8dd666210765e4853d2f7b5545dcfa2209625f881ed0d2dbe0fb8`.

<a id="c073"></a>

## `components/admin/form-preview.tsx`

- Responsibility / candidate ownership: Wrap the shared conference schema renderer in an admin preview surface / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormPreview`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder.tsx:15` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 4); `@/components/conference/dynamic-form-renderer` → `components/conference/dynamic-form-renderer.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `Eye`, `X`, `DynamicFormRenderer`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `42b52e27f7ca272e7fa509815b67c6f01b05ccbaa0e61438e77e3c27d0b58937`.

<a id="c074"></a>

## `components/admin/form-step-editor.tsx`

- Responsibility / candidate ownership: Create/edit/reorder conference steps and their conditions / Admin conference.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FormStepEditor`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/form-field-palette.tsx:8` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `react` → `package` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `./conference-form-builder/EnhancedConditionalEditor` → `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Button`, `Plus`, `EnhancedConditionalEditor`, `X`, `Check`, `Edit2`, `ChevronUp`, `ChevronDown`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `487d13b0ba796d4f77931448717456315925bf764a4d9b7315e685265cc7b259`.

<a id="c075"></a>

## `components/admin/gallery-manager.tsx`

- Responsibility / candidate ownership: Upload and maintain the site-settings image gallery / Admin settings.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `GalleryManager`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/site-settings-form.tsx:47` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `next/image` → `package` (import, line 10); `@/lib/utils` → `lib/utils.ts` (import, line 11).
- Hooks called: `useState`.
- JSX components: `Label`, `Input`, `Loader2`, `Upload`, `Card`, `CardContent`, `Image`, `Button`, `X`, `ImageIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6041c2f4e1b985e24b55652edec0709867f9585ddc3cb5be0fb9f6238148261c`.

<a id="c076"></a>

## `components/admin/homepage-manager-client.tsx`

- Responsibility / candidate ownership: Maintain older monolithic homepage settings with media/video pickers / Legacy admin homepage; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HomepageManagerClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 10); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 11); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 12); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 13); `lucide-react` → `package` (import, line 14); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 33); `@/lib/actions/admin-settings` → `lib/actions/admin-settings.ts` (import, line 43); `@/lib/notifications` → `lib/notifications.ts` (import, line 44); `./media-picker` → `components/admin/media-picker.tsx` (import, line 45); `./video-picker` → `components/admin/video-picker.tsx` (import, line 46); `@/lib/types/media` → `lib/types/media.ts` (import, type-only, line 47).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Home`, `Button`, `Eye`, `Tabs`, `TabsList`, `TabsTrigger`, `Video`, `BookOpen`, `BarChart3`, `Megaphone`, `TabsContent`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Settings`, `Trash2`, `Badge`, `Plus`, `ImageIcon`, `Label`, `Input`, `Textarea`, `Separator`, `Loader2`, `Save`, `ArrowUpRight`, `LinkIcon`, `Users`, `Heart`, `TrendingUp`, `FancySelect`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `MediaPicker`, `VideoPicker`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `586dc81694f842fb687c088c0285236b5fa99e0a5bfc08cafc877bef06308cdb`.

<a id="c077"></a>

## `components/admin/homepage-manager/HomepageManagerClient.tsx`

- Responsibility / candidate ownership: Load/reset/save current homepage settings and compose section managers / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HomepageManagerClient`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/homepage/page.tsx:22` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/lib/notifications` → `lib/notifications.ts` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 26); `@/lib/data/site-settings` → `lib/data/site-settings.ts` (import, type-only, line 27); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 28); `./components/StatsManager` → `components/admin/homepage-manager/components/StatsManager.tsx` (import, line 35); `./components/StoryManager` → `components/admin/homepage-manager/components/StoryManager.tsx` (import, line 36); `./components/WhatWeDoManager` → `components/admin/homepage-manager/components/WhatWeDoManager.tsx` (import, line 37); `./components/ProgramsManager` → `components/admin/homepage-manager/components/ProgramsManager.tsx` (import, line 38); `./components/HeroManager` → `components/admin/homepage-manager/components/HeroManager.tsx` (import, line 39); `./components/HeroCarouselManager` → `components/admin/homepage-manager/components/HeroCarouselManager.tsx` (import, line 40); `./components/HeroCTAsManager` → `components/admin/homepage-manager/components/HeroCTAsManager.tsx` (import, line 41); `./components/CTACardsManager` → `components/admin/homepage-manager/components/CTACardsManager.tsx` (import, line 42); `./components/BannersManager` → `components/admin/homepage-manager/components/BannersManager.tsx` (import, line 43); `./components/MarqueeManager` → `components/admin/homepage-manager/components/MarqueeManager.tsx` (import, line 44); `./components/SEOManager` → `components/admin/homepage-manager/components/SEOManager.tsx` (import, line 45); `./components/FlagsManager` → `components/admin/homepage-manager/components/FlagsManager.tsx` (import, line 46); `./components/TrustIndicatorsManager` → `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx` (import, line 47); `./components/FeaturedStoriesManager` → `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx` (import, line 48); `./components/TestimonialsManager` → `components/admin/homepage-manager/components/TestimonialsManager.tsx` (import, line 49); `./components/TimelineManager` → `components/admin/homepage-manager/components/TimelineManager.tsx` (import, line 50).
- Hooks called: `useState`.
- JSX components: `Sparkles`, `Badge`, `Button`, `RotateCcw`, `Eye`, `Save`, `Tabs`, `TabsList`, `TabsTrigger`, `ImageIcon`, `BarChart3`, `BookOpen`, `Target`, `CreditCard`, `Palette`, `Settings`, `Shield`, `Star`, `Search`, `TabsContent`, `HeroCarouselManager`, `HeroManager`, `StatsManager`, `StoryManager`, `WhatWeDoManager`, `ProgramsManager`, `HeroCTAsManager`, `CTACardsManager`, `BannersManager`, `MarqueeManager`, `TrustIndicatorsManager`, `FeaturedStoriesManager`, `TestimonialsManager`, `TimelineManager`, `SEOManager`, `FlagsManager`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `106dcff4cbc09da618abbcd3b5e3d351d5baee036adcc2b41d390b816a41eeae`.

<a id="c078"></a>

## `components/admin/homepage-manager/components/BannersManager.tsx`

- Responsibility / candidate ownership: Edit/delete/add homepage banners / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: BannersManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:43` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Trash2`, `Label`, `Input`, `Textarea`, `Switch`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `58ddfafa83076a91174608e2099533fad02c75e74e1e6cfcd62ad7c0826631d0`.

<a id="c079"></a>

## `components/admin/homepage-manager/components/CTACardsManager.tsx`

- Responsibility / candidate ownership: Edit homepage call-to-action cards / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: CTACardsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:42` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 8); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 9); `lucide-react` → `package` (import, line 10); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 11).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Trash2`, `Label`, `Input`, `Textarea`, `FancySelect`, `Switch`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `72c72e67a785e3a59ab6b5f7b7fd7140eec0ea15cc6af2464370adf0388a4928`.

<a id="c080"></a>

## `components/admin/homepage-manager/components/ColorPicker.tsx`

- Responsibility / candidate ownership: Select local homepage timeline colors through a palette/popover / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ColorPicker`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/components/TimelineManager.tsx:12` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/popover` → `components/ui/popover.tsx` (import, line 6); `lucide-react` → `package` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Label`, `Popover`, `PopoverTrigger`, `Button`, `Palette`, `PopoverContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4f0d1cb8afa1804e0a4cbd57ad078141de2c5c80bf2d07e3ec399c1535ad8497`.

<a id="c081"></a>

## `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx`

- Responsibility / candidate ownership: Configure featured-story selection mode and display settings / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: FeaturedStoriesManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:48` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 7); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 8).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `FancySelect`, `Input`, `Switch`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c611065623717abb258784ec87925adf8f9510bcda2a9195bbbf4563443a49be`.

<a id="c082"></a>

## `components/admin/homepage-manager/components/FlagsManager.tsx`

- Responsibility / candidate ownership: Configure homepage display/feature flags / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: FlagsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:46` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 5); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 6); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Switch`, `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c0bdad828f78a862069104f17c22e96b8424ee9f0c1a5f73786f73a1a943b4e0`.

<a id="c083"></a>

## `components/admin/homepage-manager/components/HeroCTAsManager.tsx`

- Responsibility / candidate ownership: Edit/order homepage hero call-to-action links / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HeroCTAsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:41` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 7); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `GripVertical`, `Label`, `Input`, `FancySelect`, `Switch`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `cfb579e7194b4157b64d4321a523263b5fa63e6957b29dada95a98f0710d796e`.

<a id="c084"></a>

## `components/admin/homepage-manager/components/HeroCarouselManager.tsx`

- Responsibility / candidate ownership: Edit/order/upload/toggle homepage hero slides / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HeroCarouselManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:40` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 11); `lucide-react` → `package` (import, line 12); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 13); `@/lib/notifications` → `lib/notifications.ts` (import, line 14).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Switch`, `Button`, `Plus`, `GripVertical`, `Eye`, `EyeOff`, `Trash2`, `Tabs`, `TabsList`, `TabsTrigger`, `Upload`, `LinkIcon`, `TabsContent`, `X`, `Textarea`, `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c9a9eff4c54b6eb0806deb1e15fdf2dad741ebeb5416e24ff2353fca71f9e19b`.

<a id="c085"></a>

## `components/admin/homepage-manager/components/HeroManager.tsx`

- Responsibility / candidate ownership: Edit the homepage hero settings contract / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HeroManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:39` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`, `ImageIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0163ad44fc764e0dac761238711899211eea0d7be22b8f4c37fb8e05aefcac0a`.

<a id="c086"></a>

## `components/admin/homepage-manager/components/MarqueeManager.tsx`

- Responsibility / candidate ownership: Edit scrolling marquee groups and settings / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: MarqueeManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:44` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 6); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 7); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 8).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Switch`, `Input`, `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a22e4205c2b7be0eb4058f95e9b7a84c9e86f9c1b62c5b3cddd36c0af083017d`.

<a id="c087"></a>

## `components/admin/homepage-manager/components/ProgramsManager.tsx`

- Responsibility / candidate ownership: Edit homepage program summaries and bullet content / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: ProgramsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:38` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 8).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ff12447a66277c71a165a86002ee538fe37b7c6d1baf8f85c0b18262c0b38833`.

<a id="c088"></a>

## `components/admin/homepage-manager/components/SEOManager.tsx`

- Responsibility / candidate ownership: Edit homepage SEO metadata and keywords / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: SEOManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:45` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8ea983d5264080db4c8f2f281935957b7a2b0e77704210dab4011b40b79fc678`.

<a id="c089"></a>

## `components/admin/homepage-manager/components/StatsManager.tsx`

- Responsibility / candidate ownership: Edit/order/add/remove homepage impact metrics / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: StatsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:35` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 9).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `GripVertical`, `Label`, `Input`, `Star`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e694437c921680d9f79bd66b16cbb348cf6487833ff39b0d0bd08caca27593f4`.

<a id="c090"></a>

## `components/admin/homepage-manager/components/StoryManager.tsx`

- Responsibility / candidate ownership: Edit homepage story content and upload its image / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: StoryManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:36` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 9); `lucide-react` → `package` (import, line 10); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 11); `@/lib/notifications` → `lib/notifications.ts` (import, line 12).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`, `Button`, `Trash2`, `Plus`, `Tabs`, `TabsList`, `TabsTrigger`, `Upload`, `LinkIcon`, `TabsContent`, `X`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f1b8496b47f20a1cba483f77da55b7955e97d36fc1eeb95324c6289cca01c025`.

<a id="c091"></a>

## `components/admin/homepage-manager/components/TestimonialsManager.tsx`

- Responsibility / candidate ownership: Edit/order/upload/toggle homepage testimonials / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: TestimonialsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:49` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 9); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 10); `lucide-react` → `package` (import, line 20); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 21); `@/lib/notifications` → `lib/notifications.ts` (import, line 22).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Plus`, `GripVertical`, `Star`, `Eye`, `EyeOff`, `Trash2`, `Label`, `Input`, `Tabs`, `TabsList`, `TabsTrigger`, `LinkIcon`, `Upload`, `TabsContent`, `X`, `Textarea`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3f9f76ca89f9cd4f0ff2f609daba4148f36a9297170cac80db798635d0c5040a`.

<a id="c092"></a>

## `components/admin/homepage-manager/components/TimelineManager.tsx`

- Responsibility / candidate ownership: Edit/order/toggle timeline milestones and colors / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: TimelineManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:50` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 9); `lucide-react` → `package` (import, line 10); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 11); `./ColorPicker` → `components/admin/homepage-manager/components/ColorPicker.tsx` (import, line 12).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`, `Button`, `Plus`, `GripVertical`, `Eye`, `EyeOff`, `Trash2`, `FancySelect`, `ColorPicker`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d2cb3b5fb07a80cb7f448d0e20005706d11dedfcfff129f9392f5fa440c91986`.

<a id="c093"></a>

## `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx`

- Responsibility / candidate ownership: Edit homepage trust indicators and supporting copy / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: TrustIndicatorsManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:47` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Switch`, `Input`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `bae59ae26ef86fa73e0e14f7995486d1a10bc50e24597873f3f1eaa09bd64358`.

<a id="c094"></a>

## `components/admin/homepage-manager/components/WhatWeDoManager.tsx`

- Responsibility / candidate ownership: Edit/order/toggle homepage what-we-do pillars / Admin homepage.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: WhatWeDoManager`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager/HomepageManagerClient.tsx:37` (import).
- App-entry ancestors: `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/card` → `components/ui/card.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 9).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`, `Button`, `Plus`, `GripVertical`, `Eye`, `EyeOff`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `02c2669935cec1d261f9f85e8714a946d385748cac385357187a8c5a7523229c`.

<a id="c095"></a>

## `components/admin/internal-note-modal.tsx`

- Responsibility / candidate ownership: Submit an internal support note through the support API / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: InternalNoteModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/support-actions.tsx:13` (import); `components/admin/support/support-detail-client.tsx:18` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `next/navigation` → `package` (import, line 6).
- Hooks called: `React.useState`, `useRouter`.
- JSX components: `Dialog`, `DialogTrigger`, `Button`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f29c5204bb1cac25864e3d34a209312c1b836afbf8f20051b5cf0c7075695bbd`.

<a id="c096"></a>

## `components/admin/media-library-client.tsx`

- Responsibility / candidate ownership: Browse/sync storage and media records; render picker and removal actions / Admin media.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `MediaLibraryClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/media/page.tsx:4` (import).
- App-entry ancestors: `app/admin/media/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/card` → `components/ui/card.tsx` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 8); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 11); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 18); `lucide-react` → `package` (import, line 28); `@/lib/actions/media` → `lib/actions/media.ts` (import, line 49); `@/lib/actions/storage-browser` → `lib/actions/storage-browser.ts` (import, line 56); `@/lib/actions/sync-media` → `lib/actions/sync-media.ts` (import, line 62); `@/lib/notifications` → `lib/notifications.ts` (import, line 63); `@/lib/types/media` → `lib/types/media.ts` (import, type-only, line 64); `@/lib/utils` → `lib/utils.ts` (import, line 65); `date-fns` → `package` (import, line 66); `./media-picker` → `components/admin/media-picker.tsx` (import, line 67).
- Hooks called: `useState`, `useEffect`.
- JSX components: `ImageIcon`, `Button`, `Loader2`, `RefreshCw`, `Upload`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Video`, `FileText`, `Search`, `Input`, `FancySelect`, `Grid3x3`, `List`, `HardDrive`, `Trash2`, `ImagePlus`, `Badge`, `Check`, `DropdownMenu`, `DropdownMenuTrigger`, `MoreVertical`, `DropdownMenuContent`, `DropdownMenuItem`, `Copy`, `Eye`, `Download`, `DropdownMenuSeparator`, `ScrollArea`, `Calendar`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `MediaPicker`.
- Browser-name signals (not semantic proof): `navigator`, `window`.
- Source hash: `27697603d69183f8fc71f77a065e49bdc809e3ff035e0388d466b9c2de4cd812`.

<a id="c097"></a>

## `components/admin/media-picker.tsx`

- Responsibility / candidate ownership: Browse/upload/select media and storage files for admin callers / Admin media.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `MediaPicker`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager-client.tsx:45` (import); `components/admin/media-library-client.tsx:67` (import); `components/admin/video-picker.tsx:18` (import).
- App-entry ancestors: `app/admin/media/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 7); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 8); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 16); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 26); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 27); `lucide-react` → `package` (import, line 28); `./file-upload` → `components/admin/file-upload.tsx` (import, line 41); `@/lib/actions/media` → `lib/actions/media.ts` (import, line 42); `@/lib/actions/storage-browser` → `lib/actions/storage-browser.ts` (import, line 43); `@/lib/notifications` → `lib/notifications.ts` (import, line 44); `@/lib/types/media` → `lib/types/media.ts` (import, type-only, line 45); `@/lib/utils` → `lib/utils.ts` (import, line 46); `date-fns` → `package` (import, line 47).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `ImageIcon`, `DialogDescription`, `Tabs`, `TabsList`, `TabsTrigger`, `Upload`, `LinkIcon`, `TabsContent`, `Search`, `Input`, `Button`, `Loader2`, `AlertCircle`, `ScrollArea`, `Check`, `Trash2`, `HardDrive`, `Calendar`, `Badge`, `FileUpload`, `Label`, `DialogFooter`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `409507b95256d4a63afa0f7cc40b44554b0bdd61dc5ba33743b42adcb9c0bb65`.

<a id="c098"></a>

## `components/admin/notification-bell-realtime.tsx`

- Responsibility / candidate ownership: Fetch notifications and subscribe to realtime updates in an alternative bell / Admin notifications.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: NotificationBellRealtime`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 12); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 13); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 14); `next/link` → `package` (import, line 15).
- Hooks called: `useState`, `useRouter`, `useEffect`.
- JSX components: `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `Bell`, `Badge`, `DropdownMenuContent`, `CheckCheck`, `Link`, `ExternalLink`, `ScrollArea`, `Check`, `Trash2`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `0150a1913159f4c29f0549b6af5b64a7d8fb58cf9add5971aa2176bd20de0442`.

<a id="c099"></a>

## `components/admin/notification-bell.tsx`

- Responsibility / candidate ownership: Fetch and manage notifications in the active admin-header bell / Admin notifications.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `default: NotificationBell`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-header.tsx:20` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 12); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 13); `next/link` → `package` (import, line 14).
- Hooks called: `useState`, `useRouter`, `useEffect`.
- JSX components: `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `Bell`, `Badge`, `DropdownMenuContent`, `CheckCheck`, `Link`, `ExternalLink`, `ScrollArea`, `Check`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `11806fa0af3edaafe9352e926a69646eef85da69ebb2450b5240f99304e15d8f`.

<a id="c100"></a>

## `components/admin/notification-center-client.tsx`

- Responsibility / candidate ownership: Filter and manage the admin notification listing / Admin notifications.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: NotificationCenterClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/notifications/page.tsx:4` (import).
- App-entry ancestors: `app/admin/notifications/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 8); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Button`, `CheckCheck`, `Card`, `CardContent`, `Bell`, `Filter`, `FancySelect`, `Badge`, `Check`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2d15be2a3d63256038c0126472889a9dedfac5c17d19fa6eced2907db0586396`.

<a id="c101"></a>

## `components/admin/organization-settings-form.tsx`

- Responsibility / candidate ownership: Persist organization configuration through site-setting actions / Admin settings.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `OrganizationSettingsForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/settings-tabs.tsx:7` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/notifications` → `lib/notifications.ts` (import, line 9); `@/lib/actions/admin-settings` → `lib/actions/admin-settings.ts` (import, line 10); `next/navigation` → `package` (import, line 11).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Label`, `Input`, `Textarea`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `4d7f99cf28d912e614e2fc96c23ab4187147e36e1603a4050a434c776fa5dca4`.

<a id="c102"></a>

## `components/admin/partner-actions.tsx`

- Responsibility / candidate ownership: Delete a partner record / Admin partners.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `PartnerActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/partners/page.tsx:8` (import).
- App-entry ancestors: `app/admin/partners/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 6); `lucide-react` → `package` (import, line 17); `@/lib/actions/admin-partners` → `lib/actions/admin-partners.ts` (import, line 18).
- Hooks called: `useState`, `useRouter`.
- JSX components: `AlertDialog`, `AlertDialogTrigger`, `Button`, `Trash2`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9cafa66666ff1d239095458aaba62e4e97b6b51eb508812cf2dee06893f1e5a2`.

<a id="c103"></a>

## `components/admin/partner-form.tsx`

- Responsibility / candidate ownership: Create/update partner data and upload partner media / Admin partners.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `PartnerForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/partners/[id]/page.tsx:4` (import); `app/admin/partners/new/page.tsx:3` (import).
- App-entry ancestors: `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 10); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 11); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 12); `lucide-react` → `package` (import, line 13); `@/lib/actions/admin-partners` → `lib/actions/admin-partners.ts` (import, line 14); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 15); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 16).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `FancySelect`, `Textarea`, `FileUpload`, `Switch`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3307bcd6655d065f1e4e73353c604185045f58a2c4fdc76bda84bb214fe7c1d5`.

<a id="c104"></a>

## `components/admin/password-form.tsx`

- Responsibility / candidate ownership: Change the current admin password with validation feedback / Admin profile.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `PasswordForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/profile/page.tsx:5` (import).
- App-entry ancestors: `app/admin/profile/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/actions/admin-profile` → `lib/actions/admin-profile.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `Alert`, `AlertDescription`, `CheckCircle`, `Label`, `Input`, `Button`, `EyeOff`, `Eye`, `Loader2`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `d61796b6f6dcfa89e360fde8db21e976d50d2f39ba9aa5f1ebc83f31d8361f3d`.

<a id="c105"></a>

## `components/admin/payment-settings-form.tsx`

- Responsibility / candidate ownership: Persist enabled payment providers and payment settings / Admin finance settings.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `PaymentSettingsForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/settings-tabs.tsx:6` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/label` → `components/ui/label.tsx` (import, line 8); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/lib/payments/config` → `lib/payments/config.ts` (import, type-only, line 11); `@/lib/actions/admin-payments` → `lib/actions/admin-payments.ts` (import, line 12); `@/lib/notifications` → `lib/notifications.ts` (import, line 13).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CreditCard`, `CardDescription`, `CardContent`, `Label`, `Switch`, `Globe`, `FancySelect`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `466c4f678c75e1fb90b1d575c9a7dd6396c86b19ab4ae188bfa5f870309af717`.

<a id="c106"></a>

## `components/admin/payments/payment-detail-client.tsx`

- Responsibility / candidate ownership: Compose polymorphic payment detail, review, communication and archive actions / Admin finance.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `PaymentDetailClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/payments/[id]/page.tsx:4` (import).
- App-entry ancestors: `app/admin/payments/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `next/link` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 29); `@/components/ui/card` → `components/ui/card.tsx` (import, line 30); `@/components/ui/button` → `components/ui/button.tsx` (import, line 31); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 32); `@/lib/notifications` → `lib/notifications.ts` (import, line 40); `@/lib/utils/currency` → `lib/utils/currency.ts` (import, line 41); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 42); `@/components/admin/donations/review-status-card` → `components/admin/donations/review-status-card.tsx` (import, line 43); `@/components/admin/donations/review-notes-section` → `components/admin/donations/review-notes-section.tsx` (import, line 44); `@/components/admin/donations/activity-timeline` → `components/admin/donations/activity-timeline.tsx` (import, line 45); `@/components/admin/donations/status-change-modal` → `components/admin/donations/status-change-modal.tsx` (import, line 46); `@/components/admin/donations/error-boundary` → `components/admin/donations/error-boundary.tsx` (import, line 47); `@/lib/utils/activity-timeline` → `lib/utils/activity-timeline.ts` (import, line 48); `@/lib/utils/provider-dashboard` → `lib/utils/provider-dashboard.ts` (import, line 49); `@/lib/actions/admin-donation-actions` → `lib/actions/admin-donation-actions.ts` (import, line 50); `@/lib/actions/archive-payment` → `lib/actions/archive-payment.ts` (dynamic, line 337).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Check`, `Copy`, `Icon`, `Link`, `ArrowLeft`, `Card`, `CardContent`, `Badge`, `Button`, `Loader2`, `MailIcon`, `FileDown`, `ExternalLink`, `Send`, `CardHeader`, `CardTitle`, `User`, `DetailRow`, `MessageSquare`, `CreditCard`, `Hash`, `CopyButton`, `Calendar`, `ShieldCheck`, `RotateCcw`, `ArchiveRestore`, `Archive`, `ErrorBoundary`, `ReviewStatusCard`, `ReviewNotesSection`, `ActivityTimeline`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `StatusChangeModal`.
- Browser-name signals (not semantic proof): `navigator`, `document`, `window`.
- Source hash: `5d7e8b7a07b0e52333bd740ba225d75fd9389742bca3e7351736410f7694e251`.

<a id="c107"></a>

## `components/admin/payments/payments-table-client.tsx`

- Responsibility / candidate ownership: Filter/page/manage payment records across donation/event/conference entities / Admin finance.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `PaymentsDashboard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/payments/page.tsx:7` (import).
- App-entry ancestors: `app/admin/payments/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/card` → `components/ui/card.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/input` → `components/ui/input.tsx` (import, line 8); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 9); `@/components/ui/table` → `components/ui/table.tsx` (import, line 10); `lucide-react` → `package` (import, line 18); `@/lib/utils/currency` → `lib/utils/currency.ts` (import, line 38); `@/components/ui/skeleton` → `components/ui/skeleton.tsx` (import, line 39); `@/lib/notifications` → `lib/notifications.ts` (import, line 40); `@/lib/actions/archive-payment` → `lib/actions/archive-payment.ts` (dynamic, line 291).
- Hooks called: `useRouter`, `useState`, `useRef`, `useCallback`, `useEffect`.
- JSX components: `DollarSign`, `Clock`, `AlertCircle`, `Heart`, `CalendarDays`, `Users`, `Card`, `CardContent`, `StatCard`, `CreditCard`, `CardHeader`, `CardTitle`, `Button`, `RotateCcw`, `Search`, `Input`, `X`, `Filter`, `FancySelect`, `Loader2`, `Archive`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `CheckSquare`, `Square`, `TableBody`, `TableCell`, `Skeleton`, `Badge`, `Calendar`, `ChevronDown`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f023c2e4baeb25062eae01ecf6ad2856b00fc699f31b938ccb247f5b3d355013`.

<a id="c108"></a>

## `components/admin/permission-gate.tsx`

- Responsibility / candidate ownership: Server-check admin roles/permissions and redirect or expose permission helpers / Admin authentication/access.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `PermissionGate`, `checkPermission`, `checkFinanceAccess`, `checkUserManagementAccess`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 1); `next/navigation` → `package` (import, line 2); `@/lib/supabase/server` → `lib/supabase/server.ts` (import, line 3); `@/lib/types/admin` → `lib/types/admin.ts` (import, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d4ff4236e548757d748fb51cecd83473cded19fb883fcae2cfb883027fe07db3`.

<a id="c109"></a>

## `components/admin/podcast-form.tsx`

- Responsibility / candidate ownership: Edit podcast metadata, highlights, guests and YouTube-derived data / Admin podcasts.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/podcasts/[id]/page.tsx:4` (import); `app/admin/podcasts/new/page.tsx:4` (import).
- App-entry ancestors: `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 10); `@/components/ui/checkbox` → `components/ui/checkbox.tsx` (import, line 11); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 12); `lucide-react` → `package` (import, line 13); `@/components/social-icons` → `components/social-icons.tsx` (import, line 14); `@/lib/utils/youtube` → `lib/utils/youtube.ts` (import, line 15); `@/lib/notifications` → `lib/notifications.ts` (import, line 16).
- Hooks called: `useRouter`, `useState`, `useEffect`.
- JSX components: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Youtube`, `Input`, `Button`, `Loader2`, `XCircle`, `CheckCircle2`, `Textarea`, `Badge`, `Plus`, `X`, `Checkbox`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5ad81392f72d1ce564a892765995a83b3485fd52417b59a6b64ccf65d2bdaf42`.

<a id="c110"></a>

## `components/admin/profile-form.tsx`

- Responsibility / candidate ownership: Update the current admin profile / Admin profile.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProfileForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/profile/page.tsx:4` (import).
- App-entry ancestors: `app/admin/profile/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/actions/admin-profile` → `lib/actions/admin-profile.ts` (import, line 9); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 10).
- Hooks called: `useState`.
- JSX components: `Alert`, `AlertDescription`, `CheckCircle`, `Label`, `Input`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `667b0936846c72b69d366480e027791bcf7c9301fabad17325289e3fb20c9b91`.

<a id="c111"></a>

## `components/admin/program-edit-skeleton.tsx`

- Responsibility / candidate ownership: Render program-admin editor loading placeholders / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProgramEditSkeleton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/loading.tsx:1` (import); `app/admin/programs/[id]/edit/page.tsx:38` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/loading.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/skeleton` → `components/ui/skeleton.tsx` (import, line 1).
- Hooks called: None found.
- JSX components: `Skeleton`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6bf12ffcb5f38c94894ff752f2511c2a8140586802d77fff3cf6c8b3fb461dd6`.

<a id="c112"></a>

## `components/admin/program-sections/AssetPicker.tsx`

- Responsibility / candidate ownership: Select/upload/replace program assets with real-program context and metadata / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `AssetPick`, `AssetPicker`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:9` (import); `components/admin/CampaignEditForm.tsx:8` (import); `components/admin/EditorialProgramEditor.tsx:6` (import); `components/admin/OutreachEditForm.tsx:8` (import); `components/admin/ResearchEditForm.tsx:8` (import); `components/admin/ServiceEditForm.tsx:10` (import); `components/admin/program-sections/forms/GallerySectionForm.tsx:11` (import); `components/admin/program-sections/forms/QuoteSectionForm.tsx:6` (import); `components/admin/program-sections/forms/StorySectionForm.tsx:8` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 8); `./program-id-context` → `components/admin/program-sections/program-id-context.tsx` (import, line 9); `@/lib/utils` → `lib/utils.ts` (import, line 10); `@/lib/notifications` → `lib/notifications.ts` (import, line 11); `@/lib/actions/program-assets` → `lib/actions/program-assets.ts` (import, line 12); `@/components/admin/confirm-dialog` → `components/admin/confirm-dialog.tsx` (import, line 13); `@/lib/programs/content` → `lib/programs/content.ts` (import, line 14).
- Hooks called: `useProgramId`, `useId`, `useState`, `useRef`, `useCallback`.
- JSX components: `Label`, `Button`, `LinkIcon`, `Input`, `Check`, `X`, `Upload`, `Loader2`, `ConfirmDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `395b58274ad4ac098d194bf8f139846a7b79e0ab82ace8489d2a63cf86e8499d`.

<a id="c113"></a>

## `components/admin/program-sections/ImageMetadataFields.tsx`

- Responsibility / candidate ownership: Edit program image metadata such as alt text, captions and attribution / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ImageMetadataFields`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/ServiceEditForm.tsx:9` (import); `components/admin/program-sections/forms/QuoteSectionForm.tsx:7` (import); `components/admin/program-sections/forms/StorySectionForm.tsx:9` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6).
- Hooks called: `useId`.
- JSX components: `Label`, `Input`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `22e1c0a91fa8dc1dc29f3feb4c010aa80741dace31073a2a80c9122691c27b20`.

<a id="c114"></a>

## `components/admin/program-sections/ProgramMediaLibrary.tsx`

- Responsibility / candidate ownership: Fetch/edit/delete program media records / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ProgramMediaLibrary`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/page.tsx:36` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/input` → `components/ui/input.tsx` (import, line 9); `@/components/ui/label` → `components/ui/label.tsx` (import, line 10); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 11); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 12); `@/lib/actions/program-assets` → `lib/actions/program-assets.ts` (import, line 16); `@/lib/notifications` → `lib/notifications.ts` (import, line 22).
- Hooks called: `useState`, `useCallback`, `useEffect`.
- JSX components: `HardDrive`, `ChevronDown`, `ChevronRight`, `Loader2`, `ImageIcon`, `Input`, `Button`, `Check`, `X`, `Badge`, `ExternalLink`, `Pencil`, `Trash2`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `f9388d441c51e3234620d7cc89b3a6e27456e114c9c309e5f8af2cbcd878a07d`.

<a id="c115"></a>

## `components/admin/program-sections/SectionList.tsx`

- Responsibility / candidate ownership: Compose the sortable program-section list / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionList`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/index.tsx:22` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@dnd-kit/sortable` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 6); `./SortableSectionCard` → `components/admin/program-sections/SortableSectionCard.tsx` (import, line 7); `./types` → `components/admin/program-sections/types.ts` (import, type-only, line 8).
- Hooks called: None found.
- JSX components: `Icon`, `SortableContext`, `SortableSectionCard`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `545c91c2fad46f41068c6689c96e3cd65ce91960bde91a1bfc1a42e771728220`.

<a id="c116"></a>

## `components/admin/program-sections/SectionPropertiesPanel.tsx`

- Responsibility / candidate ownership: Edit selected section metadata and delegate content to SectionFormFactory / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionPropertiesPanel`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/index.tsx:23` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 10); `./types` → `components/admin/program-sections/types.ts` (import, line 11); `./forms/SectionFormFactory` → `components/admin/program-sections/forms/SectionFormFactory.tsx` (import, line 12).
- Hooks called: None found.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Badge`, `Button`, `Copy`, `Trash2`, `CardContent`, `Label`, `Input`, `Switch`, `SectionFormFactory`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b857400804515426cadfe6bcef3b045a5a6c1ebb7fa75cc59ffac6fb21d59a60`.

<a id="c117"></a>

## `components/admin/program-sections/SectionTypePicker.tsx`

- Responsibility / candidate ownership: Select from configured program section types/categories / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionTypePicker`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/index.tsx:21` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 9); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 10); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 13); `./types` → `components/admin/program-sections/types.ts` (import, type-only, line 14); `./types` → `components/admin/program-sections/types.ts` (import, line 15).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogTrigger`, `Button`, `Plus`, `DialogContent`, `DialogHeader`, `DialogTitle`, `ScrollArea`, `Icon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `07041a0fa483fa6c6eb1932e5bd6f0d4aea132db8f615418faee7a72b29eea82`.

<a id="c118"></a>

## `components/admin/program-sections/SortableSectionCard.tsx`

- Responsibility / candidate ownership: Drag/reorder a program section and expose visibility/copy/delete actions / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SortableSectionCard`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/SectionList.tsx:7` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@dnd-kit/sortable` → `package` (import, line 3); `@dnd-kit/utilities` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 11); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 12); `@/lib/utils` → `lib/utils.ts` (import, line 13); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 14); `./types` → `components/admin/program-sections/types.ts` (import, line 15).
- Hooks called: `useSortable`.
- JSX components: `GripVertical`, `Icon`, `Badge`, `Button`, `EyeOff`, `Eye`, `Copy`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b841758e6b10be76ea782aea340bb920bd02b52fe379b251b67d4b01568b3872`.

<a id="c119"></a>

## `components/admin/program-sections/TemplateSection.tsx`

- Responsibility / candidate ownership: Provide collapsible template-editor panels and text fields / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TemplateSection`, `TemplateTextField`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:6` (import); `components/admin/EditorialProgramEditor.tsx:3` (import); `components/admin/program-sections/TemplateSectionsEditor.tsx:3` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 2); `lucide-react` → `package` (import, line 3).
- Hooks called: `useState`, `useId`.
- JSX components: `ChevronDown`, `ChevronRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1af437e94cb64ce580d2ccf9bc1973f6eda787b9a14977c95db51c1b1f30542f`.

<a id="c120"></a>

## `components/admin/program-sections/TemplateSectionsEditor.tsx`

- Responsibility / candidate ownership: Align editable program sections with category template slots / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TemplateSectionsEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:5` (import); `components/admin/EditorialProgramEditor.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 2); `./TemplateSection` → `components/admin/program-sections/TemplateSection.tsx` (import, line 3); `./template-layouts` → `components/admin/program-sections/template-layouts.ts` (import, line 4); `./forms/SectionFormFactory` → `components/admin/program-sections/forms/SectionFormFactory.tsx` (import, line 5); `./program-id-context` → `components/admin/program-sections/program-id-context.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `ProgramIdProvider`, `TemplateSection`, `TemplateTextField`, `SectionFormFactory`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4b024fe4c8c7f944c0585a7bd0464cc7505184b3cdac8b2d4f59b543d5961a1e`.

<a id="c121"></a>

## `components/admin/program-sections/VersionHistoryPanel.tsx`

- Responsibility / candidate ownership: Fetch, preview and restore program versions / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `VersionHistoryPanel`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/page.tsx:37` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 9); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 10); `@/lib/actions/program-crud` → `lib/actions/program-crud.ts` (import, line 14); `@/lib/notifications` → `lib/notifications.ts` (import, line 20).
- Hooks called: `useState`, `useCallback`, `useEffect`.
- JSX components: `Badge`, `History`, `ChevronDown`, `ChevronRight`, `Loader2`, `Clock`, `Button`, `Eye`, `RotateCcw`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `VersionPreview`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ca86905ea69097efaaba441deae6c8bf65fde7486d1d75180028cdb9b1c83fd3`.

<a id="c122"></a>

## `components/admin/program-sections/forms/ActivitiesSectionForm.tsx`

- Responsibility / candidate ownership: Edit program activity item content / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ActivitiesSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:13` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c73cc0d9a02c3311faa546f36870e316d8ed8b33228b1a22cf20b0a20a3e5e86`.

<a id="c123"></a>

## `components/admin/program-sections/forms/CTASectionForm.tsx`

- Responsibility / candidate ownership: Edit CTA buttons, layout and campaign participation cards / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `CTASectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:12` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/select` → `components/ui/select.tsx` (import, line 7); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Input`, `Label`, `Button`, `Trash2`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d3f1a30df07a8e4638da9e2aefe5413f7b455306e3465435dcd8102aa004b36b`.

<a id="c124"></a>

## `components/admin/program-sections/forms/FAQSectionForm.tsx`

- Responsibility / candidate ownership: Edit program FAQ entries / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FAQSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:10` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4818fa869e03b46021b5608d86b9c30a9dafe1d224920c80797dd31f76ea54f1`.

<a id="c125"></a>

## `components/admin/program-sections/forms/FactsBarSectionForm.tsx`

- Responsibility / candidate ownership: Edit program fact-bar metrics / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FactsBarSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:16` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `549aff67934fae45249c1a812cda0474cc3a4d80ece562d867b9ecae442db57f`.

<a id="c126"></a>

## `components/admin/program-sections/forms/FeaturesSectionForm.tsx`

- Responsibility / candidate ownership: Edit feature items with category-specific icon/number options / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `FeaturesSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:7` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/select` → `components/ui/select.tsx` (import, line 7); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Label`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0d560b575d37dabf268d9f30b616aee0b3161e0d7bb66711defaeb0dae965225`.

<a id="c127"></a>

## `components/admin/program-sections/forms/GallerySectionForm.tsx`

- Responsibility / candidate ownership: Edit gallery layout/media with program asset selection / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `GallerySectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:6` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/select` → `components/ui/select.tsx` (import, line 7); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 10); `../AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 11).
- Hooks called: None found.
- JSX components: `Label`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Button`, `Trash2`, `AssetPicker`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2ff3770c321fc51fd10b1bab1acc056854df317070da57c17308e893bb9427f5`.

<a id="c128"></a>

## `components/admin/program-sections/forms/ProgressTrackerSectionForm.tsx`

- Responsibility / candidate ownership: Edit progress tracker values and content / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ProgressTrackerSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:11` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/input` → `components/ui/input.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 5).
- Hooks called: None found.
- JSX components: `Input`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ec6688eff411fe82ba6845a07864388512b92a35188d2b0abf91d55d2edcdbbd`.

<a id="c129"></a>

## `components/admin/program-sections/forms/QuoteSectionForm.tsx`

- Responsibility / candidate ownership: Edit quote text/attribution and optional program image metadata / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `QuoteSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:9` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/input` → `components/ui/input.tsx` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 5); `../AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 6); `../ImageMetadataFields` → `components/admin/program-sections/ImageMetadataFields.tsx` (import, line 7).
- Hooks called: None found.
- JSX components: `Input`, `AssetPicker`, `ImageMetadataFields`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `28e9fc1d8942b3c842aad8dce88a718eed1f2a3bc4b19f63ed0b12a7004dacb1`.

<a id="c130"></a>

## `components/admin/program-sections/forms/ResourcesSectionForm.tsx`

- Responsibility / candidate ownership: Edit program resource/download items / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ResourcesSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:14` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `204f6907fd43ea2824e66c50568e2d30934e3fa1c84e911889526292f503077d`.

<a id="c131"></a>

## `components/admin/program-sections/forms/RichTextSectionForm.tsx`

- Responsibility / candidate ownership: Adapt program rich-text content to the shared admin RichTextEditor / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `RichTextSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/label` → `components/ui/label.tsx` (import, line 3); `@/components/admin/rich-text-editor` → `components/admin/rich-text-editor.tsx` (import, line 4); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 5).
- Hooks called: None found.
- JSX components: `Label`, `RichTextEditor`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `17fd2eaba726bff9dccfdfafaabaa2756e8cb15a167f6c7479403466e8a431ff`.

<a id="c132"></a>

## `components/admin/program-sections/forms/SectionFormFactory.tsx`

- Responsibility / candidate ownership: Dispatch section content types to the appropriate form and handle built-in demo fields / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionFormFactory`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/template-editor.test.tsx:7` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:12` (import); `components/admin/program-sections/TemplateSectionsEditor.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 3); `./RichTextSectionForm` → `components/admin/program-sections/forms/RichTextSectionForm.tsx` (import, line 4); `./StatsSectionForm` → `components/admin/program-sections/forms/StatsSectionForm.tsx` (import, line 5); `./GallerySectionForm` → `components/admin/program-sections/forms/GallerySectionForm.tsx` (import, line 6); `./FeaturesSectionForm` → `components/admin/program-sections/forms/FeaturesSectionForm.tsx` (import, line 7); `./StepsSectionForm` → `components/admin/program-sections/forms/StepsSectionForm.tsx` (import, line 8); `./QuoteSectionForm` → `components/admin/program-sections/forms/QuoteSectionForm.tsx` (import, line 9); `./FAQSectionForm` → `components/admin/program-sections/forms/FAQSectionForm.tsx` (import, line 10); `./ProgressTrackerSectionForm` → `components/admin/program-sections/forms/ProgressTrackerSectionForm.tsx` (import, line 11); `./CTASectionForm` → `components/admin/program-sections/forms/CTASectionForm.tsx` (import, line 12); `./ActivitiesSectionForm` → `components/admin/program-sections/forms/ActivitiesSectionForm.tsx` (import, line 13); `./ResourcesSectionForm` → `components/admin/program-sections/forms/ResourcesSectionForm.tsx` (import, line 14); `./WhoWeSupportSectionForm` → `components/admin/program-sections/forms/WhoWeSupportSectionForm.tsx` (import, line 15); `./FactsBarSectionForm` → `components/admin/program-sections/forms/FactsBarSectionForm.tsx` (import, line 16); `./StorySectionForm` → `components/admin/program-sections/forms/StorySectionForm.tsx` (import, line 17).
- Hooks called: None found.
- JSX components: `RichTextSectionForm`, `StatsSectionForm`, `GallerySectionForm`, `FeaturesSectionForm`, `StepsSectionForm`, `QuoteSectionForm`, `FAQSectionForm`, `ProgressTrackerSectionForm`, `CTASectionForm`, `ActivitiesSectionForm`, `ResourcesSectionForm`, `WhoWeSupportSectionForm`, `FactsBarSectionForm`, `StorySectionForm`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7f57b67ea17c63fbb8ed11a4d2fd9bdc180c6ad5df21c7ae61602cc99bab3f86`.

<a id="c133"></a>

## `components/admin/program-sections/forms/StatsSectionForm.tsx`

- Responsibility / candidate ownership: Edit program statistic items and optional attribution / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `StatsSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a6d81604d94e6790995ab46d88963de5f83850805e72acbb9d1707525df0666c`.

<a id="c134"></a>

## `components/admin/program-sections/forms/StepsSectionForm.tsx`

- Responsibility / candidate ownership: Edit process/timeline steps and handwritten notes / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `StepsSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:8` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/select` → `components/ui/select.tsx` (import, line 7); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a04ceef4235bf522f98fb0e8eeccc7ce33561dc10d14356fdc23dee5b92efcf4`.

<a id="c135"></a>

## `components/admin/program-sections/forms/StorySectionForm.tsx`

- Responsibility / candidate ownership: Edit program story text, media metadata and statistics / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `StorySectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:17` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7); `../AssetPicker` → `components/admin/program-sections/AssetPicker.tsx` (import, line 8); `../ImageMetadataFields` → `components/admin/program-sections/ImageMetadataFields.tsx` (import, line 9).
- Hooks called: None found.
- JSX components: `Input`, `AssetPicker`, `ImageMetadataFields`, `Label`, `Button`, `Trash2`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4ee435aecbe471d29ba6e872f0fa920051c9e271114123f7e41e328a88357157`.

<a id="c136"></a>

## `components/admin/program-sections/forms/WhoWeSupportSectionForm.tsx`

- Responsibility / candidate ownership: Edit supported-group items / Admin program content forms.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `WhoWeSupportSectionForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/SectionFormFactory.tsx:15` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 7).
- Hooks called: None found.
- JSX components: `Label`, `Button`, `Trash2`, `Input`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ad01925f48395f308304473904c11c783d98a740c92d9a7ded7a357ff8a02636`.

<a id="c137"></a>

## `components/admin/program-sections/index.tsx`

- Responsibility / candidate ownership: Compose section editing, drag/drop, undo/redo and program context / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionEditor`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/page.tsx:31` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@dnd-kit/core` → `package` (import, line 4); `@dnd-kit/sortable` → `package` (import, line 15); `lucide-react` → `package` (import, line 16); `@/components/ui/button` → `components/ui/button.tsx` (import, line 17); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 18); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 19); `./useSectionState` → `components/admin/program-sections/useSectionState.ts` (import, line 20); `./SectionTypePicker` → `components/admin/program-sections/SectionTypePicker.tsx` (import, line 21); `./SectionList` → `components/admin/program-sections/SectionList.tsx` (import, line 22); `./SectionPropertiesPanel` → `components/admin/program-sections/SectionPropertiesPanel.tsx` (import, line 23); `./types` → `components/admin/program-sections/types.ts` (import, line 24); `./program-id-context` → `components/admin/program-sections/program-id-context.tsx` (import, line 25).
- Hooks called: `useSectionState`, `useState`, `useRef`, `useEffect`, `useSensors`, `useSensor`, `useCallback`.
- JSX components: `ProgramIdProvider`, `SectionTypePicker`, `Button`, `Undo2`, `Redo2`, `EyeOff`, `Eye`, `Badge`, `DndContext`, `SectionList`, `DragOverlay`, `SectionPropertiesPanel`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9570c090d076cf8c53d18daefb9a13fc20d7b60397de72e458026fabc9934429`.

<a id="c138"></a>

## `components/admin/program-sections/program-id-context.tsx`

- Responsibility / candidate ownership: Provide the program identifier to editor/media descendants / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ProgramIdProvider`, `useProgramId`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/page.tsx:32` (import); `components/admin/ProgramEditorDemo.tsx:5` (import); `components/admin/program-sections/AssetPicker.tsx:9` (import); `components/admin/program-sections/TemplateSectionsEditor.tsx:6` (import); `components/admin/program-sections/index.tsx:25` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3).
- Hooks called: `useContext`.
- JSX components: `ProgramIdContext.Provider`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `96c748ae0ed0f641b4a5bddc0154d686e3241e4b25f903ea80d50187618d3b90`.

<a id="c139"></a>

## `components/admin/program-sections/section-actions.ts`

- Responsibility / candidate ownership: Apply pure section-list operations; not server actions / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `addSection`, `removeSection`, `updateSection`, `updateSectionContent`, `duplicateSection`, `moveSection`, `toggleSectionEnabled`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/useSectionState.ts:5` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 1); `./types` → `components/admin/program-sections/types.ts` (import, type-only, line 2); `./types` → `components/admin/program-sections/types.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `38e1aff3cff36985fd61d85f9c19f5e66346eed50dc9f6bfdf25f44fd2fc502e`.

<a id="c140"></a>

## `components/admin/program-sections/template-layouts.ts`

- Responsibility / candidate ownership: Define category template slots and construct matching section defaults / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TemplateSlot`, `TEMPLATE_LAYOUTS`, `templateSectionDetails`, `createTemplateSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/TemplateSectionsEditor.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 1); `./types` → `components/admin/program-sections/types.ts` (import, line 2).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f620b0323d430b97a68ce7b58896e77cc5adcf33088951431fd4e550166d0f89`.

<a id="c141"></a>

## `components/admin/program-sections/types.ts`

- Responsibility / candidate ownership: Define section metadata/categories and runtime content/section factories / Admin programs.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SectionType`, `SectionTypeConfig`, `SECTION_TYPES`, `SECTION_TYPE_MAP`, `SECTION_CATEGORIES`, `createEmptyContent`, `generateSectionId`, `createSection`, `ProgramCategoryType`, `CATEGORY_DEFAULTS`, `getDefaultSectionsForCategory`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/lifecycle.test.tsx:5` (import); `app/admin/programs/new/page.tsx:13` (import); `components/admin/ServiceEditForm.tsx:3` (import); `components/admin/program-sections/SectionList.tsx:8` (import, type-only); `components/admin/program-sections/SectionPropertiesPanel.tsx:11` (import); `components/admin/program-sections/SectionTypePicker.tsx:14` (import, type-only); `components/admin/program-sections/SectionTypePicker.tsx:15` (import); `components/admin/program-sections/SortableSectionCard.tsx:15` (import); `components/admin/program-sections/index.tsx:24` (import); `components/admin/program-sections/section-actions.ts:2` (import, type-only); `components/admin/program-sections/section-actions.ts:3` (import); `components/admin/program-sections/template-layouts.ts:2` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/lifecycle.test.tsx`, `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5ec1d9a71b9642c75760022fcd90b2202144686df9a8fee97ca1863deb6ba43d`.

<a id="c142"></a>

## `components/admin/program-sections/useSectionState.ts`

- Responsibility / candidate ownership: Manage section editing, history and callbacks through a local state hook / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `UseSectionStateReturn`, `useSectionState`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/index.tsx:20` (import).
- App-entry ancestors: `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 4); `./section-actions` → `components/admin/program-sections/section-actions.ts` (import, line 5).
- Hooks called: `useReducer`, `useCallback`, `useEffect`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `95a184649ade64b9c0718f899c69fe719276bc1beee5693608ffa7c389a9b092`.

<a id="c143"></a>

## `components/admin/program-thumb.tsx`

- Responsibility / candidate ownership: Render an admin program thumbnail with failure handling / Admin programs.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProgramThumb`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/page.tsx:12` (import).
- App-entry ancestors: `app/admin/programs/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 5).
- Hooks called: `useState`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `039ba06971b02e4887301aa85749610d6d1a0987966780aff7e9d8daafe5c65f`.

<a id="c144"></a>

## `components/admin/project-actions.tsx`

- Responsibility / candidate ownership: Apply project visibility/deletion actions with toast feedback / Admin projects.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProjectActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/projects/page.tsx:8` (import).
- App-entry ancestors: `app/admin/projects/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 5); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 12); `lucide-react` → `package` (import, line 22); `@/lib/actions/admin-projects` → `lib/actions/admin-projects.ts` (import, line 23); `@/hooks/use-toast` → `hooks/use-toast.ts` (import, line 24).
- Hooks called: `useState`, `useToast`.
- JSX components: `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `MoreHorizontal`, `DropdownMenuContent`, `DropdownMenuItem`, `EyeOff`, `Eye`, `DropdownMenuSeparator`, `Trash2`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `db79fea8a4b98c59be0b48b6a4fb2c5f34b7f8ee7da95612a26bf1533c032558`.

<a id="c145"></a>

## `components/admin/project-form.tsx`

- Responsibility / candidate ownership: Create/update legacy project records and media / Admin projects.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProjectForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/projects/[id]/page.tsx:3` (import); `app/admin/projects/new/page.tsx:1` (import).
- App-entry ancestors: `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 11); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 12); `lucide-react` → `package` (import, line 13); `@/lib/actions/admin-projects` → `lib/actions/admin-projects.ts` (import, line 14); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 15); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 16).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Textarea`, `FileUpload`, `Switch`, `FancySelect`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2d19a0e41b81b123dbc062a3e2f2cac913ea0891672280a80e4941d24796826f`.

<a id="c146"></a>

## `components/admin/reply-modal.tsx`

- Responsibility / candidate ownership: Send a support reply through the support API / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: ReplyModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/support/support-detail-client.tsx:19` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `next/navigation` → `package` (import, line 6).
- Hooks called: `React.useState`, `React.useMemo`, `useRouter`, `React.useEffect`.
- JSX components: `Dialog`, `DialogTrigger`, `Button`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5198d67cb620b98169b10fcb925e625667925e831256d4a91a7d725644bdb258`.

<a id="c147"></a>

## `components/admin/rich-text-editor.tsx`

- Responsibility / candidate ownership: Compose Tiptap extensions/toolbars, story image handling and autosave integration / Admin rich-text editing with story coupling.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `RichTextEditorProps`, `RichTextEditor`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/program-sections/forms/RichTextSectionForm.tsx:4` (import); `components/admin/story-form.tsx:17` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/react` → `package` (import, line 3); `@tiptap/starter-kit` → `package` (import, line 4); `@tiptap/extension-link` → `package` (import, line 5); `@tiptap/extension-underline` → `package` (import, line 6); `@tiptap/extension-color` → `package` (import, line 7); `@tiptap/extension-text-style` → `package` (import, line 8); `@tiptap/extension-table` → `package` (import, line 9); `@tiptap/extension-youtube` → `package` (import, line 10); `@tiptap/extension-placeholder` → `package` (import, line 11); `@tiptap/extension-character-count` → `package` (import, line 12); `react` → `package` (import, line 13); `./rich-text-editor/toolbar` → `components/admin/rich-text-editor/toolbar.tsx` (import, line 14); `./rich-text-editor/bubble-toolbar` → `components/admin/rich-text-editor/bubble-toolbar.tsx` (import, line 15); `./rich-text-editor/extensions/custom-image` → `components/admin/rich-text-editor/extensions/custom-image.ts` (import, line 16); `./rich-text-editor/extensions/two-column` → `components/admin/rich-text-editor/extensions/two-column.ts` (import, line 17); `./rich-text-editor/extensions/callout` → `components/admin/rich-text-editor/extensions/callout.ts` (import, line 18); `./rich-text-editor/extensions/highlight-quote` → `components/admin/rich-text-editor/extensions/highlight-quote.ts` (import, line 19); `./rich-text-editor/extensions/slash-command` → `components/admin/rich-text-editor/extensions/slash-command.tsx` (import, line 20); `./rich-text-editor/extensions/text-style-with-font-size` → `components/admin/rich-text-editor/extensions/text-style-with-font-size.ts` (import, line 21); `./rich-text-editor/hooks/use-autosave` → `components/admin/rich-text-editor/hooks/use-autosave.ts` (import, line 22); `@/lib/actions/admin-stories` → `lib/actions/admin-stories.ts` (import, line 23); `lucide-react` → `package` (import, line 24).
- Hooks called: `useRef`, `useEffect`, `useAutosave`, `useEditor`.
- JSX components: `Toolbar`, `BubbleToolbar`, `EditorContent`, `Loader2`, `Check`, `AlertCircle`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7990c701822fdb8211beb0e6b5251ed3598d3e09351e90b532a04267401c95d9`.

<a id="c148"></a>

## `components/admin/rich-text-editor/bubble-toolbar.tsx`

- Responsibility / candidate ownership: Render selection formatting and link editing for Tiptap / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `BubbleToolbarProps`, `BubbleToolbar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:15` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/react` → `package` (import, type-only, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `react` → `package` (import, line 13); `./link-dialog` → `components/admin/rich-text-editor/link-dialog.tsx` (import, line 14).
- Hooks called: `useState`, `useRef`, `useEffect`.
- JSX components: `Button`, `Bold`, `Italic`, `Underline`, `Strikethrough`, `Separator`, `LinkIcon`, `LinkDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `82068d7ccb642704d4b47527d964edcdecb450a3ce2dac1fb851682e0756c9cb`.

<a id="c149"></a>

## `components/admin/rich-text-editor/extensions/callout.ts`

- Responsibility / candidate ownership: Define callout node attributes, serialization and editor commands / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `CalloutType`, `Callout`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:18` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/core` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c7979f68dbadaafe8f48766bc8e5adf14c7b71c0e57ee9f663333506dfe8ee84`.

<a id="c150"></a>

## `components/admin/rich-text-editor/extensions/custom-image.ts`

- Responsibility / candidate ownership: Extend image attributes/serialization and image-editing commands / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ImageAttributes`, `CustomImage`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:16` (import); `components/admin/rich-text-editor/image-dialog.tsx:21` (import, type-only).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/extension-image` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `50c76bcc6bd1fa9dec0e7247b6cf3791ea10bbc82f20120006a3c13e08c83a72`.

<a id="c151"></a>

## `components/admin/rich-text-editor/extensions/highlight-quote.ts`

- Responsibility / candidate ownership: Define highlighted-quote node serialization and commands / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `HighlightQuote`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:19` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/core` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9067314eac89277b3707b79570ea057fd268d6ba9d8b0c05ac6bff6241649f90`.

<a id="c152"></a>

## `components/admin/rich-text-editor/extensions/slash-command.tsx`

- Responsibility / candidate ownership: Connect Tiptap suggestion handling to the React slash menu and Tippy popup / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SlashCommand`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:20` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/core` → `package` (import, line 1); `@tiptap/react` → `package` (import, line 2); `@tiptap/suggestion` → `package` (import, line 3); `tippy.js` → `package` (import, line 4); `../slash-menu` → `components/admin/rich-text-editor/slash-menu.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `7c321941c822535f35b46c96ff7b6fd3918a7b47853cd14e7055b693e92c617e`.

<a id="c153"></a>

## `components/admin/rich-text-editor/extensions/text-style-with-font-size.ts`

- Responsibility / candidate ownership: Extend text-style parsing/rendering and font-size commands / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TextStyleWithFontSize`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:21` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/core` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `fd8cc38963a22604cc56127b449f060b50f50b24b05ba36e1ebffe795dc1bf8f`.

<a id="c154"></a>

## `components/admin/rich-text-editor/extensions/two-column.ts`

- Responsibility / candidate ownership: Define two-column container/section nodes and serialization commands / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TwoColumnSection`, `TwoColumn`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:17` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/core` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9dccc735ce3501d346e9c1718305836c1ad18ff46c3b024d3e24452a703a827d`.

<a id="c155"></a>

## `components/admin/rich-text-editor/hooks/use-autosave.ts`

- Responsibility / candidate ownership: Debounce draft saves and persist/recover story-keyed localStorage backups / Admin story draft behavior.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `UseAutosaveOptions`, `UseAutosaveReturn`, `useAutosave`, `getAutosaveBackup`, `clearAutosaveBackup`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:22` (import); `components/admin/story-form.tsx:20` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1).
- Hooks called: `useState`, `useRef`, `useEffect`, `useCallback`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `window`, `localStorage`.
- Source hash: `f5af95aa0cabaffca32bf299ae13a714c2591a2370d881047ce01d3d4cc2dc49`.

<a id="c156"></a>

## `components/admin/rich-text-editor/hooks/use-unsaved-changes.ts`

- Responsibility / candidate ownership: Warn before leaving a page with unsaved content / Admin story draft behavior.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `UseUnsavedChangesOptions`, `useUnsavedChanges`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/story-form.tsx:19` (import).
- App-entry ancestors: `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `next/navigation` → `package` (import, line 2).
- Hooks called: `useRouter`, `useEffect`, `useCallback`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `1932b7448978d719eddb4ba2a65e987520191407ce92989266c2c4cdf9f10d50`.

<a id="c157"></a>

## `components/admin/rich-text-editor/image-dialog.tsx`

- Responsibility / candidate ownership: Insert/configure editor images from upload or URL using FileUpload / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ImageDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor/toolbar.tsx:32` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@tiptap/react` → `package` (import, type-only, line 4); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 13); `@/components/ui/input` → `components/ui/input.tsx` (import, line 14); `@/components/ui/label` → `components/ui/label.tsx` (import, line 15); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 16); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 17); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 18); `lucide-react` → `package` (import, line 19); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 20); `./extensions/custom-image` → `components/admin/rich-text-editor/extensions/custom-image.ts` (import, type-only, line 21).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `FileUpload`, `Label`, `Input`, `Alert`, `AlertCircle`, `AlertDescription`, `FancySelect`, `DialogFooter`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `46314ecb6c171b0ca8780fb9cd0d0606dac525f34c1a3e29f3b6de5aef77097b`.

<a id="c158"></a>

## `components/admin/rich-text-editor/link-dialog.tsx`

- Responsibility / candidate ownership: Configure a Tiptap selection link / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `LinkDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor/bubble-toolbar.tsx:14` (import); `components/admin/rich-text-editor/toolbar.tsx:31` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@tiptap/react` → `package` (import, type-only, line 4); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 13); `@/components/ui/input` → `components/ui/input.tsx` (import, line 14); `@/components/ui/label` → `components/ui/label.tsx` (import, line 15); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 16); `lucide-react` → `package` (import, line 17).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Alert`, `AlertCircle`, `AlertDescription`, `Label`, `Input`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `fb726bee6076572c54da7f547e1496be130e6e75b4f097f93c860d073eff8dd4`.

<a id="c159"></a>

## `components/admin/rich-text-editor/slash-menu.tsx`

- Responsibility / candidate ownership: Render and keyboard-navigate slash-command choices / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `SlashCommand`, `SlashMenuProps`, `SlashMenuRef`, `SlashMenu`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor/extensions/slash-command.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@tiptap/react` → `package` (import, type-only, line 4); `lucide-react` → `package` (import, line 5).
- Hooks called: `useState`, `useEffect`, `useCallback`, `useImperativeHandle`.
- JSX components: `Type`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `List`, `ListOrdered`, `Quote`, `Minus`, `ImageIcon`, `Video`, `Table`, `Columns`, `AlertCircle`, `Sparkles`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f711a7acb006e16d56e60c89be7b2c26bcaa38647eae4779a80ddae0e025549d`.

<a id="c160"></a>

## `components/admin/rich-text-editor/table-dialog.tsx`

- Responsibility / candidate ownership: Collect table dimensions for editor insertion / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `TableDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor/toolbar.tsx:33` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 12); `@/components/ui/input` → `components/ui/input.tsx` (import, line 13); `@/components/ui/label` → `components/ui/label.tsx` (import, line 14); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 15).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Label`, `Input`, `Switch`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ab7cf6748549110b669c47c70424e9e7b780d1fd35f0d8cb714a67094f5120aa`.

<a id="c161"></a>

## `components/admin/rich-text-editor/toolbar.tsx`

- Responsibility / candidate ownership: Compose editor formatting, layout, insertion and media controls / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `ToolbarProps`, `Toolbar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor.tsx:14` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@tiptap/react` → `package` (import, type-only, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 6); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/notifications` → `lib/notifications.ts` (import, line 30); `./link-dialog` → `components/admin/rich-text-editor/link-dialog.tsx` (import, line 31); `./image-dialog` → `components/admin/rich-text-editor/image-dialog.tsx` (import, line 32); `./table-dialog` → `components/admin/rich-text-editor/table-dialog.tsx` (import, line 33); `./video-dialog` → `components/admin/rich-text-editor/video-dialog.tsx` (import, line 34).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Button`, `FancySelect`, `Separator`, `ActionButton`, `Bold`, `Italic`, `Underline`, `Strikethrough`, `Quote`, `Palette`, `PaintBucket`, `Undo`, `Redo`, `List`, `ListOrdered`, `Minus`, `LinkIcon`, `ImageIcon`, `Trash2`, `Video`, `Columns`, `AlertCircle`, `Sparkles`, `Table`, `LinkDialog`, `ImageDialog`, `TableDialog`, `VideoDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2614563380751bc81d514e619f95c521d164cbd960a267ade6e66f738fc7d577`.

<a id="c162"></a>

## `components/admin/rich-text-editor/video-dialog.tsx`

- Responsibility / candidate ownership: Configure editor video insertion / Admin rich-text editing.
- Usage / observed scope: USED / admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `VideoDialog`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/rich-text-editor/toolbar.tsx:34` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@tiptap/react` → `package` (import, type-only, line 4); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 13); `@/components/ui/input` → `components/ui/input.tsx` (import, line 14); `@/components/ui/label` → `components/ui/label.tsx` (import, line 15); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 16); `lucide-react` → `package` (import, line 17).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Alert`, `AlertCircle`, `AlertDescription`, `Label`, `Input`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5a2922252a9554c9d3a8839c2d3f3b51a4a7f68b9e172adf95d557d50fa4bcc0`.

<a id="c163"></a>

## `components/admin/settings-tabs.tsx`

- Responsibility / candidate ownership: Compose site, payment, organization and support-setting controls / Admin settings.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SettingsTabs`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/settings/page.tsx:7` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/navigation` → `package` (import, line 3); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 4); `@/components/admin/site-settings-form` → `components/admin/site-settings-form.tsx` (import, line 5); `@/components/admin/payment-settings-form` → `components/admin/payment-settings-form.tsx` (import, line 6); `@/components/admin/organization-settings-form` → `components/admin/organization-settings-form.tsx` (import, line 7); `@/components/admin/support-toggle-modal` → `components/admin/support-toggle-modal.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `lucide-react` → `package` (import, line 10); `@/lib/payments/config` → `lib/payments/config.ts` (import, type-only, line 11).
- Hooks called: `useRouter`, `useSearchParams`.
- JSX components: `Tabs`, `TabsList`, `TabsTrigger`, `Settings`, `CreditCard`, `Building2`, `TabsContent`, `SupportToggleModal`, `SiteSettingsForm`, `PaymentSettingsForm`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `OrganizationSettingsForm`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `148b20b4c1b4c241ad6b7d2a04adde63713788824c3e5b8d2d9bd7c0cad85179`.

<a id="c164"></a>

## `components/admin/setup-form.tsx`

- Responsibility / candidate ownership: Submit initial admin setup using form action state / Admin authentication/access.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SetupForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/setup/page.tsx:3` (import).
- App-entry ancestors: `app/admin/setup/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `react-dom` → `package` (import, line 4); `@/lib/actions/admin-setup` → `lib/actions/admin-setup.ts` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/input` → `components/ui/input.tsx` (import, line 7); `@/components/ui/label` → `components/ui/label.tsx` (import, line 8); `lucide-react` → `package` (import, line 9).
- Hooks called: `useFormStatus`, `useState`.
- JSX components: `Button`, `Loader2`, `AlertCircle`, `Label`, `Input`, `EyeOff`, `Eye`, `SubmitButton`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `14b7117de98a8b0054601c531373c12348ccdfa95e5b7fa63c79725c859b8b79`.

<a id="c165"></a>

## `components/admin/site-settings-form.tsx`

- Responsibility / candidate ownership: Edit site-level content, links, media/gallery and PhotoWall settings / Admin settings.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SiteSettingsForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/settings-tabs.tsx:5` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 10); `@/components/ui/scroll-area` → `components/ui/scroll-area.tsx` (import, line 11); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 12); `@/components/photo-wall/photo-wall` → `components/photo-wall/photo-wall.tsx` (import, line 20); `lucide-react` → `package` (import, line 21); `@/components/social-icons` → `components/social-icons.tsx` (import, line 44); `@/lib/actions/admin-settings` → `lib/actions/admin-settings.ts` (import, line 45); `./file-upload` → `components/admin/file-upload.tsx` (import, line 46); `./gallery-manager` → `components/admin/gallery-manager.tsx` (import, line 47); `@/lib/notifications` → `lib/notifications.ts` (import, line 48); `@/lib/utils` → `lib/utils.ts` (import, line 49); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 50); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 51).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Settings`, `Button`, `Building2`, `Home`, `ImageIcon`, `Dialog`, `DialogTrigger`, `HelpCircle`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Check`, `Loader2`, `X`, `Tabs`, `ScrollArea`, `TabsList`, `TabsTrigger`, `Globe`, `Phone`, `Twitter`, `Search`, `Layout`, `Newspaper`, `Palette`, `ScrollBar`, `TabsContent`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Textarea`, `Separator`, `Save`, `Mail`, `MapPin`, `Facebook`, `Instagram`, `Linkedin`, `Youtube`, `FileUpload`, `BookOpen`, `GalleryManager`, `ZoomOut`, `RefreshCw`, `ZoomIn`, `PhotoWall`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7e40db0afd740de3c8ac8da76a0ab9ff86708dadf2567c4638f54715af0629b8`.

<a id="c166"></a>

## `components/admin/stat-actions.tsx`

- Responsibility / candidate ownership: Delete an impact statistic record / Admin impact statistics.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `StatActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/stats/page.tsx:8` (import).
- App-entry ancestors: `app/admin/stats/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 6); `lucide-react` → `package` (import, line 17); `@/lib/actions/admin-stats` → `lib/actions/admin-stats.ts` (import, line 18).
- Hooks called: `useState`, `useRouter`.
- JSX components: `AlertDialog`, `AlertDialogTrigger`, `Button`, `Trash2`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a3835ad2ad47ea4bea43fdcc2f2716e27d999a5a6c86fef1b7d08e5f20288a54`.

<a id="c167"></a>

## `components/admin/stat-form.tsx`

- Responsibility / candidate ownership: Create/update an impact statistic record / Admin impact statistics.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `StatForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/stats/[id]/page.tsx:4` (import); `app/admin/stats/new/page.tsx:3` (import).
- App-entry ancestors: `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 9); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 10); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 11); `lucide-react` → `package` (import, line 12); `@/lib/actions/admin-stats` → `lib/actions/admin-stats.ts` (import, line 13); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 14).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `FancySelect`, `Switch`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d9e06e0adc205ddeecb8a7811dc4906407eb2a1b473d5e23cf3e1af43b248332`.

<a id="c168"></a>

## `components/admin/story-form.tsx`

- Responsibility / candidate ownership: Edit/persist stories with uploads, rich text, preview and draft recovery / Admin stories.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `StoryForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/stories/[id]/page.tsx:5` (import); `app/admin/stories/new/page.tsx:1` (import).
- App-entry ancestors: `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 10); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 11); `lucide-react` → `package` (import, line 12); `@/components/ui/print-button` → `components/ui/print-button.tsx` (import, line 13); `@/lib/notifications` → `lib/notifications.ts` (import, line 14); `@/lib/actions/admin-stories` → `lib/actions/admin-stories.ts` (import, line 15); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 16); `@/components/admin/rich-text-editor` → `components/admin/rich-text-editor.tsx` (import, line 17); `@/components/admin/story-preview-modal` → `components/admin/story-preview-modal.tsx` (import, line 18); `@/components/admin/rich-text-editor/hooks/use-unsaved-changes` → `components/admin/rich-text-editor/hooks/use-unsaved-changes.ts` (import, line 19); `@/components/admin/rich-text-editor/hooks/use-autosave` → `components/admin/rich-text-editor/hooks/use-autosave.ts` (import, line 20); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 21); `@/app/print-styles.css` → `app/print-styles.css` (import, line 22).
- Hooks called: `useState`, `useRouter`, `useEffect`, `useUnsavedChanges`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `AlertTriangle`, `Button`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Switch`, `Textarea`, `PenSquare`, `RichTextEditor`, `FileUpload`, `PrintButton`, `Eye`, `Loader2`, `StoryPreviewModal`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `c8c776842060c95647af343762af02bbf31f56a430612aa3cf34a8a731638a72`.

<a id="c169"></a>

## `components/admin/story-preview-modal.tsx`

- Responsibility / candidate ownership: Render the current story draft in a modal preview / Admin stories.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `StoryPreviewModalProps`, `StoryPreviewModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/story-form.tsx:18` (import).
- App-entry ancestors: `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `lucide-react` → `package` (import, line 5); `next/image` → `package` (import, line 6).
- Hooks called: None found.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Button`, `X`, `Image`, `Sparkles`, `CalendarDays`, `Clock3`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `74cdc8857f21d23235dfb43129632b58a9b645043c80af830712bf10e1c84a91`.

<a id="c170"></a>

## `components/admin/support-actions.tsx`

- Responsibility / candidate ownership: Manage support status, assignment, notes and export/download actions / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: SupportActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/support/[id]/page.tsx:6` (import); `components/admin/support/support-detail-client.tsx:17` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 5); `next/navigation` → `package` (import, line 12); `./internal-note-modal` → `components/admin/internal-note-modal.tsx` (import, line 13); `./support/assign-modal` → `components/admin/support/assign-modal.tsx` (import, line 14); `lucide-react` → `package` (import, line 15).
- Hooks called: `useRouter`, `React.useState`.
- JSX components: `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `DropdownMenuContent`, `DropdownMenuItem`, `AssignModal`, `Download`, `FileJson`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `1073207ac522cb632f3bdeab5eaf3c2a33f200ed510ead73f10802a65748eec9`.

<a id="c171"></a>

## `components/admin/support-screenshot-modal.tsx`

- Responsibility / candidate ownership: Display an attached support screenshot / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: SupportScreenshotModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/support/[id]/page.tsx:5` (import); `components/admin/support/support-detail-client.tsx:16` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4).
- Hooks called: `React.useState`, `React.useRef`, `React.useEffect`.
- JSX components: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogClose`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `8a03e80536c59012ad98caba773efa8585bedfbc14c9dd31785cab2eb9806c39`.

<a id="c172"></a>

## `components/admin/support-toggle-modal.tsx`

- Responsibility / candidate ownership: Load and change support availability in a settings modal / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SupportToggleModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/settings-tabs.tsx:8` (import).
- App-entry ancestors: `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/card` → `components/ui/card.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `next/navigation` → `package` (import, line 8); `@/lib/notifications` → `lib/notifications.ts` (import, line 9).
- Hooks called: `React.useState`, `useRouter`, `React.useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Settings`, `CardDescription`, `CardContent`, `Dialog`, `DialogTrigger`, `Button`, `Power`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Loader2`, `CheckCircle2`, `AlertCircle`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5fd1e48776b26d766f3a546be13369c119942e789e4d1701b030b870e6ba4c29`.

<a id="c173"></a>

## `components/admin/support-toggle.tsx`

- Responsibility / candidate ownership: Load and change support availability in an older inline control / Admin support.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `SupportToggle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/card` → `components/ui/card.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `next/navigation` → `package` (import, line 8).
- Hooks called: `React.useState`, `useRouter`, `React.useEffect`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Loader2`, `CheckCircle2`, `AlertCircle`, `Label`, `Switch`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ecd8f132e3b70184350ce63834e4e6cba2a360850eec971f8837c2b58aff034a`.

<a id="c174"></a>

## `components/admin/support/assign-modal.tsx`

- Responsibility / candidate ownership: Fetch assignees and assign a support request / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: AssignModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/support-actions.tsx:14` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 6); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 15); `lucide-react` → `package` (import, line 16); `@/lib/notifications` → `lib/notifications.ts` (import, line 17).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Dialog`, `DialogTrigger`, `Button`, `UserPlus`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `FancySelect`, `DialogFooter`, `Loader2`, `X`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `70963a9a25110a90d9bff1165ef341d8d3491fc2179cbd8372cb7c6d8662fd45`.

<a id="c175"></a>

## `components/admin/support/delete-support-button.tsx`

- Responsibility / candidate ownership: Archive/delete support requests through the API / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: DeleteSupportButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/support/support-detail-client.tsx:20` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 7); `@/lib/notifications` → `lib/notifications.ts` (import, line 16).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Button`, `Trash2`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `Archive`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0cac519182a2b01bf3718677e8fa23ad867625d12ece219e721d80cf31e6c596`.

<a id="c176"></a>

## `components/admin/support/show-archived-button.tsx`

- Responsibility / candidate ownership: Toggle support-list archived visibility through navigation / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: ShowArchivedButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/support/page.tsx:11` (import).
- App-entry ancestors: `app/admin/support/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/navigation` → `package` (import, line 3); `react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: `useRouter`, `useSearchParams`, `useTransition`.
- JSX components: `Button`, `Loader2`, `ArchiveRestore`, `Archive`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c06dd9819fff84ffa25f38a1e07cb8d01f90f8306698c32f93ecbe3733903cde`.

<a id="c177"></a>

## `components/admin/support/support-detail-client.tsx`

- Responsibility / candidate ownership: Compose support conversation, metadata, notes, assignment and activity history / Admin support.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SupportDetailClient`, `default: SupportDetailClient`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/support/[id]/page.tsx:7` (import).
- App-entry ancestors: `app/admin/support/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/card` → `components/ui/card.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/components/ui/tabs` → `components/ui/tabs.tsx` (import, line 9); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 10); `@/components/admin/support-screenshot-modal` → `components/admin/support-screenshot-modal.tsx` (import, line 16); `@/components/admin/support-actions` → `components/admin/support-actions.tsx` (import, line 17); `@/components/admin/internal-note-modal` → `components/admin/internal-note-modal.tsx` (import, line 18); `../reply-modal` → `components/admin/reply-modal.tsx` (import, line 19); `@/components/admin/support/delete-support-button` → `components/admin/support/delete-support-button.tsx` (import, line 20); `@/components/admin/donations/activity-timeline` → `components/admin/donations/activity-timeline.tsx` (import, line 21); `@/lib/notifications` → `lib/notifications.ts` (import, line 22).
- Hooks called: `useRouter`, `React.useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `Badge`, `Calendar`, `SupportActions`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `CardContent`, `SupportScreenshotModal`, `Button`, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `InternalNoteModal`, `ShieldAlert`, `DeleteSupportButton`, `Mail`, `ReplyModal`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ff0a3cd7f3ab1b73bc3627074689cb387e94ca4cc03775594cceb0a3c72cf891`.

<a id="c178"></a>

## `components/admin/team-delete-button.tsx`

- Responsibility / candidate ownership: Delete a team member using shared confirmation / Admin team.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `TeamDeleteButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `@/lib/actions/admin-team` → `lib/actions/admin-team.ts` (import, line 7); `@/lib/notifications` → `lib/notifications.ts` (import, line 8); `./confirm-dialog` → `components/admin/confirm-dialog.tsx` (import, line 9).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Button`, `Trash2`, `ConfirmDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `44aab5a30e3700c412489512f9a96e40ec8d21aabbab4e9025079e8cd9cdd9fc`.

<a id="c179"></a>

## `components/admin/team-member-form.tsx`

- Responsibility / candidate ownership: Create/update/delete team members and upload profile media / Admin team.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `TeamMemberForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/team/[id]/page.tsx:5` (import); `app/admin/team/new/page.tsx:3` (import).
- App-entry ancestors: `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 10); `@/components/ui/alert` → `components/ui/alert.tsx` (import, line 11); `lucide-react` → `package` (import, line 12); `@/lib/actions/admin-team` → `lib/actions/admin-team.ts` (import, line 13); `@/lib/notifications` → `lib/notifications.ts` (import, line 14); `@/components/admin/file-upload` → `components/admin/file-upload.tsx` (import, line 15); `@/components/admin/confirm-dialog` → `components/admin/confirm-dialog.tsx` (import, line 16); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 17).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Alert`, `AlertCircle`, `AlertDescription`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Textarea`, `FileUpload`, `Globe`, `MessageCircle`, `Switch`, `Button`, `Loader2`, `ConfirmDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8fa0e5944d1efff899755f1331e3b7a9e574875c01130f75a30ea36fd40fea07`.

<a id="c180"></a>

## `components/admin/team-table.tsx`

- Responsibility / candidate ownership: Filter/page team records and expose visibility/edit/delete controls / Admin team.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `TeamTable`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/team/page.tsx:5` (import).
- App-entry ancestors: `app/admin/team/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `next/link` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `@/components/ui/input` → `components/ui/input.tsx` (import, line 8); `@/components/ui/table` → `components/ui/table.tsx` (import, line 9); `@/components/ui/card` → `components/ui/card.tsx` (import, line 10); `@/components/ui/select` → `components/ui/select.tsx` (import, line 11); `lucide-react` → `package` (import, line 18); `@/lib/actions/admin-team` → `lib/actions/admin-team.ts` (import, line 19); `@/lib/notifications` → `lib/notifications.ts` (import, line 20); `./confirm-dialog` → `components/admin/confirm-dialog.tsx` (import, line 21).
- Hooks called: `useRouter`, `useState`, `useMemo`.
- JSX components: `Card`, `CardContent`, `Search`, `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `Badge`, `Eye`, `EyeOff`, `Button`, `Link`, `Pencil`, `Trash2`, `ChevronLeft`, `ChevronRight`, `ConfirmDialog`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `07b1fb6409b2e09153e62dd642648b548439c69cc539617fdde8b0c0b0e1d6e3`.

<a id="c181"></a>

## `components/admin/video-picker.tsx`

- Responsibility / candidate ownership: Configure a selected/uploaded video using MediaPicker / Admin media.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `VideoPicker`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager-client.tsx:46` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 7); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 16); `lucide-react` → `package` (import, line 17); `./media-picker` → `components/admin/media-picker.tsx` (import, line 18); `@/lib/types/media` → `lib/types/media.ts` (import, type-only, line 19).
- Hooks called: `useState`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Video`, `DialogDescription`, `Label`, `Input`, `Button`, `Upload`, `Card`, `CardContent`, `Settings2`, `Switch`, `DialogFooter`, `Check`, `MediaPicker`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a08b65106d3097a9c010b77dec30d47fd7fe3eb083c6adb8ca14d78a18853442`.

<a id="c182"></a>

## `components/admin/volunteer-actions.tsx`

- Responsibility / candidate ownership: Update volunteer application status with toast feedback / Admin volunteers.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `VolunteerActions`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/volunteers/page.tsx:8` (import).
- App-entry ancestors: `app/admin/volunteers/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 12); `lucide-react` → `package` (import, line 13); `@/lib/actions/admin-volunteers` → `lib/actions/admin-volunteers.ts` (import, line 14); `@/hooks/use-toast` → `hooks/use-toast.ts` (import, line 15); `@/lib/types/admin` → `lib/types/admin.ts` (import, type-only, line 16).
- Hooks called: `useState`, `useToast`.
- JSX components: `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `MoreHorizontal`, `DropdownMenuContent`, `DropdownMenuItem`, `Eye`, `DropdownMenuSeparator`, `CheckCircle`, `XCircle`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e6935396dfe5dd3e28b73ab0c7776b3482016eb285c39bbc985178b54ed8ce8f`.

<a id="c183"></a>

## `components/arts/arts-gallery.tsx`

- Responsibility / candidate ownership: Render artwork gallery/lightbox navigation synchronized with URL hash / Arts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ArtsGallery`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/arts/page.tsx:7` (import).
- App-entry ancestors: `app/(public)/arts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `@radix-ui/react-dialog` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7); `@/lib/arts/types` → `lib/arts/types.ts` (import, line 8); `./arts.module.css` → `components/arts/arts.module.css` (import, line 9).
- Hooks called: `useState`, `useRef`, `useCallback`, `useEffect`.
- JSX components: `Image`, `Maximize2`, `DialogPrimitive.Root`, `DialogPrimitive.Portal`, `DialogPrimitive.Overlay`, `DialogPrimitive.Content`, `DialogPrimitive.Title`, `DialogPrimitive.Description`, `ChevronLeft`, `ChevronRight`, `DialogPrimitive.Close`, `X`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `a93589729056419062a5bfdba4405cee2cf2e0c5afbb2adac5c740ac0d59e64c`.

<a id="c184"></a>

## `components/arts/arts.module.css`

- Responsibility / candidate ownership: Share artwork/gallery/home-feature styles across arts consumers / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/arts/page.tsx:9` (import); `components/arts/arts-gallery.tsx:9` (import); `components/arts/home-art-feature.tsx:7` (import).
- App-entry ancestors: `app/(public)/arts/page.tsx`, `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `03c87e5e059ad15eaa16e37ec8dfc26dce31f56051278a1930649317bcc7a5bb`.

<a id="c185"></a>

## `components/arts/home-art-feature.tsx`

- Responsibility / candidate ownership: Compose homepage artwork previews from arts content / Arts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `HomeArtFeature`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/page.tsx:21` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4); `@/lib/arts/types` → `lib/arts/types.ts` (import, line 5); `@/lib/arts/content` → `lib/arts/content.ts` (import, line 6); `./arts.module.css` → `components/arts/arts.module.css` (import, line 7).
- Hooks called: None found.
- JSX components: `Link`, `Image`, `FramedArtwork`, `ArrowRight`, `Collage`, `Sparkles`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `538ce824307c7cba8dd36d58671ae79ddf6a44e496d156a555590abb898259f1`.

<a id="c186"></a>

## `components/circular-testimonials.tsx`

- Responsibility / candidate ownership: Animate testimonial selection with accessibility preferences for home and Our Story / Cross-domain testimonials.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `CircularTestimonials`, `default: CircularTestimonials`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/our-story/page.tsx:8` (import); `components/homepage-sections.tsx:778` (import).
- App-entry ancestors: `app/(public)/our-story/page.tsx`, `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `framer-motion` → `package` (import, line 5); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 6).
- Hooks called: `useOptionalAccessibility`, `useAccessibility`, `useState`, `useRef`, `useMemo`, `useLayoutEffect`, `useEffect`, `useCallback`.
- JSX components: `ChevronLeft`, `ChevronRight`, `AnimatePresence`.
- Browser-name signals (not semantic proof): `window`, `IntersectionObserver`.
- Source hash: `95a13938067f04debc8030ebf79532f8240fa590c7813c0fd4fc8f87572e07f5`.

<a id="c187"></a>

## `components/conference/conference-registration-form.tsx`

- Responsibility / candidate ownership: Orchestrate schema steps, conditional validation, review and registration submission / Conference registration.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ConferenceRegistrationForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/conference/register/page.tsx:1` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `./step-progress-bar` → `components/conference/step-progress-bar.tsx` (import, line 5); `./dynamic-step` → `components/conference/dynamic-step.tsx` (import, line 6); `./step4-review` → `components/conference/step4-review.tsx` (import, line 7); `@/lib/actions/conference-registration` → `lib/actions/conference-registration.ts` (import, line 8); `@/lib/validation/form-schema` → `lib/validation/form-schema.ts` (import, line 9); `@/lib/validation/conditional-engine` → `lib/validation/conditional-engine.ts` (import, line 10); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 11).
- Hooks called: `useRouter`, `useState`, `useMemo`, `useCallback`.
- JSX components: `StepProgressBar`, `DynamicStep`, `Step4Review`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `89cb9666b7e9465515f3e8134d06963f0aabd5c79c6a66f8eb55e95fc56cef43`.

<a id="c188"></a>

## `components/conference/dynamic-form-renderer.tsx`

- Responsibility / candidate ownership: Render the schema wizard for the admin conference form preview / Event/conference schema rendering.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DynamicFormRenderer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/form-preview.tsx:5` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `./step-progress-bar` → `components/conference/step-progress-bar.tsx` (import, line 4); `./dynamic-step` → `components/conference/dynamic-step.tsx` (import, line 5); `@/lib/validation/form-schema` → `lib/validation/form-schema.ts` (import, line 6); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 7).
- Hooks called: `useState`, `useCallback`.
- JSX components: `StepProgressBar`, `DynamicStep`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `38f3b8126b60768edf7202d5b129a8a404c8b9a82b97611afe53bac26e005253`.

<a id="c189"></a>

## `components/conference/dynamic-step.tsx`

- Responsibility / candidate ownership: Evaluate schema conditions and dispatch field components from FIELD_REGISTRY / Event/conference schema rendering.
- Usage / observed scope: USED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `DynamicStep`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/conference-registration-form.tsx:6` (import); `components/conference/dynamic-form-renderer.tsx:5` (import); `components/events/public/event-registration-form.tsx:8` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `./fields` → `components/conference/fields/index.ts` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 5); `@/lib/validation/form-schema` → `lib/validation/form-schema.ts` (import, line 6); `@/lib/validation/conditional-engine` → `lib/validation/conditional-engine.ts` (import, line 7).
- Hooks called: `useCallback`.
- JSX components: `FieldComponent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7a6aaff40981112a73631be4a703b2cf1d688d400e281a0a4b10fad35fb4782c`.

<a id="c190"></a>

## `components/conference/fields/field-checkbox.tsx`

- Responsibility / candidate ownership: Render a schema-defined checkbox option set / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldCheckbox`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:16` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3); `lucide-react` → `package` (import, line 4).
- Hooks called: None found.
- JSX components: `Check`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `06450df850a690f9928619aad6898b13872a6f90f86ec87b62a537e6ec82eec6`.

<a id="c191"></a>

## `components/conference/fields/field-date-range.tsx`

- Responsibility / candidate ownership: Render paired start/end date inputs from schema configuration / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldDateRange`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:23` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/input` → `components/ui/input.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: None found.
- JSX components: `Label`, `Input`, `CalendarRange`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `963efdfac40186ee18c5b9c6c779f05ac4a0f102a1dc804e9b39683f55cb6cf9`.

<a id="c192"></a>

## `components/conference/fields/field-date.tsx`

- Responsibility / candidate ownership: Render a configured schema date input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldDate`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:20` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/input` → `components/ui/input.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: None found.
- JSX components: `Label`, `Input`, `Calendar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `69a562fa46f3286a2ee6acddee59aee1ea957bc1827afc1a6ccfae4e1eb0aaf4`.

<a id="c193"></a>

## `components/conference/fields/field-email.tsx`

- Responsibility / candidate ownership: Render a schema email input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldEmail`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:11` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ec562f6d47efcfa96d101ad73ec60ae0930114fe4889124db5316c91f8442067`.

<a id="c194"></a>

## `components/conference/fields/field-file.tsx`

- Responsibility / candidate ownership: Validate and upload schema files to configured Supabase storage; return stored URLs / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldFile`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:22` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `react` → `package` (import, line 7); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 8).
- Hooks called: `useRef`, `useState`.
- JSX components: `Label`, `Button`, `Upload`, `FileCheck`, `X`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `159308d30621e2ab9cdc5a5e882a1b201ea78a63b672b810dd7b7ba54820bf1e`.

<a id="c195"></a>

## `components/conference/fields/field-heading.tsx`

- Responsibility / candidate ownership: Render a schema heading with presentation settings / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldHeading`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:18` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6c109cc28740142da22090be1b6a733566744c42d3d29775831d77121e108083`.

<a id="c196"></a>

## `components/conference/fields/field-number.tsx`

- Responsibility / candidate ownership: Render a numeric schema input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldNumber`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:13` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `269cf26965385d8fd05d85ce64c592800232b3589246146840a2b9d67df1c8da`.

<a id="c197"></a>

## `components/conference/fields/field-paragraph.tsx`

- Responsibility / candidate ownership: Render schema explanatory paragraph content / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldParagraph`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:19` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3ebce9a4d054c6c80a7c076bc2f4dcad0898396d1e0e459f4703403e81bb5f61`.

<a id="c198"></a>

## `components/conference/fields/field-radio.tsx`

- Responsibility / candidate ownership: Render mutually exclusive schema choices / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldRadio`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:15` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e97fa06ddf1855df91bfabe90fcf20b5a47c8bf535acf44ca76c613cdf3fe723`.

<a id="c199"></a>

## `components/conference/fields/field-rating.tsx`

- Responsibility / candidate ownership: Render an interactive schema star-rating control / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldRating`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:25` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: `useState`.
- JSX components: `Label`, `Star`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9c6c5e19f16cc2c308ba82d64a1734daddeccacba6bd8a7058d23a998af29e52`.

<a id="c200"></a>

## `components/conference/fields/field-repeating.tsx`

- Responsibility / candidate ownership: Add/remove repeated field rows and recursively resolve subfields through the registry / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldRepeating`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:27` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `./index` → `components/conference/fields/index.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `Label`, `GripVertical`, `Button`, `Trash2`, `SubFieldComponent`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5423bb988537ecbcc0c36fd93fb530da5ef0b69fc910efe4dbfe772e3cd88b05`.

<a id="c201"></a>

## `components/conference/fields/field-rich-text.tsx`

- Responsibility / candidate ownership: Render a Tiptap schema rich-text field with formatting toolbar / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldRichText`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:28` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@tiptap/react` → `package` (import, line 3); `@tiptap/starter-kit` → `package` (import, line 4); `@tiptap/extension-link` → `package` (import, line 5); `@tiptap/extension-underline` → `package` (import, line 6); `@tiptap/extension-placeholder` → `package` (import, line 7); `@/components/ui/label` → `components/ui/label.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 20).
- Hooks called: `useEditor`.
- JSX components: `Label`, `ToolbarButton`, `Bold`, `Italic`, `UnderlineIcon`, `Heading2`, `List`, `ListOrdered`, `LinkIcon`, `Undo`, `Redo`, `EditorContent`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `6cb3c33c9798d134ad01f2949d4749d068671768e68d891bbf91bbf12d030437`.

<a id="c202"></a>

## `components/conference/fields/field-select.tsx`

- Responsibility / candidate ownership: Adapt schema options to FancySelect / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldSelect`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:14` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ca75c337ffe2f459427963a60c5ab612ec25a4f8b58dfa55a29575e637861081`.

<a id="c203"></a>

## `components/conference/fields/field-signature.tsx`

- Responsibility / candidate ownership: Capture and reset a signature canvas through signature_pad / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldSignature`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:24` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `signature_pad` → `package` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8).
- Hooks called: `useRef`, `useState`, `useEffect`, `useCallback`.
- JSX components: `Label`, `PenTool`, `Button`, `RotateCcw`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `812263eb6f848222a64dc832f42460f2f636b068a0a1ca3db22a6117914121bf`.

<a id="c204"></a>

## `components/conference/fields/field-slider.tsx`

- Responsibility / candidate ownership: Render a schema-configured numeric range input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldSlider`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:26` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/label` → `components/ui/label.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `Label`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e0eb5a904c42fcd214e27ee4fb26298791cdc60ef3372ec08d001a0ac4bdd725`.

<a id="c205"></a>

## `components/conference/fields/field-tel.tsx`

- Responsibility / candidate ownership: Render a schema telephone input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldTel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:12` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a594bed0aadab4b1d03f2a8ea412beb9c5ba87bfd916ad0e23c46be231441fc9`.

<a id="c206"></a>

## `components/conference/fields/field-text.tsx`

- Responsibility / candidate ownership: Render a schema text input with length feedback / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldText`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:9` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d0570f7628032628e45e2d6f7d07c5b510016e3f52a4006df5342723f813f10b`.

<a id="c207"></a>

## `components/conference/fields/field-textarea.tsx`

- Responsibility / candidate ownership: Render multiline schema input with length feedback / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldTextarea`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:10` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 3); `./index` → `components/conference/fields/index.ts` (import, type-only, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f6ace22aedc5f56ebffb64497738c548d0e1ce62758fad962921326eab10b79e`.

<a id="c208"></a>

## `components/conference/fields/field-toggle.tsx`

- Responsibility / candidate ownership: Render a schema boolean toggle / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldToggle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:17` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./index` → `components/conference/fields/index.ts` (import, type-only, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b30f614be8f026d7df0e356f5cbc775fa53226b1dcb3693b553ffdf1bb71527d`.

<a id="c209"></a>

## `components/conference/fields/field-url.tsx`

- Responsibility / candidate ownership: Render and preview a schema URL input / Event/conference schema fields.
- Usage / observed scope: DYNAMICALLY REFERENCED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldUrl`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/fields/index.ts:21` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, line 3); `@/components/ui/input` → `components/ui/input.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `lucide-react` → `package` (import, line 6); `react` → `package` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Label`, `Link2`, `Input`, `ExternalLink`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7e83aac1439254c855078291fe540a575334dd8928c4e1e930e7250c01a04cc2`.

<a id="c210"></a>

## `components/conference/fields/index.ts`

- Responsibility / candidate ownership: Define shared field props, construct the field-type registry and re-export renderers / Event/conference schema fields.
- Usage / observed scope: USED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: shared schema registry and recursive field dispatch.
- Exports: `FieldProps`, `FIELD_REGISTRY`, `FieldText`, `FieldTextarea`, `FieldEmail`, `FieldTel`, `FieldNumber`, `FieldSelect`, `FieldRadio`, `FieldCheckbox`, `FieldToggle`, `FieldHeading`, `FieldParagraph`, `FieldDate`, `FieldUrl`, `FieldFile`, `FieldDateRange`, `FieldSignature`, `FieldRating`, `FieldSlider`, `FieldRepeating`, `FieldRichText`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/dynamic-step.tsx:4` (import); `components/conference/fields/field-checkbox.tsx:3` (import, type-only); `components/conference/fields/field-email.tsx:3` (import, type-only); `components/conference/fields/field-heading.tsx:3` (import, type-only); `components/conference/fields/field-number.tsx:3` (import, type-only); `components/conference/fields/field-paragraph.tsx:3` (import, type-only); `components/conference/fields/field-radio.tsx:3` (import, type-only); `components/conference/fields/field-repeating.tsx:7` (import); `components/conference/fields/field-select.tsx:3` (import, type-only); `components/conference/fields/field-tel.tsx:3` (import, type-only); `components/conference/fields/field-text.tsx:3` (import, type-only); `components/conference/fields/field-textarea.tsx:4` (import, type-only); `components/conference/fields/field-toggle.tsx:3` (import, type-only); `components/events/admin/EventFormBuilder/index.tsx:30` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 6); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 7); `./field-text` → `components/conference/fields/field-text.tsx` (import, line 9); `./field-textarea` → `components/conference/fields/field-textarea.tsx` (import, line 10); `./field-email` → `components/conference/fields/field-email.tsx` (import, line 11); `./field-tel` → `components/conference/fields/field-tel.tsx` (import, line 12); `./field-number` → `components/conference/fields/field-number.tsx` (import, line 13); `./field-select` → `components/conference/fields/field-select.tsx` (import, line 14); `./field-radio` → `components/conference/fields/field-radio.tsx` (import, line 15); `./field-checkbox` → `components/conference/fields/field-checkbox.tsx` (import, line 16); `./field-toggle` → `components/conference/fields/field-toggle.tsx` (import, line 17); `./field-heading` → `components/conference/fields/field-heading.tsx` (import, line 18); `./field-paragraph` → `components/conference/fields/field-paragraph.tsx` (import, line 19); `./field-date` → `components/conference/fields/field-date.tsx` (import, line 20); `./field-url` → `components/conference/fields/field-url.tsx` (import, line 21); `./field-file` → `components/conference/fields/field-file.tsx` (import, line 22); `./field-date-range` → `components/conference/fields/field-date-range.tsx` (import, line 23); `./field-signature` → `components/conference/fields/field-signature.tsx` (import, line 24); `./field-rating` → `components/conference/fields/field-rating.tsx` (import, line 25); `./field-slider` → `components/conference/fields/field-slider.tsx` (import, line 26); `./field-repeating` → `components/conference/fields/field-repeating.tsx` (import, line 27); `./field-rich-text` → `components/conference/fields/field-rich-text.tsx` (import, line 28).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `daf7a5f5bfcdf6bd181b8a92c9106c24a2e1bd0ff6ef44d385f9c359cd91f021`.

<a id="c211"></a>

## `components/conference/step-progress-bar.tsx`

- Responsibility / candidate ownership: Display current step and label for conference, event and preview wizards / Event/conference schema rendering.
- Usage / observed scope: USED / public + admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `StepProgressBar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/conference-registration-form.tsx:5` (import); `components/conference/dynamic-form-renderer.tsx:4` (import); `components/events/public/event-registration-form.tsx:7` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c50e9b042fbc90e9ddd60c2d94bc67a677d94bb9f2f44318b517a46d557f1555`.

<a id="c212"></a>

## `components/conference/step1-personal-details.tsx`

- Responsibility / candidate ownership: Define Step1Data and the older personal-details step UI / Conference registration.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Step1Data`, `Step1PersonalDetails`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/step4-review.tsx:5` (import, type-only).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3).
- Hooks called: None found.
- JSX components: `User`, `Mail`, `Phone`, `Building2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7e2f869319ee844c7ac335aa1af5abc9c0e53b90fb42a4565dd8a6db09ad0587`.

<a id="c213"></a>

## `components/conference/step2-participation.tsx`

- Responsibility / candidate ownership: Define Step2Data and the older participation step UI / Conference registration.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Step2Data`, `Step2Participation`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/step4-review.tsx:6` (import, type-only).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 3).
- Hooks called: None found.
- JSX components: `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1b4ee2d196978499ed2bbf62afe4bdeadc50b00c69022947772030a6073dd615`.

<a id="c214"></a>

## `components/conference/step3-additional-info.tsx`

- Responsibility / candidate ownership: Define Step3Data and the older additional-information step UI / Conference registration.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Step3Data`, `Step3AdditionalInfo`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/step4-review.tsx:7` (import, type-only).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 3).
- Hooks called: None found.
- JSX components: `FancySelect`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1be4375572299fb84ac64b94e8da562769f5c52112c478f51068db0ce39aa921`.

<a id="c215"></a>

## `components/conference/step4-review.tsx`

- Responsibility / candidate ownership: Render submitted-data review and agreement controls; consumes earlier step types / Conference registration.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Step4Review`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/conference/conference-registration-form.tsx:7` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `./step1-personal-details` → `components/conference/step1-personal-details.tsx` (import, type-only, line 5); `./step2-participation` → `components/conference/step2-participation.tsx` (import, type-only, line 6); `./step3-additional-info` → `components/conference/step3-additional-info.tsx` (import, type-only, line 7).
- Hooks called: `useState`.
- JSX components: `ReviewSection`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `550cb576b87e1a9711967d51d665c3e6570cbd01c68064c05a0cc2693d64ae95`.

<a id="c216"></a>

## `components/contact-form-prefilled.tsx`

- Responsibility / candidate ownership: Read contact query parameters and pass prefilled values into ContactForm / Contact.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ContactFormPrefilled`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/contact/page.tsx:5` (import).
- App-entry ancestors: `app/(public)/contact/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/navigation` → `package` (import, line 3); `@/components/contact-form` → `components/contact-form.tsx` (import, line 4).
- Hooks called: `useSearchParams`.
- JSX components: `ContactForm`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `a8edf57e0d031867f7de81cf109f8c145e41716af92181f6bfb1bafa8012a7cd`.

<a id="c217"></a>

## `components/contact-form.tsx`

- Responsibility / candidate ownership: Collect contact details, validate submission state and invoke the contact action / Contact.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ContactForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/contact-form-prefilled.tsx:4` (import).
- App-entry ancestors: `app/(public)/contact/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/form` → `components/form/index.ts` (import, line 8); `@/lib/actions/contact` → `lib/actions/contact.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `CheckCircle`, `Button`, `FormField`, `TextareaField`, `Loader2`, `Send`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b34bafabda0461b80c3aed17a8d3d624ee6e4425512560214dabf4a9f3c1d601`.

<a id="c218"></a>

## `components/development-notice-modal.module.css`

- Responsibility / candidate ownership: Style the public development notice and its contrast states / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/development-notice-modal.tsx:9` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `bb51d76e71784c7228e74e6adce40c6cdb6bf2fa6b97d9e5ac3e3280c9f3a19c`.

<a id="c219"></a>

## `components/development-notice-modal.tsx`

- Responsibility / candidate ownership: Show a public-layout development notice and dismissal controls / Public layout.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `DevelopmentNoticeModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:6` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 7); `@/lib/utils` → `lib/utils.ts` (import, line 8); `./development-notice-modal.module.css` → `components/development-notice-modal.module.css` (import, line 9).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Dialog`, `DialogContent`, `DialogHeader`, `AlertTriangle`, `DialogTitle`, `DialogDescription`, `Bug`, `Button`, `Link`, `X`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `d0cd23aa192eebe26178105887d41f71fd63afe77582fe50520d743ccfd262f6`.

<a id="c220"></a>

## `components/donation-amount-picker.tsx`

- Responsibility / candidate ownership: Select a donation amount and construct the donation link / Donations.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `DonationAmountPicker`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Heart`, `Button`, `Link`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b59224d5cdf1da8fe07af2f6cc33602ef9465b424deef0c79f85be152ef2ac17`.

<a id="c221"></a>

## `components/donation/bank-transfer-panel.tsx`

- Responsibility / candidate ownership: Present bank accounts and submit an offline bank-transfer record / Donations.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `BankTransferPanel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/donate/page.tsx:7` (import).
- App-entry ancestors: `app/(public)/donate/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/lib/utils` → `lib/utils.ts` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10); `@/lib/actions/bank-donation` → `lib/actions/bank-donation.ts` (import, line 11); `@/lib/payments/bank-details` → `lib/payments/bank-details.ts` (import, type-only, line 12).
- Hooks called: `useState`.
- JSX components: `Check`, `Copy`, `CheckCircle2`, `Building2`, `CopyableRow`, `Info`, `Textarea`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): `navigator`.
- Source hash: `9a5c5308444e904d7b08767c14992194a57549170d3bf9c97deea40e80e04dcf`.

<a id="c222"></a>

## `components/donation/donation-form.tsx`

- Responsibility / candidate ownership: Select amount/frequency/provider and initiate donation payment redirects or form POST / Donations.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DonationForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/donate/page.tsx:6` (import).
- App-entry ancestors: `app/(public)/donate/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/lib/utils` → `lib/utils.ts` (import, line 9); `react` → `package` (import, line 10); `@/lib/payments/config` → `lib/payments/config.ts` (import, type-only, line 11); `@/lib/actions/donation` → `lib/actions/donation.ts` (import, line 12); `@/lib/notifications` → `lib/notifications.ts` (import, line 13).
- Hooks called: `useState`, `useEffect`.
- JSX components: `Heart`, `Repeat`, `Lock`, `CreditCard`, `Sparkles`, `Textarea`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `e68887e8e0f0dae9904e21343ba2089e992244959b171705bfa606f1405604a6`.

<a id="c223"></a>

## `components/error-pages/GenericErrorPage.tsx`

- Responsibility / candidate ownership: Display error details with reset, copy and report interactions / Application errors.
- Usage / observed scope: USED / demo + global.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: GenericErrorPage`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/demo/errors/generic/page.tsx:3` (import); `app/error.tsx:3` (import).
- App-entry ancestors: `app/demo/errors/generic/page.tsx`, `app/error.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/card` → `components/ui/card.tsx` (import, line 5); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `@/components/ui/toast` → `components/ui/toast.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `react` → `package` (import, line 10).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `ShieldAlert`, `CardTitle`, `CardDescription`, `Badge`, `CardContent`, `Button`, `RefreshCw`, `Home`, `Separator`, `Copy`, `Bug`, `ChevronUp`, `ChevronDown`.
- Browser-name signals (not semantic proof): `navigator`, `window`.
- Source hash: `ed311ff05dab6ef5c888da28f74e3af6d139b7cc9cfd337dfe6ea015d2a087d0`.

<a id="c224"></a>

## `components/error-pages/NetworkErrorPage.tsx`

- Responsibility / candidate ownership: Display a network-failure recovery screen in the error demo / Application errors.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: NetworkErrorPage`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/demo/errors/network/page.tsx:1` (import).
- App-entry ancestors: `app/demo/errors/network/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `lucide-react` → `package` (import, line 5).
- Hooks called: None found.
- JSX components: `GradientGrid`, `Smartphone`, `WifiOff`, `Server`, `Button`, `RefreshCw`, `Link`, `Home`, `LifeBuoy`, `Glow`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `6ee31222942207eaff3f9b2ff610d20ecbb5402cb42c127717d252612c37183c`.

<a id="c225"></a>

## `components/error-pages/NotFoundErrorPage.tsx`

- Responsibility / candidate ownership: Render the not-found screen with pointer-responsive illustration and recovery links / Application errors.
- Usage / observed scope: USED / global.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: NotFound`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/not-found.tsx:3` (import).
- App-entry ancestors: `app/not-found.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `next/image` → `package` (import, line 4); `framer-motion` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `lucide-react` → `package` (import, line 7).
- Hooks called: `useMotionValue`, `useSpring`.
- JSX components: `GradientGrid`, `Button`, `Link`, `Home`, `Undo2`, `Compass`, `FloatingAstronautImage`, `FloatingOrbs`, `Glow`, `Image`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `2693512c437267950467de65d57996742ba60394498ec90f0160dde5cf0559fb`.

<a id="c226"></a>

## `components/error-pages/ServerErrorPage.tsx`

- Responsibility / candidate ownership: Render server-error details/recovery with pointer-responsive presentation / Application errors.
- Usage / observed scope: USED / demo + global.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: ServerErrorPage`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/demo/errors/server/page.tsx:3` (import); `app/global-error.tsx:3` (import).
- App-entry ancestors: `app/demo/errors/server/page.tsx`, `app/global-error.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `framer-motion` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `lucide-react` → `package` (import, line 6).
- Hooks called: `useMotionValue`, `useSpring`.
- JSX components: `GradientGrid`, `ServerCrash`, `Button`, `Link`, `Home`, `Bug`, `FloatingOrbs`, `Glow`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `594ef71930fc1ad62d7128b1860f79af0db89fd5aadc014df49b0db07fe723c7`.

<a id="c227"></a>

## `components/error-pages/UnauthorizedErrorPage.tsx`

- Responsibility / candidate ownership: Explain access failure using auth/error context and role-specific messaging / Application errors.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: UnauthorizedErrorPage`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/demo/errors/unauthorized/page.tsx:3` (import).
- App-entry ancestors: `app/demo/errors/unauthorized/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/card` → `components/ui/card.tsx` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `framer-motion` → `package` (import, line 8); `@/contexts/AuthContext` → `contexts/AuthContext.tsx` (import, line 9); `@/contexts/ErrorContext` → `contexts/ErrorContext.tsx` (import, line 10).
- Hooks called: `useAuth`, `useError`.
- JSX components: `ShieldAlert`, `XCircle`, `ShieldX`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `UserCheck`, `Badge`, `AlertTriangle`, `Button`, `Link`, `Home`, `ArrowLeft`, `Lock`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0eefb0604924eeb88682fa19d7c4b3591e75e3e3bb8fd69abead360d3d073638`.

<a id="c228"></a>

## `components/error-pages/astronaut.png`

- Responsibility / candidate ownership: Store an unimported image copy; the current rendered astronaut URL resolves under public/ / Application errors.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `951b1a9f5b6b18c3224e4438f4db307872370fb39c13e2e2e4915fe04198b4a2`.

<a id="c229"></a>

## `components/event-preview-card.tsx`

- Responsibility / candidate ownership: Render an event object with category border and slug-based navigation / Public events.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventPreviewCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 1); `next/image` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4).
- Hooks called: None found.
- JSX components: `Link`, `MapPin`, `Calendar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `adaf9482328fe4e48c6f9ca2cbd29b2a395d65bbc40e08f75a433fa48b39649d`.

<a id="c230"></a>

## `components/event-registration-modal.tsx`

- Responsibility / candidate ownership: Collect registration details in a modal using the older registration action / Public events.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventRegistrationModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/actions/event-registration` → `lib/actions/event-registration.ts` (import, line 8).
- Hooks called: `useState`.
- JSX components: `X`, `Calendar`, `Clock`, `MapPin`, `CheckCircle`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `81b25d2b2ecb97acd51aeec8f95ea4bbb72c356975398c4f632cc6c40d5f5da4`.

<a id="c231"></a>

## `components/events/admin/AgendaEditor.tsx`

- Responsibility / candidate ownership: Create, edit and delete event agenda entries / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `AgendaEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/agenda/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:53` (import).
- App-entry ancestors: `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 8); `@/components/ui/time-picker` → `components/ui/time-picker.tsx` (import, line 17); `lucide-react` → `package` (import, line 18); `@/lib/actions/events-module/event-agenda` → `lib/actions/events-module/event-agenda.ts` (import, line 27); `@/lib/notifications` → `lib/notifications.ts` (import, line 33); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 34).
- Hooks called: `useState`, `useMemo`.
- JSX components: `Button`, `Plus`, `Label`, `Input`, `TimePicker`, `Textarea`, `Loader2`, `CalendarDays`, `Star`, `Dialog`, `DialogTrigger`, `Trash2`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `User`, `MapPin`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9ccac69db8e1a49f443a7c108b6444fb5cbc5c888c271890328e045a55a1a036`.

<a id="c232"></a>

## `components/events/admin/EmailTemplateEditor.tsx`

- Responsibility / candidate ownership: Edit event email templates and template interpolation previews / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `EmailTemplateEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/email-templates/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:56` (import).
- App-entry ancestors: `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 9); `@/components/ui/tabs-switcher` → `components/ui/tabs-switcher.tsx` (import, line 10); `@/components/ui/alert-dialog` → `components/ui/alert-dialog.tsx` (import, line 11); `lucide-react` → `package` (import, line 21); `@/lib/utils/template-interpolation` → `lib/utils/template-interpolation.ts` (import, line 37); `@/lib/actions/events-module/event-email-templates` → `lib/actions/events-module/event-email-templates.ts` (import, line 38); `@/lib/notifications` → `lib/notifications.ts` (import, line 44); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 45).
- Hooks called: `useRef`, `useCallback`, `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Info`, `CardContent`, `Button`, `Loader2`, `Plus`, `TabsSwitcher`, `Mail`, `Code`, `Eye`, `RotateCcw`, `InlinePreview`, `Label`, `Input`, `Textarea`, `VariablesCard`, `ArrowLeft`, `Pencil`, `Trash2`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `941e7b04caa7c7152d8e484f88f2a4eecc444852b73579f63261d98177d208f4`.

<a id="c233"></a>

## `components/events/admin/EventCheckInButton.tsx`

- Responsibility / candidate ownership: Invoke registration check-in and refresh admin state / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventCheckInButton`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:23` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 14); `@/lib/notifications` → `lib/notifications.ts` (import, line 15); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 16).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Loader2`, `Button`, `Undo2`, `CheckCircle`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `24141b042f6c1e7616034aea6365b10601efb4bf3de4894029465c1e4e673c04`.

<a id="c234"></a>

## `components/events/admin/EventCommunicationLog.tsx`

- Responsibility / candidate ownership: Fetch and display registration email history / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventCommunicationLog`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:27` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 7); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 8).
- Hooks called: `useState`, `useCallback`, `useEffect`.
- JSX components: `Button`, `RefreshCw`, `Loader2`, `Mail`, `Badge`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `bca6baa009f7e5b2beb1db2956b6d3cab7ea9869341410a824c38a71076f0983`.

<a id="c235"></a>

## `components/events/admin/EventDeleteRegistrationButton.tsx`

- Responsibility / candidate ownership: Delete an event registration with confirmation and navigation feedback / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventDeleteRegistrationButton`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:26` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/lib/notifications` → `lib/notifications.ts` (import, line 7); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 8).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Trash2`, `AlertTriangle`, `X`, `Button`, `Loader2`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `687876659012277ffd337125e3841de76ffdcbf34910f10b8449c472d9180021`.

<a id="c236"></a>

## `components/events/admin/EventDetailsForm.tsx`

- Responsibility / candidate ownership: Edit event details and upload QR media through Supabase / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventDetailsForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/details/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:50` (import).
- App-entry ancestors: `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8); `@/components/ui/card` → `components/ui/card.tsx` (import, line 9); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 10); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 11); `@/components/ui/date-time-picker` → `components/ui/date-time-picker.tsx` (import, line 12); `lucide-react` → `package` (import, line 13); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 23); `@/lib/actions/events-module/event-crud` → `lib/actions/events-module/event-crud.ts` (import, line 24); `@/lib/notifications` → `lib/notifications.ts` (import, line 25); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 26).
- Hooks called: `useRouter`, `useState`, `useRef`, `useCallback`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Textarea`, `DateTimePicker`, `FancySelect`, `Switch`, `QrCode`, `Upload`, `X`, `Button`, `Link2`, `Loader2`, `Check`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `3cb9c78d98afb635a0d18f0936cd654b8cf3f16663916efd65f074a36df24c6e`.

<a id="c237"></a>

## `components/events/admin/EventFormBuilder/FieldPalette.tsx`

- Responsibility / candidate ownership: Select schema field types to add to the event form / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FieldPalette`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:31` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 27).
- Hooks called: `useState`.
- JSX components: `CategoryIcon`, `ChevronRight`, `Icon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `66780e12aa629a4fa069ce734a49aa32261461a5b797d672d99f30d15cbb8958`.

<a id="c238"></a>

## `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx`

- Responsibility / candidate ownership: Edit field validation, options and conditional settings / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FieldPropertiesPanel`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:35` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/input` → `components/ui/input.tsx` (import, line 4); `@/components/ui/label` → `components/ui/label.tsx` (import, line 5); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `./OptionsEditor` → `components/events/admin/EventFormBuilder/OptionsEditor.tsx` (import, line 9); `@/components/admin/conference-form-builder/EnhancedConditionalEditor` → `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` (import, line 10); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 11).
- Hooks called: `useState`.
- JSX components: `Label`, `Input`, `OptionsEditor`, `Switch`, `ChevronDown`, `ChevronRight`, `GripVertical`, `Trash2`, `Button`, `Plus`, `EnhancedConditionalEditor`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d1376f051116d53239e7fad8ba110d9c7f2a67cd75dcf38e90436e12124134c9`.

<a id="c239"></a>

## `components/events/admin/EventFormBuilder/FormCanvas.tsx`

- Responsibility / candidate ownership: Compose sortable event-form steps / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormCanvas`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:32` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@dnd-kit/sortable` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `./SortableStepCard` → `components/events/admin/EventFormBuilder/SortableStepCard.tsx` (import, line 9); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 10).
- Hooks called: None found.
- JSX components: `Plus`, `Button`, `SortableContext`, `SortableStepCard`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e28603692b8f81b28be9de96f2b79b7412f2a797b76ae7d7f05a3034cf199f68`.

<a id="c240"></a>

## `components/events/admin/EventFormBuilder/OptionsEditor.tsx`

- Responsibility / candidate ownership: Add/edit/remove schema choice options / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `OptionsEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:9` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 7).
- Hooks called: `useState`.
- JSX components: `GripVertical`, `Trash2`, `Input`, `Button`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b9524714707a7b46299b32c4437cc39eec96f25a04cf4e17585c887a6760699f`.

<a id="c241"></a>

## `components/events/admin/EventFormBuilder/SchemaImportExport.tsx`

- Responsibility / candidate ownership: Import/export form schemas as JSON files / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SchemaImportExport`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:34` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 5); `lucide-react` → `package` (import, line 13); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 20); `@/lib/notifications` → `lib/notifications.ts` (import, line 21).
- Hooks called: `useState`, `useRef`.
- JSX components: `Download`, `Upload`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `FileJson`, `DialogDescription`, `AlertTriangle`, `CheckCircle2`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): `document`, `FileReader`.
- Source hash: `10e3049f83a7c750e144141a620769ca0a44984f6ed2713bdb5fe2e2bead8a2f`.

<a id="c242"></a>

## `components/events/admin/EventFormBuilder/SortableFieldCard.tsx`

- Responsibility / candidate ownership: Render a draggable field card with editing/removal controls / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SortableFieldCard`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/SortableStepCard.tsx:12` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@dnd-kit/sortable` → `package` (import, line 3); `@dnd-kit/utilities` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 31); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 32).
- Hooks called: `useSortable`.
- JSX components: `GripVertical`, `Icon`, `DropdownMenu`, `DropdownMenuTrigger`, `ArrowRightLeft`, `DropdownMenuContent`, `DropdownMenuItem`, `Copy`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `61344a9555fd9ac48739184268f1f35025020f93c1d8a2dceb7d1de88a381adb`.

<a id="c243"></a>

## `components/events/admin/EventFormBuilder/SortableStepCard.tsx`

- Responsibility / candidate ownership: Render a draggable/droppable step containing sortable fields / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SortableStepCard`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/FormCanvas.tsx:9` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@dnd-kit/sortable` → `package` (import, line 4); `@dnd-kit/utilities` → `package` (import, line 5); `@dnd-kit/sortable` → `package` (import, line 6); `@dnd-kit/core` → `package` (import, line 10); `lucide-react` → `package` (import, line 11); `./SortableFieldCard` → `components/events/admin/EventFormBuilder/SortableFieldCard.tsx` (import, line 12); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 13).
- Hooks called: `useState`, `useSortable`, `useDroppable`.
- JSX components: `GripVertical`, `ChevronDown`, `ChevronRight`, `Trash2`, `SortableContext`, `SortableFieldCard`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `84e3fca99df2933b27976ae02a49fb049cd5e5ce8d33255735c62d8dc1f81b0a`.

<a id="c244"></a>

## `components/events/admin/EventFormBuilder/builder-actions.ts`

- Responsibility / candidate ownership: Transform schema fields/steps locally; these are not server actions / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `generateId`, `createField`, `createStep`, `duplicateField`, `addFieldToStep`, `removeFieldFromStep`, `updateFieldInSchema`, `reorderFieldsInStep`, `moveFieldToStep`, `reorderSteps`, `addStep`, `removeStep`, `updateStepInSchema`, `findFieldStep`, `findField`, `countFields`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:37` (import); `components/events/admin/EventFormBuilder/useBuilderState.ts:5` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b7c30de834e53033b4623eb8516872c18d4bb8b042ca4e68efd29b0fda9cfa00`.

<a id="c245"></a>

## `components/events/admin/EventFormBuilder/index.tsx`

- Responsibility / candidate ownership: Compose drag/drop schema editing, preview, templates and persistence actions / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventFormBuilder`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/form-builder/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:55` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@dnd-kit/core` → `package` (import, line 5); `@dnd-kit/sortable` → `package` (import, line 16); `@/components/ui/button` → `components/ui/button.tsx` (import, line 19); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 20); `lucide-react` → `package` (import, line 21); `@/components/conference/fields` → `components/conference/fields/index.ts` (import, line 30); `./FieldPalette` → `components/events/admin/EventFormBuilder/FieldPalette.tsx` (import, line 31); `./FormCanvas` → `components/events/admin/EventFormBuilder/FormCanvas.tsx` (import, line 32); `@/components/admin/conference-form-builder/FormTemplateChooser` → `components/admin/conference-form-builder/FormTemplateChooser.tsx` (import, line 33); `./SchemaImportExport` → `components/events/admin/EventFormBuilder/SchemaImportExport.tsx` (import, line 34); `./FieldPropertiesPanel` → `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx` (import, line 35); `./useBuilderState` → `components/events/admin/EventFormBuilder/useBuilderState.ts` (import, line 36); `./builder-actions` → `components/events/admin/EventFormBuilder/builder-actions.ts` (import, line 37); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 38); `@/lib/actions/events-module/event-form-schema` → `lib/actions/events-module/event-form-schema.ts` (import, line 39); `@/lib/notifications` → `lib/notifications.ts` (import, line 40).
- Hooks called: `useRouter`, `useBuilderState`, `useState`, `useRef`, `useEffect`, `useSensors`, `useSensor`, `useCallback`.
- JSX components: `Badge`, `Undo2`, `Redo2`, `FormTemplateChooser`, `SchemaImportExport`, `Button`, `Loader2`, `Save`, `FileText`, `FieldPalette`, `DndContext`, `FormCanvas`, `DragOverlay`, `FieldPropertiesPanel`, `FieldComponent`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `09df2a099b9b21c193376cd595c50a53c566f830a3fd4f31648bd1056d5bc62f`.

<a id="c246"></a>

## `components/events/admin/EventFormBuilder/useBuilderState.ts`

- Responsibility / candidate ownership: Manage form-builder reducer state and edit history / Admin event schema builder.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `useBuilderState`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventFormBuilder/index.tsx:36` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 4); `./builder-actions` → `components/events/admin/EventFormBuilder/builder-actions.ts` (import, line 5).
- Hooks called: `useReducer`, `useEffect`, `useCallback`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `9c92d4472ebb6bd3e49da93fbf3b9e5fb693d6f5e6dfd5a53fcc3f11924790e7`.

<a id="c247"></a>

## `components/events/admin/EventLocationForm.tsx`

- Responsibility / candidate ownership: Edit event location data through event actions / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventLocationForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/location/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:52` (import).
- App-entry ancestors: `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `lucide-react` → `package` (import, line 8); `@/lib/actions/events-module/event-crud` → `lib/actions/events-module/event-crud.ts` (import, line 9); `@/lib/notifications` → `lib/notifications.ts` (import, line 10); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 11).
- Hooks called: `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Button`, `Navigation`, `MapPin`, `ExternalLink`, `Loader2`.
- Browser-name signals (not semantic proof): `navigator`.
- Source hash: `33c36e16181858c2721d467660a689444274dfe261e01c0886e07c6b4b98cf13`.

<a id="c248"></a>

## `components/events/admin/EventMediaForm.tsx`

- Responsibility / candidate ownership: Upload/remove event media and persist event media configuration / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `EventMediaForm`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/media/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:51` (import).
- App-entry ancestors: `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/input` → `components/ui/input.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 9); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 10); `lucide-react` → `package` (import, line 18); `@/lib/supabase/client` → `lib/supabase/client.ts` (import, line 30); `@/lib/actions/events-module/event-crud` → `lib/actions/events-module/event-crud.ts` (import, line 31); `@/lib/notifications` → `lib/notifications.ts` (import, line 32); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 33); `next/image` → `package` (import, line 34).
- Hooks called: `useRouter`, `useState`, `useRef`, `useCallback`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `Badge`, `Check`, `CardContent`, `Replace`, `Trash2`, `Input`, `Button`, `Link2`, `Loader2`, `Upload`, `X`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `AlertTriangle`, `DialogDescription`, `DialogFooter`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `57f3253ef672cc3abaeb7d005d296ec0a162ab10b866000ac0b7e30a6264471d`.

<a id="c249"></a>

## `components/events/admin/EventPaymentInfo.tsx`

- Responsibility / candidate ownership: Display registration payment information and payment-related actions / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventPaymentInfo`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:28` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 22); `@/components/ui/card` → `components/ui/card.tsx` (import, line 23); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 24); `@/components/ui/button` → `components/ui/button.tsx` (import, line 32); `@/lib/notifications` → `lib/notifications.ts` (import, line 33); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 34).
- Hooks called: `useState`, `useRouter`.
- JSX components: `Badge`, `Check`, `Copy`, `CreditCard`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CheckCircle`, `XCircle`, `ProviderIcon`, `PaymentBadge`, `CopyButton`, `History`, `Clock`, `Eye`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `X`, `Loader2`, `Send`, `ShieldCheck`, `RotateCcw`, `DialogDescription`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): `navigator`.
- Source hash: `f01a0016348bfe3fdf47ef15741d93d2c2162b2069279cfbea4a19b8ca5f4b1b`.

<a id="c250"></a>

## `components/events/admin/EventRegistrationEmailActions.tsx`

- Responsibility / candidate ownership: Send registration emails using selected templates and API actions / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventRegistrationEmailActions`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:25` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 18); `@/components/ui/button` → `components/ui/button.tsx` (import, line 26); `@/components/ui/input` → `components/ui/input.tsx` (import, line 27); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 28); `@/lib/notifications` → `lib/notifications.ts` (import, line 29); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 30); `@/lib/utils/template-interpolation` → `lib/utils/template-interpolation.ts` (import, line 31); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 32).
- Hooks called: `useRouter`, `useState`, `useEffect`.
- JSX components: `Info`, `Bell`, `AlertTriangle`, `Check`, `Copy`, `Loader2`, `RefreshCw`, `Mail`, `FileText`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Input`, `Textarea`, `DialogFooter`, `Button`.
- Browser-name signals (not semantic proof): `navigator`, `window`.
- Source hash: `32706ceab23b6c0a4bfce6fedb22a40be253adec4adf0ff16a534dc91e097ae5`.

<a id="c251"></a>

## `components/events/admin/EventRegistrationNotes.tsx`

- Responsibility / candidate ownership: Fetch and maintain admin notes for an event registration / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventRegistrationNotes`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:24` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/notifications` → `lib/notifications.ts` (import, line 5); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 10).
- Hooks called: `useState`, `useCallback`, `useEffect`.
- JSX components: `Button`, `Loader2`, `Save`, `StickyNote`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2764bc8337e16fbbc89404820c1689231df3a36584b447e6efffa703fee18c43`.

<a id="c252"></a>

## `components/events/admin/EventSettingsClient.tsx`

- Responsibility / candidate ownership: Load and compose event settings tabs, editors and registration-button configuration / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventSettingsClient`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/settings/page.tsx:1` (import).
- App-entry ancestors: `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `next/link` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 8); `lucide-react` → `package` (import, line 9); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 40); `@/lib/utils` → `lib/utils.ts` (import, line 49); `./EventDetailsForm` → `components/events/admin/EventDetailsForm.tsx` (import, line 50); `./EventMediaForm` → `components/events/admin/EventMediaForm.tsx` (import, line 51); `./EventLocationForm` → `components/events/admin/EventLocationForm.tsx` (import, line 52); `./AgendaEditor` → `components/events/admin/AgendaEditor.tsx` (import, line 53); `./PricingEditor` → `components/events/admin/PricingEditor.tsx` (import, line 54); `./EventFormBuilder` → `components/events/admin/EventFormBuilder/index.tsx` (import, line 55); `./EmailTemplateEditor` → `components/events/admin/EmailTemplateEditor.tsx` (import, line 56); `@/lib/actions/events-module/event-crud` → `lib/actions/events-module/event-crud.ts` (import, line 57); `@/lib/notifications` → `lib/notifications.ts` (import, line 62); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 63); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 70); `@/lib/actions/admin-settings` → `lib/actions/admin-settings.ts` (dynamic, line 310).
- Hooks called: `useRouter`, `useState`, `useEffect`.
- JSX components: `Badge`, `Eye`, `EyeOff`, `Button`, `Link`, `ExternalLink`, `Card`, `CardContent`, `Users`, `CheckCircle`, `Clock`, `FileText`, `CreditCard`, `DollarSign`, `CardHeader`, `CardTitle`, `Calendar`, `MapPin`, `EventDetailsForm`, `EventMediaForm`, `EventLocationForm`, `AgendaEditor`, `PricingEditor`, `EventFormBuilder`, `EmailTemplateEditor`, `Megaphone`, `ToggleRight`, `ToggleLeft`, `ClipboardList`, `Loader2`, `Pause`, `Archive`, `RotateCcw`, `Copy`, `Trash2`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `AlertTriangle`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `81c2556d2866cdc2c1de25f4ba4cbbc688054dde489f98f99946c56fa1c34c22`.

<a id="c253"></a>

## `components/events/admin/EventSettingsPanel.tsx`

- Responsibility / candidate ownership: Render an alternative event-settings action panel including deletion / Admin events.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventSettingsPanel`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `next/link` → `package` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/card` → `components/ui/card.tsx` (import, line 7); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 8); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 9); `lucide-react` → `package` (import, line 18); `@/lib/actions/events-module/event-crud` → `lib/actions/events-module/event-crud.ts` (import, line 30); `@/lib/notifications` → `lib/notifications.ts` (import, line 35); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 36).
- Hooks called: `useRouter`, `useState`.
- JSX components: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Button`, `Loader2`, `Eye`, `Pause`, `Play`, `Archive`, `RotateCcw`, `Link`, `ExternalLink`, `Dialog`, `DialogTrigger`, `Copy`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Trash2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d0aa0ef7872022d9023b502832eb0f305520454ffa407afe817ba19c50ab3928`.

<a id="c254"></a>

## `components/events/admin/EventSettingsTabs.tsx`

- Responsibility / candidate ownership: Navigate event-settings routes and highlight the active tab / Admin events.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventSettingsTabs`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EventSettingsWrapper.tsx:22` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/navigation` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4); `lucide-react` → `package` (import, line 5); `react` → `package` (import, line 15).
- Hooks called: `useRouter`, `usePathname`, `useCallback`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3d4419770298813d27fe7b9de9b0a7070aa433e6e266d7383c50dd3cb67ca9db`.

<a id="c255"></a>

## `components/events/admin/EventSettingsWrapper.tsx`

- Responsibility / candidate ownership: Server-load event, registration, revenue and form information around settings content / Admin events.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventSettingsWrapper`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 1); `next/navigation` → `package` (import, line 2); `@/lib/supabase/server` → `lib/supabase/server.ts` (import, line 3); `@/components/ui/card` → `components/ui/card.tsx` (import, line 4); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `lucide-react` → `package` (import, line 7); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 21); `./EventSettingsTabs` → `components/events/admin/EventSettingsTabs.tsx` (import, line 22).
- Hooks called: None found.
- JSX components: `Card`, `CardContent`, `Users`, `CheckCircle`, `Clock`, `XCircle`, `DollarSign`, `CardHeader`, `CardTitle`, `Badge`, `Eye`, `EyeOff`, `Calendar`, `MapPin`, `FileText`, `CreditCard`, `Button`, `Link`, `ExternalLink`, `EventSettingsTabs`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2625ba19141194f7bbacbefe7c1b937a2a2aae84cee69352fb259abc4886fd8a`.

<a id="c256"></a>

## `components/events/admin/EventStatusActions.tsx`

- Responsibility / candidate ownership: Apply event-registration status actions with feedback and refresh / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventStatusActions`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:22` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 14); `@/components/ui/button` → `components/ui/button.tsx` (import, line 22); `@/lib/notifications` → `lib/notifications.ts` (import, line 23); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 24).
- Hooks called: `useRouter`, `useState`.
- JSX components: `CheckCircle`, `XCircle`, `Loader2`, `ShieldCheck`, `Clock`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Button`, `AlertTriangle`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e8c013e7930aa5208061c1281555e017903ab06ac0d1b2754c96314ec3d62fd4`.

<a id="c257"></a>

## `components/events/admin/PricingEditor.tsx`

- Responsibility / candidate ownership: Create, edit and remove event ticket types/prices / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: editor, media or payment workflow contracts.
- Exports: `PricingEditor`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/pricing/page.tsx:3` (import); `components/events/admin/EventSettingsClient.tsx:54` (import).
- App-entry ancestors: `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5); `@/components/ui/label` → `components/ui/label.tsx` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `@/components/ui/switch` → `components/ui/switch.tsx` (import, line 8); `@/components/ui/date-time-picker` → `components/ui/date-time-picker.tsx` (import, line 9); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 10); `lucide-react` → `package` (import, line 19); `@/lib/actions/events-module/event-pricing` → `lib/actions/events-module/event-pricing.ts` (import, line 27); `@/lib/notifications` → `lib/notifications.ts` (import, line 32); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 33).
- Hooks called: `useState`, `useCallback`.
- JSX components: `DollarSign`, `Button`, `Plus`, `Label`, `Input`, `Switch`, `DateTimePicker`, `Loader2`, `CreditCard`, `Badge`, `Pencil`, `Dialog`, `DialogTrigger`, `Trash2`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6fa18fd2cd74d023f15c359e4ff42ed16682114fdd8dfde5a77be90225e52438`.

<a id="c258"></a>

## `components/events/admin/RegistrationsTable.tsx`

- Responsibility / candidate ownership: Filter/page event registrations and export spreadsheet rows through ExcelJS / Admin events.
- Usage / observed scope: USED / admin.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `RegistrationsTable`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/page.tsx:12` (import).
- App-entry ancestors: `app/admin/events/[id]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `exceljs` → `package` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/badge` → `components/ui/badge.tsx` (import, line 7); `@/components/ui/card` → `components/ui/card.tsx` (import, line 8); `@/components/ui/table` → `components/ui/table.tsx` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 17); `@/components/ui/dropdown-menu` → `components/ui/dropdown-menu.tsx` (import, line 18); `@/components/ui/select` → `components/ui/select.tsx` (import, line 24); `lucide-react` → `package` (import, line 31); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 42).
- Hooks called: `useRouter`, `useState`, `useMemo`, `useCallback`.
- JSX components: `Badge`, `Card`, `CardHeader`, `CardTitle`, `DropdownMenu`, `DropdownMenuTrigger`, `Button`, `Download`, `DropdownMenuContent`, `DropdownMenuItem`, `FileText`, `FileSpreadsheet`, `Search`, `Input`, `Filter`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `X`, `CardContent`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `Users`, `ModeBadge`, `PaymentMethodBadge`, `StatusBadge`, `PaymentBadge`, `ChevronLeft`, `ChevronRight`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `a13f3e16e4f8c0598daf88da5d992ed1aa9865acfb7cb175e383caaeee9393dc`.

<a id="c259"></a>

## `components/events/public/EventError.tsx`

- Responsibility / candidate ownership: Render event failure, not-found and registration-closed variants / Public events.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventError`, `EventNotFound`, `EventRegistrationClosed`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/events/[slug]/error.tsx:3` (import); `app/(public)/events/error.tsx:3` (import); `app/(public)/events/not-found.tsx:1` (import).
- App-entry ancestors: `app/(public)/events/[slug]/error.tsx`, `app/(public)/events/error.tsx`, `app/(public)/events/not-found.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `AlertTriangle`, `Button`, `RefreshCcw`, `Link`, `Home`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `0d86198bbf6a1e2ce26b4109fbeb4f73d1272431a1630e5db7b91a0e39b57621`.

<a id="c260"></a>

## `components/events/public/EventLoading.tsx`

- Responsibility / candidate ownership: Render event page/grid/detail loading placeholders / Public events.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventPageLoading`, `EventGridLoading`, `EventDetailLoading`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 1).
- Hooks called: None found.
- JSX components: `Calendar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `75e591157456408256be9da4d15eb820f26492286c6d319b1e5cad2b8252e185`.

<a id="c261"></a>

## `components/events/public/event-registration-form.tsx`

- Responsibility / candidate ownership: Orchestrate event schema registration, review and payment-related submission / Public events.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `EventRegistrationForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/events/[slug]/register/page.tsx:3` (import).
- App-entry ancestors: `app/(public)/events/[slug]/register/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/navigation` → `package` (import, line 4); `next/link` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/conference/step-progress-bar` → `components/conference/step-progress-bar.tsx` (import, line 7); `@/components/conference/dynamic-step` → `components/conference/dynamic-step.tsx` (import, line 8); `@/lib/validation/form-schema` → `lib/validation/form-schema.ts` (import, line 9); `@/lib/validation/conditional-engine` → `lib/validation/conditional-engine.ts` (import, line 10); `@/lib/actions/events-module/event-registration` → `lib/actions/events-module/event-registration.ts` (import, line 11); `@/lib/types/conference-form-schema` → `lib/types/conference-form-schema.ts` (import, type-only, line 12); `@/lib/types/events-module` → `lib/types/events-module.ts` (import, type-only, line 13).
- Hooks called: `useRouter`, `useState`, `useRef`, `useMemo`, `useCallback`.
- JSX components: `Link`, `ChevronLeft`, `StepProgressBar`, `AlertCircle`, `DynamicStep`, `QrCode`, `CheckCircle`, `X`, `Loader2`, `Upload`, `ReviewSection`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `97a85946c7d6c67712a7ccd31fb07d8a249ffcd118ed8fefc9eef9b4618f40b0`.

<a id="c262"></a>

## `components/events/share-event-button.tsx`

- Responsibility / candidate ownership: Share current event URL/description or copy it with a browser alert fallback / Public events.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ShareEventButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/events/[slug]/page.tsx:27` (import).
- App-entry ancestors: `app/(public)/events/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3).
- Hooks called: None found.
- JSX components: `Share2`.
- Browser-name signals (not semantic proof): `navigator`, `window`.
- Source hash: `7e59ddd71912a55b32a4e637e017c4f3d7454974d9e7fb3fbc9278d16e8786d1`.

<a id="c263"></a>

## `components/footer.tsx`

- Responsibility / candidate ownership: Compose public footer navigation, contact details, social links and newsletter subscription / Public layout.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Footer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:4` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `next/image` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/newsletter-form` → `components/newsletter-form.tsx` (import, line 7); `@/components/social-icons` → `components/social-icons.tsx` (import, line 8).
- Hooks called: `useState`, `useRef`.
- JSX components: `BenefitIcon`, `NewsletterForm`, `ShieldCheckTwoTone`, `Link`, `ArrowRight`, `Image`, `Award`, `CheckCircle`, `ContactIcon`, `IconComponent`, `Heart`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `42659a0a1f0a368efa7690e7acbb04a748911d7c523d43c9bfed7ed42233181b`.

<a id="c264"></a>

## `components/form/form-field.tsx`

- Responsibility / candidate ownership: Wrap native input with label, helper/error associations and forwarded ref / Cross-domain form composition.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormFieldProps`, `FormField`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/form/index.ts:1` (re-export).
- App-entry ancestors: `app/(public)/contact/page.tsx`, `app/(public)/get-involved/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `86284157037161e16fe2a5927d71659afc9df73e58d8c61eb1726f54ab8f9243`.

<a id="c265"></a>

## `components/form/index.ts`

- Responsibility / candidate ownership: Re-export the native field wrappers and their prop contracts / Cross-domain form composition.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `FormField`, `FormFieldProps`, `TextareaField`, `TextareaFieldProps`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/contact-form.tsx:8` (import); `components/volunteer-form.tsx:8` (import).
- App-entry ancestors: `app/(public)/contact/page.tsx`, `app/(public)/get-involved/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./form-field` → `components/form/form-field.tsx` (re-export, line 1); `./textarea-field` → `components/form/textarea-field.tsx` (re-export, line 2).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `08c432b83867ce6df78565455b7ae07f53b44fcd44597077cbbfee60af8f98b1`.

<a id="c266"></a>

## `components/form/textarea-field.tsx`

- Responsibility / candidate ownership: Wrap native textarea with label, helper/error associations and forwarded ref / Cross-domain form composition.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `TextareaFieldProps`, `TextareaField`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/form/index.ts:2` (re-export).
- App-entry ancestors: `app/(public)/contact/page.tsx`, `app/(public)/get-involved/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ae92af47251af0ac08e936363177155dba19b2f1bb1799622440ab3d69ea6cfc`.

<a id="c267"></a>

## `components/global-video-modal.tsx`

- Responsibility / candidate ownership: Adapt global video context state to the podcast video-modal implementation / Shared video presentation with podcast implementation.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `GlobalVideoModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:8` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 3); `@/components/podcasts/podcast-video-modal` → `components/podcasts/podcast-video-modal.tsx` (import, line 4).
- Hooks called: `useVideoModal`.
- JSX components: `PodcastVideoModal`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `62d4eb6262e3a89e9ac79b56279ffe5bf8ab563d333b16935e1cc5bf91f341d1`.

<a id="c268"></a>

## `components/hero-carousel.tsx`

- Responsibility / candidate ownership: Render CMS hero slides with playback/navigation and accessibility integration / Homepage.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `HeroSlide`, `HeroCarousel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/page.tsx:3` (import); `app/(public)/page.tsx:4` (import, type-only).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/components/homepage-image` → `components/homepage-image.tsx` (import, line 4); `./homepage-sections.module.css` → `components/homepage-sections.module.css` (import, line 5); `next/link` → `package` (import, line 6); `lucide-react` → `package` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 9); `@/lib/utils` → `lib/utils.ts` (import, line 10); `@/lib/tts/types` → `lib/tts/types.ts` (import, line 11).
- Hooks called: `useOptionalAccessibility`, `useAccessibility`, `useState`, `useRef`, `useEffect`, `useCallback`.
- JSX components: `HomepageImage`, `Button`, `Link`, `ChevronLeft`, `ChevronRight`, `Play`, `Pause`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `64cb95a109ff593c37a2f49a228b98ed1a397a7fac147eaa85daa23ff18df5c9`.

<a id="c269"></a>

## `components/hero-video.tsx`

- Responsibility / candidate ownership: Render a video hero with accessibility-aware playback controls / Homepage-oriented; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HeroVideo`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 5).
- Hooks called: `useAccessibility`, `useState`, `useRef`, `useEffect`, `useCallback`.
- JSX components: `VolumeX`, `Volume2`.
- Browser-name signals (not semantic proof): `localStorage`, `window`, `IntersectionObserver`, `document`.
- Source hash: `3ed5ecc6cf019881502c73852b6c4bd30d3859255ec72aa77c6d74d8bf57751e`.

<a id="c270"></a>

## `components/home-faqs.tsx`

- Responsibility / candidate ownership: Compose a homepage FAQ accordion with scroll-reveal presentation / Homepage.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HomeFAQs`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/components/ui/section` → `components/ui/section.tsx` (import, line 3); `@/components/ui/accordion` → `components/ui/accordion.tsx` (import, line 4); `lucide-react` → `package` (import, line 10); `@/components/scroll-animations` → `components/scroll-animations.tsx` (import, line 11).
- Hooks called: None found.
- JSX components: `Section`, `ScrollReveal`, `Accordion`, `AccordionItem`, `AccordionTrigger`, `HelpCircle`, `AccordionContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `db926942891829dac8af54ccbc43797b14301ad4451f447b437858dc501d9963`.

<a id="c271"></a>

## `components/home-testimonials-slider.tsx`

- Responsibility / candidate ownership: Render an alternative testimonial slider honoring accessibility preferences / Homepage-oriented; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HomeTestimonialsSlider`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 7).
- Hooks called: `useAccessibility`, `useState`, `useCallback`, `useEffect`.
- JSX components: `Image`, `Star`, `ChevronLeft`, `ChevronRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3db94bf46dd5899c1b3c35f3b66ef8a6f91d54fc191ffec51d84581abb825995`.

<a id="c272"></a>

## `components/homepage-image.tsx`

- Responsibility / candidate ownership: Normalize homepage image URLs and provide failure fallback behavior / Homepage.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `HomepageImage`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/hero-carousel.tsx:4` (import); `components/homepage-sections.tsx:5` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 3); `react` → `package` (import, line 4).
- Hooks called: `useState`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `abb1aa686413c8bf20b8c07d0f474964bc8457376e0a0464b45b61a65f7a5af6`.

<a id="c273"></a>

## `components/homepage-sections.module.css`

- Responsibility / candidate ownership: Share homepage section and hero-carousel styles / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/hero-carousel.tsx:5` (import); `components/homepage-sections.tsx:6` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `620dd03bbff5012ad0cb4dd83c4911e31e828bc0c076e5bc35f5a4101be0edf1`.

<a id="c274"></a>

## `components/homepage-sections.tsx`

- Responsibility / candidate ownership: Compose CMS-driven home sections, testimonials and global enhancement widgets / Homepage.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ImpactStatsBar`, `OurStorySection`, `MissionVisionSection`, `ProgramsSection`, `TimelineSection`, `PodcastSection`, `TestimonialsSection`, `PartnersSection`, `ContactSection`, `GlobalEnhancements`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/page.tsx:5` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `./homepage-image` → `components/homepage-image.tsx` (import, line 5); `./homepage-sections.module.css` → `components/homepage-sections.module.css` (import, line 6); `next/link` → `package` (import, line 7); `lucide-react` → `package` (import, line 8); `@/components/ui/button` → `components/ui/button.tsx` (import, line 38); `@/components/scroll-animations` → `components/scroll-animations.tsx` (import, line 39); `@/components/ui/brush-stroke` → `components/ui/brush-stroke.tsx` (import, line 40); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, type-only, line 41); `@/lib/types/homepage-settings` → `lib/types/homepage-settings.ts` (import, line 49); `@/components/circular-testimonials` → `components/circular-testimonials.tsx` (import, line 778).
- Hooks called: `useState`, `useEffect`.
- JSX components: `CountUp`, `ScrollReveal`, `HomepageImage`, `BrushStroke`, `Link`, `ArrowRight`, `Target`, `Eye`, `Flag`, `IconComp`, `Image`, `Mic2`, `CircularTestimonials`, `MarqueeContainer`, `LogoComponent`, `MapPin`, `ArrowUpRight`, `BackToTop`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `fd5c0cb1e81ea0a7a7adbcea245b731913d4f3eb118413170999391643146970`.

<a id="c275"></a>

## `components/impact-counter.tsx`

- Responsibility / candidate ownership: Animate a displayed impact number when it enters view / Homepage-oriented; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ImpactCounter`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4); `lucide-react` → `package` (import, line 5); `lucide-react` → `package` (import, type-only, line 6).
- Hooks called: `useState`, `useEffect`, `useRef`.
- JSX components: `Icon`, `AnimatedNumber`.
- Browser-name signals (not semantic proof): `IntersectionObserver`.
- Source hash: `08938ef2f405833609d43b88d25c90fb4d3ec5f5b30796c52b5680c6edd97e7d`.

<a id="c276"></a>

## `components/intro-video.tsx`

- Responsibility / candidate ownership: Show an introductory video according to route, accessibility and persisted viewing state / Public layout.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `IntroVideo`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:5` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `next/navigation` → `package` (import, line 5); `@/lib/hooks/use-accessibility` → `lib/hooks/use-accessibility.ts` (import, line 6).
- Hooks called: `usePathname`, `useAccessibility`, `useState`, `useRef`, `useEffect`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): `window`, `localStorage`, `document`.
- Source hash: `f1a65ffdd0208527e1d1538bfa162011eacd51944bf0eb8d8a9906ad191844aa`.

<a id="c277"></a>

## `components/navbar-wrapper.tsx`

- Responsibility / candidate ownership: Fetch support and registration configuration on the server before rendering Navbar / Public layout.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: async server-data boundary.
- Exports: `NavbarWrapper`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/layout.tsx:3` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/support/settings` → `lib/support/settings.ts` (import, line 1); `./navbar` → `components/navbar.tsx` (import, line 2).
- Hooks called: None found.
- JSX components: `Navbar`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c93f6c4e60095e8677e5bca97dbdf299e80472edeeb3c0c353fe5f28e7b7711f`.

<a id="c278"></a>

## `components/navbar.module.css`

- Responsibility / candidate ownership: Scope navigation contrast surfaces, text and icons / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/navbar.tsx:25` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `696d829eb4d8e8cd08aa97afcbd3e4e23ef0df563b897548e0af75664631f944`.

<a id="c279"></a>

## `components/navbar.tsx`

- Responsibility / candidate ownership: Render public navigation, active routes, scroll state and mobile controls / Public layout.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Navbar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/navbar-wrapper.tsx:2` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `next/image` → `package` (import, line 4); `next/navigation` → `package` (import, line 5); `react` → `package` (import, line 6); `@/lib/support/settings` → `lib/support/settings.ts` (import, type-only, line 7); `@/lib/fonts` → `lib/fonts.ts` (import, line 8); `lucide-react` → `package` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 23); `@/lib/utils` → `lib/utils.ts` (import, line 24); `./navbar.module.css` → `components/navbar.module.css` (import, line 25).
- Hooks called: `usePathname`, `useState`, `useRef`, `useEffect`.
- JSX components: `Link`, `IconComponent`, `Image`, `ClipboardList`, `Button`, `Heart`, `X`, `Menu`, `MessageSquare`.
- Browser-name signals (not semantic proof): `window`, `document`.
- Source hash: `299987b627a1d54922b7c5632f24c6e659f5668fe625128e9f937250775ed73c`.

<a id="c280"></a>

## `components/newsletter-form.tsx`

- Responsibility / candidate ownership: Submit newsletter subscriptions and display submission feedback / Newsletter.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `NewsletterForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/footer.tsx:7` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/actions/newsletter` → `lib/actions/newsletter.ts` (import, line 8).
- Hooks called: `useState`.
- JSX components: `CheckCircle`, `Loader2`, `Button`, `Send`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `61752b4c26d2bfd6f2d5555943d982272979c166f99b19ab8f7b9b6280ec4703`.

<a id="c281"></a>

## `components/page-hero-contrast.module.css`

- Responsibility / candidate ownership: Share contrast treatments across Events, Our Story and Stories heroes / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/events/page.tsx:4` (import); `app/(public)/our-story/page.tsx:3` (import); `app/(public)/stories/page.tsx:2` (import).
- App-entry ancestors: `app/(public)/events/page.tsx`, `app/(public)/our-story/page.tsx`, `app/(public)/stories/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `877a58a9f3200610af57ce8bb222c1134fcec1d4a23436776a050b94dfbd395f`.

<a id="c282"></a>

## `components/partner-strip.tsx`

- Responsibility / candidate ownership: Render partner logos in a visual strip / Partners; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `PartnerStrip`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8665dd3c6f3774d6d3740bfb13b689b21892e7a243b463b5c5012676850945cd`.

<a id="c283"></a>

## `components/photo-wall/photo-wall.tsx`

- Responsibility / candidate ownership: Compose photo strips, optional hero copy and mobile expansion for impact/admin preview/demo / Cross-domain photo presentation.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `default: PhotoWall`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/impact/ImpactClientPage.tsx:8` (import); `app/demo/photo-wall/page.tsx:8` (import); `components/admin/site-settings-form.tsx:20` (import).
- App-entry ancestors: `app/(public)/impact/page.tsx`, `app/admin/settings/page.tsx`, `app/demo/photo-wall/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4).
- Hooks called: `useState`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `9b393e618090b007b8c96563958af0e08892241963a5510f998fc98bb55dcd2b`.

<a id="c284"></a>

## `components/podcasts/all-highlights-card.tsx`

- Responsibility / candidate ownership: Resolve highlight video metadata and open selected video through shared context / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: AllHighlightsCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/podcasts/highlights-page-content.tsx:4` (import).
- App-entry ancestors: `app/(public)/podcasts/highlights/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `next/link` → `package` (import, line 5); `./podcasts-page.module.css` → `components/podcasts/podcasts-page.module.css` (import, line 6); `./highlights-page.module.css` → `components/podcasts/highlights-page.module.css` (import, line 7); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 8).
- Hooks called: `useVideoModal`, `useState`, `useEffect`.
- JSX components: `Link`, `Play`, `ExternalLink`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `26cfa149229cd03be88ae82e4abb28df55432144d35f179e25b3ac577ef9a16b`.

<a id="c285"></a>

## `components/podcasts/all-highlights-section.tsx`

- Responsibility / candidate ownership: Render the podcast-page highlights strip with shared video actions / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: AllHighlightsSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/page.tsx:5` (import).
- App-entry ancestors: `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `next/image` → `package` (import, line 5); `next/link` → `package` (import, line 6); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 7); `@/lib/data/podcasts` → `lib/data/podcasts.ts` (import, type-only, line 8); `./podcasts-page.module.css` → `components/podcasts/podcasts-page.module.css` (import, line 9).
- Hooks called: `useRef`, `useVideoModal`.
- JSX components: `Link`, `ArrowRight`, `Image`, `Play`, `ExternalLink`, `ChevronLeft`, `ChevronRight`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `7a5430e8ba7f8958c0dc959178e8695f7abc0a492b1699b4bfaf06a830c493a1`.

<a id="c286"></a>

## `components/podcasts/archive-thumbnail-image.tsx`

- Responsibility / candidate ownership: Apply saved-thumbnail/YouTube/placeholder fallback to podcast imagery / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ArchiveThumbnailImage`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/podcasts/episodes-page-content.tsx:5` (import); `components/podcasts/podcast-archive-section.tsx:5` (import); `components/podcasts/podcast-latest-episode.tsx:4` (import).
- App-entry ancestors: `app/(public)/podcasts/episodes/page.tsx`, `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4).
- Hooks called: `useState`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e307aa427a480cd3e830ad382de9d4a4b72d3d4ca2d87cf03adac9f2fac38f93`.

<a id="c287"></a>

## `components/podcasts/archive-thumbnail.module.css`

- Responsibility / candidate ownership: Share archive/latest/episode thumbnail contrast treatment / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/podcasts/episodes-page-content.tsx:6` (import); `components/podcasts/podcast-archive-section.tsx:6` (import); `components/podcasts/podcast-latest-episode.tsx:5` (import).
- App-entry ancestors: `app/(public)/podcasts/episodes/page.tsx`, `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f7d7cf9127e264d1f064e22f61a8a080919184b29eb2a457170f5735b80a3b80`.

<a id="c288"></a>

## `components/podcasts/episodes-page-content.tsx`

- Responsibility / candidate ownership: Filter and page podcast episodes using archive thumbnail presentation / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: EpisodesPageContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/episodes/page.tsx:3` (import).
- App-entry ancestors: `app/(public)/podcasts/episodes/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `./archive-thumbnail-image` → `components/podcasts/archive-thumbnail-image.tsx` (import, line 5); `./archive-thumbnail.module.css` → `components/podcasts/archive-thumbnail.module.css` (import, line 6); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 7); `lucide-react` → `package` (import, line 8); `date-fns` → `package` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 10); `@/components/ui/checkbox` → `components/ui/checkbox.tsx` (import, line 11); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 12).
- Hooks called: `useState`, `useMemo`.
- JSX components: `Filter`, `Search`, `FancySelect`, `Checkbox`, `Heart`, `Button`, `Link`, `ArchiveThumbnailImage`, `Play`, `Calendar`, `ArrowRight`, `Share2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `c1a18e9617a8768c8b287bbb7c817bdf26787fc54b373165b3c55245a38a683c`.

<a id="c289"></a>

## `components/podcasts/highlights-carousel.tsx`

- Responsibility / candidate ownership: Scroll episode highlights composed from PodcastHighlightCard / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HighlightsCarousel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:9` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `./podcast-highlight-card` → `components/podcasts/podcast-highlight-card.tsx` (import, line 5).
- Hooks called: `useRef`.
- JSX components: `ChevronLeft`, `ChevronRight`, `PodcastHighlightCard`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `413b1be2f7c0ae242410e59917ed34987d53217a5405d4a0184793bca3944088`.

<a id="c290"></a>

## `components/podcasts/highlights-page-content.tsx`

- Responsibility / candidate ownership: Filter and compose the all-highlights page / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: HighlightsPageContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/highlights/page.tsx:4` (import).
- App-entry ancestors: `app/(public)/podcasts/highlights/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `./all-highlights-card` → `components/podcasts/all-highlights-card.tsx` (import, line 4); `@/lib/data/podcasts` → `lib/data/podcasts.ts` (import, type-only, line 5); `lucide-react` → `package` (import, line 6); `./podcasts-page.module.css` → `components/podcasts/podcasts-page.module.css` (import, line 7); `./highlights-page.module.css` → `components/podcasts/highlights-page.module.css` (import, line 8).
- Hooks called: `useState`, `useMemo`.
- JSX components: `Search`, `ArrowUpDown`, `X`, `AllHighlightsCard`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9745b0a61502ef57adee945740ec7090ef78f34314c73249d5816c35874ea12c`.

<a id="c291"></a>

## `components/podcasts/highlights-page.module.css`

- Responsibility / candidate ownership: Share highlight page/card/list presentation / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/highlights/page.tsx:8` (import); `components/podcasts/all-highlights-card.tsx:7` (import); `components/podcasts/highlights-page-content.tsx:8` (import).
- App-entry ancestors: `app/(public)/podcasts/highlights/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `79b92f72561fb1bea4e8bf5f45e5a732bd529db4c4d78caffdbc49ed27ed7ca6`.

<a id="c292"></a>

## `components/podcasts/podcast-archive-section.tsx`

- Responsibility / candidate ownership: Filter and render the podcast archive list / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastArchiveSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/page.tsx:4` (import).
- App-entry ancestors: `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `./archive-thumbnail-image` → `components/podcasts/archive-thumbnail-image.tsx` (import, line 5); `./archive-thumbnail.module.css` → `components/podcasts/archive-thumbnail.module.css` (import, line 6); `lucide-react` → `package` (import, line 7); `./podcasts-page.module.css` → `components/podcasts/podcasts-page.module.css` (import, line 8); `@/components/ui/checkbox` → `components/ui/checkbox.tsx` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 10); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 11); `date-fns` → `package` (import, line 12).
- Hooks called: `useState`, `useMemo`.
- JSX components: `Link`, `ArrowRight`, `SlidersHorizontal`, `Search`, `X`, `Checkbox`, `Heart`, `Button`, `ArchiveThumbnailImage`, `Play`, `Calendar`, `Share2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `91f51be851f6e467e68f1d3fa923b4af9d0a95e0a8d927f288aa1c239e60974a`.

<a id="c293"></a>

## `components/podcasts/podcast-card.tsx`

- Responsibility / candidate ownership: Render podcast metadata, media and social presentation for older grid/section consumers / Podcasts.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `PodcastCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/podcasts/podcast-grid.tsx:5` (import); `components/podcasts/podcast-section.tsx:6` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `next/image` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/social-icons` → `components/social-icons.tsx` (import, line 7); `@/lib/utils` → `lib/utils.ts` (import, line 8); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `Link`, `Image`, `Play`, `Youtube`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `f861d800e9507c8931eaddb232e17dac40b14ef243dc9a9a224a01da58ac7b20`.

<a id="c294"></a>

## `components/podcasts/podcast-filter-sidebar.tsx`

- Responsibility / candidate ownership: Render an alternative podcast filter sidebar / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastFilterSidebar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/components/ui/checkbox` → `components/ui/checkbox.tsx` (import, line 6); `next/link` → `package` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Filter`, `Checkbox`, `Button`, `Link`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `28b84e0b67d6aeebc8db94b64fe4ae0c9f55ffdbdd9ac54099b38b0fe878f110`.

<a id="c295"></a>

## `components/podcasts/podcast-grid.tsx`

- Responsibility / candidate ownership: Render an alternative episode grid connected to global video state / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastGrid`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `./podcast-card` → `components/podcasts/podcast-card.tsx` (import, line 5); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 6); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 7); `@/components/ui/button` → `components/ui/button.tsx` (import, line 8).
- Hooks called: `useVideoModal`, `useState`.
- JSX components: `PodcastCard`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5c4669ff5b8c0f915968ec33a0dd53b00fbe50d7d37c378aa81026b2b9d6bfb7`.

<a id="c296"></a>

## `components/podcasts/podcast-guest-card.tsx`

- Responsibility / candidate ownership: Render podcast guest identity and social links / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastGuestCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/social-icons` → `components/social-icons.tsx` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `User`, `Button`, `Linkedin`, `Twitter`, `Globe`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5dbdbde4bc3ba830c0831d61a14a71ad4cb2cae6aea5319e7fcba406702ea278`.

<a id="c297"></a>

## `components/podcasts/podcast-hero-section.tsx`

- Responsibility / candidate ownership: Render an alternative podcast hero with local playback state / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastHeroSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/social-icons` → `components/social-icons.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 8).
- Hooks called: `useState`.
- JSX components: `Music`, `Button`, `Link`, `Play`, `Youtube`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d843119a8f3387bb105f37de653dd851ae15afe0518b8116425227a577596549`.

<a id="c298"></a>

## `components/podcasts/podcast-highlight-card.tsx`

- Responsibility / candidate ownership: Resolve individual highlight metadata and open it in the shared video modal / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastHighlightCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/podcasts/highlights-carousel.tsx:5` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 5).
- Hooks called: `useVideoModal`, `useState`, `useEffect`.
- JSX components: `Play`, `ExternalLink`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `22d76c7993fdc3ce839fe64756764ebd569653ad51aa5e31c4978459eea370ba`.

<a id="c299"></a>

## `components/podcasts/podcast-latest-episode.tsx`

- Responsibility / candidate ownership: Render latest-episode details with playback/share interactions / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastLatestEpisode`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `./archive-thumbnail-image` → `components/podcasts/archive-thumbnail-image.tsx` (import, line 4); `./archive-thumbnail.module.css` → `components/podcasts/archive-thumbnail.module.css` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 8); `date-fns` → `package` (import, line 9); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 10); `@/lib/notifications` → `lib/notifications.ts` (import, line 11).
- Hooks called: `useVideoModal`.
- JSX components: `ArchiveThumbnailImage`, `Play`, `Calendar`, `Clock`, `Link`, `Button`, `FileText`, `Share2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `0d244a6f7dce5519c91cf9e6d996fbf8d230b31cecd672d2bd257fa8fdd09ebd`.

<a id="c300"></a>

## `components/podcasts/podcast-main-hero.tsx`

- Responsibility / candidate ownership: Render an alternative podcast hero wired to shared video state / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastMainHero`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/components/social-icons` → `components/social-icons.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 8); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 9).
- Hooks called: `useVideoModal`, `useState`, `useEffect`.
- JSX components: `Button`, `Play`, `Youtube`, `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `55d36b5ce03afea448878292d064a7fec6125ea7f56175cd6b3619c3dfb3a6cb`.

<a id="c301"></a>

## `components/podcasts/podcast-preview-section.tsx`

- Responsibility / candidate ownership: Present linked podcast episode previews / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastPreviewSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 3); `next/image` → `package` (import, line 4); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 5); `lucide-react` → `package` (import, line 6); `date-fns` → `package` (import, line 7).
- Hooks called: None found.
- JSX components: `Sparkles`, `Link`, `Image`, `Play`, `Calendar`, `ArrowRight`, `Share2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `d85c1dee2709d718c3bf453de0af27e63af76f6be343fd0fd43a7ca8fb24ce04`.

<a id="c302"></a>

## `components/podcasts/podcast-section.tsx`

- Responsibility / candidate ownership: Compose an alternative podcast carousel/section with shared video actions / Podcasts.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `default: PodcastSection`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `./podcast-card` → `components/podcasts/podcast-card.tsx` (import, line 6); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 7); `@/lib/utils` → `lib/utils.ts` (import, line 8); `@/components/ui/button` → `components/ui/button.tsx` (import, line 9); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 10).
- Hooks called: `useVideoModal`, `useState`, `useRef`, `useEffect`.
- JSX components: `Headphones`, `Button`, `Link`, `ArrowRight`, `PodcastCard`, `ChevronLeft`, `ChevronRight`.
- Browser-name signals (not semantic proof): `IntersectionObserver`.
- Source hash: `a47bbbbd6e94ec8bd964cf4f9638c8eb627672da61b7102f98cbdb725a6986a3`.

<a id="c303"></a>

## `components/podcasts/podcast-series-intro.tsx`

- Responsibility / candidate ownership: Render current series introduction with episode and video actions / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastSeriesIntro`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/page.tsx:3` (import).
- App-entry ancestors: `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 3); `next/link` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/contexts/VideoModalContext` → `contexts/VideoModalContext.tsx` (import, line 6); `./podcasts-page.module.css` → `components/podcasts/podcasts-page.module.css` (import, line 7); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, type-only, line 8).
- Hooks called: `useVideoModal`.
- JSX components: `Mic2`, `Play`, `Link`, `ArrowDown`, `Image`, `Plus`, `ArrowUpRight`, `Heart`, `Quote`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e00d4f746b2a6d3976b75e1172a9e81741f0a21f03a1ffc6825389efb1ec0bbf`.

<a id="c304"></a>

## `components/podcasts/podcast-share-card.tsx`

- Responsibility / candidate ownership: Render podcast sharing actions / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastShareCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:8` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/toast` → `components/ui/toast.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `Copy`, `Share2`, `Mail`.
- Browser-name signals (not semantic proof): `navigator`, `window`.
- Source hash: `e1c0149dcc02fc9d0eaecd689709302328b4f44c6530e1803be33d5f845d9338`.

<a id="c305"></a>

## `components/podcasts/podcast-sticky-player.tsx`

- Responsibility / candidate ownership: Maintain a sticky podcast playback surface and playback state / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastStickyPlayer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:6` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/lib/types/podcast` → `lib/types/podcast.ts` (import, line 6).
- Hooks called: `useState`, `useRef`, `useEffect`.
- JSX components: `Button`, `SkipBack`, `Pause`, `Play`, `SkipForward`, `Maximize2`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `05c1035f473b8008f90657c5775d05c9949f8added2269b1c623e726c6496777`.

<a id="c306"></a>

## `components/podcasts/podcast-transcript.tsx`

- Responsibility / candidate ownership: Render searchable transcript lines and matching-term highlights / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: PodcastTranscript`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:7` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/input` → `components/ui/input.tsx` (import, line 5).
- Hooks called: `useState`.
- JSX components: `FileText`, `Search`, `Input`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e69704d5985e3f70625d93d6e7e69b256be46e77a39671afc073dded1d6e3d7e`.

<a id="c307"></a>

## `components/podcasts/podcast-video-modal.tsx`

- Responsibility / candidate ownership: Render the shared video overlay with escape/focus/body-scroll behavior / Shared video presentation with podcast implementation.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `default: PodcastVideoModal`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/global-video-modal.tsx:4` (import).
- App-entry ancestors: `app/(public)/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: `useCallback`, `useEffect`.
- JSX components: `ExternalLink`, `Maximize2`, `XIcon`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `a7e2ea3d47ede868dcd6e345bf52e7874efef5098144353e950f2a211385e750`.

<a id="c308"></a>

## `components/podcasts/podcasts-page.module.css`

- Responsibility / candidate ownership: Share podcast overview/highlights/series/archive styles / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/highlights/page.tsx:7` (import); `app/(public)/podcasts/page.tsx:1` (import); `components/podcasts/all-highlights-card.tsx:6` (import); `components/podcasts/all-highlights-section.tsx:9` (import); `components/podcasts/highlights-page-content.tsx:7` (import); `components/podcasts/podcast-archive-section.tsx:8` (import); `components/podcasts/podcast-series-intro.tsx:7` (import).
- App-entry ancestors: `app/(public)/podcasts/highlights/page.tsx`, `app/(public)/podcasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `31175671157a15e1a068c0e4b0fc7e6090511ff87c679f683aa90c0113ce3039`.

<a id="c309"></a>

## `components/programs/CmsProgramRenderer.tsx`

- Responsibility / candidate ownership: Normalize CMS documents and dispatch category templates plus related programs / Programs.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `CmsProgramRenderer`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/demo/cms-templates/[category]/page.tsx:2` (import); `app/(public)/whatwedo/[slug]/page.tsx:5` (import); `app/admin/programs/[id]/preview/page.tsx:7` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 1); `@/lib/programs/normalize` → `lib/programs/normalize.ts` (import, line 2); `@/lib/programs/data` → `lib/programs/data.ts` (import, type-only, line 3); `./templates` → `components/programs/templates/index.ts` (import, line 4); `./sections/RelatedProgramsSection` → `components/programs/sections/RelatedProgramsSection.tsx` (import, line 5); `@/lib/programs/editor-hero` → `lib/programs/editor-hero.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `CampaignTemplate`, `RelatedProgramsSection`, `OutreachTemplate`, `ResearchTemplate`, `ServiceTemplate`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `9a62691d21fe716b41fb938c214517c1c0e30cc18e86ae564c5c7c7aff922504`.

<a id="c310"></a>

## `components/programs/LoadingSkeleton.tsx`

- Responsibility / candidate ownership: Render older program/section skeleton variants / Programs.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ProgramSkeleton`, `SectionSkeleton`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9d9233fb4f873285b2b4668d9b54a4bf5b3af3fd7e6c9b4626568938e686b06a`.

<a id="c311"></a>

## `components/programs/ProgramLoading.tsx`

- Responsibility / candidate ownership: Render current program listing/detail loading placeholders / Programs.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ProgramCardsSkeleton`, `ProgramsPageSkeleton`, `ProgramDetailSkeleton`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/whatwedo/[slug]/loading.tsx:1` (import); `app/(public)/whatwedo/loading.tsx:1` (import); `app/(public)/whatwedo/page.tsx:6` (import).
- App-entry ancestors: `app/(public)/whatwedo/[slug]/loading.tsx`, `app/(public)/whatwedo/loading.tsx`, `app/(public)/whatwedo/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 1); `./program-loading.module.css` → `components/programs/program-loading.module.css` (import, line 2).
- Hooks called: None found.
- JSX components: `Placeholder`, `Cards`, `ProgramCardsSkeleton`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f91307405e118ed72b222eb502db26cbe58d22782cb6b409fe6d9bfc31a8a7c3`.

<a id="c312"></a>

## `components/programs/SafeImage.tsx`

- Responsibility / candidate ownership: Resolve allowed image hosts, proxy other sources and hide failed program media / Programs.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `SafeImage`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/whatwedo/whatwedo-client.tsx:8` (import); `components/programs/sections/GallerySection.tsx:6` (import); `components/programs/sections/ProgramHero.tsx:7` (import); `components/programs/sections/QuoteSection.tsx:6` (import); `components/programs/sections/RelatedProgramsSection.tsx:7` (import); `components/programs/sections/StorySection.tsx:6` (import); `components/programs/templates/EditorialParts.tsx:5` (import); `components/programs/templates/ServiceTemplate.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/(public)/whatwedo/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 5); `react` → `package` (import, line 6).
- Hooks called: `useState`, `useCallback`.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ddee3b19e79b74f13968c7b47b6e7b041e3aa162052ac59c93f577c34faddf56`.

<a id="c313"></a>

## `components/programs/demo/CampaignConcept.tsx`

- Responsibility / candidate ownership: Compose the campaign design-reference page using demo actions / Program design fixtures.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: `CampaignConcept`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/demo/ProgramDemos.tsx:28` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/programs/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `./DemoInteractions` → `components/programs/demo/DemoInteractions.tsx` (import, line 3); `./campaign-concept.module.css` → `components/programs/demo/campaign-concept.module.css` (import, line 4).
- Hooks called: None found.
- JSX components: `ArrowUpRight`, `ArrowDown`, `Image`, `Heart`, `Symbol`, `Check`, `DemoAction`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `867478a23e5eef2aa45cac412e236f7bb39e8976f76a4f2c79a427fe1d5682c3`.

<a id="c314"></a>

## `components/programs/demo/DemoInteractions.tsx`

- Responsibility / candidate ownership: Provide demo actions/contributions and the production-used CommunicationBoard / Programs shared demo/production interactions.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: `DemoAction`, `CampaignContribution`, `CommunicationBoard`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/demo/CampaignConcept.tsx:3` (import); `components/programs/demo/ProgramDemos.tsx:17` (import); `components/programs/templates/EditorialParts.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/programs/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `./programs.module.css` → `components/programs/demo/programs.module.css` (import, line 5).
- Hooks called: `useState`.
- JSX components: `ArrowUpRight`, `Check`, `Volume2`, `Icon`, `RotateCcw`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0e08624343c8fdcfd929e1f92d2d70da8a0e38a9a03ceeb2f5fad9bf459bcfb7`.

<a id="c315"></a>

## `components/programs/demo/ProgramDemos.tsx`

- Responsibility / candidate ownership: Compose four program design-reference pages and the comparison index / Program design fixtures.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: `ServiceDemo`, `CampaignDemo`, `OutreachDemo`, `ResearchDemo`, `ProgramDemoIndex`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/demo/1000-families/page.tsx:2` (import); `app/(public)/demo/aac-support/page.tsx:2` (import); `app/(public)/demo/community-outreach/page.tsx:2` (import); `app/(public)/demo/deessa-companion/page.tsx:2` (import); `app/(public)/demo/programs/page.tsx:2` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/programs/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 1); `next/image` → `package` (import, line 2); `next/link` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `./DemoInteractions` → `components/programs/demo/DemoInteractions.tsx` (import, line 17); `./demo-content` → `components/programs/demo/demo-content.ts` (import, line 18); `./programs.module.css` → `components/programs/demo/programs.module.css` (import, line 27); `./CampaignConcept` → `components/programs/demo/CampaignConcept.tsx` (import, line 28).
- Hooks called: None found.
- JSX components: `Image`, `Link`, `ArrowUpRight`, `ArrowDown`, `Eyebrow`, `Plus`, `SectionTitle`, `Photo`, `Shell`, `Anchor`, `Heart`, `Sparkles`, `Icon`, `Faqs`, `DemoAction`, `MetricGrid`, `Gallery`, `CampaignConcept`, `MapPin`, `MessageCircle`, `Sun`, `Check`, `CommunicationBoard`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `292f9e13720c57e9e57f193a5009df3118235c7e3f4e3d8f8c3de43962c622c4`.

<a id="c316"></a>

## `components/programs/demo/campaign-concept.module.css`

- Responsibility / candidate ownership: Share campaign design-reference and production template styling / Component styling.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/demo/CampaignConcept.tsx:4` (import); `components/programs/templates/CampaignTemplate.tsx:12` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/programs/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `474144cb50d623f5ad301f52cf15076fc0e06d0bd324288be4a94f0fa1c94513`.

<a id="c317"></a>

## `components/programs/demo/demo-content.ts`

- Responsibility / candidate ownership: Export design-fixture content reused by demo documents and offline fixture generation / Program design fixtures.
- Usage / observed scope: USED / demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: `demoPages`, `DemoCategory`, `serviceSupport`, `serviceSteps`, `serviceFaqs`, `outreachStops`, `researchStages`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/demo/ProgramDemos.tsx:18` (import); `data/programs/editorial-demo-documents.ts:2` (import); `data/programs/service-demo-document.ts:2` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/program-editor/page.tsx`, `app/(public)/demo/programs/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`, `__tests__/programs/lifecycle.test.tsx`, `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: `data/programs/editorial-demo-documents.ts`, `data/programs/service-demo-document.ts`.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ce68fbc32ca943f6c6b652dbd32b351de303dcf338921f16fc28b6a7ac31eacf`.

<a id="c318"></a>

## `components/programs/demo/programs.module.css`

- Responsibility / candidate ownership: Share program design-reference, interactive and production template styling / Component styling.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: demo location conceals production dependencies.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/demo/DemoInteractions.tsx:5` (import); `components/programs/demo/ProgramDemos.tsx:27` (import); `components/programs/templates/CampaignTemplate.tsx:13` (import); `components/programs/templates/EditorialParts.tsx:6` (import); `components/programs/templates/OutreachTemplate.tsx:13` (import); `components/programs/templates/ResearchTemplate.tsx:14` (import); `components/programs/templates/ServiceTemplate.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/1000-families/page.tsx`, `app/(public)/demo/aac-support/page.tsx`, `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/demo/community-outreach/page.tsx`, `app/(public)/demo/deessa-companion/page.tsx`, `app/(public)/demo/programs/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f1e934853640aad47442d8c5aaa64ae5fb10680bbc29624eb9b474b43f9fe610`.

<a id="c319"></a>

## `components/programs/program-loading.module.css`

- Responsibility / candidate ownership: Style current program loading placeholders / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/ProgramLoading.tsx:2` (import).
- App-entry ancestors: `app/(public)/whatwedo/[slug]/loading.tsx`, `app/(public)/whatwedo/loading.tsx`, `app/(public)/whatwedo/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `379293b594cc0a66c62264e704ccca34a8804c33afdf37e8b78c9bf0b737daaf`.

<a id="c320"></a>

## `components/programs/sections/ActivitiesSection.tsx`

- Responsibility / candidate ownership: Present program activity cards with heading and motion / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ActivitiesSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6bb0caeb792c119aaccd8fdd5aec4306dcf4e23e533101f8d602ca404148d4b0`.

<a id="c321"></a>

## `components/programs/sections/CTASection.tsx`

- Responsibility / candidate ownership: Present program call-to-action content and links / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `CTASection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `next/link` → `package` (import, line 5).
- Hooks called: None found.
- JSX components: `Link`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c5fca227af98aeb8355e5e3a4adb52cb36d5851c7c9021a3b98f68362d2a8932`.

<a id="c322"></a>

## `components/programs/sections/FactsBarSection.tsx`

- Responsibility / candidate ownership: Present program fact metrics / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `FactsBarSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1322bc4feae06a11a4983bab34f60718d61690b7f73efde0b8f3f2a913c0d750`.

<a id="c323"></a>

## `components/programs/sections/FaqSection.tsx`

- Responsibility / candidate ownership: Render expandable program FAQ entries / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `FaqSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `react` → `package` (import, line 5); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 6).
- Hooks called: `useState`.
- JSX components: `SectionHeading`, `AnimatePresence`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b378925c15f26c03aa530195d10c1509fcaff3c5cdea7ba0e16d238ea814ee46`.

<a id="c324"></a>

## `components/programs/sections/FeaturesSection.tsx`

- Responsibility / candidate ownership: Render program feature cards / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `FeaturesSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `514d93cd99310c52a36273ae305e41c05db9b5438c7ac6f0d9f837020f6b3664`.

<a id="c325"></a>

## `components/programs/sections/GallerySection.tsx`

- Responsibility / candidate ownership: Render program gallery images with local selection and SafeImage / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `GallerySection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `react` → `package` (import, line 5); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 6); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `SectionHeading`, `SafeImage`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `07e92ceb10d2882151bc02ebc16f18362ecbb983ae15ca993983c99d0e53fa7c`.

<a id="c326"></a>

## `components/programs/sections/HowItWorksSection.tsx`

- Responsibility / candidate ownership: Present program process steps / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HowItWorksSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5c80b8c7cb9b2ab197b133830cd423536f482facef41c670e6809c8db7671467`.

<a id="c327"></a>

## `components/programs/sections/ProgramHero.tsx`

- Responsibility / candidate ownership: Present program hero data, links and media / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ProgramHero`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `next/link` → `package` (import, line 4); `framer-motion` → `package` (import, line 5); `react` → `package` (import, line 6); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `SafeImage`, `Link`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4465d53aa69daf14817aab20561442cc85d7b38e5e9e3e4d7bb1395c978d2c82`.

<a id="c328"></a>

## `components/programs/sections/ProgressTrackerSection.tsx`

- Responsibility / candidate ownership: Present animated program progress/donation indicators / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ProgressTrackerSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 7).
- Hooks called: `useState`, `useEffect`.
- JSX components: `SectionHeading`, `Heart`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `321f5c3c9554837cfac320da04c82dc9a0b9f06432dfe0badae0ebeda511012d`.

<a id="c329"></a>

## `components/programs/sections/QuoteSection.tsx`

- Responsibility / candidate ownership: Present program quote content and image / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `QuoteSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `react` → `package` (import, line 5); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 6); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `SectionHeading`, `SafeImage`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `fc17b41655dcb99abca42cc15f4db58188dd058199f2b250621342a05f845882`.

<a id="c330"></a>

## `components/programs/sections/RelatedProgramsSection.tsx`

- Responsibility / candidate ownership: Render linked related-program cards using SafeImage / Programs section presentation.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `RelatedProgramsSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/CmsProgramRenderer.tsx:5` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `next/link` → `package` (import, line 4); `framer-motion` → `package` (import, line 5); `react` → `package` (import, line 6); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `Link`, `RelatedProgramImage`, `SafeImage`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `edd351ea0b80a25ba0e9e8bd4805804bb11964da38306da93ae133028ab27ec2`.

<a id="c331"></a>

## `components/programs/sections/ResourcesSection.tsx`

- Responsibility / candidate ownership: Render program resource/download links / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ResourcesSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0c9c751a53b8152f498af257c8ed9e29da23761c822ca9c25ee10b64a023954a`.

<a id="c332"></a>

## `components/programs/sections/RichTextSection.tsx`

- Responsibility / candidate ownership: Render program rich-text section content / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `RichTextSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0581d0fa0108a1a4efe3f478b220a91d776aa5a48f87b182124d4b129c7655ac`.

<a id="c333"></a>

## `components/programs/sections/SectionHeading.tsx`

- Responsibility / candidate ownership: Render animated program section headings with local accent variants / Programs section presentation.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `SectionHeading`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/sections/ActivitiesSection.tsx:5` (import); `components/programs/sections/FactsBarSection.tsx:5` (import); `components/programs/sections/FaqSection.tsx:6` (import); `components/programs/sections/FeaturesSection.tsx:5` (import); `components/programs/sections/GallerySection.tsx:7` (import); `components/programs/sections/HowItWorksSection.tsx:5` (import); `components/programs/sections/ProgressTrackerSection.tsx:7` (import); `components/programs/sections/QuoteSection.tsx:7` (import); `components/programs/sections/ResourcesSection.tsx:5` (import); `components/programs/sections/RichTextSection.tsx:5` (import); `components/programs/sections/StatsSection.tsx:5` (import); `components/programs/sections/StorySection.tsx:7` (import); `components/programs/sections/TimelineSection.tsx:6` (import); `components/programs/sections/WhoWeSupportSection.tsx:5` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `framer-motion` → `package` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `95ec2d136c5a2273ba8918686eb0c9815b838d4b1d25973fd73f2af1188a4dff`.

<a id="c334"></a>

## `components/programs/sections/SectionNav.tsx`

- Responsibility / candidate ownership: Observe section visibility and navigate program-page anchors / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `SectionNav`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `framer-motion` → `package` (import, line 4).
- Hooks called: `useState`, `useCallback`, `useEffect`.
- JSX components: `AnimatePresence`.
- Browser-name signals (not semantic proof): `document`, `IntersectionObserver`.
- Source hash: `14b4792b22d417b3e50afa13697950c224e0995acbcee94d99d416aaa51eb4b1`.

<a id="c335"></a>

## `components/programs/sections/StatsSection.tsx`

- Responsibility / candidate ownership: Render program statistics / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `StatsSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `eef7a2e5087ba199eb6c08d5474bfaffbd18579c423f71048c5f7fc3822791b9`.

<a id="c336"></a>

## `components/programs/sections/StorySection.tsx`

- Responsibility / candidate ownership: Render program story content and media / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `StorySection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `react` → `package` (import, line 5); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 6); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 7).
- Hooks called: `useState`.
- JSX components: `SectionHeading`, `SafeImage`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `de6cc710f0adeafb92c6c65a22cd52f044f4068f2ddaa1040634e6658208990a`.

<a id="c337"></a>

## `components/programs/sections/TimelineSection.tsx`

- Responsibility / candidate ownership: Render program timeline milestones / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `TimelineSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `SectionHeading`, `CheckCircle`, `Circle`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `580746ed3a7e1bb673aff72b1d819e776ee62b510a760d93ad0f3d6cb4e1b1df`.

<a id="c338"></a>

## `components/programs/sections/WhoWeSupportSection.tsx`

- Responsibility / candidate ownership: Present supported groups in a program section / Programs section presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `WhoWeSupportSection`.
- Naming: uppercase filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 3); `framer-motion` → `package` (import, line 4); `./SectionHeading` → `components/programs/sections/SectionHeading.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `SectionHeading`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f7bc3eb9ad9f4f7232c1f5da2533e87ace9422f159803f76a973cd3d162e8b42`.

<a id="c339"></a>

## `components/programs/templates/CampaignTemplate.tsx`

- Responsibility / candidate ownership: Render campaign CMS composition using editorial sections and shared campaign styles / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `CampaignTemplate`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/editorial-templates.test.tsx:6` (import); `components/programs/templates/index.ts:2` (re-export).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 3); `./EditorialParts` → `components/programs/templates/EditorialParts.tsx` (import, line 4); `../demo/campaign-concept.module.css` → `components/programs/demo/campaign-concept.module.css` (import, line 12); `../demo/programs.module.css` → `components/programs/demo/programs.module.css` (import, line 13).
- Hooks called: None found.
- JSX components: `EditorialText`, `Heading`, `EditorialIcon`, `Check`, `EditorialPhoto`, `ArrowUpRight`, `EditorialSection`, `EditorialAccent`, `ArrowDown`, `Heart`, `Fragment`, `AnchorAlias`, `CampaignSection`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `afd0dc577b8b114adfed84372bd2335557d4b87d4583b7710f70480a91fb6323`.

<a id="c340"></a>

## `components/programs/templates/EditorialParts.tsx`

- Responsibility / candidate ownership: Render editorial text/media/actions and content-type sections, including CommunicationBoard / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ImageRef`, `Action`, `EditorialText`, `EditorialAccent`, `imageUrl`, `EditorialPhoto`, `EditorialIcon`, `EditorialActions`, `EditorialHeading`, `SectionCopy`, `EditorialSection`, `AnchorAlias`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/templates/CampaignTemplate.tsx:4` (import); `components/programs/templates/OutreachTemplate.tsx:4` (import); `components/programs/templates/ResearchTemplate.tsx:4` (import); `components/programs/templates/ServiceTemplate.tsx:3` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 3); `../demo/DemoInteractions` → `components/programs/demo/DemoInteractions.tsx` (import, line 4); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 5); `../demo/programs.module.css` → `components/programs/demo/programs.module.css` (import, line 6).
- Hooks called: None found.
- JSX components: `Fragment`, `EditorialText`, `SafeImage`, `Icon`, `ArrowUpRight`, `ArrowDown`, `EditorialHeading`, `EditorialPhoto`, `Plus`, `EditorialIcon`, `MapPin`, `EditorialActions`, `SectionCopy`, `Check`, `CommunicationBoard`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `39557dc6e0074051d945e4b5640b403f8b154bc95df2d7c4dcdeef573e4e2bce`.

<a id="c341"></a>

## `components/programs/templates/OutreachTemplate.tsx`

- Responsibility / candidate ownership: Render outreach CMS composition using editorial sections / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `OutreachTemplate`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/editorial-templates.test.tsx:7` (import); `components/programs/templates/index.ts:3` (re-export).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 3); `./EditorialParts` → `components/programs/templates/EditorialParts.tsx` (import, line 4); `../demo/programs.module.css` → `components/programs/demo/programs.module.css` (import, line 13).
- Hooks called: None found.
- JSX components: `EditorialText`, `EditorialAccent`, `EditorialPhoto`, `MapPin`, `EditorialActions`, `ArrowDown`, `SectionCopy`, `Fragment`, `AnchorAlias`, `EditorialSection`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `5ad930b74c74d2f45cfae8b250e23cb9c122d5191577e84be9dc5587226a3971`.

<a id="c342"></a>

## `components/programs/templates/ResearchTemplate.tsx`

- Responsibility / candidate ownership: Render research CMS composition and shared interactive content / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ResearchTemplate`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `__tests__/programs/editorial-templates.test.tsx:8` (import); `components/programs/templates/index.ts:4` (re-export).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/programs/content` → `lib/programs/content.ts` (import, type-only, line 3); `./EditorialParts` → `components/programs/templates/EditorialParts.tsx` (import, line 4); `../demo/programs.module.css` → `components/programs/demo/programs.module.css` (import, line 14); `./editorial-photo.module.css` → `components/programs/templates/editorial-photo.module.css` (import, line 17).
- Hooks called: None found.
- JSX components: `EditorialText`, `EditorialAccent`, `EditorialActions`, `EditorialPhoto`, `MessageCircle`, `Sun`, `Heart`, `Check`, `ArrowDown`, `SectionCopy`, `Fragment`, `AnchorAlias`, `EditorialSection`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `3bc7227947371720593430c0274eccfe316978e9ff7ca0b1e0e82c12a42e3535`.

<a id="c343"></a>

## `components/programs/templates/ServiceTemplate.tsx`

- Responsibility / candidate ownership: Render normalized service-program content in the service layout / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ServiceTemplate`.
- Naming: uppercase filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/templates/index.ts:1` (re-export).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/types/program-prototype` → `lib/types/program-prototype.ts` (import, type-only, line 1); `lucide-react` → `package` (import, line 2); `./EditorialParts` → `components/programs/templates/EditorialParts.tsx` (import, line 3); `../SafeImage` → `components/programs/SafeImage.tsx` (import, line 4); `../demo/programs.module.css` → `components/programs/demo/programs.module.css` (import, line 5).
- Hooks called: None found.
- JSX components: `Eyebrow`, `EditorialText`, `SafeImage`, `ArrowUpRight`, `ArrowDown`, `EditorialIcon`, `Photo`, `SectionTitle`, `Plus`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `395de0f5ae3b2dfdcbe29d70b62ea18dcf34843041cfc0195fb5fc52636a9c4d`.

<a id="c344"></a>

## `components/programs/templates/editorial-photo.module.css`

- Responsibility / candidate ownership: Style editorial research template photography / Component styling.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/templates/ResearchTemplate.tsx:17` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: `__tests__/programs/editorial-templates.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `1e9e3ecf082fd59fb0d7346dda09dcc5e3fef71aa894f2f66f2918788e7711da`.

<a id="c345"></a>

## `components/programs/templates/index.ts`

- Responsibility / candidate ownership: Re-export the four category templates used by CmsProgramRenderer / Programs CMS templates.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ServiceTemplate`, `CampaignTemplate`, `OutreachTemplate`, `ResearchTemplate`.
- Naming: index entry; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/programs/CmsProgramRenderer.tsx:4` (import).
- App-entry ancestors: `app/(public)/demo/cms-templates/[category]/page.tsx`, `app/(public)/whatwedo/[slug]/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `./ServiceTemplate` → `components/programs/templates/ServiceTemplate.tsx` (re-export, line 1); `./CampaignTemplate` → `components/programs/templates/CampaignTemplate.tsx` (re-export, line 2); `./OutreachTemplate` → `components/programs/templates/OutreachTemplate.tsx` (re-export, line 3); `./ResearchTemplate` → `components/programs/templates/ResearchTemplate.tsx` (re-export, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2a53fa64da82577f8605c58ece4f4332aff0cc9a372093e762fc7d8fa6059178`.

<a id="c346"></a>

## `components/receipt-preview.tsx`

- Responsibility / candidate ownership: Display donation receipt status and provide download, email and copy interactions / Donations.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ReceiptPreview`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/donate/success/success-content.tsx:21` (import).
- App-entry ancestors: `app/(public)/donate/success/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/lib/notifications` → `lib/notifications.ts` (import, line 7).
- Hooks called: `useState`, `useRef`, `useEffect`.
- JSX components: `CheckCircle`, `Loader2`, `FileText`, `Button`, `Download`, `Mail`, `Copy`.
- Browser-name signals (not semantic proof): `window`, `document`, `navigator`.
- Source hash: `5e029f3761211b1bb0437c9770a537bf4b6b23039a7fb37dc3c19637e88c77ef`.

<a id="c347"></a>

## `components/resource-downloads.tsx`

- Responsibility / candidate ownership: Render branded/legal resource download cards and export their resource lists / Press.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ResourceDownloads`, `legalResources`, `brandResources`, `allResources`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/press/page.tsx:6` (import).
- App-entry ancestors: `app/(public)/press/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 1); `@/components/ui/button` → `components/ui/button.tsx` (import, line 2); `@/components/ui/card` → `components/ui/card.tsx` (import, line 3).
- Hooks called: None found.
- JSX components: `Icon`, `Button`, `Download`, `Card`, `CardContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c0602154200de6b47c4a8b189161f2c7ce305bf60642a7b6a4ec4fb6ab5aff64`.

<a id="c348"></a>

## `components/scroll-animations.tsx`

- Responsibility / candidate ownership: Provide scroll reveal, counters, parallax, particles, progress and back-to-top effects / Animation helpers; currently homepage reachability.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ScrollReveal`, `CountUp`, `StaggerChildren`, `ParallaxImage`, `FloatingParticles`, `WordByWordReveal`, `ScrollProgressBar`, `BackToTop`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/home-faqs.tsx:11` (import); `components/homepage-sections.tsx:39` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4).
- Hooks called: `useRef`, `useState`, `useEffect`.
- JSX components: `ScrollReveal`.
- Browser-name signals (not semantic proof): `IntersectionObserver`, `window`, `document`.
- Source hash: `c6782d1890d0fdf52333f5542a5c1266de0be394e70bec65ca796695a2217bc4`.

<a id="c349"></a>

## `components/secret-key-listener.tsx`

- Responsibility / candidate ownership: Mount the homepage shortcut hook without rendering visible content / Homepage.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SecretKeyListener`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/page.tsx:2` (import).
- App-entry ancestors: `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/hooks/use-secret-key` → `hooks/use-secret-key.ts` (import, line 3).
- Hooks called: `useSecretKey`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4e75779fce01bec060adcc876f0e436e2bbb45e1d7b758b841ab7fa32601dc88`.

<a id="c350"></a>

## `components/seo/structured-data.tsx`

- Responsibility / candidate ownership: Serialize supplied schema objects into JSON-LD script elements / Cross-domain SEO.
- Usage / observed scope: USED / public + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `StructuredData`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/events/[slug]/page.tsx:29` (import); `app/(public)/podcasts/[slug]/page.tsx:16` (import); `app/(public)/stories/[slug]/page.tsx:13` (import); `app/layout.tsx:7` (import).
- App-entry ancestors: `app/(public)/events/[slug]/page.tsx`, `app/(public)/podcasts/[slug]/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `42fc9e4da97dbce7bb80740757ce567b249849e3889cf7085983f8714838bd35`.

<a id="c351"></a>

## `components/share-button.tsx`

- Responsibility / candidate ownership: Share a podcast with podcast-specific text or copy its URL, using notification feedback / Podcasts.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `default: ShareButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:12` (import).
- App-entry ancestors: `app/(public)/podcasts/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/lib/notifications` → `lib/notifications.ts` (import, line 5).
- Hooks called: None found.
- JSX components: `Button`, `Share2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `13a8a20de73e31b7b9be73f5831d0f58778a3e74e42c921b9baec3cfa7d291a0`.

<a id="c352"></a>

## `components/social-icons.tsx`

- Responsibility / candidate ownership: Export social-network SVG icons consumed by public and admin presentation / Cross-domain icon presentation.
- Usage / observed scope: USED / public + admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Facebook`, `Twitter`, `Instagram`, `Youtube`, `Linkedin`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:5` (import); `app/(public)/stories/[slug]/page.tsx:6` (import); `components/admin/podcast-form.tsx:14` (import); `components/admin/site-settings-form.tsx:44` (import); `components/footer.tsx:8` (import); `components/podcasts/podcast-card.tsx:7` (import); `components/podcasts/podcast-guest-card.tsx:4` (import); `components/podcasts/podcast-hero-section.tsx:6` (import); `components/podcasts/podcast-main-hero.tsx:6` (import).
- App-entry ancestors: `app/(public)/layout.tsx`, `app/(public)/podcasts/[slug]/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, type-only, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `100a4faa24d885890386f8c44166c21e97023f6bc1baaf156f3d96ddf8c57824`.

<a id="c353"></a>

## `components/stories-carousel.tsx`

- Responsibility / candidate ownership: Render horizontally scrollable story links and navigation controls / Stories; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `StoriesCarousel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next/image` → `package` (import, line 4); `next/link` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: `useRef`, `useState`, `useCallback`, `useEffect`.
- JSX components: `ChevronLeft`, `ChevronRight`, `Link`, `Image`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d68c50da6a3495e245c5c429565c7989efd1437912ccf4ec193264efda7b1092`.

<a id="c354"></a>

## `components/support-form.tsx`

- Responsibility / candidate ownership: Collect support issues and screenshots with browser-context submission data / Support.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `SupportForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/support/page.tsx:15` (import).
- App-entry ancestors: `app/(public)/support/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/ui/fancy-select` → `components/ui/fancy-select.tsx` (import, line 8); `@/lib/notifications` → `lib/notifications.ts` (import, line 9).
- Hooks called: `useState`, `useRef`, `useEffect`, `useMemo`.
- JSX components: `CheckCircle`, `Sparkles`, `Button`, `Bug`, `FancySelect`, `FileImage`, `X`, `Loader2`.
- Browser-name signals (not semantic proof): `window`, `navigator`.
- Source hash: `6c4ecd18c858ac4913201a90a2fb311ed37cac2def19aeb7d612c660a5a85f52`.

<a id="c355"></a>

## `components/theme-provider.tsx`

- Responsibility / candidate ownership: Wrap next-themes as an application theme provider / Theme infrastructure; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ThemeProvider`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `next-themes` → `package` (import, line 4).
- Hooks called: None found.
- JSX components: `NextThemesProvider`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7c1edcfa7a0614bfc279aeb8ce3e60e0642b1c24a6ff3d4d03d3e256efc95b20`.

<a id="c356"></a>

## `components/ui/accordion.tsx`

- Responsibility / candidate ownership: Wrap Radix accordion roots/items/triggers/content / Generic UI.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/home-faqs.tsx:4` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-accordion` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `AccordionPrimitive.Root`, `AccordionPrimitive.Item`, `AccordionPrimitive.Header`, `AccordionPrimitive.Trigger`, `ChevronDownIcon`, `AccordionPrimitive.Content`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `789b258bfc80b22f9634539e5b7b8d06acb68eb2842347326fdfb5b9eed79d93`.

<a id="c357"></a>

## `components/ui/alert-dialog.tsx`

- Responsibility / candidate ownership: Wrap Radix confirmation-dialog primitives with button variants / Generic UI.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-user-edit-form.tsx:12` (import); `components/admin/confirm-dialog.tsx:3` (import); `components/admin/delete-podcast-button.tsx:7` (import); `components/admin/delete-story-button.tsx:7` (import); `components/admin/homepage-manager-client.tsx:33` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:10` (import); `components/admin/media-library-client.tsx:18` (import); `components/admin/media-picker.tsx:16` (import); `components/admin/partner-actions.tsx:6` (import); `components/admin/project-actions.tsx:12` (import); `components/admin/stat-actions.tsx:6` (import); `components/admin/support/delete-support-button.tsx:7` (import); `components/events/admin/EmailTemplateEditor.tsx:11` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/media/page.tsx`, `app/admin/partners/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/[id]/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-alert-dialog` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7).
- Hooks called: None found.
- JSX components: `AlertDialogPrimitive.Root`, `AlertDialogPrimitive.Trigger`, `AlertDialogPrimitive.Portal`, `AlertDialogPrimitive.Overlay`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogPrimitive.Content`, `AlertDialogPrimitive.Title`, `AlertDialogPrimitive.Description`, `AlertDialogPrimitive.Action`, `AlertDialogPrimitive.Cancel`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8181c7be76533bb5e1d721274cf16bcc07dbe25c521aa6f15e01fe8a302eb481`.

<a id="c358"></a>

## `components/ui/alert.tsx`

- Responsibility / candidate ownership: Compose styled alert title/description variants / Generic UI.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Alert`, `AlertTitle`, `AlertDescription`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:20` (import); `app/admin/login/page.tsx:10` (import); `app/admin/payments/alerts/alerts-client.tsx:7` (import); `app/admin/payments/emails/failed/failed-emails-client.tsx:7` (import); `app/admin/payments/monitoring/monitoring-client.tsx:4` (import); `app/admin/payments/receipts/failed/failed-receipts-client.tsx:7` (import); `app/admin/payments/system/system-health-client.tsx:7` (import); `components/admin/admin-user-edit-form.tsx:10` (import); `components/admin/admin-user-form.tsx:10` (import); `components/admin/conference-form-builder/EventSelector.tsx:7` (import); `components/admin/donations/review-action-dialog.tsx:15` (import); `components/admin/donations/review-dashboard-client.tsx:7` (import); `components/admin/donations/status-change-modal.tsx:15` (import); `components/admin/event-form.tsx:13` (import); `components/admin/partner-form.tsx:11` (import); `components/admin/password-form.tsx:7` (import); `components/admin/profile-form.tsx:7` (import); `components/admin/project-form.tsx:12` (import); `components/admin/rich-text-editor/image-dialog.tsx:18` (import); `components/admin/rich-text-editor/link-dialog.tsx:16` (import); `components/admin/rich-text-editor/video-dialog.tsx:16` (import); `components/admin/stat-form.tsx:10` (import); `components/admin/story-form.tsx:11` (import); `components/admin/team-member-form.tsx:11` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/login/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/alerts/page.tsx`, `app/admin/payments/emails/failed/page.tsx`, `app/admin/payments/monitoring/page.tsx`, `app/admin/payments/receipts/failed/page.tsx`, `app/admin/payments/system/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/users/[id]/page.tsx`, `app/admin/users/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `class-variance-authority` → `package` (import, line 2); `@/lib/utils` → `lib/utils.ts` (import, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `dce4f80f612a79389688cc8f765cccde46d5af4881ea899cc694187ac386757a`.

<a id="c359"></a>

## `components/ui/animated-brush-quote.tsx`

- Responsibility / candidate ownership: Compose an animated quote over BrushStroke decoration / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `AnimatedBrushQuote`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `framer-motion` → `package` (import, line 3); `@/components/ui/brush-stroke` → `components/ui/brush-stroke.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `BrushStroke`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `564c41e97f03ee99d3877df7609af0056e27c753b7033fb3914156f3b80759ec`.

<a id="c360"></a>

## `components/ui/aspect-ratio.tsx`

- Responsibility / candidate ownership: Expose the Radix aspect-ratio primitive / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `AspectRatio`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@radix-ui/react-aspect-ratio` → `package` (import, line 3).
- Hooks called: None found.
- JSX components: `AspectRatioPrimitive.Root`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `09035a9c5b8211fffd34f06a6ec44e053b0d753390e40aea970cb59773176714`.

<a id="c361"></a>

## `components/ui/avatar.tsx`

- Responsibility / candidate ownership: Wrap avatar image/fallback presentation / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Avatar`, `AvatarImage`, `AvatarFallback`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-avatar` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `AvatarPrimitive.Root`, `AvatarPrimitive.Image`, `AvatarPrimitive.Fallback`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9effa6f9decfeb6230e20958c815cdfef8bd84f6ec6aafc8e2e87c5e4c64b4b2`.

<a id="c362"></a>

## `components/ui/badge.tsx`

- Responsibility / candidate ownership: Compose badge variants with optional Slot rendering / Generic UI.
- Usage / observed scope: USED / admin + demo + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Badge`, `badgeVariants`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/[id]/page.tsx:20` (import); `app/admin/conference/forms/page.tsx:7` (import); `app/admin/conference/page.tsx:3` (import); `app/admin/contacts/page.tsx:3` (import); `app/admin/donations/review/audit/page.tsx:5` (import); `app/admin/events/[id]/page-new.tsx:5` (import); `app/admin/events/[id]/registrations/[registrationId]/page.tsx:18` (import); `app/admin/events/page.tsx:7` (import); `app/admin/newsletter/page.tsx:3` (import); `app/admin/page.tsx:3` (import); `app/admin/partners/page.tsx:5` (import); `app/admin/payments/alerts/alerts-client.tsx:5` (import); `app/admin/payments/emails/failed/failed-emails-client.tsx:6` (import); `app/admin/payments/logs/logs-client.tsx:7` (import); `app/admin/payments/metrics/metrics-client.tsx:4` (import); `app/admin/payments/monitoring/monitoring-client.tsx:5` (import); `app/admin/payments/receipts/failed/failed-receipts-client.tsx:6` (import); `app/admin/payments/system/system-health-client.tsx:6` (import); `app/admin/podcasts/page.tsx:6` (import); `app/admin/profile/page.tsx:8` (import); `app/admin/programs/[id]/edit/page.tsx:13` (import); `app/admin/programs/page.tsx:8` (import); `app/admin/projects/page.tsx:5` (import); `app/admin/stats/page.tsx:5` (import); `app/admin/stories/page.tsx:5` (import); `app/admin/support/[id]/page.tsx:11` (import); `app/admin/support/page.tsx:4` (import); `app/admin/users/page.tsx:7` (import); `app/admin/volunteers/page.tsx:5` (import); `app/demo/brand-toolkit/page.tsx:4` (import); `app/demo/errors/page.tsx:6` (import); `components/admin/about-manager/AboutManagerClient.tsx:6` (import); `components/admin/artworks/artworks-manager-client.tsx:21` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:12` (import); `components/admin/conference-form-builder/EventSelector.tsx:6` (import); `components/admin/conference-form-builder/FormSchemaViewer.tsx:11` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:18` (import); `components/admin/dashboard/activity-feed.tsx:4` (import); `components/admin/dashboard/event-capacity-chart.tsx:4` (import); `components/admin/dashboard/pending-actions.tsx:4` (import); `components/admin/dashboard/system-health-card.tsx:4` (import); `components/admin/donations/activity-timeline.tsx:6` (import); `components/admin/donations/donations-table-client.tsx:5` (import); `components/admin/donations/review-dashboard-client.tsx:6` (import); `components/admin/donations/review-status-card.tsx:5` (import); `components/admin/donations/transaction-header.tsx:5` (import); `components/admin/donations/transaction-overview.tsx:4` (import); `components/admin/homepage-manager-client.tsx:12` (import); `components/admin/homepage-manager/HomepageManagerClient.tsx:7` (import); `components/admin/media-library-client.tsx:7` (import); `components/admin/media-picker.tsx:27` (import); `components/admin/notification-bell-realtime.tsx:12` (import); `components/admin/notification-bell.tsx:12` (import); `components/admin/notification-center-client.tsx:8` (import); `components/admin/payments/payment-detail-client.tsx:29` (import); `components/admin/payments/payments-table-client.tsx:6` (import); `components/admin/podcast-form.tsx:10` (import); `components/admin/program-sections/ProgramMediaLibrary.tsx:11` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:8` (import); `components/admin/program-sections/SortableSectionCard.tsx:12` (import); `components/admin/program-sections/VersionHistoryPanel.tsx:9` (import); `components/admin/program-sections/index.tsx:18` (import); `components/admin/site-settings-form.tsx:51` (import); `components/admin/support/support-detail-client.tsx:6` (import); `components/admin/team-table.tsx:7` (import); `components/error-pages/GenericErrorPage.tsx:7` (import); `components/error-pages/UnauthorizedErrorPage.tsx:6` (import); `components/events/admin/EmailTemplateEditor.tsx:9` (import); `components/events/admin/EventCommunicationLog.tsx:5` (import); `components/events/admin/EventFormBuilder/index.tsx:20` (import); `components/events/admin/EventMediaForm.tsx:9` (import); `components/events/admin/EventPaymentInfo.tsx:22` (import); `components/events/admin/EventSettingsClient.tsx:8` (import); `components/events/admin/EventSettingsPanel.tsx:8` (import); `components/events/admin/EventSettingsWrapper.tsx:5` (import); `components/events/admin/PricingEditor.tsx:7` (import); `components/events/admin/RegistrationsTable.tsx:7` (import).
- App-entry ancestors: `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/[id]/page.tsx`, `app/admin/conference/forms/page.tsx`, `app/admin/conference/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/contacts/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/donations/review/audit/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/layout.tsx`, `app/admin/media/page.tsx`, `app/admin/newsletter/page.tsx`, `app/admin/notifications/page.tsx`, `app/admin/page.tsx`, `app/admin/partners/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/alerts/page.tsx`, `app/admin/payments/emails/failed/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/payments/metrics/page.tsx`, `app/admin/payments/monitoring/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/payments/receipts/failed/page.tsx`, `app/admin/payments/system/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/podcasts/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/support/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/page.tsx`, `app/admin/volunteers/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/errors/generic/page.tsx`, `app/demo/errors/page.tsx`, `app/demo/errors/unauthorized/page.tsx`, `app/error.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@radix-ui/react-slot` → `package` (import, line 2); `class-variance-authority` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: None found.
- JSX components: `Comp`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `92dfe1cb7278ffac5c23656e33d0827da93b067724f377923f618c248204fa67`.

<a id="c363"></a>

## `components/ui/breadcrumb.tsx`

- Responsibility / candidate ownership: Render breadcrumb navigation from labels, links and current-item flags / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `BreadcrumbItem`, `Breadcrumb`, `BreadcrumbContainer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 8); `lucide-react` → `package` (import, line 9); `@/lib/utils` → `lib/utils.ts` (import, line 10).
- Hooks called: None found.
- JSX components: `ChevronRight`, `Link`, `Home`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `968ece1657d018a89a44bb1ac9c1263026628dbd6df66af694583e2eb7d261c0`.

<a id="c364"></a>

## `components/ui/brush-stroke.tsx`

- Responsibility / candidate ownership: Render configurable animated brush decoration using GSAP/ScrollTrigger / Generic UI.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `BrushStroke`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/impact/ImpactClientPage.tsx:7` (import); `app/(public)/our-story/AnimatedBrushQuote.tsx:5` (import); `app/(public)/our-story/page.tsx:6` (import); `components/homepage-sections.tsx:40` (import); `components/ui/animated-brush-quote.tsx:4` (import).
- App-entry ancestors: `app/(public)/impact/page.tsx`, `app/(public)/our-story/page.tsx`, `app/(public)/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `gsap` → `package` (import, line 4); `gsap/ScrollTrigger` → `package` (import, line 5).
- Hooks called: `useRef`, `useEffect`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ec46d8e0fade498aa0d7b5901e2224397876a8556c6a4c18aa949268ad6dbaf1`.

<a id="c365"></a>

## `components/ui/button-group.tsx`

- Responsibility / candidate ownership: Compose grouped buttons with text/separator variants / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@radix-ui/react-slot` → `package` (import, line 1); `class-variance-authority` → `package` (import, line 2); `@/lib/utils` → `lib/utils.ts` (import, line 4); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `Comp`, `Separator`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `07203100cedafa78bd03b8ffe71559d29c35bfe7ea034449ed21d1008907cc0e`.

<a id="c366"></a>

## `components/ui/button.tsx`

- Responsibility / candidate ownership: Compose button variants with optional Slot rendering / Generic UI.
- Usage / observed scope: USED / public + admin + demo + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Button`, `buttonVariants`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/contact/page.tsx:4` (import); `app/(public)/donate/cancel/page.tsx:4` (import); `app/(public)/donate/page.tsx:5` (import); `app/(public)/donate/success/success-content.tsx:17` (import); `app/(public)/get-involved/page.tsx:7` (import); `app/(public)/payments/khalti/return/page.tsx:6` (import); `app/(public)/podcasts/[slug]/page.tsx:10` (import); `app/(public)/podcasts/page.tsx:9` (import); `app/(public)/press/page.tsx:4` (import); `app/(public)/stories/[slug]/page.tsx:8` (import); `app/(public)/support/page.tsx:14` (import); `app/(public)/whatwedo/[slug]/error.tsx:5` (import); `app/(public)/whatwedo/[slug]/not-found.tsx:3` (import); `app/(public)/whatwedo/error.tsx:5` (import); `app/admin/cms/page.tsx:5` (import); `app/admin/conference/forms/page.tsx:17` (import); `app/admin/donations/page.tsx:3` (import); `app/admin/donations/review/page.tsx:5` (import); `app/admin/events/[id]/page-new.tsx:6` (import); `app/admin/events/new/page.tsx:6` (import); `app/admin/events/page.tsx:5` (import); `app/admin/login/page.tsx:6` (import); `app/admin/partners/page.tsx:3` (import); `app/admin/payments/alerts/alerts-client.tsx:6` (import); `app/admin/payments/emails/failed/failed-emails-client.tsx:5` (import); `app/admin/payments/logs/logs-client.tsx:5` (import); `app/admin/payments/metrics/metrics-client.tsx:5` (import); `app/admin/payments/monitoring/monitoring-client.tsx:6` (import); `app/admin/payments/operations/page.tsx:4` (import); `app/admin/payments/page.tsx:3` (import); `app/admin/payments/receipts/failed/failed-receipts-client.tsx:5` (import); `app/admin/payments/system/system-health-client.tsx:5` (import); `app/admin/podcasts/[id]/page.tsx:7` (import); `app/admin/podcasts/new/page.tsx:7` (import); `app/admin/podcasts/page.tsx:4` (import); `app/admin/programs/[id]/edit/page.tsx:10` (import); `app/admin/programs/[id]/preview/page.tsx:4` (import); `app/admin/programs/new/page.tsx:7` (import); `app/admin/programs/page.tsx:6` (import); `app/admin/projects/page.tsx:3` (import); `app/admin/stats/page.tsx:3` (import); `app/admin/stories/page.tsx:3` (import); `app/admin/support/page.tsx:10` (import); `app/admin/team/page.tsx:3` (import); `app/admin/users/page.tsx:5` (import); `app/demo/brand-toolkit/page.tsx:3` (import); `app/demo/errors/page.tsx:4` (import); `app/demo/page.tsx:2` (import); `app/demo/toasts/page.tsx:3` (import); `components/admin/CampaignEditForm.tsx:5` (import); `components/admin/OutreachEditForm.tsx:5` (import); `components/admin/ResearchEditForm.tsx:5` (import); `components/admin/ServiceEditForm.tsx:6` (import); `components/admin/about-manager/AboutManagerClient.tsx:5` (import); `components/admin/admin-header.tsx:6` (import); `components/admin/admin-user-edit-form.tsx:5` (import); `components/admin/admin-user-form.tsx:5` (import); `components/admin/artworks/artworks-manager-client.tsx:20` (import); `components/admin/conference-form-builder.tsx:11` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:8` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:4` (import); `components/admin/conference-notes.tsx:7` (import); `components/admin/conference-quick-actions.tsx:20` (import); `components/admin/conference-settings-form.tsx:9` (import); `components/admin/conference-status-actions.tsx:14` (import); `components/admin/delete-podcast-button.tsx:6` (import); `components/admin/delete-story-button.tsx:6` (import); `components/admin/donations/activity-timeline.tsx:5` (import); `components/admin/donations/donations-table-client.tsx:6` (import); `components/admin/donations/error-boundary.tsx:4` (import); `components/admin/donations/payment-technical.tsx:5` (import); `components/admin/donations/review-action-dialog.tsx:12` (import); `components/admin/donations/review-dashboard-client.tsx:5` (import); `components/admin/donations/review-notes-section.tsx:5` (import); `components/admin/donations/status-change-modal.tsx:12` (import); `components/admin/donations/transaction-header.tsx:4` (import); `components/admin/event-form.tsx:5` (import); `components/admin/file-upload.tsx:5` (import); `components/admin/form-canvas.tsx:5` (import); `components/admin/form-field-editor.tsx:5` (import); `components/admin/form-field-palette.tsx:6` (import); `components/admin/form-preview.tsx:6` (import); `components/admin/form-step-editor.tsx:6` (import); `components/admin/gallery-manager.tsx:5` (import); `components/admin/homepage-manager-client.tsx:5` (import); `components/admin/homepage-manager/HomepageManagerClient.tsx:5` (import); `components/admin/homepage-manager/components/BannersManager.tsx:7` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:7` (import); `components/admin/homepage-manager/components/ColorPicker.tsx:5` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:6` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:8` (import); `components/admin/homepage-manager/components/HeroManager.tsx:7` (import); `components/admin/homepage-manager/components/ProgramsManager.tsx:7` (import); `components/admin/homepage-manager/components/StatsManager.tsx:4` (import); `components/admin/homepage-manager/components/StoryManager.tsx:8` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:8` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:8` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:7` (import); `components/admin/homepage-manager/components/WhatWeDoManager.tsx:7` (import); `components/admin/internal-note-modal.tsx:5` (import); `components/admin/media-library-client.tsx:4` (import); `components/admin/media-picker.tsx:4` (import); `components/admin/notification-bell-realtime.tsx:6` (import); `components/admin/notification-bell.tsx:6` (import); `components/admin/notification-center-client.tsx:6` (import); `components/admin/organization-settings-form.tsx:4` (import); `components/admin/partner-actions.tsx:5` (import); `components/admin/partner-form.tsx:5` (import); `components/admin/password-form.tsx:4` (import); `components/admin/payment-settings-form.tsx:6` (import); `components/admin/payments/payment-detail-client.tsx:31` (import); `components/admin/payments/payments-table-client.tsx:7` (import); `components/admin/podcast-form.tsx:5` (import); `components/admin/profile-form.tsx:4` (import); `components/admin/program-sections/AssetPicker.tsx:5` (import); `components/admin/program-sections/ProgramMediaLibrary.tsx:8` (import); `components/admin/program-sections/SectionList.tsx:5` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:4` (import); `components/admin/program-sections/SectionTypePicker.tsx:9` (import); `components/admin/program-sections/SortableSectionCard.tsx:11` (import); `components/admin/program-sections/VersionHistoryPanel.tsx:8` (import); `components/admin/program-sections/forms/ActivitiesSectionForm.tsx:4` (import); `components/admin/program-sections/forms/CTASectionForm.tsx:4` (import); `components/admin/program-sections/forms/FAQSectionForm.tsx:4` (import); `components/admin/program-sections/forms/FactsBarSectionForm.tsx:4` (import); `components/admin/program-sections/forms/FeaturesSectionForm.tsx:4` (import); `components/admin/program-sections/forms/GallerySectionForm.tsx:4` (import); `components/admin/program-sections/forms/ResourcesSectionForm.tsx:4` (import); `components/admin/program-sections/forms/StatsSectionForm.tsx:4` (import); `components/admin/program-sections/forms/StepsSectionForm.tsx:4` (import); `components/admin/program-sections/forms/StorySectionForm.tsx:4` (import); `components/admin/program-sections/forms/WhoWeSupportSectionForm.tsx:4` (import); `components/admin/program-sections/index.tsx:17` (import); `components/admin/project-actions.tsx:4` (import); `components/admin/project-form.tsx:5` (import); `components/admin/reply-modal.tsx:5` (import); `components/admin/rich-text-editor/bubble-toolbar.tsx:4` (import); `components/admin/rich-text-editor/image-dialog.tsx:13` (import); `components/admin/rich-text-editor/link-dialog.tsx:13` (import); `components/admin/rich-text-editor/table-dialog.tsx:12` (import); `components/admin/rich-text-editor/toolbar.tsx:5` (import); `components/admin/rich-text-editor/video-dialog.tsx:13` (import); `components/admin/setup-form.tsx:6` (import); `components/admin/site-settings-form.tsx:5` (import); `components/admin/stat-actions.tsx:5` (import); `components/admin/stat-form.tsx:5` (import); `components/admin/story-form.tsx:5` (import); `components/admin/story-preview-modal.tsx:4` (import); `components/admin/support-actions.tsx:4` (import); `components/admin/support-toggle-modal.tsx:5` (import); `components/admin/support/assign-modal.tsx:5` (import); `components/admin/support/delete-support-button.tsx:6` (import); `components/admin/support/show-archived-button.tsx:5` (import); `components/admin/support/support-detail-client.tsx:7` (import); `components/admin/team-delete-button.tsx:5` (import); `components/admin/team-member-form.tsx:5` (import); `components/admin/team-table.tsx:6` (import); `components/admin/video-picker.tsx:4` (import); `components/admin/volunteer-actions.tsx:4` (import); `components/conference/fields/field-file.tsx:5` (import); `components/conference/fields/field-repeating.tsx:5` (import); `components/conference/fields/field-signature.tsx:7` (import); `components/contact-form.tsx:7` (import); `components/development-notice-modal.tsx:6` (import); `components/donation-amount-picker.tsx:6` (import); `components/donation/bank-transfer-panel.tsx:7` (import); `components/donation/donation-form.tsx:7` (import); `components/error-pages/GenericErrorPage.tsx:4` (import); `components/error-pages/NetworkErrorPage.tsx:4` (import); `components/error-pages/NotFoundErrorPage.tsx:6` (import); `components/error-pages/ServerErrorPage.tsx:5` (import); `components/error-pages/UnauthorizedErrorPage.tsx:4` (import); `components/event-registration-modal.tsx:7` (import); `components/events/admin/AgendaEditor.tsx:4` (import); `components/events/admin/EmailTemplateEditor.tsx:4` (import); `components/events/admin/EventCheckInButton.tsx:14` (import); `components/events/admin/EventCommunicationLog.tsx:6` (import); `components/events/admin/EventDeleteRegistrationButton.tsx:6` (import); `components/events/admin/EventDetailsForm.tsx:5` (import); `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:7` (import); `components/events/admin/EventFormBuilder/FormCanvas.tsx:7` (import); `components/events/admin/EventFormBuilder/OptionsEditor.tsx:6` (import); `components/events/admin/EventFormBuilder/SchemaImportExport.tsx:4` (import); `components/events/admin/EventFormBuilder/index.tsx:19` (import); `components/events/admin/EventLocationForm.tsx:4` (import); `components/events/admin/EventMediaForm.tsx:5` (import); `components/events/admin/EventPaymentInfo.tsx:32` (import); `components/events/admin/EventRegistrationEmailActions.tsx:26` (import); `components/events/admin/EventRegistrationNotes.tsx:10` (import); `components/events/admin/EventSettingsClient.tsx:6` (import); `components/events/admin/EventSettingsPanel.tsx:6` (import); `components/events/admin/EventSettingsWrapper.tsx:6` (import); `components/events/admin/EventStatusActions.tsx:22` (import); `components/events/admin/PricingEditor.tsx:4` (import); `components/events/admin/RegistrationsTable.tsx:17` (import); `components/events/public/EventError.tsx:5` (import); `components/hero-carousel.tsx:8` (import); `components/homepage-sections.tsx:38` (import); `components/navbar.tsx:23` (import); `components/newsletter-form.tsx:7` (import); `components/podcasts/episodes-page-content.tsx:10` (import); `components/podcasts/podcast-archive-section.tsx:10` (import); `components/podcasts/podcast-filter-sidebar.tsx:5` (import); `components/podcasts/podcast-grid.tsx:8` (import); `components/podcasts/podcast-guest-card.tsx:5` (import); `components/podcasts/podcast-hero-section.tsx:7` (import); `components/podcasts/podcast-latest-episode.tsx:7` (import); `components/podcasts/podcast-main-hero.tsx:7` (import); `components/podcasts/podcast-section.tsx:9` (import); `components/podcasts/podcast-sticky-player.tsx:5` (import); `components/receipt-preview.tsx:5` (import); `components/resource-downloads.tsx:2` (import); `components/share-button.tsx:4` (import); `components/support-form.tsx:7` (import); `components/ui/alert-dialog.tsx:7` (import); `components/ui/calendar.tsx:12` (import); `components/ui/carousel.tsx:10` (import); `components/ui/event-card.tsx:5` (import); `components/ui/input-group.tsx:6` (import); `components/ui/location-picker.tsx:7` (import); `components/ui/pagination.tsx:9` (import); `components/ui/print-button.tsx:4` (import); `components/ui/project-card.tsx:5` (import); `components/ui/sidebar.tsx:10` (import); `components/volunteer-form.tsx:7` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/contact/page.tsx`, `app/(public)/demo/program-editor/page.tsx`, `app/(public)/donate/cancel/page.tsx`, `app/(public)/donate/page.tsx`, `app/(public)/donate/success/page.tsx`, `app/(public)/events/[slug]/error.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/(public)/events/error.tsx`, `app/(public)/events/not-found.tsx`, `app/(public)/get-involved/page.tsx`, `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/(public)/payments/khalti/return/page.tsx`, `app/(public)/podcasts/[slug]/page.tsx`, `app/(public)/podcasts/episodes/page.tsx`, `app/(public)/podcasts/page.tsx`, `app/(public)/press/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/(public)/support/page.tsx`, `app/(public)/whatwedo/[slug]/error.tsx`, `app/(public)/whatwedo/[slug]/not-found.tsx`, `app/(public)/whatwedo/error.tsx`, `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/cms/page.tsx`, `app/admin/conference/[id]/page.tsx`, `app/admin/conference/forms/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/conference/settings/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/events/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/admin/media/page.tsx`, `app/admin/notifications/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/partners/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/alerts/page.tsx`, `app/admin/payments/emails/failed/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/payments/metrics/page.tsx`, `app/admin/payments/monitoring/page.tsx`, `app/admin/payments/operations/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/payments/receipts/failed/page.tsx`, `app/admin/payments/system/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/podcasts/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/[id]/preview/page.tsx`, `app/admin/programs/new/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/setup/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/support/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/[id]/page.tsx`, `app/admin/users/new/page.tsx`, `app/admin/users/page.tsx`, `app/admin/volunteers/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/errors/generic/page.tsx`, `app/demo/errors/network/page.tsx`, `app/demo/errors/page.tsx`, `app/demo/errors/server/page.tsx`, `app/demo/errors/unauthorized/page.tsx`, `app/demo/page.tsx`, `app/demo/toasts/page.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@radix-ui/react-slot` → `package` (import, line 2); `class-variance-authority` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: None found.
- JSX components: `Comp`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `26091929e1eb3ec66d29e93b12d4424fd88b2073ecbb0b76d2aae9df945312c0`.

<a id="c367"></a>

## `components/ui/calendar.tsx`

- Responsibility / candidate ownership: Adapt react-day-picker with application controls and focused day rendering / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Calendar`, `CalendarDayButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/ui/date-picker.tsx:7` (import).
- App-entry ancestors: `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `react-day-picker` → `package` (import, line 9); `@/lib/utils` → `lib/utils.ts` (import, line 11); `@/components/ui/button` → `components/ui/button.tsx` (import, line 12).
- Hooks called: `React.useRef`, `React.useEffect`.
- JSX components: `DayPicker`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronDownIcon`, `Button`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `11b817aaa791d8ebd39a882f80827a7d4a99c6d451c8b836a81b186fcb2de87a`.

<a id="c368"></a>

## `components/ui/card.tsx`

- Responsibility / candidate ownership: Compose card container/header/content/footer presentation / Generic UI.
- Usage / observed scope: USED / public + admin + demo + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/press/page.tsx:5` (import); `app/admin/cms/page.tsx:4` (import); `app/admin/conference/[id]/page.tsx:21` (import); `app/admin/conference/forms/page.tsx:8` (import); `app/admin/conference/page.tsx:4` (import); `app/admin/contacts/page.tsx:2` (import); `app/admin/donations/[id]/loading.tsx:1` (import); `app/admin/donations/review/audit/page.tsx:4` (import); `app/admin/events/[id]/loading.tsx:1` (import); `app/admin/events/[id]/page-new.tsx:4` (import); `app/admin/events/[id]/page.tsx:4` (import); `app/admin/events/[id]/registrations/[registrationId]/page.tsx:19` (import); `app/admin/events/loading.tsx:1` (import); `app/admin/events/new/page.tsx:10` (import); `app/admin/events/page.tsx:6` (import); `app/admin/login/page.tsx:9` (import); `app/admin/newsletter/page.tsx:2` (import); `app/admin/page.tsx:2` (import); `app/admin/partners/page.tsx:4` (import); `app/admin/payments/alerts/alerts-client.tsx:4` (import); `app/admin/payments/emails/failed/failed-emails-client.tsx:4` (import); `app/admin/payments/logs/logs-client.tsx:4` (import); `app/admin/payments/metrics/metrics-client.tsx:3` (import); `app/admin/payments/monitoring/monitoring-client.tsx:3` (import); `app/admin/payments/operations/page.tsx:3` (import); `app/admin/payments/receipts/failed/failed-receipts-client.tsx:4` (import); `app/admin/payments/system/system-health-client.tsx:4` (import); `app/admin/podcasts/[id]/page.tsx:3` (import); `app/admin/podcasts/new/page.tsx:3` (import); `app/admin/podcasts/page.tsx:5` (import); `app/admin/profile/page.tsx:6` (import); `app/admin/programs/new/page.tsx:8` (import); `app/admin/programs/page.tsx:7` (import); `app/admin/projects/page.tsx:4` (import); `app/admin/stats/page.tsx:4` (import); `app/admin/stories/page.tsx:4` (import); `app/admin/support/[id]/page.tsx:10` (import); `app/admin/support/page.tsx:3` (import); `app/admin/users/page.tsx:6` (import); `app/admin/volunteers/page.tsx:4` (import); `app/demo/brand-toolkit/page.tsx:7` (import); `app/demo/errors/page.tsx:5` (import); `app/demo/page.tsx:1` (import); `app/demo/toasts/page.tsx:4` (import); `components/admin/about-manager/AboutManagerClient.tsx:7` (import); `components/admin/admin-user-edit-form.tsx:7` (import); `components/admin/admin-user-form.tsx:8` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:13` (import); `components/admin/conference-form-builder/FormSchemaViewer.tsx:12` (import); `components/admin/conference-settings-form.tsx:8` (import); `components/admin/dashboard/activity-feed.tsx:3` (import); `components/admin/dashboard/content-activity-chart.tsx:3` (import); `components/admin/dashboard/dashboard-stat-card.tsx:3` (import); `components/admin/dashboard/donation-by-category-chart.tsx:3` (import); `components/admin/dashboard/donation-trend-chart.tsx:3` (import); `components/admin/dashboard/event-capacity-chart.tsx:3` (import); `components/admin/dashboard/fundraising-progress-chart.tsx:3` (import); `components/admin/dashboard/monthly-vs-onetime-chart.tsx:3` (import); `components/admin/dashboard/pending-actions.tsx:3` (import); `components/admin/dashboard/provider-breakdown-chart.tsx:3` (import); `components/admin/dashboard/system-health-card.tsx:3` (import); `components/admin/dashboard/volunteer-skills-chart.tsx:3` (import); `components/admin/donations/activity-timeline.tsx:4` (import); `components/admin/donations/donations-table-client.tsx:4` (import); `components/admin/donations/donor-information.tsx:3` (import); `components/admin/donations/error-boundary.tsx:5` (import); `components/admin/donations/payment-technical.tsx:4` (import); `components/admin/donations/review-dashboard-client.tsx:4` (import); `components/admin/donations/review-notes-section.tsx:4` (import); `components/admin/donations/review-status-card.tsx:4` (import); `components/admin/donations/transaction-overview.tsx:3` (import); `components/admin/event-form.tsx:9` (import); `components/admin/gallery-manager.tsx:8` (import); `components/admin/homepage-manager-client.tsx:9` (import); `components/admin/homepage-manager/components/BannersManager.tsx:3` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:3` (import); `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx:3` (import); `components/admin/homepage-manager/components/FlagsManager.tsx:3` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:3` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:4` (import); `components/admin/homepage-manager/components/HeroManager.tsx:3` (import); `components/admin/homepage-manager/components/MarqueeManager.tsx:3` (import); `components/admin/homepage-manager/components/ProgramsManager.tsx:3` (import); `components/admin/homepage-manager/components/SEOManager.tsx:3` (import); `components/admin/homepage-manager/components/StatsManager.tsx:7` (import); `components/admin/homepage-manager/components/StoryManager.tsx:4` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:4` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:4` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:3` (import); `components/admin/homepage-manager/components/WhatWeDoManager.tsx:3` (import); `components/admin/media-library-client.tsx:6` (import); `components/admin/notification-center-client.tsx:7` (import); `components/admin/partner-form.tsx:9` (import); `components/admin/payment-settings-form.tsx:7` (import); `components/admin/payments/payment-detail-client.tsx:30` (import); `components/admin/payments/payments-table-client.tsx:5` (import); `components/admin/podcast-form.tsx:9` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:9` (import); `components/admin/project-form.tsx:9` (import); `components/admin/settings-tabs.tsx:9` (import); `components/admin/site-settings-form.tsx:9` (import); `components/admin/stat-form.tsx:8` (import); `components/admin/story-form.tsx:9` (import); `components/admin/support-toggle-modal.tsx:6` (import); `components/admin/support-toggle.tsx:6` (import); `components/admin/support/support-detail-client.tsx:5` (import); `components/admin/team-member-form.tsx:9` (import); `components/admin/team-table.tsx:10` (import); `components/admin/video-picker.tsx:16` (import); `components/error-pages/GenericErrorPage.tsx:5` (import); `components/error-pages/UnauthorizedErrorPage.tsx:5` (import); `components/events/admin/EmailTemplateEditor.tsx:8` (import); `components/events/admin/EventDetailsForm.tsx:9` (import); `components/events/admin/EventLocationForm.tsx:7` (import); `components/events/admin/EventMediaForm.tsx:8` (import); `components/events/admin/EventPaymentInfo.tsx:23` (import); `components/events/admin/EventSettingsClient.tsx:7` (import); `components/events/admin/EventSettingsPanel.tsx:7` (import); `components/events/admin/EventSettingsWrapper.tsx:4` (import); `components/events/admin/RegistrationsTable.tsx:8` (import); `components/resource-downloads.tsx:3` (import).
- App-entry ancestors: `app/(public)/press/page.tsx`, `app/admin/about/page.tsx`, `app/admin/cms/page.tsx`, `app/admin/conference/[id]/page.tsx`, `app/admin/conference/forms/page.tsx`, `app/admin/conference/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/conference/settings/page.tsx`, `app/admin/contacts/page.tsx`, `app/admin/donations/[id]/loading.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/donations/review/audit/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/loading.tsx`, `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/loading.tsx`, `app/admin/events/new/page.tsx`, `app/admin/events/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/login/page.tsx`, `app/admin/media/page.tsx`, `app/admin/newsletter/page.tsx`, `app/admin/notifications/page.tsx`, `app/admin/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/partners/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/alerts/page.tsx`, `app/admin/payments/emails/failed/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/payments/metrics/page.tsx`, `app/admin/payments/monitoring/page.tsx`, `app/admin/payments/operations/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/payments/receipts/failed/page.tsx`, `app/admin/payments/system/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/podcasts/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/new/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/support/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/[id]/page.tsx`, `app/admin/users/new/page.tsx`, `app/admin/users/page.tsx`, `app/admin/volunteers/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/errors/generic/page.tsx`, `app/demo/errors/page.tsx`, `app/demo/errors/unauthorized/page.tsx`, `app/demo/page.tsx`, `app/demo/toasts/page.tsx`, `app/error.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `541ffffc9e6533063116770ae651e359b41de8546c52a29a3b560074878a37db`.

<a id="c369"></a>

## `components/ui/carousel.tsx`

- Responsibility / candidate ownership: Wrap Embla carousel state, context and navigation controls / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `CarouselApi`, `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `embla-carousel-react` → `package` (import, line 4); `lucide-react` → `package` (import, line 7); `@/lib/utils` → `lib/utils.ts` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 10).
- Hooks called: `React.useContext`, `useEmblaCarousel`, `React.useState`, `React.useCallback`, `React.useEffect`, `useCarousel`.
- JSX components: `CarouselContext.Provider`, `Button`, `ArrowLeft`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `67237a35be1473c2436d9438a17330e183bf720e84391dd8d0a00a73f289a371`.

<a id="c370"></a>

## `components/ui/chart.tsx`

- Responsibility / candidate ownership: Provide Recharts configuration context, theme styles, tooltip and legend wrappers / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `ChartConfig`, `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/dashboard/content-activity-chart.tsx:4` (import); `components/admin/dashboard/donation-by-category-chart.tsx:4` (import); `components/admin/dashboard/donation-trend-chart.tsx:5` (import); `components/admin/dashboard/event-capacity-chart.tsx:5` (import); `components/admin/dashboard/fundraising-progress-chart.tsx:4` (import); `components/admin/dashboard/monthly-vs-onetime-chart.tsx:4` (import); `components/admin/dashboard/provider-breakdown-chart.tsx:4` (import); `components/admin/dashboard/volunteer-skills-chart.tsx:5` (import).
- App-entry ancestors: `app/admin/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `recharts` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: `React.useContext`, `React.useId`, `useChart`, `React.useMemo`.
- JSX components: `ChartContext.Provider`, `ChartStyle`, `RechartsPrimitive.ResponsiveContainer`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0d1015da32cad5bcf8b19ecb4464bfada1faf005ead1db5107410f33a4b1ac77`.

<a id="c371"></a>

## `components/ui/checkbox.tsx`

- Responsibility / candidate ownership: Wrap Radix checkbox and indicator / Generic UI.
- Usage / observed scope: USED / public + admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Checkbox`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/podcast-form.tsx:11` (import); `components/podcasts/episodes-page-content.tsx:11` (import); `components/podcasts/podcast-archive-section.tsx:9` (import); `components/podcasts/podcast-filter-sidebar.tsx:6` (import).
- App-entry ancestors: `app/(public)/podcasts/episodes/page.tsx`, `app/(public)/podcasts/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-checkbox` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `CheckboxPrimitive.Root`, `CheckboxPrimitive.Indicator`, `CheckIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f4629326151cdb4fefbb8d49ff20bcc3ffab3f791fb31b795937650877eae212`.

<a id="c372"></a>

## `components/ui/collapsible.tsx`

- Responsibility / candidate ownership: Expose Radix collapsible controls / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@radix-ui/react-collapsible` → `package` (import, line 3).
- Hooks called: None found.
- JSX components: `CollapsiblePrimitive.Root`, `CollapsiblePrimitive.CollapsibleTrigger`, `CollapsiblePrimitive.CollapsibleContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `89d052508dd671fdc6c823cc299a53537edd00c7067ae9508a2af0a8eeb4348b`.

<a id="c373"></a>

## `components/ui/command.tsx`

- Responsibility / candidate ownership: Compose cmdk command search/list controls and dialog wrapper / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `cmdk` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7); `@/components/ui/dialog` → `components/ui/dialog.tsx` (import, line 8).
- Hooks called: None found.
- JSX components: `CommandPrimitive`, `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogContent`, `Command`, `SearchIcon`, `CommandPrimitive.Input`, `CommandPrimitive.List`, `CommandPrimitive.Empty`, `CommandPrimitive.Group`, `CommandPrimitive.Separator`, `CommandPrimitive.Item`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `803aa420db4170238043ca1b9f1fd88f285f1b83f3ff2c0c5abff217df316896`.

<a id="c374"></a>

## `components/ui/context-menu.tsx`

- Responsibility / candidate ownership: Wrap Radix context-menu items, submenus and selection controls / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-context-menu` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `ContextMenuPrimitive.Root`, `ContextMenuPrimitive.Trigger`, `ContextMenuPrimitive.Group`, `ContextMenuPrimitive.Portal`, `ContextMenuPrimitive.Sub`, `ContextMenuPrimitive.RadioGroup`, `ContextMenuPrimitive.SubTrigger`, `ChevronRightIcon`, `ContextMenuPrimitive.SubContent`, `ContextMenuPrimitive.Content`, `ContextMenuPrimitive.Item`, `ContextMenuPrimitive.CheckboxItem`, `ContextMenuPrimitive.ItemIndicator`, `CheckIcon`, `ContextMenuPrimitive.RadioItem`, `CircleIcon`, `ContextMenuPrimitive.Label`, `ContextMenuPrimitive.Separator`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `ef3f8b668e7abee8ea18ea66317d067a5f3590a3bdfb7be937df5838e69602e8`.

<a id="c375"></a>

## `components/ui/date-picker.tsx`

- Responsibility / candidate ownership: Select a date through a calendar popover / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DatePicker`, `DatePickerProps`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/ui/date-time-picker.tsx:7` (import).
- App-entry ancestors: `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `date-fns` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/components/ui/calendar` → `components/ui/calendar.tsx` (import, line 7); `@/components/ui/popover` → `components/ui/popover.tsx` (import, line 8).
- Hooks called: `React.useState`.
- JSX components: `Popover`, `PopoverTrigger`, `CalendarIcon`, `PopoverContent`, `Calendar`, `X`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `f52c0fc31436c0bd955fe530ab3f4c20eba63b9eddac351783f9011f7ca4b8c0`.

<a id="c376"></a>

## `components/ui/date-time-picker.tsx`

- Responsibility / candidate ownership: Compose date/time inputs with configurable granularity / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DateTimePicker`, `DateTimePickerProps`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:19` (import); `components/admin/event-form.tsx:12` (import); `components/events/admin/EventDetailsForm.tsx:12` (import); `components/events/admin/PricingEditor.tsx:9` (import).
- App-entry ancestors: `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `date-fns` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/components/ui/date-picker` → `components/ui/date-picker.tsx` (import, line 7); `@/components/ui/time-picker` → `components/ui/time-picker.tsx` (import, line 8).
- Hooks called: None found.
- JSX components: `DatePicker`, `TimePicker`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9075940956be31ca73a44acd4ab7129442e0d1a5575dd8df1394cd98f4346d2f`.

<a id="c377"></a>

## `components/ui/detail-row.tsx`

- Responsibility / candidate ownership: Render a label with scalar/list/empty value presentation / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `DetailRow`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/[id]/registrations/[registrationId]/page.tsx:21` (import).
- App-entry ancestors: `app/admin/events/[id]/registrations/[registrationId]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `5f7d3721e1973304c7280ab7c9c0913aa1545a6c04d76b31bdc6429f4eab4c09`.

<a id="c378"></a>

## `components/ui/dialog.tsx`

- Responsibility / candidate ownership: Wrap Radix dialog, overlay and close controls / Generic UI.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/programs/[id]/edit/page.tsx:17` (import); `components/admin/artworks/artworks-manager-client.tsx:26` (import); `components/admin/conference-form-builder/FormSchemaViewer.tsx:4` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:5` (import); `components/admin/conference-quick-actions.tsx:12` (import); `components/admin/conference-status-actions.tsx:6` (import); `components/admin/donations/review-action-dialog.tsx:4` (import); `components/admin/donations/review-notes-section.tsx:12` (import); `components/admin/donations/status-change-modal.tsx:4` (import); `components/admin/internal-note-modal.tsx:4` (import); `components/admin/media-picker.tsx:8` (import); `components/admin/payments/payment-detail-client.tsx:32` (import); `components/admin/program-sections/ProgramMediaLibrary.tsx:12` (import); `components/admin/program-sections/SectionTypePicker.tsx:10` (import); `components/admin/program-sections/VersionHistoryPanel.tsx:10` (import); `components/admin/reply-modal.tsx:4` (import); `components/admin/rich-text-editor/image-dialog.tsx:5` (import); `components/admin/rich-text-editor/link-dialog.tsx:5` (import); `components/admin/rich-text-editor/table-dialog.tsx:4` (import); `components/admin/rich-text-editor/video-dialog.tsx:5` (import); `components/admin/site-settings-form.tsx:12` (import); `components/admin/story-preview-modal.tsx:3` (import); `components/admin/support-screenshot-modal.tsx:4` (import); `components/admin/support-toggle-modal.tsx:4` (import); `components/admin/support/assign-modal.tsx:6` (import); `components/admin/video-picker.tsx:8` (import); `components/admin/volunteer-actions.tsx:12` (import); `components/development-notice-modal.tsx:7` (import); `components/events/admin/AgendaEditor.tsx:8` (import); `components/events/admin/EventCheckInButton.tsx:6` (import); `components/events/admin/EventFormBuilder/SchemaImportExport.tsx:5` (import); `components/events/admin/EventMediaForm.tsx:10` (import); `components/events/admin/EventPaymentInfo.tsx:24` (import); `components/events/admin/EventRegistrationEmailActions.tsx:18` (import); `components/events/admin/EventSettingsClient.tsx:40` (import); `components/events/admin/EventSettingsPanel.tsx:9` (import); `components/events/admin/EventStatusActions.tsx:14` (import); `components/events/admin/PricingEditor.tsx:10` (import); `components/ui/command.tsx:8` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/(public)/layout.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/[id]/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/media/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/volunteers/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-dialog` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `DialogPrimitive.Root`, `DialogPrimitive.Trigger`, `DialogPrimitive.Portal`, `DialogPrimitive.Close`, `DialogPrimitive.Overlay`, `DialogPortal`, `DialogOverlay`, `DialogPrimitive.Content`, `XIcon`, `DialogPrimitive.Title`, `DialogPrimitive.Description`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2341f5d3379758c9659806e518299f9a3dc394128571e379ed83941deae83403`.

<a id="c379"></a>

## `components/ui/drawer.tsx`

- Responsibility / candidate ownership: Wrap Vaul drawer presentation / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `vaul` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `DrawerPrimitive.Root`, `DrawerPrimitive.Trigger`, `DrawerPrimitive.Portal`, `DrawerPrimitive.Close`, `DrawerPrimitive.Overlay`, `DrawerPortal`, `DrawerOverlay`, `DrawerPrimitive.Content`, `DrawerPrimitive.Title`, `DrawerPrimitive.Description`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e62592bd1cea50ad95ebeba32a165f9cfdf5a5c6431067ec74e024b83a866f01`.

<a id="c380"></a>

## `components/ui/dropdown-menu.tsx`

- Responsibility / candidate ownership: Wrap Radix dropdown-menu content and selection controls / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-header.tsx:7` (import); `components/admin/media-library-client.tsx:11` (import); `components/admin/notification-bell-realtime.tsx:7` (import); `components/admin/notification-bell.tsx:7` (import); `components/admin/project-actions.tsx:5` (import); `components/admin/support-actions.tsx:5` (import); `components/admin/support/support-detail-client.tsx:10` (import); `components/admin/volunteer-actions.tsx:5` (import); `components/events/admin/EventFormBuilder/SortableFieldCard.tsx:32` (import); `components/events/admin/RegistrationsTable.tsx:18` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/layout.tsx`, `app/admin/media/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/volunteers/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-dropdown-menu` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `DropdownMenuPrimitive.Root`, `DropdownMenuPrimitive.Portal`, `DropdownMenuPrimitive.Trigger`, `DropdownMenuPrimitive.Content`, `DropdownMenuPrimitive.Group`, `DropdownMenuPrimitive.Item`, `DropdownMenuPrimitive.CheckboxItem`, `DropdownMenuPrimitive.ItemIndicator`, `CheckIcon`, `DropdownMenuPrimitive.RadioGroup`, `DropdownMenuPrimitive.RadioItem`, `CircleIcon`, `DropdownMenuPrimitive.Label`, `DropdownMenuPrimitive.Separator`, `DropdownMenuPrimitive.Sub`, `DropdownMenuPrimitive.SubTrigger`, `ChevronRightIcon`, `DropdownMenuPrimitive.SubContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3124a8b0edfe90400cf4d14d438dfe6ac3af9ec9a6181feee10f48390aeb1815`.

<a id="c381"></a>

## `components/ui/empty.tsx`

- Responsibility / candidate ownership: Compose an empty-state surface with media/title/description/content / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyMedia`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `class-variance-authority` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c9828acce9044690059524bee2e67dec68710baed7bfa1f6c787ca86413112d6`.

<a id="c382"></a>

## `components/ui/event-card.tsx`

- Responsibility / candidate ownership: Present event date/time/location/category with explicit link and verification display / Events presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `EventCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `Image`, `CheckCircle`, `Share2`, `Clock`, `MapPin`, `Button`, `Link`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d256429b8ab104fc6ddff842b9959449a119d74c5bb7705f192e7cd8a5f185b9`.

<a id="c383"></a>

## `components/ui/fancy-select.tsx`

- Responsibility / candidate ownership: Implement a keyboard-controlled styled option selector / Generic UI.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `FancySelect`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/accessibility/tts-controls.tsx:32` (import); `components/admin/admin-user-edit-form.tsx:8` (import); `components/admin/admin-user-form.tsx:9` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:10` (import); `components/admin/conference-form-builder/EventSelector.tsx:5` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:14` (import); `components/admin/conference-settings-form.tsx:10` (import); `components/admin/donations/donations-table-client.tsx:8` (import); `components/admin/donations/review-status-card.tsx:6` (import); `components/admin/donations/status-change-modal.tsx:14` (import); `components/admin/event-form.tsx:10` (import); `components/admin/form-conditional-editor.tsx:4` (import); `components/admin/form-field-palette.tsx:7` (import); `components/admin/homepage-manager-client.tsx:11` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:8` (import); `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx:5` (import); `components/admin/homepage-manager/components/FlagsManager.tsx:5` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:7` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:10` (import); `components/admin/homepage-manager/components/MarqueeManager.tsx:6` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:9` (import); `components/admin/media-library-client.tsx:10` (import); `components/admin/notification-center-client.tsx:9` (import); `components/admin/partner-form.tsx:12` (import); `components/admin/payment-settings-form.tsx:10` (import); `components/admin/payments/payments-table-client.tsx:9` (import); `components/admin/project-form.tsx:10` (import); `components/admin/rich-text-editor/image-dialog.tsx:17` (import); `components/admin/rich-text-editor/toolbar.tsx:7` (import); `components/admin/stat-form.tsx:11` (import); `components/admin/support/assign-modal.tsx:15` (import); `components/conference/fields/field-select.tsx:4` (import); `components/conference/step2-participation.tsx:3` (import); `components/conference/step3-additional-info.tsx:3` (import); `components/events/admin/EventDetailsForm.tsx:10` (import); `components/podcasts/episodes-page-content.tsx:12` (import); `components/support-form.tsx:8` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/demo/accessibility-test/page.tsx`, `app/(public)/demo/program-editor/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/(public)/layout.tsx`, `app/(public)/podcasts/episodes/page.tsx`, `app/(public)/support/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/conference/settings/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/media/page.tsx`, `app/admin/notifications/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/users/[id]/page.tsx`, `app/admin/users/new/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: `useId`, `useState`, `useRef`, `useCallback`, `useEffect`.
- JSX components: `ChevronDown`, `Check`.
- Browser-name signals (not semantic proof): `document`.
- Source hash: `ea86fb00d8cf6c353d08144f0ec278e38199f1e79c67914e9e5d88ea1fa4b132`.

<a id="c384"></a>

## `components/ui/field.tsx`

- Responsibility / candidate ownership: Compose fieldsets, labels, descriptions and deduplicated error output / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `class-variance-authority` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6); `@/components/ui/label` → `components/ui/label.tsx` (import, line 7); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 8).
- Hooks called: `useMemo`.
- JSX components: `Label`, `Separator`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c80fb0dc554855fd84ac91ad30f724127a066ad2156b1846dc46ee5811ee9135`.

<a id="c385"></a>

## `components/ui/form.tsx`

- Responsibility / candidate ownership: Connect React Hook Form context/controllers to labeled error-aware form controls / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `useFormField`, `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-label` → `package` (import, line 4); `@radix-ui/react-slot` → `package` (import, line 5); `react-hook-form` → `package` (import, line 6); `@/lib/utils` → `lib/utils.ts` (import, line 16); `@/components/ui/label` → `components/ui/label.tsx` (import, line 17).
- Hooks called: `React.useContext`, `useFormContext`, `useFormState`, `React.useId`, `useFormField`.
- JSX components: `FormFieldContext.Provider`, `Controller`, `FormItemContext.Provider`, `Label`, `Slot`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e308b9b592b4c89895a14077bd3254811cab67bb580286b1bd7428cb476b6df3`.

<a id="c386"></a>

## `components/ui/hover-card.tsx`

- Responsibility / candidate ownership: Wrap Radix hover-card primitives / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-hover-card` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `HoverCardPrimitive.Root`, `HoverCardPrimitive.Trigger`, `HoverCardPrimitive.Portal`, `HoverCardPrimitive.Content`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3a05918eaf7436596e09562f4d5371384e15f2f27c9ef0788354035282d96064`.

<a id="c387"></a>

## `components/ui/initiative-card.tsx`

- Responsibility / candidate ownership: Present an image/icon/title/description link with hover reveal and no domain API / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `InitiativeCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4).
- Hooks called: None found.
- JSX components: `Link`, `Image`, `Icon`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `36ed58fb93d2eb88bd114af93ec9ffaaf5b5972018706fca3bf4787aa9acaf00`.

<a id="c388"></a>

## `components/ui/input-group.tsx`

- Responsibility / candidate ownership: Compose inputs/textareas with addons, text and action buttons / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `class-variance-authority` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 5); `@/components/ui/button` → `components/ui/button.tsx` (import, line 6); `@/components/ui/input` → `components/ui/input.tsx` (import, line 7); `@/components/ui/textarea` → `components/ui/textarea.tsx` (import, line 8).
- Hooks called: None found.
- JSX components: `Button`, `Input`, `Textarea`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9214c077d8d253331da82bffdb36edb778abc73d27b34dff0eb544e6d7b9d386`.

<a id="c389"></a>

## `components/ui/input-otp.tsx`

- Responsibility / candidate ownership: Wrap OTP input slots, grouping and separators / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `input-otp` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: `React.useContext`.
- JSX components: `OTPInput`, `MinusIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6a046b50c82c554699c148a9f4922c785b200fb87f067772f166e80c59e813ca`.

<a id="c390"></a>

## `components/ui/input.tsx`

- Responsibility / candidate ownership: Style a native input while forwarding native props / Generic UI.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Input`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/podcasts/[slug]/page.tsx:11` (import); `app/admin/events/new/page.tsx:7` (import); `app/admin/events/page.tsx:8` (import); `app/admin/login/page.tsx:7` (import); `app/admin/payments/logs/logs-client.tsx:6` (import); `app/admin/programs/[id]/edit/page.tsx:11` (import); `app/admin/programs/new/page.tsx:9` (import); `app/admin/programs/page.tsx:9` (import); `app/demo/brand-toolkit/page.tsx:5` (import); `app/demo/toasts/page.tsx:5` (import); `components/admin/CampaignEditForm.tsx:6` (import); `components/admin/OutreachEditForm.tsx:6` (import); `components/admin/ResearchEditForm.tsx:6` (import); `components/admin/ServiceEditForm.tsx:7` (import); `components/admin/about-manager/AboutManagerClient.tsx:9` (import); `components/admin/admin-user-form.tsx:6` (import); `components/admin/artworks/artworks-manager-client.tsx:22` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:11` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:15` (import); `components/admin/donations/donations-table-client.tsx:7` (import); `components/admin/event-form.tsx:6` (import); `components/admin/file-upload.tsx:6` (import); `components/admin/gallery-manager.tsx:6` (import); `components/admin/homepage-manager-client.tsx:6` (import); `components/admin/homepage-manager/components/BannersManager.tsx:5` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:5` (import); `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx:6` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:5` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:6` (import); `components/admin/homepage-manager/components/HeroManager.tsx:5` (import); `components/admin/homepage-manager/components/MarqueeManager.tsx:5` (import); `components/admin/homepage-manager/components/ProgramsManager.tsx:5` (import); `components/admin/homepage-manager/components/SEOManager.tsx:5` (import); `components/admin/homepage-manager/components/StatsManager.tsx:5` (import); `components/admin/homepage-manager/components/StoryManager.tsx:6` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:6` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:6` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:5` (import); `components/admin/homepage-manager/components/WhatWeDoManager.tsx:5` (import); `components/admin/media-library-client.tsx:5` (import); `components/admin/media-picker.tsx:5` (import); `components/admin/organization-settings-form.tsx:5` (import); `components/admin/partner-form.tsx:6` (import); `components/admin/password-form.tsx:5` (import); `components/admin/payments/payments-table-client.tsx:8` (import); `components/admin/podcast-form.tsx:6` (import); `components/admin/profile-form.tsx:5` (import); `components/admin/program-sections/AssetPicker.tsx:6` (import); `components/admin/program-sections/ImageMetadataFields.tsx:5` (import); `components/admin/program-sections/ProgramMediaLibrary.tsx:9` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:5` (import); `components/admin/program-sections/forms/ActivitiesSectionForm.tsx:5` (import); `components/admin/program-sections/forms/CTASectionForm.tsx:5` (import); `components/admin/program-sections/forms/FAQSectionForm.tsx:5` (import); `components/admin/program-sections/forms/FactsBarSectionForm.tsx:5` (import); `components/admin/program-sections/forms/FeaturesSectionForm.tsx:5` (import); `components/admin/program-sections/forms/GallerySectionForm.tsx:5` (import); `components/admin/program-sections/forms/ProgressTrackerSectionForm.tsx:3` (import); `components/admin/program-sections/forms/QuoteSectionForm.tsx:3` (import); `components/admin/program-sections/forms/ResourcesSectionForm.tsx:5` (import); `components/admin/program-sections/forms/StatsSectionForm.tsx:5` (import); `components/admin/program-sections/forms/StepsSectionForm.tsx:5` (import); `components/admin/program-sections/forms/StorySectionForm.tsx:5` (import); `components/admin/program-sections/forms/WhoWeSupportSectionForm.tsx:5` (import); `components/admin/project-form.tsx:6` (import); `components/admin/rich-text-editor/image-dialog.tsx:14` (import); `components/admin/rich-text-editor/link-dialog.tsx:14` (import); `components/admin/rich-text-editor/table-dialog.tsx:13` (import); `components/admin/rich-text-editor/video-dialog.tsx:14` (import); `components/admin/setup-form.tsx:7` (import); `components/admin/site-settings-form.tsx:6` (import); `components/admin/stat-form.tsx:6` (import); `components/admin/story-form.tsx:6` (import); `components/admin/team-member-form.tsx:6` (import); `components/admin/team-table.tsx:8` (import); `components/admin/video-picker.tsx:5` (import); `components/conference/fields/field-date-range.tsx:4` (import); `components/conference/fields/field-date.tsx:4` (import); `components/conference/fields/field-url.tsx:4` (import); `components/events/admin/AgendaEditor.tsx:5` (import); `components/events/admin/EmailTemplateEditor.tsx:5` (import); `components/events/admin/EventDetailsForm.tsx:6` (import); `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:4` (import); `components/events/admin/EventFormBuilder/OptionsEditor.tsx:5` (import); `components/events/admin/EventLocationForm.tsx:5` (import); `components/events/admin/EventMediaForm.tsx:7` (import); `components/events/admin/EventRegistrationEmailActions.tsx:27` (import); `components/events/admin/PricingEditor.tsx:5` (import); `components/events/admin/RegistrationsTable.tsx:6` (import); `components/podcasts/podcast-transcript.tsx:5` (import); `components/ui/input-group.tsx:7` (import); `components/ui/location-picker.tsx:6` (import); `components/ui/sidebar.tsx:11` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/demo/program-editor/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/(public)/podcasts/[slug]/page.tsx`, `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/events/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/login/page.tsx`, `app/admin/media/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/new/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/setup/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/new/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/toasts/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b67dea8a8d35c004c6d94c22aacbbf2340b0e536c614e4c87a69d8814a7b4502`.

<a id="c391"></a>

## `components/ui/item.tsx`

- Responsibility / candidate ownership: Compose list-item media, content, metadata and actions / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Item`, `ItemMedia`, `ItemContent`, `ItemActions`, `ItemGroup`, `ItemSeparator`, `ItemTitle`, `ItemDescription`, `ItemHeader`, `ItemFooter`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@radix-ui/react-slot` → `package` (import, line 2); `class-variance-authority` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 5); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 6).
- Hooks called: None found.
- JSX components: `Separator`, `Comp`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c4f50ecab61ee02224a432f2e5e7cafc1941913640134abade00e3db82512baf`.

<a id="c392"></a>

## `components/ui/kbd.tsx`

- Responsibility / candidate ownership: Render keyboard shortcut keys and groups / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Kbd`, `KbdGroup`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3e346d9b84a0e2cbafb6311589d4dfcf0df6c1c8f94fca26ff4c34dfa4170823`.

<a id="c393"></a>

## `components/ui/label.tsx`

- Responsibility / candidate ownership: Style a Radix label primitive / Generic UI.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Label`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:8` (import); `app/admin/login/page.tsx:8` (import); `app/admin/programs/[id]/edit/page.tsx:12` (import); `app/admin/programs/new/page.tsx:10` (import); `app/demo/toasts/page.tsx:7` (import); `components/admin/CampaignEditForm.tsx:7` (import); `components/admin/OutreachEditForm.tsx:7` (import); `components/admin/ResearchEditForm.tsx:7` (import); `components/admin/ServiceEditForm.tsx:8` (import); `components/admin/about-manager/AboutManagerClient.tsx:8` (import); `components/admin/admin-user-edit-form.tsx:6` (import); `components/admin/admin-user-form.tsx:7` (import); `components/admin/artworks/artworks-manager-client.tsx:23` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:9` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:16` (import); `components/admin/donations/review-action-dialog.tsx:14` (import); `components/admin/event-form.tsx:7` (import); `components/admin/file-upload.tsx:7` (import); `components/admin/gallery-manager.tsx:7` (import); `components/admin/homepage-manager-client.tsx:7` (import); `components/admin/homepage-manager/components/BannersManager.tsx:4` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:4` (import); `components/admin/homepage-manager/components/ColorPicker.tsx:4` (import); `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx:4` (import); `components/admin/homepage-manager/components/FlagsManager.tsx:4` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:4` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:5` (import); `components/admin/homepage-manager/components/HeroManager.tsx:4` (import); `components/admin/homepage-manager/components/MarqueeManager.tsx:4` (import); `components/admin/homepage-manager/components/ProgramsManager.tsx:4` (import); `components/admin/homepage-manager/components/SEOManager.tsx:4` (import); `components/admin/homepage-manager/components/StatsManager.tsx:6` (import); `components/admin/homepage-manager/components/StoryManager.tsx:5` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:5` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:5` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:4` (import); `components/admin/homepage-manager/components/WhatWeDoManager.tsx:4` (import); `components/admin/media-picker.tsx:6` (import); `components/admin/organization-settings-form.tsx:6` (import); `components/admin/partner-form.tsx:7` (import); `components/admin/password-form.tsx:6` (import); `components/admin/payment-settings-form.tsx:8` (import); `components/admin/podcast-form.tsx:7` (import); `components/admin/profile-form.tsx:6` (import); `components/admin/program-sections/AssetPicker.tsx:7` (import); `components/admin/program-sections/ImageMetadataFields.tsx:6` (import); `components/admin/program-sections/ProgramMediaLibrary.tsx:10` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:6` (import); `components/admin/program-sections/forms/ActivitiesSectionForm.tsx:6` (import); `components/admin/program-sections/forms/CTASectionForm.tsx:6` (import); `components/admin/program-sections/forms/FAQSectionForm.tsx:6` (import); `components/admin/program-sections/forms/FactsBarSectionForm.tsx:6` (import); `components/admin/program-sections/forms/FeaturesSectionForm.tsx:6` (import); `components/admin/program-sections/forms/GallerySectionForm.tsx:6` (import); `components/admin/program-sections/forms/ProgressTrackerSectionForm.tsx:4` (import); `components/admin/program-sections/forms/QuoteSectionForm.tsx:4` (import); `components/admin/program-sections/forms/ResourcesSectionForm.tsx:6` (import); `components/admin/program-sections/forms/RichTextSectionForm.tsx:3` (import); `components/admin/program-sections/forms/StatsSectionForm.tsx:6` (import); `components/admin/program-sections/forms/StepsSectionForm.tsx:6` (import); `components/admin/program-sections/forms/StorySectionForm.tsx:6` (import); `components/admin/program-sections/forms/WhoWeSupportSectionForm.tsx:6` (import); `components/admin/project-form.tsx:7` (import); `components/admin/rich-text-editor/image-dialog.tsx:15` (import); `components/admin/rich-text-editor/link-dialog.tsx:15` (import); `components/admin/rich-text-editor/table-dialog.tsx:14` (import); `components/admin/rich-text-editor/video-dialog.tsx:15` (import); `components/admin/setup-form.tsx:8` (import); `components/admin/site-settings-form.tsx:7` (import); `components/admin/stat-form.tsx:7` (import); `components/admin/story-form.tsx:7` (import); `components/admin/support-toggle.tsx:5` (import); `components/admin/team-member-form.tsx:7` (import); `components/admin/video-picker.tsx:6` (import); `components/conference/fields/field-date-range.tsx:5` (import); `components/conference/fields/field-date.tsx:5` (import); `components/conference/fields/field-file.tsx:4` (import); `components/conference/fields/field-rating.tsx:5` (import); `components/conference/fields/field-repeating.tsx:4` (import); `components/conference/fields/field-rich-text.tsx:8` (import); `components/conference/fields/field-signature.tsx:6` (import); `components/conference/fields/field-slider.tsx:4` (import); `components/conference/fields/field-url.tsx:5` (import); `components/events/admin/AgendaEditor.tsx:6` (import); `components/events/admin/EmailTemplateEditor.tsx:6` (import); `components/events/admin/EventDetailsForm.tsx:7` (import); `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:5` (import); `components/events/admin/EventLocationForm.tsx:6` (import); `components/events/admin/EventMediaForm.tsx:6` (import); `components/events/admin/PricingEditor.tsx:6` (import); `components/ui/field.tsx:7` (import); `components/ui/form.tsx:17` (import).
- App-entry ancestors: `app/(public)/conference/register/page.tsx`, `app/(public)/demo/program-editor/page.tsx`, `app/(public)/events/[slug]/register/page.tsx`, `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/login/page.tsx`, `app/admin/media/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/new/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/setup/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/users/[id]/page.tsx`, `app/admin/users/new/page.tsx`, `app/demo/toasts/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-label` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `LabelPrimitive.Root`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `dfd466a53a86f0bd002050d33e96b5385ac4e102e93485ff8d9943fdc2fbeb12`.

<a id="c394"></a>

## `components/ui/location-picker.tsx`

- Responsibility / candidate ownership: Select coordinates using map tiles, pan/zoom, coordinate inputs and geolocation / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `LocationPicker`, `LocationPickerProps`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 5); `@/components/ui/input` → `components/ui/input.tsx` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7).
- Hooks called: `React.useState`, `React.useRef`.
- JSX components: `MapPin`, `X`, `Search`, `Input`, `Button`, `LocateFixed`, `Plus`, `Minus`, `Globe`.
- Browser-name signals (not semantic proof): `navigator`.
- Source hash: `5950507851d9a3c4d2c6947f4d34f2eca1ee668067bb24d98bb4f2920429653d`.

<a id="c395"></a>

## `components/ui/menubar.tsx`

- Responsibility / candidate ownership: Wrap Radix menubar menus and selection controls / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Menubar`, `MenubarPortal`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarGroup`, `MenubarSeparator`, `MenubarLabel`, `MenubarItem`, `MenubarShortcut`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-menubar` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `MenubarPrimitive.Root`, `MenubarPrimitive.Menu`, `MenubarPrimitive.Group`, `MenubarPrimitive.Portal`, `MenubarPrimitive.RadioGroup`, `MenubarPrimitive.Trigger`, `MenubarPortal`, `MenubarPrimitive.Content`, `MenubarPrimitive.Item`, `MenubarPrimitive.CheckboxItem`, `MenubarPrimitive.ItemIndicator`, `CheckIcon`, `MenubarPrimitive.RadioItem`, `CircleIcon`, `MenubarPrimitive.Label`, `MenubarPrimitive.Separator`, `MenubarPrimitive.Sub`, `MenubarPrimitive.SubTrigger`, `ChevronRightIcon`, `MenubarPrimitive.SubContent`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `da0313c01c8aedd722c4bb1cbd4723acef6187cda4de0ea230cff90d6aebcf2e`.

<a id="c396"></a>

## `components/ui/navigation-menu.tsx`

- Responsibility / candidate ownership: Wrap Radix navigation-menu triggers/content/viewport / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@radix-ui/react-navigation-menu` → `package` (import, line 2); `class-variance-authority` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `NavigationMenuPrimitive.Root`, `NavigationMenuViewport`, `NavigationMenuPrimitive.List`, `NavigationMenuPrimitive.Item`, `NavigationMenuPrimitive.Trigger`, `ChevronDownIcon`, `NavigationMenuPrimitive.Content`, `NavigationMenuPrimitive.Viewport`, `NavigationMenuPrimitive.Link`, `NavigationMenuPrimitive.Indicator`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `39bd2c3d7086a76e2b2b9a7a3968ebe1d2932604e99a7484b9a1c9579fd64146`.

<a id="c397"></a>

## `components/ui/pagination.tsx`

- Responsibility / candidate ownership: Compose pagination links, previous/next actions and ellipsis / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/utils` → `lib/utils.ts` (import, line 8); `@/components/ui/button` → `components/ui/button.tsx` (import, line 9).
- Hooks called: None found.
- JSX components: `PaginationLink`, `ChevronLeftIcon`, `ChevronRightIcon`, `MoreHorizontalIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `c0306e3325a10c7377794b1b75fffb57179be1f19a3b3b3b0e0d79dde53b4ecf`.

<a id="c398"></a>

## `components/ui/popover.tsx`

- Responsibility / candidate ownership: Wrap Radix popover trigger/anchor/content / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/page.tsx:6` (import); `components/admin/homepage-manager/components/ColorPicker.tsx:6` (import); `components/ui/date-picker.tsx:8` (import); `components/ui/time-picker.tsx:6` (import).
- App-entry ancestors: `app/admin/conference/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/homepage/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-popover` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `PopoverPrimitive.Root`, `PopoverPrimitive.Trigger`, `PopoverPrimitive.Portal`, `PopoverPrimitive.Content`, `PopoverPrimitive.Anchor`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `50b93b8af040517d766f9ee6d0dffeacf40b5082469bba7e5d49a7f9eb5aaa37`.

<a id="c399"></a>

## `components/ui/print-button.tsx`

- Responsibility / candidate ownership: Invoke browser print from a configurable button / Generic UI.
- Usage / observed scope: USED / public + admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `PrintButton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/stories/[slug]/page.tsx:9` (import); `components/admin/story-form.tsx:13` (import).
- App-entry ancestors: `app/(public)/stories/[slug]/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 3); `@/components/ui/button` → `components/ui/button.tsx` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: None found.
- JSX components: `Button`, `Printer`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `13250c2ec1114b0b421645722537733ef96a7cc1759bae49357e492aba26417e`.

<a id="c400"></a>

## `components/ui/progress.tsx`

- Responsibility / candidate ownership: Render a Radix progress indicator / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Progress`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/stats/page.tsx:9` (import).
- App-entry ancestors: `app/admin/stats/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-progress` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `ProgressPrimitive.Root`, `ProgressPrimitive.Indicator`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `d48446fe6380e0fb272988c37992a4633b7002dd7e8faa639993f38e010953aa`.

<a id="c401"></a>

## `components/ui/project-card.tsx`

- Responsibility / candidate ownership: Present project status, location, fundraising and metrics with a destination / Projects presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ProjectCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4); `@/components/ui/button` → `components/ui/button.tsx` (import, line 5).
- Hooks called: None found.
- JSX components: `Icon`, `Image`, `MapPin`, `Button`, `Link`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0ac1b6bd0e64a3c24a22ecee64bd322a3f70c6d47a13b7824cd5f68e72a4edf7`.

<a id="c402"></a>

## `components/ui/radio-group.tsx`

- Responsibility / candidate ownership: Wrap Radix radio-group choices / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `RadioGroup`, `RadioGroupItem`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-radio-group` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `RadioGroupPrimitive.Root`, `RadioGroupPrimitive.Item`, `RadioGroupPrimitive.Indicator`, `CircleIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `9a91313aaed0e8358c69fad89d12a1f5d148bd7fa5ffbed925e6f8b368617ba9`.

<a id="c403"></a>

## `components/ui/resizable.tsx`

- Responsibility / candidate ownership: Wrap resizable panel groups/panels/handles / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `react-resizable-panels` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `ResizablePrimitive.PanelGroup`, `ResizablePrimitive.Panel`, `ResizablePrimitive.PanelResizeHandle`, `GripVerticalIcon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8f96f309d60fb87c09afbfba79c43326324379859e2bc27e1d26594a886ec908`.

<a id="c404"></a>

## `components/ui/scroll-area.tsx`

- Responsibility / candidate ownership: Wrap Radix scrolling viewport and scrollbars / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `ScrollArea`, `ScrollBar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/conference-form-builder/FormSchemaViewer.tsx:13` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:19` (import); `components/admin/media-library-client.tsx:9` (import); `components/admin/media-picker.tsx:26` (import); `components/admin/notification-bell-realtime.tsx:13` (import); `components/admin/notification-bell.tsx:13` (import); `components/admin/program-sections/SectionTypePicker.tsx:13` (import); `components/admin/site-settings-form.tsx:11` (import).
- App-entry ancestors: `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/layout.tsx`, `app/admin/media/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-scroll-area` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `ScrollAreaPrimitive.Root`, `ScrollAreaPrimitive.Viewport`, `ScrollBar`, `ScrollAreaPrimitive.Corner`, `ScrollAreaPrimitive.ScrollAreaScrollbar`, `ScrollAreaPrimitive.ScrollAreaThumb`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4d19b093a16635687d128e2157c8f5bac50b2391cbe031e07ec1e2d53f4d73a3`.

<a id="c405"></a>

## `components/ui/section.tsx`

- Responsibility / candidate ownership: Wrap content in a semantic section with shared spacing/container styles / Generic UI.
- Usage / observed scope: USED / public.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Section`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/donate/cancel/page.tsx:5` (import); `app/(public)/donate/page.tsx:4` (import); `app/(public)/donate/success/page.tsx:2` (import); `app/(public)/get-involved/page.tsx:6` (import); `app/(public)/payments/khalti/return/page.tsx:8` (import); `app/(public)/press/page.tsx:3` (import); `app/(public)/stories/[slug]/page.tsx:7` (import); `app/(public)/support/page.tsx:13` (import); `components/home-faqs.tsx:3` (import).
- App-entry ancestors: `app/(public)/donate/cancel/page.tsx`, `app/(public)/donate/page.tsx`, `app/(public)/donate/success/page.tsx`, `app/(public)/get-involved/page.tsx`, `app/(public)/payments/khalti/return/page.tsx`, `app/(public)/press/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/(public)/support/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 2).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3d99340f56e147d3525b4577686a3f9485f4cc440185aef32e2576466bef32d5`.

<a id="c406"></a>

## `components/ui/select.tsx`

- Responsibility / candidate ownership: Wrap Radix select options, trigger and scrolling content / Generic UI.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:11` (import); `app/admin/payments/logs/logs-client.tsx:8` (import); `app/admin/programs/[id]/edit/page.tsx:14` (import); `app/admin/programs/page.tsx:11` (import); `components/admin/program-sections/forms/CTASectionForm.tsx:7` (import); `components/admin/program-sections/forms/FeaturesSectionForm.tsx:7` (import); `components/admin/program-sections/forms/GallerySectionForm.tsx:7` (import); `components/admin/program-sections/forms/StepsSectionForm.tsx:7` (import); `components/admin/team-table.tsx:11` (import); `components/events/admin/RegistrationsTable.tsx:24` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/team/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-select` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `SelectPrimitive.Root`, `SelectPrimitive.Group`, `SelectPrimitive.Value`, `SelectPrimitive.Trigger`, `SelectPrimitive.Icon`, `ChevronDownIcon`, `SelectPrimitive.Portal`, `SelectPrimitive.Content`, `SelectScrollUpButton`, `SelectPrimitive.Viewport`, `SelectScrollDownButton`, `SelectPrimitive.Label`, `SelectPrimitive.Item`, `SelectPrimitive.ItemIndicator`, `CheckIcon`, `SelectPrimitive.ItemText`, `SelectPrimitive.Separator`, `SelectPrimitive.ScrollUpButton`, `ChevronUpIcon`, `SelectPrimitive.ScrollDownButton`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e2b4198bbf3968eae76d71fd04074b43f802357d997dbd01a1721a96e5895383`.

<a id="c407"></a>

## `components/ui/separator.tsx`

- Responsibility / candidate ownership: Render a styled Radix separator / Generic UI.
- Usage / observed scope: USED / admin + demo + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Separator`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/homepage-manager-client.tsx:13` (import); `components/admin/rich-text-editor/bubble-toolbar.tsx:5` (import); `components/admin/rich-text-editor/toolbar.tsx:6` (import); `components/admin/site-settings-form.tsx:50` (import); `components/error-pages/GenericErrorPage.tsx:6` (import); `components/ui/button-group.tsx:5` (import); `components/ui/field.tsx:8` (import); `components/ui/item.tsx:6` (import); `components/ui/sidebar.tsx:12` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/demo/errors/generic/page.tsx`, `app/error.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-separator` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `SeparatorPrimitive.Root`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `96ef29b5aa9a169fd23a813ebbd4a721ba693c9ba73b9bdd9b4ece6788e9279c`.

<a id="c408"></a>

## `components/ui/sheet.tsx`

- Responsibility / candidate ownership: Compose a side-sheet using Radix dialog primitives / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-header.tsx:15` (import); `components/ui/sidebar.tsx:13` (import).
- App-entry ancestors: `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-dialog` → `package` (import, line 4); `lucide-react` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `SheetPrimitive.Root`, `SheetPrimitive.Trigger`, `SheetPrimitive.Close`, `SheetPrimitive.Portal`, `SheetPrimitive.Overlay`, `SheetPortal`, `SheetOverlay`, `SheetPrimitive.Content`, `XIcon`, `SheetPrimitive.Title`, `SheetPrimitive.Description`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `647b61de5cb1f53e7265022c6f60bf25a43b75ff71bde690adf9ec5f74a22688`.

<a id="c409"></a>

## `components/ui/sidebar.tsx`

- Responsibility / candidate ownership: Provide responsive sidebar context, persistence, keyboard toggle and navigation primitives / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-slot` → `package` (import, line 4); `class-variance-authority` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/hooks/use-mobile` → `hooks/use-mobile.ts` (import, line 8); `@/lib/utils` → `lib/utils.ts` (import, line 9); `@/components/ui/button` → `components/ui/button.tsx` (import, line 10); `@/components/ui/input` → `components/ui/input.tsx` (import, line 11); `@/components/ui/separator` → `components/ui/separator.tsx` (import, line 12); `@/components/ui/sheet` → `components/ui/sheet.tsx` (import, line 13); `@/components/ui/skeleton` → `components/ui/skeleton.tsx` (import, line 20); `@/components/ui/tooltip` → `components/ui/tooltip.tsx` (import, line 21).
- Hooks called: `React.useContext`, `useIsMobile`, `React.useState`, `React.useCallback`, `React.useEffect`, `React.useMemo`, `useSidebar`.
- JSX components: `SidebarContext.Provider`, `TooltipProvider`, `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `Button`, `PanelLeftIcon`, `Input`, `Separator`, `Comp`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `Skeleton`.
- Browser-name signals (not semantic proof): `document`, `window`.
- Source hash: `1bdf187549f043a81a5b1a97da1422c4bf2bc5b2cce0415f074e017dcf1e8f71`.

<a id="c410"></a>

## `components/ui/skeleton.tsx`

- Responsibility / candidate ownership: Render a styled loading placeholder / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `Skeleton`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/donations/[id]/loading.tsx:2` (import); `app/admin/events/[id]/loading.tsx:2` (import); `app/admin/events/loading.tsx:2` (import); `app/admin/page.tsx:4` (import); `app/admin/payments/[id]/loading.tsx:1` (import); `components/admin/payments/payments-table-client.tsx:39` (import); `components/admin/program-edit-skeleton.tsx:1` (import); `components/ui/sidebar.tsx:20` (import).
- App-entry ancestors: `app/admin/donations/[id]/loading.tsx`, `app/admin/events/[id]/loading.tsx`, `app/admin/events/loading.tsx`, `app/admin/page.tsx`, `app/admin/payments/[id]/loading.tsx`, `app/admin/payments/page.tsx`, `app/admin/programs/[id]/edit/loading.tsx`, `app/admin/programs/[id]/edit/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 1).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `03809a0ce9cb512aa72291deb27fbca08a55fe46e55f70f684f64612053a6841`.

<a id="c411"></a>

## `components/ui/slider.tsx`

- Responsibility / candidate ownership: Wrap Radix numeric slider tracks/thumbs / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Slider`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-slider` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: `React.useMemo`.
- JSX components: `SliderPrimitive.Root`, `SliderPrimitive.Track`, `SliderPrimitive.Range`, `SliderPrimitive.Thumb`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `0d000a7ec98386e515f6e484e4545cc4d34bcf201fd52ce5a53a5fea0bfdd9b5`.

<a id="c412"></a>

## `components/ui/sonner.tsx`

- Responsibility / candidate ownership: Mount a theme-aware Sonner notification host / Generic UI.
- Usage / observed scope: USED / global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Toaster`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/layout.tsx:6` (import).
- App-entry ancestors: `app/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next-themes` → `package` (import, line 3); `sonner` → `package` (import, line 4).
- Hooks called: `useTheme`.
- JSX components: `Sonner`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `8066aa9c8aca67dc2f56c3e5d241b40470afab3238d5592cf1099f547a3614a9`.

<a id="c413"></a>

## `components/ui/spinner.tsx`

- Responsibility / candidate ownership: Render a loading spinner icon / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Spinner`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `lucide-react` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: `Loader2Icon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `006b673fb9c6922aae885173748176c0daec31d8b396a04335143808a5ec89c4`.

<a id="c414"></a>

## `components/ui/stat-card.tsx`

- Responsibility / candidate ownership: Present a caller-supplied icon/value/label with style variants / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `StatCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 1); `lucide-react` → `package` (import, type-only, line 2).
- Hooks called: None found.
- JSX components: `Icon`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6c81bdaa72ebcc2e883e966e890afbceead079324687bea22a799ca7db8881b1`.

<a id="c415"></a>

## `components/ui/story-card.tsx`

- Responsibility / candidate ownership: Present story excerpt/category/date/read-time with a destination / Stories presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `StoryCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `lucide-react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 4).
- Hooks called: None found.
- JSX components: `Link`, `Image`, `ArrowRight`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4488102a617fbdf8dc091ab16fceab404668d860932253855ca2fa5e806f8f35`.

<a id="c416"></a>

## `components/ui/switch.tsx`

- Responsibility / candidate ownership: Wrap Radix switch controls / Generic UI.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Switch`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:18` (import); `components/admin/admin-user-edit-form.tsx:9` (import); `components/admin/artworks/artworks-manager-client.tsx:24` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:20` (import); `components/admin/event-form.tsx:11` (import); `components/admin/homepage-manager/components/BannersManager.tsx:8` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:9` (import); `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx:7` (import); `components/admin/homepage-manager/components/FlagsManager.tsx:6` (import); `components/admin/homepage-manager/components/HeroCTAsManager.tsx:8` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:9` (import); `components/admin/homepage-manager/components/MarqueeManager.tsx:7` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:8` (import); `components/admin/partner-form.tsx:10` (import); `components/admin/payment-settings-form.tsx:9` (import); `components/admin/program-sections/SectionPropertiesPanel.tsx:7` (import); `components/admin/project-form.tsx:11` (import); `components/admin/rich-text-editor/table-dialog.tsx:15` (import); `components/admin/stat-form.tsx:9` (import); `components/admin/story-form.tsx:10` (import); `components/admin/support-toggle.tsx:4` (import); `components/admin/team-member-form.tsx:10` (import); `components/admin/video-picker.tsx:7` (import); `components/events/admin/EventDetailsForm.tsx:11` (import); `components/events/admin/EventFormBuilder/FieldPropertiesPanel.tsx:6` (import); `components/events/admin/PricingEditor.tsx:8` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stats/[id]/page.tsx`, `app/admin/stats/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/users/[id]/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-switch` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `SwitchPrimitive.Root`, `SwitchPrimitive.Thumb`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `6d89650a8b9474244627b2ead855995f9923b9ad8576db96c1841b084f44c76a`.

<a id="c417"></a>

## `components/ui/table.tsx`

- Responsibility / candidate ownership: Compose semantic table structure and styles / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: broad direct dependency surface.
- Exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/conference/forms/page.tsx:9` (import); `app/admin/conference/page.tsx:5` (import); `app/admin/contacts/page.tsx:4` (import); `app/admin/donations/review/audit/page.tsx:6` (import); `app/admin/events/[id]/page-new.tsx:7` (import); `app/admin/events/page.tsx:9` (import); `app/admin/newsletter/page.tsx:4` (import); `app/admin/partners/page.tsx:6` (import); `app/admin/podcasts/page.tsx:7` (import); `app/admin/programs/page.tsx:10` (import); `app/admin/projects/page.tsx:6` (import); `app/admin/stats/page.tsx:6` (import); `app/admin/stories/page.tsx:6` (import); `app/admin/support/page.tsx:5` (import); `app/admin/users/page.tsx:8` (import); `app/admin/volunteers/page.tsx:6` (import); `components/admin/donations/donations-table-client.tsx:9` (import); `components/admin/payments/payments-table-client.tsx:10` (import); `components/admin/team-table.tsx:9` (import); `components/events/admin/RegistrationsTable.tsx:9` (import).
- App-entry ancestors: `app/admin/conference/forms/page.tsx`, `app/admin/conference/page.tsx`, `app/admin/contacts/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/donations/review/audit/page.tsx`, `app/admin/events/[id]/page.tsx`, `app/admin/events/page.tsx`, `app/admin/newsletter/page.tsx`, `app/admin/partners/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/podcasts/page.tsx`, `app/admin/programs/page.tsx`, `app/admin/projects/page.tsx`, `app/admin/stats/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/page.tsx`, `app/admin/team/page.tsx`, `app/admin/users/page.tsx`, `app/admin/volunteers/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@/lib/utils` → `lib/utils.ts` (import, line 5).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `7e4ec95a993de8b29a144facf8c5e99271239ee40ca158a93cbc8b6853e7ca54`.

<a id="c418"></a>

## `components/ui/tabs-switcher.tsx`

- Responsibility / candidate ownership: Render controlled icon/label tab buttons / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `TabsSwitcher`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/EmailTemplateEditor.tsx:10` (import).
- App-entry ancestors: `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/settings/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/lib/utils` → `lib/utils.ts` (import, line 3); `lucide-react` → `package` (import, type-only, line 4).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `cd002880ca1070d8053701af23a174791f9643d43bd71539c892cda9b54afa5d`.

<a id="c419"></a>

## `components/ui/tabs.tsx`

- Responsibility / candidate ownership: Wrap Radix tabs root/list/triggers/content / Generic UI.
- Usage / observed scope: USED / admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/profile/page.tsx:7` (import); `app/admin/support/[id]/page.tsx:4` (import); `app/demo/brand-toolkit/page.tsx:8` (import); `app/demo/errors/page.tsx:7` (import); `components/admin/about-manager/AboutManagerClient.tsx:4` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:20` (import); `components/admin/dashboard/donation-trend-chart.tsx:4` (import); `components/admin/dashboard/volunteer-skills-chart.tsx:4` (import); `components/admin/homepage-manager-client.tsx:10` (import); `components/admin/homepage-manager/HomepageManagerClient.tsx:4` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:11` (import); `components/admin/homepage-manager/components/StoryManager.tsx:9` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:9` (import); `components/admin/media-library-client.tsx:8` (import); `components/admin/media-picker.tsx:7` (import); `components/admin/podcast-form.tsx:12` (import); `components/admin/rich-text-editor/image-dialog.tsx:16` (import); `components/admin/settings-tabs.tsx:4` (import); `components/admin/site-settings-form.tsx:10` (import); `components/admin/support/support-detail-client.tsx:9` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/admin/about/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/media/page.tsx`, `app/admin/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/profile/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/errors/page.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-tabs` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `TabsPrimitive.Root`, `TabsPrimitive.List`, `TabsPrimitive.Trigger`, `TabsPrimitive.Content`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `23cc67b5360458decab2e93b3827aebbe142fd2d9f76ec418f96cb3269f1820a`.

<a id="c420"></a>

## `components/ui/team-member-card.tsx`

- Responsibility / candidate ownership: Present a team-member portrait, role and biography / Team presentation.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `TeamMemberCard`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 2).
- Hooks called: None found.
- JSX components: `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `83b2b7f0ae7231216738af2047eb677a6ffe05b331d706c44532dc38b65083a1`.

<a id="c421"></a>

## `components/ui/textarea.tsx`

- Responsibility / candidate ownership: Style a native textarea while forwarding native props / Generic UI.
- Usage / observed scope: USED / public + admin + demo.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `Textarea`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/admin/events/new/page.tsx:9` (import); `app/demo/brand-toolkit/page.tsx:6` (import); `app/demo/toasts/page.tsx:6` (import); `components/admin/about-manager/AboutManagerClient.tsx:10` (import); `components/admin/artworks/artworks-manager-client.tsx:25` (import); `components/admin/conference-form-builder/FormTemplateChooser.tsx:17` (import); `components/admin/donations/review-action-dialog.tsx:13` (import); `components/admin/donations/review-notes-section.tsx:6` (import); `components/admin/donations/status-change-modal.tsx:13` (import); `components/admin/event-form.tsx:8` (import); `components/admin/homepage-manager-client.tsx:8` (import); `components/admin/homepage-manager/components/BannersManager.tsx:6` (import); `components/admin/homepage-manager/components/CTACardsManager.tsx:6` (import); `components/admin/homepage-manager/components/HeroCarouselManager.tsx:7` (import); `components/admin/homepage-manager/components/HeroManager.tsx:6` (import); `components/admin/homepage-manager/components/ProgramsManager.tsx:6` (import); `components/admin/homepage-manager/components/SEOManager.tsx:6` (import); `components/admin/homepage-manager/components/StoryManager.tsx:7` (import); `components/admin/homepage-manager/components/TestimonialsManager.tsx:7` (import); `components/admin/homepage-manager/components/TimelineManager.tsx:7` (import); `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx:6` (import); `components/admin/homepage-manager/components/WhatWeDoManager.tsx:6` (import); `components/admin/organization-settings-form.tsx:7` (import); `components/admin/partner-form.tsx:8` (import); `components/admin/podcast-form.tsx:8` (import); `components/admin/project-form.tsx:8` (import); `components/admin/site-settings-form.tsx:8` (import); `components/admin/story-form.tsx:8` (import); `components/admin/team-member-form.tsx:8` (import); `components/donation/bank-transfer-panel.tsx:8` (import); `components/donation/donation-form.tsx:8` (import); `components/events/admin/AgendaEditor.tsx:7` (import); `components/events/admin/EmailTemplateEditor.tsx:7` (import); `components/events/admin/EventDetailsForm.tsx:8` (import); `components/events/admin/EventRegistrationEmailActions.tsx:28` (import); `components/ui/input-group.tsx:8` (import).
- App-entry ancestors: `app/(public)/donate/page.tsx`, `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/review/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/demo/brand-toolkit/page.tsx`, `app/demo/toasts/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 3).
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `cf31ce99f03ac69f9821b4463a366c66698ae8e7eba5c06d2ede63d5cf7309bd`.

<a id="c422"></a>

## `components/ui/time-picker.tsx`

- Responsibility / candidate ownership: Select hours/minutes through a popover clock interface / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `TimePicker`, `TimePickerProps`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/events/admin/AgendaEditor.tsx:17` (import); `components/ui/date-time-picker.tsx:8` (import).
- App-entry ancestors: `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/events/new/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 5); `@/components/ui/popover` → `components/ui/popover.tsx` (import, line 6).
- Hooks called: `React.useState`, `React.useRef`, `React.useEffect`.
- JSX components: `Popover`, `PopoverTrigger`, `Clock`, `PopoverContent`, `X`.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `e796d1f569da1fd3b77ff4f9b19467586c9590f521c3383ea3eec437a10112ea`.

<a id="c423"></a>

## `components/ui/toast.tsx`

- Responsibility / candidate ownership: Provide Sonner-backed success/error/warning/info/promise toast presentation / Generic UI.
- Usage / observed scope: USED / public + admin + demo + global.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: public/admin or demo boundary reuse.
- Exports: `ToastOptions`, `showToast`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/error-pages/GenericErrorPage.tsx:8` (import); `components/podcasts/podcast-share-card.tsx:4` (import); `components/ui/toaster.tsx:4` (import); `components/ui/use-toast.ts:6` (import, type-only); `hooks/use-toast.ts:6` (import, type-only); `lib/notifications.ts:3` (import).
- App-entry ancestors: `app/(public)/demo/program-editor/page.tsx`, `app/(public)/donate/page.tsx`, `app/(public)/donate/success/page.tsx`, `app/(public)/podcasts/[slug]/page.tsx`, `app/(public)/support/page.tsx`, `app/admin/about/page.tsx`, `app/admin/artworks/page.tsx`, `app/admin/conference/[id]/page.tsx`, `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/conference/settings/page.tsx`, `app/admin/donations/[id]/page.tsx`, `app/admin/donations/page.tsx`, `app/admin/events/[id]/agenda/page.tsx`, `app/admin/events/[id]/details/page.tsx`, `app/admin/events/[id]/email-templates/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/location/page.tsx`, `app/admin/events/[id]/media/page.tsx`, `app/admin/events/[id]/pricing/page.tsx`, `app/admin/events/[id]/registrations/[registrationId]/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/homepage/page.tsx`, `app/admin/media/page.tsx`, `app/admin/notifications/page.tsx`, `app/admin/partners/[id]/page.tsx`, `app/admin/partners/new/page.tsx`, `app/admin/payments/[id]/page.tsx`, `app/admin/payments/logs/page.tsx`, `app/admin/payments/metrics/page.tsx`, `app/admin/payments/page.tsx`, `app/admin/payments/system/page.tsx`, `app/admin/podcasts/[id]/page.tsx`, `app/admin/podcasts/new/page.tsx`, `app/admin/programs/[id]/edit/page.tsx`, `app/admin/projects/[id]/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/stories/page.tsx`, `app/admin/support/[id]/page.tsx`, `app/admin/team/[id]/page.tsx`, `app/admin/team/new/page.tsx`, `app/admin/team/page.tsx`, `app/demo/errors/generic/page.tsx`, `app/demo/errors/page.tsx`, `app/demo/toasts/page.tsx`, `app/error.tsx`.
- Test-import ancestry: `__tests__/programs/template-editor.test.tsx`. No listed test is not proof of no feature-level coverage.
- Other source ancestors: `lib/notifications.ts`.
- Dependencies: `sonner` → `package` (import, line 1); `@/lib/utils` → `lib/utils.ts` (import, line 2).
- Hooks called: None found.
- JSX components: `ToastMessage`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `626fabf8e195c749b67e1a8f7d7105fbc0f7da58f6d8d53b1c734c2bb9310578`.

<a id="c424"></a>

## `components/ui/toaster.tsx`

- Responsibility / candidate ownership: Render the older toast state through Radix-style exports no longer provided / Legacy notification API; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Toaster`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `@/hooks/use-toast` → `hooks/use-toast.ts` (import, line 3); `@/components/ui/toast` → `components/ui/toast.tsx` (import, line 4).
- Hooks called: `useToast`.
- JSX components: `ToastProvider`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastClose`, `ToastViewport`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `2dfd19d81413d2eda50679dd8caa1cad25ebb34194b37fa1ddfb7dd647939f6d`.

<a id="c425"></a>

## `components/ui/toggle-group.tsx`

- Responsibility / candidate ownership: Provide grouped Radix toggle state/variants / Generic UI.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `ToggleGroup`, `ToggleGroupItem`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-toggle-group` → `package` (import, line 4); `class-variance-authority` → `package` (import, type-only, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7); `@/components/ui/toggle` → `components/ui/toggle.tsx` (import, line 8).
- Hooks called: `React.useContext`.
- JSX components: `ToggleGroupPrimitive.Root`, `ToggleGroupContext.Provider`, `ToggleGroupPrimitive.Item`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `4e725b44cc99b17211ca80c9306271c7dd1a9c9af0d0aba3faddad63d33992e2`.

<a id="c426"></a>

## `components/ui/toggle.tsx`

- Responsibility / candidate ownership: Wrap a Radix toggle with visual variants / Generic UI.
- Usage / observed scope: UNCERTAIN / no app-entry chain.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `Toggle`, `toggleVariants`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/ui/toggle-group.tsx:8` (import).
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-toggle` → `package` (import, line 4); `class-variance-authority` → `package` (import, line 5); `@/lib/utils` → `lib/utils.ts` (import, line 7).
- Hooks called: None found.
- JSX components: `TogglePrimitive.Root`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `80a93a384850d9fd7b4d5c2d1f8409874d198467648e000c310695caedaf807b`.

<a id="c427"></a>

## `components/ui/tooltip.tsx`

- Responsibility / candidate ownership: Wrap Radix tooltip provider/trigger/content / Generic UI.
- Usage / observed scope: USED / admin.
- Generic contract: Yes; does not imply a primitive or approved shared destination.
- Preliminary relocation sensitivity: HIGH: layout consumer affects descendant routes.
- Exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/admin/admin-sidebar.tsx:10` (import); `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx:21` (import); `components/ui/sidebar.tsx:21` (import).
- App-entry ancestors: `app/admin/conference/settings/form-builder/page.tsx`, `app/admin/events/[id]/form-builder/page.tsx`, `app/admin/events/[id]/settings/page.tsx`, `app/admin/layout.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `@radix-ui/react-tooltip` → `package` (import, line 4); `@/lib/utils` → `lib/utils.ts` (import, line 6).
- Hooks called: None found.
- JSX components: `TooltipPrimitive.Provider`, `TooltipProvider`, `TooltipPrimitive.Root`, `TooltipPrimitive.Trigger`, `TooltipPrimitive.Portal`, `TooltipPrimitive.Content`, `TooltipPrimitive.Arrow`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `b620f27ccc82ec7748e2039143cd3c36c029e48b083025f88e621e6dda91222a`.

<a id="c428"></a>

## `components/ui/use-mobile.tsx`

- Responsibility / candidate ownership: Observe the mobile media query through a duplicate React hook / Legacy hook copies; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `useIsMobile`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 1).
- Hooks called: `React.useState`, `React.useEffect`.
- JSX components: None found.
- Browser-name signals (not semantic proof): `window`.
- Source hash: `1b43441b273aa21c1e74fefa774d5a7cb50068e5d4c192a8f63b9c95c5580431`.

<a id="c429"></a>

## `components/ui/use-toast.ts`

- Responsibility / candidate ownership: Maintain a duplicate legacy toast store and hook using stale toast types / Legacy hook copies; retention review.
- Usage / observed scope: LIKELY UNUSED / no app-entry chain.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: REVIEW: establish retention and type/indirect consumers before relocation.
- Exports: `reducer`, `useToast`, `toast`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; retention open.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: None found.
- App-entry ancestors: None found.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 4); `@/components/ui/toast` → `components/ui/toast.tsx` (import, type-only, line 6).
- Hooks called: `React.useState`, `React.useEffect`.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `3b5f8c9c5257f1cf36a94eeffed2588037e9cc7931d90b752604c2baed30cf81`.

<a id="c430"></a>

## `components/volunteer-form.tsx`

- Responsibility / candidate ownership: Collect volunteer information and invoke the volunteer application action / Volunteer.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `VolunteerForm`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/get-involved/page.tsx:8` (import).
- App-entry ancestors: `app/(public)/get-involved/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, type-only, line 3); `react` → `package` (import, line 5); `lucide-react` → `package` (import, line 6); `@/components/ui/button` → `components/ui/button.tsx` (import, line 7); `@/components/form` → `components/form/index.ts` (import, line 8); `@/lib/actions/volunteer` → `lib/actions/volunteer.ts` (import, line 9).
- Hooks called: `useState`.
- JSX components: `X`, `CheckCircle`, `Button`, `FormField`, `TextareaField`, `Loader2`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e45e2fc935eee3f0d3edc3e1d840148da99d9e47a2005ba0f5a7a53267c35a44`.

<a id="c431"></a>

## `components/what-we-do-area-detail.tsx`

- Responsibility / candidate ownership: Compose area-specific narrative, actions and video for what-we-do detail / What we do.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `WhatWeDoAreaDetail`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/whatwedo/[slug]/page.tsx:7` (import).
- App-entry ancestors: `app/(public)/whatwedo/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/link` → `package` (import, line 1); `lucide-react` → `package` (import, line 2); `@/lib/data/what-we-do-areas` → `lib/data/what-we-do-areas.ts` (import, type-only, line 3); `@/components/what-we-do-video-player` → `components/what-we-do-video-player.tsx` (import, line 4).
- Hooks called: None found.
- JSX components: `Link`, `WhatWeDoVideoPlayer`, `Check`, `ArrowRight`, `Icon`, `Users`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e694a5693eea4f4b5c2334a7abc3889e47f3ec030b91bde6ac338103620f9f8f`.

<a id="c432"></a>

## `components/what-we-do-video-player.tsx`

- Responsibility / candidate ownership: Control playback of the what-we-do area video / What we do.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `WhatWeDoVideoPlayer`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: `use client`; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/what-we-do-area-detail.tsx:4` (import).
- App-entry ancestors: `app/(public)/whatwedo/[slug]/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `react` → `package` (import, line 3); `lucide-react` → `package` (import, line 4).
- Hooks called: `useRef`, `useState`.
- JSX components: `Play`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `e075c488be29bc223ac64b81be34fa97740c36a06325293f7a2b3f798d2f8ee2`.

<a id="c433"></a>

## `components/whatwedo/whatwedo-hero.module.css`

- Responsibility / candidate ownership: Style the what-we-do hero and contrast behavior / Component styling.
- Usage / observed scope: USED / public.
- Generic contract: Not applicable (style/asset).
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: None found.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `components/whatwedo/whatwedo-hero.tsx:4` (import).
- App-entry ancestors: `app/(public)/whatwedo/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: None found.
- Hooks called: None found.
- JSX components: None found.
- Browser-name signals (not semantic proof): None found.
- Source hash: `06304b4cc8b9cc5ed31f46854b0c3da2722fd9d80b573e65a8952774a065f5b3`.

<a id="c434"></a>

## `components/whatwedo/whatwedo-hero.tsx`

- Responsibility / candidate ownership: Render the what-we-do overview image mosaic and navigation hero / What we do.
- Usage / observed scope: USED / public.
- Generic contract: No; retains domain or workflow context.
- Preliminary relocation sensitivity: MEDIUM: preserve listed imports, exports, directives and associated styles.
- Exports: `WhatWeDoHero`.
- Naming: lowercase/kebab filename; ownership confidence: Role reviewed; destination provisional.
- Directives: None found; no directive alone does not establish runtime compatibility.
- Direct consumers: `app/(public)/whatwedo/page.tsx:9` (import).
- App-entry ancestors: `app/(public)/whatwedo/page.tsx`.
- Test-import ancestry: None found. No listed test is not proof of no feature-level coverage.
- Other source ancestors: None found.
- Dependencies: `next/image` → `package` (import, line 1); `next/link` → `package` (import, line 2); `@/lib/utils` → `lib/utils.ts` (import, line 3); `./whatwedo-hero.module.css` → `components/whatwedo/whatwedo-hero.module.css` (import, line 4).
- Hooks called: None found.
- JSX components: `Link`, `Image`.
- Browser-name signals (not semantic proof): None found.
- Source hash: `561260141894510b3f582bbcb50221e2133b0d2b6cccc6b41122bf992b7c0b10`.
