# Transparency BorderGlow

Scope: Housing Credit Vault, Active Loans, and the provenance ledger inside `#transparansi`.

Design read: evidence cards for HOUSD's housing-credit prototype, using the user's React Bits BorderGlow reference. ENERGY 2 / RHYTHM 2 / MOTION 1.

## Implementation decisions

- Adapted the supplied JavaScript/CSS component into `src/components/ui/BorderGlow.jsx` and its adjacent CSS. No dependencies added.
- All three existing surfaces use the same wrapper; their data, labels, fetch logic, and retry action remain intact.
- Dark #120F17 surfaces and lavender-led gradient colors match HOUSD. A low fill opacity preserves readable data; the glow remains concentrated at the border.
- The supplied 28px corners separate the evidence panels from the surrounding page. Existing columns remain on desktop; mobile ledger fields stack in reading order.
- Pointer proximity and angle control the cone mask. Decorative layers ignore pointer events. Keyboard focus highlights the containing card and the actual control, without adding decorative tab stops.
- Intro animation defaults to off. Optional sweep animation cancels on cleanup and respects reduced motion. Glow padding is capped by viewport width to prevent mobile overflow.

## Delivery gate

- Hard Gate PASS: no new statistics, people, claims, or navigation destinations; no new em dashes in displayed copy. Browser checks at 1280px, 375px, and 320px found no document or inner-card horizontal overflow. Data/error behavior is retained.
- Purpose Gate PASS: directional glow implements the explicit reference and indicates the surface under the pointer. No glow is applied to status chips or controls; subdued fill maintains text hierarchy. Existing type and status colors preserve HOUSD identity.
- Liveliness PASS: dials declared; the section heading remains dominant, asymmetrical live-card columns are retained, and the wider provenance ledger provides a distinct information level.
- Craftsmanship PASS: production build and three existing landing interaction tests passed; `git diff --check` passed. Browser error-log inspection returned no entries.
- Pointer verification PASS: moving along the Vault, Loans, and Ledger edges updated their separate angles and proximity values. Vault edge proximity reached 95.014 with glow opacity 0.929; the visible highlight followed the upper-right corner.
- Keyboard verification PASS: the retry control received a solid focus outline and activated the card's focus-within styling. Enter on Coba lagi retried the request and returned to the existing error state because the backend was unreachable.

Live success/empty API responses were not exercised in the browser because the backend connection was unavailable. Fetch logic was not changed. Build retains existing dependency directive and bundle-size warnings.

## Follow-up: hero network label

- Replaced the Live/market/Indonesia capsule with `Built on BNB Chain` and the unmodified official yellow BNB Chain symbol, stored under `public/brand` with its source URL.
- Removed the capsule background, border, uppercase mono styling, and status dot so the label has a different hierarchy from the navbar. Existing hero type is retained; the yellow accent is limited to the network's own logo.
- PASS: browser confirmed the SVG loaded, the label has a transparent background and zero border, and its 157px width fits the 320px viewport without horizontal overflow. Desktop and mobile screenshots inspected; production build passed after the change. This label adds no interactive control.

## Follow-up: fixed navbar stacking

- Moved the fixed navbar outside the isolated hero stacking context, directly under the page shell. Its existing z-index 100 now applies above all landing sections. Dialog overlay uses 200, and the keyboard skip link uses 300.
- PASS: desktop navbar stayed at viewport y=16 after scrolling more than 3600px; hit tests across its width found the navbar above the content. At mobile width 375px and scrollY 5823px, both navbar and expanded menu remained the top hit targets, without horizontal overflow.
- PASS: Mulai demo opened the dialog above the navbar; Escape dismissed it. Mobile Menu opened and Tutup closed it. Production build, all three landing interaction tests, and diff whitespace checks passed.
- Visual design, typography, and motion remain unchanged; the change corrects the existing fixed-navigation behavior.

## Follow-up: compact navbar CTA

- Reduced only the navbar CTA from 38px to 32px visual height, 20px to 14px horizontal padding, and 14px to 12px type. The unchanged hero CTA remains 44px tall. The compact visual reduces competition with the hero action; a transparent hit extension retains a 44px click target.
- PASS: browser measured the navbar button at 93.3 by 32px, verified its extended hit area, opened the demo dialog by clicking it, and closed the dialog with Escape. The 320px viewport had no horizontal overflow and the label remained on one line. Production build and whitespace checks passed.
