# Investor / Borrower Sticky Scroll Reveal

Scope: the landing page's investor and borrower section only.

Design read: housing credit demo for investors and borrowers, using the existing charcoal surfaces, Super Sans stack, and lavender accent. ENERGY 1 / RHYTHM 2 / MOTION 3.

## Decisions

- Investor comes first, followed by Borrower in the page's normal scroll flow.
- Large role names establish the first level of the section; the pinned panel explains the active journey.
- Lavender identifies the active role and selected control, matching Design.md.
- Existing typography and 8/16px corners preserve the site's visual identity.
- Generous scene spacing gives each role time to remain active while scrolling.
- One contained panel groups the existing journey steps. No fabricated figures, illustrations, or claims were added.
- Motion only marks changes of role; reduced-motion preference disables the entrance transforms.
- On tall mobile screens the panel is compact and maintains a stable height across roles. On short screens the full details appear inline to keep text readable.
- The supplied Aceternity reference was adapted to existing JSX, plain CSS, and the installed motion package. No Tailwind, TypeScript, shadcn migration, or new dependency was needed.

## Verification

- PASS: `npm run build` completed. Existing dependency directive and large-chunk warnings remain.
- PASS: `npm test -- src/App.test.jsx`: 3/3 existing landing-page interaction tests passed.
- PASS: `git diff --check` returned no whitespace errors.
- PASS: browser click on Investor selects its tab and shows deposit/share/repayment steps.
- PASS: browser click on Borrower selects its tab and shows approval/bid/allocation steps.
- PASS: PageDown from Investor activates Borrower while the desktop panel remains pinned at 176px.
- PASS: ArrowLeft from Borrower moves selection and keyboard focus to Investor; visible focus outline observed.
- PASS: desktop verified at 1440x900 and 1280x900; mobile at 390x844; short-screen fallback at 320x640.
- PASS: tall-mobile panel height is 304.2px for both roles, avoiding layout shifts during switching.
- PASS: browser error log empty. An existing THREE.Clock deprecation warning remains. Unavailable backend data is shown by the existing transparency section's error state.

## Antislop delivery gate

The following checks apply to the changed section, not to unrelated existing page content.

- PASS R-02: no em dashes added to UI copy.
- PASS R-03: role text and steps fit inspected desktop/mobile section layouts; short screens use inline details.
- PASS R-17/R-18: no statistics or testimonials introduced.
- PASS R-23/R-38: all journey content comes from the existing application; simulated status remains visible.
- PASS R-24: existing `#demo` destination preserved; no navigation destinations added.
- PASS R-25: new text uses light charcoal-compatible neutrals and lavender; inactive content remains readable rather than fading to 0.3 opacity.
- PASS R-26: both tabs select and scroll to their associated roles, verified in the browser.
- PASS R-27: no new data request or asynchronous state; empty component content returns null.
- PASS R-28: no FAQ added.
- PASS R-32: semantic buttons, roving tab stops, ArrowLeft/ArrowRight/Home/End handlers, and visible focus styles; ArrowLeft tested in browser.
- PASS R-33: edits made directly in component/CSS source.
- PASS R-34: existing fixed dark palette retained; no theme switch introduced.
- PASS R-35: successful build, tests, and recorded click-through above.
- PASS R-36: no security, performance, or return claims introduced.
- PASS R-37: Design.md read before implementation; design read and dials recorded above.
- PASS R-01: no new gradient or glow; lavender has an active-state purpose.
- PASS R-04/R-07/R-08/R-09/R-10/R-12/R-13/R-22: no new icons, background patterns, decorative arrows, badges, glass, shadows, glows, or illustrations.
- PASS R-06: existing type stack retained for identity and readable content hierarchy.
- PASS R-14: one content panel groups the active role's steps.
- PASS R-19: scroll and short transitions connect role selection to its details; reduced motion is respected.
- PASS liveliness: explicit 1/2/3 dials; large role title focal point, structural scroll spacing, lavender active accent, repeated role typography, and declared design read.
- PASS C-1/C-3/R-05/R-31: composition follows the two existing roles; decision reasons are recorded above.
- PASS C-2: both controls have real selection/scroll behavior.
- PASS C-4: inspected responsive modes and keyboard flow; short-screen overlap corrected.
- PASS C-5: existing content retained without fabricated evidence.
- PASS R-11: existing small control and large panel corner sizes retained.
- PASS R-15/R-16: concrete Investor/Borrower controls; no marketing buzzwords added.
- PASS R-20/R-21/R-29/R-30: existing HOUSD typography and palette retained; the supplied reference informs behavior without importing its demo branding or gradient palette.
