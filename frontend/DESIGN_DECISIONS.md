# HOUSD Landing Page Design Decisions

Design read: a Superhuman-inspired dark UI for a hackathon RWA landing page, aimed at judges and prospective users who value clarity, speed and verifiable proof. Dials: ENERGY 1, RHYTHM 4, MOTION 1.

- Color: near-black surfaces (`#0B0B0D`, `#131316`, `#1A1A1E`) with a single electric-violet accent (`#7C7CFF`) used sparingly for focus rings, the active demo tab and one status dot. State colors (`#7CFFB2` onchain, `#FFD66B` offchain, `#FF8FA3` simulated) appear only inside mono chips.
- Layout: the page is a sequence of hairline-divided sections — topbar, hero, two-decision list, journey, transparency ledger, risk, footer. Decision rows, journey steps and the proof ledger use the same "inbox row" pattern so information density is consistent.
- Typography: Inter for everything UI-facing (wordmark, headlines, body, buttons); JetBrains Mono for labels, state chips and keyboard hints. No serif anywhere.
- Spacing: generous vertical rhythm (80–96px) on dark surfaces so dense rows still feel calm. Rows themselves are tight (14–18px vertical padding) to communicate evidence and precision.
- Cards: rotated cream/coral cards are gone. Decisions are a vertical list with a status dot, plain-language copy and a right-aligned state chip.
- Motion: 120ms ease-out on hover and focus, 160ms rise on the demo dialog, no bobbing, no rotation.
- Imagery: the warm Indonesian residential photo was removed; the dark hero uses a soft radial gradient and a status dot to communicate the same geographic and product context without the editorial weight.
- Keyboard: a visible shortcut strip (`J/K`, `Enter`, `⌘K`) plus per-tab shortcut hints make the keyboard-first story legible from the first viewport.
