# 🏠 HOMR — Housing Credit Market

> **A decentralized housing credit protocol on NEAR Protocol.** HOMR connects stablecoin investors with vetted property borrowers through a NAV-tracked housing vault, commit-reveal credit auctions, and immutable on-chain audit proofs.

[![NEAR Testnet](https://img.shields.io/badge/NEAR-testnet-00ec97)](https://testnet.nearblocks.io)
[![near-sdk](https://img.shields.io/badge/near--sdk-5.17.2-000000)](https://crates.io/crates/near-sdk)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Hackathon](https://img.shields.io/badge/Indonesia%20Web3%20Hackathon-2026-orange)](#-hackathon-notes)

Built for the **Indonesia Web3 Hackathon 2026 — Finance & Commerce track**.

---

## 📖 What is HOMR?

Housing finance in emerging markets is slow, opaque, and hard to audit. HOMR turns the whole credit lifecycle into transparent, composable on-chain primitives:

- **Investors** deposit mock USDC (`mUSDC`) into a housing vault and receive `hvSHARE`, a NEP-141 share token priced against the vault's booked NAV.
- **Borrowers** are vetted by the protocol operator, then bid for credit in a **commit-reveal auction** so no participant can front-run another's terms.
- **Winning bids** are settled by the auction contract, which instructs the Loan Manager to issue the loan and the vault to disburse the principal.
- **Every step** — borrower approval, bid commitment, loan origination, repayment — is written to an **Audit Registry** and emitted as a NEP-297 event, creating a replayable, tamper-evident credit history.

---

## 🏗️ Architecture & Tech Stack

```
                    ┌──────────────────────────────┐
                    │   React + Vite frontend      │
                    │   Wallet Selector (testnet)  │
                    └──────────────┬───────────────┘
                         view calls││signed txs
              ┌────────────────────┘└──────────────────┐
              ▼                                        ▼
   ┌─────────────────────┐                  ┌─────────────────────────┐
   │  Fastify API        │                  │  NEAR Testnet contracts │
   │  TypeScript/Prisma  │──── RPC view ───▶│                         │
   │  faucet + read API  │                  │  mock-token (NEP-141)   │
   └──────────┬──────────┘                  │  housing-vault (NEP-141)│
              │ admin-signed mint           │  credit-auction         │
              └────────────────────────────▶│  loan-manager           │
                                            │  audit-registry (NEP-297)│
                                            └─────────────────────────┘
```

### Smart Contracts — Rust + `near-sdk` 5.17.2

| Contract | Crate | Responsibility |
| --- | --- | --- |
| **Housing Vault** | `contracts/housing_vault` | NEP-141 `hvSHARE` vault with NAV tracking, deposit/withdraw, loan funding and repayment booking |
| **Credit Auction** | `contracts/credit_auction` | Borrower allow-list, commit-reveal bidding, reveal verification, winner selection, loan trigger |
| **Loan Manager** | `contracts/loan_manager` | Loan origination, repayment accounting, cross-contract funding and audit registration |
| **Audit Registry** | `contracts/audit_registry` | Append-only auction/loan/repayment proofs with NEP-297 events |
| **Mock Token** | `contracts/mock_token` | Test-only NEP-141 `mUSDC` with an owner-gated mint |
| **Common** | `contracts/common` | Shared proof structs, commitment hashing and NEP-297 event helper |

The workspace enforces `overflow-checks = true`, LTO and `panic = "abort"` in release builds.

### Backend — Fastify + TypeScript + Prisma

- **Fastify 4** HTTP API with helmet, CORS, zod-validated config.
- **Prisma 5 / PostgreSQL** for indexed applications, loans, repayments and chain events (idempotent on `(receiptId, logIndex)`).
- **`near-api-js` 5** for RPC view calls and for the admin-signed faucet mint.
- **NEP-413** signature verification for admin actions.
- **Indexer** (`api/src/chain/nearIndexer.ts`) that walks blocks → chunks → receipts and persists NEP-297 events.

### Frontend — React + Vite

- **React 19 + Vite 8**, React Router 7, TanStack Query.
- **`@near-wallet-selector` 8.9** with **Meteor**, **MyNearWallet** and **Here Wallet** modules.
- Motion + three.js for the animated landing experience.
- Hand-built design system in `frontend/src/styles.css` (no CSS framework dependency).

### From EVM to NEAR

HOMR started life as a BNB Chain / Solidity prototype. The current codebase is a full rewrite around NEAR's account model and standards:

| Concern | EVM prototype | NEAR implementation |
| --- | --- | --- |
| Token standard | ERC-20 | NEP-141 (`ft_transfer`, `ft_on_transfer`, `ft_balance_of`) |
| Vault shares | ERC-4626-style shares | NEP-141 `hvSHARE` with booked NAV + virtual-offset inflation guard |
| Events | Solidity `event` logs | NEP-297 `EVENT_JSON` logs (`homr_auction`, `homr_vault`, `homr_loan`, `homr_audit`) |
| Wallet | wagmi / injected provider | `@near-wallet-selector` + `signAndSendTransaction` |
| Transaction identity | `txHash` | `receiptId` + `predecessorId` + `blockHeight` |
| Auth | `personal_sign` | NEP-413 message signatures |
| Backend chain client | `viem` | `near-api-js` + raw JSON-RPC |

Legacy EVM contracts, ABIs and the Hardhat faucet are kept under `legacy/` and `backend/` for reference only; nothing in `contracts/`, `api/` or `frontend/` imports them.

---

## ✨ Key Features

### 🚰 Faucet — 1,000 mUSDC to try the protocol
A signed backend endpoint mints **1,000 mUSDC** (6 decimals) straight to any valid testnet account. The faucet page ships with the app at `/faucet`; `GET /api/info` reports the drip size and token contract, `POST /api/claim-usdc` performs the mint with the admin key and returns the real transaction hash.

### 🏦 Housing Vault — deposit mUSDC, mint `hvSHARE`
Deposits are made with `ft_transfer_call` into the vault, which mints **NEP-141 `hvSHARE`** at the booked NAV. The vault tracks available capital and outstanding principal, and a 1e6/1e6 virtual seed pair closes the classic first-depositor donation attack. Withdrawals redeem shares for their proportional underlying via a self-callback.

### 🔨 Credit Auction — commit, reveal, settle
Only operator-approved borrowers can bid, and only within the vault's approved principal limit.

1. `commit_bid(auction_id, commitment)` — hash of `(amount, rate_bps, term_days, salt, borrower)` plus a 0.01 NEAR anti-spam deposit.
2. `reveal_bid(...)` — the contract recomputes the hash; mismatches are rejected and the commit deposit is refunded on a valid reveal.
3. `finalize_auction(auction_id)` — after the reveal deadline, the highest-yield revealed bid wins, the auction calls `loan_manager.issue_loan`, the loan manager pulls principal from the vault, and the audit registry records the proof.

### 🧾 Audit Registry — immutable credit proofs
Auction registrations, loan origination and every repayment are stored with a SHA-256 proof hash and emitted as NEP-297 `homr_audit` events. Proofs are append-only, authorized to the operator and trusted callers, and readable through `get_auction`, `get_loan` and `get_repayments`.

### 👀 Walletless demo / read-only mode
Judges can explore the landing page and both dashboards without installing a wallet: vault, loan and event data stream from the API's live testnet reads, labelled `LIVE ONCHAIN`. The wallet selector is only required for state-changing actions (deposit, bid, repay, admin operations).

---

## 📜 Smart Contracts (NEAR Testnet)

All contracts are deployed on **NEAR testnet**:

| Contract | Account ID | Explorer |
| --- | --- | --- |
| 🏦 Housing Vault | `housing-vault.funnylace8065.testnet` | [view](https://testnet.nearblocks.io/address/housing-vault.funnylace8065.testnet) |
| 🔨 Credit Auction | `credit-auction.funnylace8065.testnet` | [view](https://testnet.nearblocks.io/address/credit-auction.funnylace8065.testnet) |
| 📄 Loan Manager | `loan-manager.funnylace8065.testnet` | [view](https://testnet.nearblocks.io/address/loan-manager.funnylace8065.testnet) |
| 🧾 Audit Registry | `audit.funnylace8065.testnet` | [view](https://testnet.nearblocks.io/address/audit.funnylace8065.testnet) |
| 🪙 Mock USDC | `mock-token.funnylace8065.testnet` | [view](https://testnet.nearblocks.io/address/mock-token.funnylace8065.testnet) |

Contract IDs are wired in:

- `frontend/src/contracts/addresses.js` — network, RPC (`https://test.rpc.fastnear.com`), account IDs and explorer.
- `api/.env` — `VAULT_CONTRACT`, `AUCTION_CONTRACT`, `LOAN_MANAGER_CONTRACT`, `AUDIT_CONTRACT`, `TOKEN_CONTRACT`.

### Build & test contracts

```bash
# from the repository root
rustup target add wasm32-unknown-unknown
cargo test --workspace          # unit tests for all five contracts

# optimized WASM (requires: cargo install cargo-near)
cargo near build
```

> **Windows note:** `near-sdk`'s test dependency `aws-lc-sys` needs **NASM** on `PATH`. Install it (e.g. `winget install NASM.NASM`) and open a fresh shell before running `cargo test`.

---

## 🚀 Local Development Setup

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| **Node.js** | 20+ (tested on 26) | npm ships with it |
| **Rust** | stable | plus the `wasm32-unknown-unknown` target for contracts |
| **NASM** | 2.x | **Windows only** — required by `aws-lc-sys` for `cargo test` |
| **PostgreSQL** | 14+ | local instance or a free Neon/Supabase database |
| **NEAR CLI** | latest | only needed to deploy or inspect contracts |

```bash
git clone https://github.com/arsenicbreaker/HOMR.git
cd HOMR
```

### 1️⃣ Backend API (`api/`)

```bash
cd api
npm install
cp .env.example .env        # then edit the values below
npx prisma generate
npm run dev                 # http://localhost:4000
```

Required `api/.env` values:

```dotenv
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/homr?sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/homr?sslmode=require
CORS_ORIGIN=http://localhost:5173

NEAR_NETWORK_ID=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org

VAULT_CONTRACT=housing-vault.funnylace8065.testnet
AUCTION_CONTRACT=credit-auction.funnylace8065.testnet
LOAN_MANAGER_CONTRACT=loan-manager.funnylace8065.testnet
AUDIT_CONTRACT=audit.funnylace8065.testnet
TOKEN_CONTRACT=mock-token.funnylace8065.testnet

ADMIN_ACCOUNT_ID=funnylace8065.testnet
ADMIN_ACCOUNT_IDS=funnylace8065.testnet
ADMIN_PRIVATE_KEY=ed25519:...      # or NEAR_PRIVATE_KEY
ADMIN_API_KEY=change-me
NEP413_RECIPIENT=homr-api.testnet
```

> ⚠️ The API reads `VAULT_CONTRACT`, `AUCTION_CONTRACT`, `LOAN_MANAGER_CONTRACT`, `AUDIT_CONTRACT` and `TOKEN_CONTRACT`. The legacy `*_CONTRACT_ID` names still present in `api/.env.example` are **not** read by `api/src/config.ts` — keep the names above.
>
> `ADMIN_PRIVATE_KEY` (or `NEAR_PRIVATE_KEY`) must be a full-access key registered on `ADMIN_ACCOUNT_ID`; it signs faucet mints. Without it the faucet returns an error rather than a simulated hash.

Apply the database schema:

```bash
npm run prisma:deploy       # production / existing database
# or: npm run prisma:migrate   # local development
```

Useful endpoints once it is running:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness + network |
| `GET` | `/api/vault` | Live vault state from testnet |
| `GET` | `/api/loans`, `/api/loans/:id` | Indexed loans |
| `GET` | `/api/events?limit=50` | NEP-297 event feed |
| `GET` | `/api/info` | Faucet metadata (`dripUsdc: "1000"`) |
| `POST` | `/api/claim-usdc` | Mint 1,000 mUSDC to `{ "accountId": "you.testnet" }` |

### 2️⃣ Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Optional `frontend/.env`:

```dotenv
VITE_API_BASE=http://localhost:4000
VITE_FAUCET_API_BASE=http://localhost:4000
```

With no `.env` file, Vite development already defaults to `http://localhost:4000`. In production builds it falls back to `https://api.homr.web.id`. Contract account IDs and the RPC endpoint live in `frontend/src/contracts/addresses.js`.

Routes:

- `/` — landing page with live vault stats
- `/app/invest` — investor dashboard (deposit, withdraw, portfolio)
- `/app/borrow` — borrower dashboard (applications, bids, loans)
- `/app/admin` — operator console (approve borrowers, open/finalize auctions)
- `/faucet` — claim 1,000 mUSDC

### 3️⃣ Tests

```bash
# contracts (from repo root, NASM on PATH on Windows)
cargo test --workspace

# API
cd api && npm test           # node:test via tsx

# frontend
cd frontend && npm test      # vitest run
```

---

## 🗂️ Repository Layout

```
HOMR/
├── contracts/               # Rust NEAR workspace
│   ├── common/              # shared proofs, hashing, NEP-297 helper
│   ├── housing_vault/       # NEP-141 vault + NAV
│   ├── credit_auction/      # commit-reveal auctions
│   ├── loan_manager/        # origination + repayments
│   ├── audit_registry/      # immutable credit proofs
│   └── mock_token/          # test mUSDC
├── api/                     # Fastify + Prisma + near-api-js
│   ├── src/chain/           # RPC, indexer, signer, NEP-297 decoder
│   ├── src/routes/          # health, public, faucet, admin
│   └── prisma/              # PostgreSQL schema
├── frontend/                # React + Vite dApp
│   └── src/                 # pages, components, NEAR wallet provider
├── legacy/                  # EVM-era contracts, ABIs, scripts (reference)
├── backend/                 # legacy Hardhat + faucet (reference)
└── deploy/                  # legacy VPS deployment assets
```

---

## 🎓 Hackathon Notes

- **Indexer is disabled for the presentation.** `api/src/server.ts` starts with `startIndexer()` commented out to avoid draining the public testnet RPC quota while a live demo runs. The API logs `NEAR Indexer is DISABLED (presentation mode)` and keeps serving live vault reads through `nearRpc.ts`. Re-enable the two commented lines once you have a dedicated/archival RPC endpoint.
- **Walletless demo.** The dashboards are fully browsable read-only: vault, loans and audit events are fetched from the API and labelled `LIVE ONCHAIN`, so judges can evaluate the protocol before creating a wallet. Transactions still go through the NEAR Wallet Selector (Meteor, MyNearWallet, Here Wallet).
- **Testnet only.** `mUSDC` is a mock token with an owner-gated mint; no real funds are involved. `hvSHARE`, loan balances and audit proofs are testnet state.
- **Demo flow for judges:** claim mUSDC at `/faucet` → deposit into the Housing Vault at `/app/invest` → watch the borrower dashboard commit and reveal a bid → the operator finalizes the auction → inspect the loan and its audit proof in the event feed.
- **Known limitations:** the Prisma-backed event feed only advances while the indexer runs; the public testnet RPC is rate-limited; and admin actions require a NEP-413 signature or the `x-api-key` header in local development.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

<p align="center">Built with ❤️ for the Indonesia Web3 Hackathon 2026 · NEAR Protocol</p>
