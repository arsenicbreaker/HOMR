# HOMR
## Housing Credit Market — Transparent Onchain Allocation

**Submission track:** Finance & Commerce — DeFi, payments and RWA for Indonesia  
**Document status:** Hackathon MVP PRD  
**Version:** 1.0  
**Prepared for:** Indonesia Web3 Hackathon 2026  
**Working tagline:** *A competitive housing-credit market, transparently onchain.*

---

## 1. Executive Summary

HOMR is an Indonesia-focused onchain housing-credit marketplace that lets investors deposit stablecoins into a diversified credit vault while qualified real-estate borrowers compete transparently for capital.

The MVP separates two decisions that are often conflated:

1. **Credit eligibility:** an offchain credit manager evaluates the borrower, property, collateral and financing request.
2. **Capital allocation:** after approval, eligible borrowers submit sealed financing bids through a commit–reveal auction. A deterministic smart contract finalizes the allocation within vault risk and liquidity limits.

Investors do not need to select individual borrowers. They deposit into one vault, receive vault shares, and see which loans are funded, how capital is allocated, and how repayments affect portfolio value.

The hackathon demo uses clearly labelled simulated borrower/property data. It demonstrates the complete onchain flow without claiming that the prototype performs legally binding underwriting, verifies real collateral, or offers a regulated investment product.

---

## 2. Problem

Housing and residential-property operators need financing, but access is often slow, opaque and relationship-driven. On the other side, stablecoin holders looking for real-world yield face fragmented private-credit opportunities and limited visibility into how capital is deployed.

Current pain points:

- borrowers cannot easily compare or compete for available financing;
- investors have limited loan-level visibility after depositing into a private-credit pool;
- a yield headline does not explain collateral, LTV, maturity, concentration or default exposure;
- credit assessment and capital allocation are frequently mixed together;
- Indonesian users need a simpler experience than a complex DeFi lending terminal.

Real-estate credit platforms demonstrate demand for institutional, collateralized onchain credit, but HOMR focuses its hackathon differentiation on an Indonesia-first allocation layer: qualified borrowers compete for limited capital under visible rules.[1]

---

## 3. Product Vision

Build a simple investor experience on top of disciplined, transparent credit infrastructure:

> **Simple for investors. Competitive for borrowers. Disciplined by risk. Transparent onchain.**

HOMR is not a promise of guaranteed yield and is not a replacement for licensed underwriting, legal security perfection, valuation, servicing or regulatory compliance.

---

## 4. Target Users

### 4.1 Investor / Capital Provider

Crypto-native individuals, professional allocators and future institutional users who want to inspect and support a diversified housing-credit portfolio without choosing every loan manually.

**Needs:** understandable risk, visible portfolio composition, clear deposit/withdrawal state and transaction proof.

### 4.2 Borrower / Property Operator

A property investor, renovation operator or residential developer requesting financing for a specific project.

**Needs:** clear eligibility requirements, predictable auction rules, transparent financing result and payment schedule.

### 4.3 Credit Manager

A trusted operator who reviews applications and publishes an eligibility decision before an auction begins.

**Needs:** borrower/application review, configurable risk limits, audit trail and loan monitoring.

### 4.4 Hackathon Judge / Observer

A visitor who should understand the value proposition and verify the core flows within three minutes, even without a wallet.

---

## 5. Why Web3 / Why BNB Chain

The product uses blockchain where it creates verifiable value:

- stablecoin deposits, vault shares and loan allocations are represented by smart-contract state;
- auction commitments and reveals create a tamper-evident allocation process;
- repayment events and portfolio accounting can be independently inspected;
- a public transaction trail reduces dependence on screenshots or unverifiable admin claims;
- BNB Chain provides the hackathon's target environment for the prototype.

Offchain components remain intentional: KYC/KYB, property documents, valuations, borrower identity and sensitive underwriting evidence should not be placed publicly onchain. The prototype stores only hashes, references and decision outputs onchain.

**Target network:** BNB Chain testnet for the hackathon demo. Chain ID, RPC and explorer URL must be taken from the current official hackathon/BNB documentation and recorded in `DEPLOY_NOTES.md` before deployment; this PRD does not invent network constants.

---

## 6. Core User Flows

### 6.1 Investor Flow

```text
Landing page
  → Connect wallet or Demo mode
  → View Housing Credit Vault
  → Deposit test stablecoin
  → Receive vault shares
  → Inspect funded loans and allocation events
  → Request redemption / view liquidity state
```

### 6.2 Borrower Flow

