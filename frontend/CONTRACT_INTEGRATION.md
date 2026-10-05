# Dashboard contract integration

The dashboards use live BNB Testnet data only. The demo switch and seeded data have been removed. Connecting a wallet enables personal reads and signed transactions; public reads remain available without a wallet. `TransactionProvider` coordinates transaction state and disables wallet disconnect while a transaction is in progress.

## Data and transactions

- Vault balances, deployed capital, borrower approval, auction deadlines, roles, revealed bids and loans come directly from the configured contracts. Public reads work without a wallet; borrower loans are filtered by the connected account.
- Contract state refreshes every 10 seconds and after confirmed transactions. Loading, RPC failure, empty data and transaction progress have separate UI states. Live history never falls back to demo events.
- Token and vault-share decimals are read onchain. Amounts remain decimal strings until conversion to bigint. The current testnet deployment reports 18 decimals for both tokens.
- Writes simulate first, request the correct chain, wait for approval receipts before spending, and wait for a successful final receipt before reporting success. Reverts and cancelled/replaced transactions are not reported as completed actions. The connected account and chain are checked before each signature request.
- Bids are saved locally by chain, auction address, wallet, cycle deadline and commitment hash before submission. A rejected replacement does not overwrite the original saved terms. Keep a private backup of the terms and salt; browser storage is not a durable backup. The reveal form also accepts manually restored values and checks the hash against the contract.
- Recent history decodes the latest 50 events within the last 2,000 blocks, queried in 500-block batches. This is a bounded recent-activity view, not an archival indexer. The default PublicNode RPC was checked with `eth_getLogs`; custom RPC endpoints must support that method.

## Existing contract behavior respected by the UI

No Solidity source, deployment, role grant, or deployed contract was changed.

- The auction uses a lazy phase transition. The UI derives the reveal window from the latest block timestamp even while stored state is still `CommitPhase`. After the reveal deadline it displays `AwaitingFinalization`.
- The UI only enables finalization after the reveal deadline and for an auction manager. The contract itself can accept earlier finalization after the first reveal; the UI intentionally waits for the full window.
- `startAuction` does not clear the old `revealedBids` mapping. A wallet that has already revealed cannot reveal again in another cycle. The UI explains this and blocks another commitment from that wallet. Fixing this limitation requires a contract change and is outside this work.
- Repayment closes the loan on any payment. The UI therefore sends exactly the full principal, read freshly from the contract, and only for the borrower. The amount field is read-only.
- Loan storage contains a term but no start time or maturity date. Live rows say **Maturity not recorded**. The UI does not invent a maturity date or APY; this contract does not accrue interest.
- The public array getter exposes revealed borrowers but not its length. The adapter stops only at a recognized out-of-bounds contract revert; transport errors remain errors. Sealed commitments cannot be enumerated through this storage interface, so the bid list is explicitly a revealed-bid list.

## Offchain application API

Applications and credit reviews still require the API and its database. The existing application API/database uses six decimal places for `requestedAmount` and `maxPrincipal`. That format is preserved for existing records and PostgreSQL bigint capacity. At the approval boundary, the API reads the actual token decimals and converts the stored amount before calling the auction. It checks the receipt status before marking a review approved.

**Prepare wallet approval** fills the direct-wallet approval form. **Approve with API signer** uses the existing authenticated server signer, grants approval onchain and records the database review. The database and contract remain separate systems; a direct wallet approval does not mark an application reviewed in the database. The API's existing signer and admin-key configuration must be provided by the operator.

The dashboard no longer depends on the incomplete database loan/bid indexer. That indexer is not upgraded by this change.

## Configuration and verification

The defaults match `deployments.json`. Environment overrides remain available: `VITE_CHAIN_ID`, `VITE_RPC_URL`, `VITE_MOCK_USDC_ADDRESS`, `VITE_VAULT_ADDRESS`, `VITE_LOAN_MANAGER_ADDRESS`, `VITE_CREDIT_AUCTION_ADDRESS`, `VITE_EXPLORER_URL`, `VITE_API_BASE`, and the existing `VITE_ADMIN_API_KEY`. Never put a private key in frontend environment variables. Supported chain IDs are 97 and 31337; local development also needs local deployment addresses.

From `backend`, run `npm ci` once to install the dependencies used by the integration test. From `frontend`, run:

```powershell
npm test
npm run build
$env:HOMR_LIVE_READ='1'
npm test -- src/tests/Protocol.live.test.js
Remove-Item Env:HOMR_LIVE_READ
```

The Solidity integration test compiles the unchanged sources with the backend's bundled solc 0.8.26 and runs an isolated in-process Hardhat chain, with test accounts only. It covers mint/setup, deposit, redeem, approval, commit, deadline transition, invalid reveal rejection, reveal, finalization, loan reads, wrong-borrower rejection, full repayment and decoded events. It also verifies the contract's retained-reveal limitation. It skips when backend dependencies are absent. The optional live test performs reads only and is skipped in the normal test command.

Additional tests cover exact unit conversion, approval confirmation ordering, reverted/cancelled approval, wrong RPC chain, RPC errors, live history without fabricated fallback, wallet-specific loans and reveal availability. UI navigation and transaction tests use test-only mocks of protocol responses.

For the API: `npm ci`, `npm run prisma:generate`, then `npm run build`. No database migration is needed. API compilation and amount conversion are verified; no review was sent through a real API signer and no user's wallet transaction was signed during development.

## Design and verification scope

Design read: existing financial dashboards for investors, borrowers and credit managers; retain the project's calm dark surfaces, lavender action accent and task-specific navigation. ENERGY 1 / RHYTHM 2 / MOTION 1. Existing typography, spacing and components are reused so connection, receipt and failure states fit the established dashboard.

- R-17/R-38 PASS: live values come from contract reads; APY and maturity are explicitly unavailable; demo events are labelled simulated and have no explorer links.
- R-26/R-27 PASS: protocol actions are exercised against local contracts; rejected/unconnected actions, loading, errors and empty history are covered by tests and browser checks.
- R-32 PASS for changed controls: mode buttons have accessible names, restoration fields have labels, and existing keyboard navigation tests pass.
- R-35 PASS for integration scope: frontend/API builds, automated tests, local contract lifecycle and read-only deployed-contract smoke test; browser checks cover live metrics, history, missing wallet, demo separation and phase-gated controls. No claim of a signed browser-wallet testnet transaction is made.
- Visual changes reuse existing styles and add no decorative assets, effects or animation. This is an integration check, not a new audit of every pre-existing landing-page element.

Implementation references: [Viem transaction simulation](https://viem.sh/docs/contract/simulateContract), [Viem public client](https://viem.sh/docs/clients/public), [BNB RPC documentation](https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/).
