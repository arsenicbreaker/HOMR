# Live data only

Removed the demo switch, seeded balances, sample loans/events, simulated application success, and fake transaction handlers. Reads now use the protocol queries; writes use the existing wallet transaction handler. The shared transaction context remains responsible for disabling wallet disconnect while a transaction is pending.

Landing-page entry buttons now say Open dashboard. The role dialog and faucet copy describe the testnet workflow. The hero's hardcoded liquidity, LTV, and example applications were replaced by existing live API panels.

Design scope: retain the existing dashboard and landing-page visual language. ENERGY 1 / RHYTHM 1 / MOTION 1 for the affected wallet controls and record labels; no added animation. The wallet control is the only header action for connecting an account. Existing live panels supply loading, empty, and error states.

- PASS, R-26: component tests exercise walletless navigation, role selection, capital actions, commit/reveal, application submission, history refresh, and mobile-menu open/close.
- PASS, R-27: empty history and API failures do not fall back to example records; rejected deposits do not report success.
- PASS, R-17/R-38: runtime seed data and hardcoded hero financial figures are removed; fixtures are confined to tests.
- PASS, R-35 automated checks: 42 tests passed, one opt-in live-contract test skipped. The separate contract-integration file was excluded because this change does not alter contract logic. Frontend build passed with existing bundler warnings.
- PASS, source review: no runtime demo switch, simulated-data context, or mocked-success branch remains.

Browser automation has no available browser in this session. These interaction checks used DOM component tests, not a connected browser wallet. Visual inspection and signed testnet transactions were not performed.
