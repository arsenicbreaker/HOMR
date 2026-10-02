# Decision cards with Lens

Scope: the two cards in `#cara-kerja` and their shared Lens component. Existing dashboard changes and other landing sections are outside this check.

Design read: a housing-credit explainer for borrowers and investors, using the supplied dark Lens card and the project's lavender palette. ENERGY 2 / RHYTHM 2 / MOTION 1.

## Integration

- `src/components/DecisionCard.jsx` holds the two content variants; `src/components/ui/Lens.jsx` is the reusable magnifier.
- The existing app uses Vite, React JSX, and plain CSS. The supplied TypeScript/Tailwind example was adapted to this stack, with `motion` installed. No shadcn, TypeScript, or Tailwind migration was performed.
- The existing `src/components/ui` directory is used so shared controls stay separate from section-specific content. Lens styles live beside that component; card styles use the existing `src/styles.css` entry point.
- The sample's Apple Vision Pro image and copy were replaced with labeled illustrations of the existing HOUSD workflows. These are explanatory diagrams, not live review or transaction records.

## Decisions

- Color: dark card surfaces and lavender rays reproduce the requested reference and match the established accent; body text remains on a dark, low-glow surface.
- Layout: two equal cards express the two complementary decisions; a light document review and dark allocation flow distinguish their responsibilities.
- Type: the existing Super Sans stack maintains continuity; mono is limited to numbering and provenance labels.
- Spacing: 32px desktop padding keeps the previews and explanations separate, reducing to 24px and 16px at narrow widths.
- Shape: the reference's 24px outer corners frame 16px preview corners.
- Motion: a 1.5x circular magnifier exposes detail; the reference's copy blur only runs during mouse hover without reduced-motion preference. Keyboard and touch retain readable copy.

## Delivery gate

- R-02 PASS: new displayed copy contains no em dashes.
- R-03 PASS: browser checks at 1440px, 375px, and 320px found no document or card horizontal overflow; desktop is two columns, mobile is one.
- R-17 PASS: no invented statistics added.
- R-18 PASS: no testimonials added.
- R-23 PASS: workflow visuals are explicitly labeled `Ilustrasi alur` and use the existing product explanation.
- R-24 PASS: no navigation destinations added; `#cara-kerja` remains reachable.
- R-25 PASS: preview text uses dark ink on a light surface or light text on a dark surface; muted card text is #c2bccb on the dark card body.
- R-26 PASS: both Lens controls activate and dismiss their magnifier.
- R-27 PASS: the new diagrams are static explanatory content and introduce no data fetching.
- R-28 PASS: no FAQ added.
- R-32 PASS: native buttons expose their pressed state; Enter activates, ArrowRight moves the mask from 50% to 58%, Escape dismisses; focus uses an inset lavender outline.
- R-33 PASS: JSX and CSS edited directly using patches.
- R-34 PASS: cards match the existing dark-only page; no theme toggle added.
- R-35 PASS: production build succeeded; all three existing landing interaction tests passed; both lenses were activated with keyboard, Escape closed each, and a pointer click toggled the credit lens off. Browser error-log query returned no entries. The existing API panels showed their connection-error state because the backend was unavailable.
- R-36 PASS: existing explanatory content retained; no security or performance claims added.
- R-37 PASS: Design.md and the supplied card reference informed the declared dials.
- R-38 PASS: both diagrams are labeled illustrations and contain no invented loan records.
- R-01 PASS: gradient and rays carry the explicitly requested card treatment and established lavender accent.
- R-04 PASS: no generic icon library introduced.
- R-06 PASS: existing typography retained for brand continuity.
- R-07 PASS: no decorative background grid added.
- R-08 PASS: no decorative button arrows added.
- R-09 PASS: existing offchain/onchain provenance labels retained as plain metadata.
- R-10 PASS: no backdrop blur added.
- R-12 PASS: no floating card shadows added.
- R-13 PASS: glow is confined to the two requested cards.
- R-14 PASS: equal outer cards communicate peer decisions; contrasting preview compositions identify their different functions.
- R-19 PASS: interaction-only animation and reduced-motion handling match MOTION 1.
- R-22 PASS: diagrams directly represent the existing review and auction workflows.
- Liveliness PASS: dials declared; heading establishes hierarchy, card spacing separates stages, lavender provides the accent, and numbered decisions plus provenance labels retain HOUSD's visual identity.
- C-1 through C-5 PASS: choices documented, both controls verified, section preserves its existing purpose, responsive checks passed, and illustrations are honestly labeled.
- R-05 / R-11 / R-15 / R-16 / R-20 / R-21 / R-29 / R-30 / R-31 PASS: this scoped replacement follows the user's two-card request, reference corners, existing copy and palette, dark page context, and documented visual reasons.

Build caveats: Vite emitted dependency `use client` directive warnings and a bundle-size warning; neither prevented the build. Backend connectivity was not part of this change.
