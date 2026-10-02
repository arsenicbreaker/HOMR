# HOUSD Landing Page Design Decisions

## Role dashboard extension

Design read: role-based financial operations dashboards for borrowers, investors, and credit managers, using the landing page's calm, precise visual language. Dials: ENERGY 1, RHYTHM 2, MOTION 1.

- Color: the navigation rail uses the deepest neutral surface from `Design.md`; lavender is limited to the active rail, focus, and the primary summary border so navigation never becomes a large purple block.
- Layout: a 96px navigation rail and one selected-content region reduce unrelated actions on screen while keeping nearly all horizontal space available for role-specific data.
- Typography: the existing Super Sans stack remains the primary voice; mono is limited to amounts, states, and operational metadata where fixed-width scanning helps.
- Spacing: 12px to 18px internal gaps keep summaries, data rows, forms, and actions dense enough for repeated operational use without collapsing their hierarchy.
- Cards: one dark primary summary is visually dominant; smaller supporting metrics, medium activity panels, and compact contextual actions vary by importance instead of repeating one card pattern.
- Navigation: each role receives only the sections supported by its existing responsibilities and handlers, with custom line icons that directly represent overview, property, auction, loan, repayment, portfolio, review, and audit functions. The selected destination uses an 8% primary tint and a 2px inset indicator, while inactive hover uses a 4% neutral surface tint so every item stays integrated with the rail.
- Motion: transitions are limited to hover, focus, tab changes, and the mobile sidebar drawer so feedback stays immediate without distracting from financial actions.
- Responsive behavior: the desktop sidebar becomes a keyboard-accessible drawer below 900px, and all multi-column data and forms collapse to one column without horizontal overflow.

Design read: a Superhuman-inspired dark UI for a hackathon RWA landing page, aimed at judges and prospective users who value clarity, speed and verifiable proof. Dials: ENERGY 1, RHYTHM 4, MOTION 1.

- Color: near-black surfaces (`#0B0B0D`, `#131316`, `#1A1A1E`) with a single electric-violet accent (`#7C7CFF`) used sparingly for focus rings, the active demo tab and one status dot. State colors (`#7CFFB2` onchain, `#FFD66B` offchain, `#FF8FA3` simulated) appear only inside mono chips.
- Layout: the page is a sequence of hairline-divided sections — topbar, hero, two-decision list, journey, transparency ledger, risk, footer. Decision rows, journey steps and the proof ledger use the same "inbox row" pattern so information density is consistent.
- Typography: Inter for everything UI-facing (wordmark, headlines, body, buttons); JetBrains Mono for labels, state chips and keyboard hints. No serif anywhere.
- Spacing: generous vertical rhythm (80–96px) on dark surfaces so dense rows still feel calm. Rows themselves are tight (14–18px vertical padding) to communicate evidence and precision.
- Cards: rotated cream/coral cards are gone. Decisions are a vertical list with a status dot, plain-language copy and a right-aligned state chip.
- Motion: 120ms ease-out on hover and focus, 160ms rise on the demo dialog, no bobbing, no rotation.
- Imagery: the warm Indonesian residential photo was removed; the dark hero uses a soft radial gradient and a status dot to communicate the same geographic and product context without the editorial weight.
- Keyboard: a visible shortcut strip (`J/K`, `Enter`, `⌘K`) plus per-tab shortcut hints make the keyboard-first story legible from the first viewport.