```text
Register demo borrower
  → Submit financing request
  → Credit manager reviews application
  → Approved borrower enters auction
  → Commit sealed bid
  → Reveal bid
  → View allocation result
  → Loan is created
  → Submit repayment
```

### 6.3 Judge Flow

```text
Open demo link
  → Choose Investor or Borrower journey
  → Complete the happy path without requiring real funds
  → Open transaction/activity panel
  → Verify contract events on the BNB testnet explorer
```

---

## 7. MVP Scope

The MVP is deliberately limited to one complete, demonstrable loop.

### 7.1 In Scope

#### Investor

- wallet connection;
- walletless demo mode with clearly labelled simulated data;
- one Housing Credit Vault;
- test stablecoin deposit;
- vault-share minting;
- portfolio value, share balance and basic NAV display;
- funded-loan list and loan detail;
- redemption request or simulated redemption queue.

#### Borrower

- demo borrower registration;
- financing application with property and loan fields;
- credit-manager approval/rejection state;
- one auction participation flow;
- commit bid;
- reveal bid;
- auction finalization and allocation result;
- loan creation after allocation;
- repayment transaction/state update.

#### Credit Manager / Admin

- create one auction;
- approve or reject a borrower;
- configure available capital, maximum allocation and basic concentration limits;
- finalize auction;
- publish a loan status update.

#### Transparency

- event/activity timeline;
- links to relevant testnet transactions;
- visible distinction between simulated offchain data and onchain facts;
- public contract addresses in the README.

### 7.2 Explicitly Out of Scope

- real-money deposits or real investment solicitation;
- production KYC/KYB;
- legal mortgage/lien creation or collateral enforcement;
- automated property valuation;
- multi-chain deployment;
- secondary-market trading;
- leverage;
- governance token or DAO;
- automated liquidation;
- prediction/decision market;
- AI underwriting;
- multiple vault strategies;
- fiat on/off-ramp;
- guaranteed yield.

These are roadmap items, not hidden MVP commitments.

---

## 8. Functional Requirements

### FR-01 — Vault Deposit

An investor can deposit test USDC into the vault and receive shares according to the current share price.

**Acceptance criteria:**

- deposit amount is validated against wallet balance;
- share amount is calculated deterministically;
- deposit event is emitted;
- dashboard reflects updated shares and vault TVL;
- transaction hash is visible.

### FR-02 — Vault Accounting

The vault displays total assets, total shares, share price, available capital and deployed capital.

For the MVP, NAV may be updated by explicit repayment/accounting transactions. Any simulated yield must be labelled `DEMO DATA`.

### FR-03 — Borrower Approval Gate

Only an approved borrower can commit a bid.

**Acceptance criteria:**

- rejected/unreviewed borrower transactions revert;
- approval status is visible in the borrower dashboard;
- approval output includes max principal, max LTV and permitted duration.

### FR-04 — Commit–Reveal Auction

An approved borrower commits a hash of their bid and salt, then reveals the original values during the reveal window.

```text
commitment = keccak256(amount, rate, term, borrower, salt)
```

The contract must reject:

- commits after the commit deadline;
- reveals before the reveal phase;
- invalid hash/salt combinations;
- duplicate reveal attempts;
- allocations above available capital or borrower limits.

### FR-05 — Deterministic Allocation

The MVP allocates only among approved borrowers and applies visible rules:

1. borrower approval is mandatory;
2. bid must satisfy amount, rate, term and LTV limits;
3. allocation cannot exceed available capital;
4. per-borrower and concentration caps apply;
5. remaining capital stays in the vault/reserve.

The first implementation may use a deterministic ranking such as risk tier → offered rate → earlier valid reveal, with the exact rule displayed before auction start. The product must not claim that the highest rate alone determines creditworthiness.

### FR-06 — Loan Creation

A finalized allocation creates a loan record containing:

- borrower ID/address;
- principal;
- rate;
- term/maturity;
- risk tier;
- collateral/property reference hash;
- status;
- repayment history.

### FR-07 — Repayment

A borrower can repay principal plus interest in test stablecoin. The repayment updates the loan and vault accounting and emits an event.

### FR-08 — Redemption State

An investor can request redemption. The UI must distinguish:

- immediately available liquidity;
- pending redemption;
- settlement after repayment/maturity.

The prototype must not imply that private-credit shares are instantly liquid.

---

## 9. Smart Contract Architecture

### 9.1 `HousingCreditVault`

Responsibilities:

- accept test stablecoin deposits;
- mint/burn vault shares;
- track assets and deployed capital;
- receive repayments;
- maintain redemption state;
- enforce administrator and loan-manager permissions.

