# Risk section globe

Scope: replacement of `#risiko` with the supplied Globe demo 3 composition.

Design read: a housing-credit risk explainer with text on the left and a cropped Earth on the lower right. ENERGY 2 / RHYTHM 2 / MOTION 2.

## Integration and design decisions

- Adapted the provided React Three Fiber scene to the existing JSX and plain CSS project. Shared rendering lives in `src/components/ui/Globe3D.jsx`; section content and styles live in `src/components/RiskGlobe.jsx` and `risk-globe.css`.
- Installed `three`, `@react-three/fiber`, and `@react-three/drei`. The project does not use TypeScript, Tailwind, or shadcn configuration; this change does not require a project-wide migration.
- Retained the original HOUSD risk heading and explanation. The sample's avatars and fictional city activity were omitted; Earth is an illustration, not a coverage claim.
- Used the existing dark surface, lavender action color, font stack, and 16px radius to keep the requested composition consistent with HOUSD.
- Large desktop padding separates text and globe. Mobile adds space below the copy for the globe so text length determines the panel height.
- Rotation follows the reference and can be paused. Reduced-motion preference disables rotation. The scene pauses offscreen and when the document is hidden; its JavaScript is loaded near the viewport.
- Texture assets are local. Loading and WebGL/texture failure use a static Earth fallback. Failure and reduced-motion branches were reviewed in source; they were not forced in the browser.

## Delivery gate

- Hard Gate PASS: original risk claims retained; no invented data, people, coverage claims, or em dashes added. Browser checks at 1280px, 375px, and 320px showed the intended layout without horizontal overflow. At 320px the text container did not overflow and panel scrollTop remained zero after keyboard focus.
- Interaction PASS: Enter on Jeda rotasi changed the state to Lanjutkan rotasi; Enter resumed it. Lihat bukti transaksi navigated to #transparansi; Kembali ke atas navigated to #top. All controls have native keyboard behavior and visible focus styles.
- Purpose Gate PASS: requested cropped-globe composition creates the section's visual focus; lavender atmosphere matches the brand, the dark text area maintains legibility, and motion is limited to the globe with a visible pause control.
- Liveliness PASS: dials declared, one large Earth illustration balances the heading, deliberate whitespace separates content and visualization, and the existing typography/accent connects the section to the rest of HOUSD.
- Craftsmanship PASS: production build succeeded after final edits; all three existing landing interaction tests passed. Browser rendered an actual WebGL canvas and Earth textures. No globe runtime errors observed; the library emitted a THREE.Clock deprecation warning.

Build also reports dependency `use client` and bundle-size warnings. The 3D code is a separate lazy chunk. Existing backend panels display their connection-error state because the API is not running; this does not affect the risk section.
