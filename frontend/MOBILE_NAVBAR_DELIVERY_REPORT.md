# Mobile hamburger navbar

Scope: replace the landing navbar's mobile Menu/Close text with hamburger/close glyphs. Desktop layout and existing mobile breakpoint stay unchanged.

Design read: existing HOMR navigation for mobile visitors; charcoal/lavender palette and existing typography retained. ENERGY 1 / RHYTHM 2 / MOTION 1 for this control.

- PASS Hard Gate: native button preserves Menu/Close accessible names, aria-expanded, aria-controls, and visible focus. No new content claims, assets, destinations, themes, forms, or async data states.
- PASS Purpose Gate: the three-line glyph identifies navigation; the X identifies closing. A 44px target supports touch input; existing colors and shape preserve the navbar's identity. No decorative effects added.
- PASS Liveliness: existing wordmark and CTA keep their hierarchy. The menu has a clear state change, with no extra motion required.
- PASS Craftsmanship: mobile at 390x844 shows hamburger; click opens links and changes to X; clicking X closes; Enter opens; choosing Demo navigates to #demo and closes.
- PASS Desktop: at 1280x900, the menu button remains display:none and the navigation links remain display:flex.
- PASS Validation: production build succeeded; 3/3 existing landing interaction tests passed; git diff --check clean; browser error log empty.

Build warnings remain in existing dependencies and chunk sizes. Screenshot: mobile-navbar-preview.jpg.

## Left-position follow-up

- PASS Layout: hamburger now precedes the logo in the DOM and mobile visual order; mobile padding is 8px with a 10px gap so the 44px touch target fits comfortably.
- PASS Interaction: opened and closed the left-position menu in the browser at 390x844.
- PASS Desktop: at 1280x900, menu remains hidden and links remain flex; desktop grid and padding are unchanged.
- PASS Build: production build rerun successfully. Earlier test results above belong to the icon change; this positioning edit was verified by build and browser interaction.
- PASS Design gate: same icon, contrast, typography, accessible labels, focus styles, and content retained; only mobile placement and spacing changed. Screenshot refreshed.

## Dropdown alignment follow-up

- PASS Position: mobile header is now the positioning reference; dropdown starts 8px below it with its left edge aligned exactly with the hamburger (24.8px at the inspected 390px viewport).
- PASS Purpose: opaque brand-colored surface separates navigation from underlying text; a restrained shadow indicates an overlay, 16px corners match the design system, and full-width 44px rows improve touch targets.
- PASS Responsive: dropdown fits at 320px and 390px widths; all five link targets measured 44px tall. Viewport-limited height allows scrolling on short screens.
- PASS Interaction: open and close work; selecting Demo navigates to #demo and closes the dropdown.
- PASS Desktop: navigation stays in normal layout (position:static); hamburger stays hidden at 1280px.
- PASS Validation: production build and whitespace checks passed. CSS-only change verified in the browser; no new tests added. Preview saved as mobile-dropdown-preview.jpg.
- PASS Design gate: existing content, typography, focus semantics, accent palette, and hierarchy retained; no new claims or destinations introduced.