### 9.2 `CreditAuction`

Responsibilities:

- create auction;
- store commitments;
- enforce commit and reveal windows;
- validate revealed bids;
- finalize deterministic allocation;
- emit allocation events.

### 9.3 `LoanManager` / `LoanRegistry`

Responsibilities:

- create loans from finalized allocations;
- track principal, rate, maturity and status;
- accept repayment;
- emit repayment and status events.

### 9.4 `MockUSDC`

Test-only ERC-20 used for the demo. It must be prominently labelled as having no real value.

### 9.5 Access Control

Use role-based permissions:

- `DEFAULT_ADMIN_ROLE`: configuration and emergency pause;
- `CREDIT_MANAGER_ROLE`: approve applications and create auctions;
- `AUCTION_MANAGER_ROLE`: finalize valid auctions;
- `LOAN_MANAGER_ROLE`: create/update loan state;
- investor/borrower wallets: user actions only.

Admin controls must be visible in the README and are acceptable for the hackathon MVP, but the production roadmap must include multisig/timelock controls.

---

## 10. Data Model

### Onchain

- wallet addresses;
- vault share balances;
- stablecoin balances and transfers;
- auction parameters and deadlines;
- bid commitments and reveal validity;
- allocation results;
- loan principal, rate, maturity and status;
- repayment events;
- hashes of offchain documents.

### Offchain / Sensitive

- legal identity and KYC/KYB records;
- property documents and exact addresses;
- valuation reports;
- underwriting notes;
- borrower contact details.

The frontend must clearly label whether each displayed field is `Onchain`, `Verified offchain`, `Simulated`, or `Pending review`.

---

## 11. Investor Experience

### Overview Cards

- Vault TVL;
- current share price;
- deposited amount;
- share balance;
- deployed capital;
- available liquidity;
- number of active loans.

### Portfolio Table

| Field | Example status |
|---|---|
| Loan | HK-001 |
| Principal | 100,000 mock USDC |
| Rate | 10% demo rate |
| LTV | 60% simulated |
| Status | Performing / simulated |
| Maturity | Date |
| Proof | Testnet transaction |

Use plain-language explanations beside financial terms. Do not display an APY as a promise; use `illustrative target rate` or `demo rate` where appropriate.

---

## 12. Borrower Experience

Borrower pages:

- application status;
- approved financing limits;
- auction timeline;
- commitment and reveal actions;
- bid validation feedback;
- allocation result;
- loan and repayment schedule;
- document/reference status.

The borrower should never be asked to expose sensitive documents publicly for the demo.

---

## 13. Risk and Trust Model

### Eligibility is not Allocation

Credit approval is performed by the credit manager using declared rules. The auction only allocates capital among approved participants.

### MVP Risk Controls

- maximum LTV per approved borrower;
- maximum principal per borrower;
- maximum portfolio allocation per risk tier;
- minimum and maximum term;
- reserve/undeployed-capital floor;
- emergency pause;
- invalid reveal rejection;
- no direct admin transfer of vault funds in the normal flow.

### Demo Disclosure

The MVP uses simulated property, borrower and repayment data. It demonstrates accounting and allocation mechanics, not proof that a real borrower can repay or that collateral is enforceable.

---

## 14. Security Requirements

- use OpenZeppelin audited primitives where practical;
- follow checks-effects-interactions and use reentrancy protection;
- validate token amounts and deadline boundaries;
- prevent duplicate commitments/reveals;
- prevent unauthorized loan creation and allocation finalization;
- write unit tests for vault share accounting;
- write commit–reveal tests for valid, invalid, early and late reveals;
- write allocation invariant tests so allocated capital never exceeds available capital;
- run a local EVM end-to-end test before testnet deployment;
- disclose that the hackathon contracts are unaudited.

---

## 15. Success Metrics for the Hackathon Demo

### Product

- a first-time visitor understands the product within 60 seconds;
- a judge can complete investor and borrower happy paths within 3 minutes;
- the demo works in walletless mode;
- every claimed onchain action links to a testnet transaction.

### Technical

- vault deposit and share mint succeeds;
- only approved borrowers can commit;
- valid reveal finalizes successfully;
- invalid reveal reverts;
- allocation invariant passes;
- loan creation and repayment update state;
- frontend reflects contract events after refresh.

### Narrative

- judges can explain why the product is different from a generic RWA vault;
- the Indonesia/BNB Chain relevance is obvious;
- the team clearly distinguishes real onchain execution from simulated credit data.

---

## 16. Demo Script

1. Open the landing page and select **Try Demo**.
2. Show the vault: available capital, deployed capital and loan count.
3. Deposit mock USDC and show vault shares plus transaction activity.
4. Switch to Borrower mode and open an approved application.
5. Commit a sealed bid; show that the bid details are not displayed before reveal.
6. Reveal the bid and finalize the auction.
7. Show deterministic allocation and the created loan.
8. Repay the loan with mock USDC.
9. Return to the investor dashboard and show the repayment event reflected in vault accounting.
10. Open the transparency panel and verify the key events on the BNB testnet explorer.

Fallback: a walletless demo with seeded state, labelled clearly as `SIMULATED DEMO`, must be available if the faucet, wallet or testnet is unavailable.

---

## 17. Roadmap

### Phase 1 — Hackathon MVP

- one vault;
- mock stablecoin;
- one auction;
- commit–reveal;
- one or more simulated borrowers;
- loan creation and repayment;
- BNB Chain testnet deployment;
- demo mode and transaction transparency.

### Phase 2 — Controlled Pilot

- real KYB/KYC provider integration;
- licensed originator and servicing partner;
- document hash registry;
- valuation-provider integration;
- multisig operations;
- configurable risk policy engine;
- reporting and reserve accounting;
- legal review for Indonesia and target lending jurisdictions.

### Phase 3 — Production Network

- multiple vault strategies;
- institutional capital onboarding;
- audited contracts;
- permissioned borrower/investor access where required;
- secondary liquidity mechanisms;
- multi-originator marketplace;
- optional advisory decision-market module, kept separate from credit approval and fund movement.

---

## 18. Business Model — Future, Not MVP

Potential future revenue:

- origination fee;
- servicing fee;
- management fee;
- interest spread;
- liquidity/redemption fee where legally and commercially appropriate.

No fee or yield claim is activated in the hackathon demo. Production economics require legal, credit and regulatory review.

---

## 19. Competitive Positioning

HOUSD demonstrates the broader category of institutional real-estate credit infrastructure onchain.[1] HOMR should not claim to be the first housing-credit RWA platform.

**Our specific hackathon angle:**

> An Indonesia-focused, investor-simple housing-credit vault with a visible commit–reveal allocation market for qualified borrowers.

**What is different in the demo:**

- allocation competition is a first-class product flow, not an invisible manager action;
- investors see the allocation trail without manually bidding on loans;
- eligibility is separated from market allocation;
- the UI discloses simulated versus onchain data;
- BNB Chain testnet execution is verifiable by judges.

---

## 20. Submission Checklist

- [ ] Team registered through the official event registration flow. The official site states that registration is required before submission.[2]
- [ ] Project submitted through the connected-wallet submission portal.[4]
- [ ] Track selected: Finance & Commerce.
- [ ] Public GitHub repository.
- [ ] README includes architecture, setup, contract addresses and demo instructions.
- [ ] `DEPLOY_NOTES.md` includes exact BNB testnet network details used.
- [ ] Testnet transaction links are valid.
- [ ] Walletless demo works.
- [ ] Mock data is labelled throughout the product.
- [ ] Smart contracts compile and local E2E tests pass.
- [ ] No private keys, API keys, real KYC documents or sensitive borrower data committed.
- [ ] Three-minute demo video recorded.
- [ ] Pitch explains the problem, Web3 necessity, MVP proof and next step.

The event page describes the competition as built on BNB Chain and lists Finance & Commerce as the track for DeFi, payments and RWA; the submission portal requires wallet sign-in, while the event page states that the submission window is 1–30 September 2026.[2][3][4]

---

## 21. One-Sentence Pitch

**HOMR is an Indonesia-focused onchain housing-credit marketplace where stablecoin investors access a transparent vault and qualified property borrowers compete fairly for limited capital through a verifiable commit–reveal auction.**

---

## Sources

[1] HOUSD, “Real Assets. Real Yield.” — https://www.housd.finance/  
[2] Indonesia Web3 Hackathon 2026 — https://indonesiaweb3hack.xyz/en  
[3] Indonesia Web3 Hackathon 2026, “Prizes” — https://indonesiaweb3hack.xyz/en/prizes  
[4] Indonesia Web3 Hackathon 2026, “Submit project” — https://indonesiaweb3hack.xyz/en/submit

---

## Positioning Note

**Verified positioning:** HOMR is positioned as a focused Indonesia/BNB Chain prototype combining a simple housing-credit vault with transparent allocation among pre-qualified borrowers. It does not claim to be first, does not promise yield, and does not represent simulated underwriting/collateral as real-world verification.

*This PRD is a product and hackathon submission document, not legal, investment or financial advice.*
