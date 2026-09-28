# Dokumentasi Frontend HOUSD Protocol (BNB Smart Chain MVP)

## Gambaran Umum
Aplikasi Frontend HOUSD Protocol dibangun menggunakan **React 19 + Vite + Wagmi + Viem + Vitest** dengan arsitektur **Additive-Only**. Desain antarmuka mengacu pada standar *Superhuman Dark UI* (surfaces `#0B0B0D`, `#131316`, `#1A1A1E` dengan aksen electric-violet `#7C7CFF`).

Setiap data pada antarmuka dilabeli secara ketat menggunakan chip status mono (`Onchain`, `Verified offchain`, `Simulated`, `Pending review`, dan tag `DEMO DATA`) untuk menjamin transparansi publik.

---

## Panduan Menjalankan & Pengujian

### 1. Jalankan Local Development Server
```bash
cd frontend
npm install
npm run dev
```
Aplikasi berjalan secara terpadu di `http://localhost:5173`.

### 2. Jalankan Pengujian Unit (Vitest)
```bash
npm run test
```

---

## 🗺️ Pemetaan Route & Pembatasan Role

| Route Path | Peran / Hak Akses | Fitur Utama |
|---|---|---|
| **`/`** | **Public Landing Page** | Presentasi produk, ringkasan bukti onchain, serta dialog penentuan peran (*Mulai Demo*). |
| **`/app/invest`** | **Investor Dashboard** | • Ringkasan Vault (TVL, Share Price, Available vs Deployed Capital, APY).<br>• Form Deposit mUSDC & Minting `hvSHARE`.<br>• Portfolio Pinjaman Aktif yang Didanai Vault.<br>• Form Pengajuan Redemption Share. |
| **`/app/borrow`** | **Borrower Portal** | • Status Approval Limit Kredit & Hash Sertifikat Properti.<br>• Commit-Bid Form (Hash Keccak256 `solidityPackedKeccak256`).<br>• Reveal-Bid Form (Buka parameter bid jumlah, rate, tenor, salt).<br>• Form Pembayaran Pinjaman (*Repayment*). |
| **`/app/admin`** | **Credit Manager Panel** | • Underwriting & Approval Limit Kredit Borrower Onchain.<br>• Kontrol Siklus Lelang (Start Auction & Finalize Auction).<br>• Antrean Evaluasi Bid Lelang. |

> **Catatan Pembatasan Role:** Header pada `/app/invest`, `/app/borrow`, dan `/app/admin` bersifat terisolasi (*isolated header*), hanya menampilkan peran aktif masing-masing tanpa tombol navigasi antar peran untuk menjaga kejelasan hak akses.

---

## Struktur Direktori (`frontend/src/`)

```
frontend/src/
├── App.test.jsx                  # Single unit test landing page utama (UNTOUCHED)
├── main.jsx                      # App entry point, React Router configuration & Web3/Demo providers
├── styles.css                    # Landing page styling (UNTOUCHED)
│
├── theme/                        # Sistem Desain Tokens (DESIGN_DECISIONS.md)
│   ├── colors.js                 # Token warna kanvas gelap, aksen violet, dan chip status
│   └── tokens.js                 # Skala tipografi, jarak (spacing), dan radius biner (8px/16px)
│
├── contracts/                    # Integrasi Smart Contract
│   ├── addresses.js              # Alamat kontrak (MockUSDC, Vault, LoanManager, Auction) & RPC Testnet
│   └── abi/                      # JSON & JS ABI hasil kompilasi backend Hardhat
│       ├── CreditAuction.js
│       ├── HousingCreditVault.js
│       ├── LoanManager.js
│       └── MockUSDC.js
│
├── components/                   # Reusable UI Components
│   ├── ui/
│   │   ├── DataLabelChip.jsx     # Render chip status [Onchain], [Verified offchain], [Simulated], [Pending review]
│   │   ├── DemoTag.jsx           # Render tag [DEMO DATA] untuk metrik simulasi
│   │   ├── InboxRow.jsx          # Pola hairline inbox row (status dot + copy + state chip)
│   │   ├── ShortcutBar.jsx       # Strips hint keyboard shortcut (J/K, Enter, ⌘K)
│   │   └── TxLink.jsx            # Tautan Explorer BSC Testnet untuk tx hash
│   ├── layout/
│   │   ├── AppNavbar.jsx         # Header terisolasi sesuai role + Wallet & Demo mode toggle
│   │   └── AppLayout.jsx         # Shell layout aplikasi & footer
│   └── transparency/
│       └── TransparencyLedger.jsx# Audit trail stream berisi log event kontrak real & simulasi
│
├── context/                      # State Management Providers
│   ├── Web3Provider.jsx          # Provider wrapper Wagmi + Viem + React Query
│   └── DemoModeContext.jsx       # State Provider walletless demo mode & seeded data
│
├── hooks/                        # Custom Web3 & Demo Hooks
│   ├── useVault.js               # Read/write state HousingCreditVault
│   ├── useAuction.js             # Read/write state CreditAuction (commit-reveal workflow)
│   ├── useLoanManager.js         # Read/write state LoanManager & repayments
│   └── useTransparencyEvents.js  # Stream activity events audit
│
├── pages/                        # Tampilan Halaman Utama Role
│   ├── InvestorDashboard.jsx     # Halaman Investor
│   ├── BorrowerDashboard.jsx     # Halaman Borrower
│   └── AdminPanel.jsx            # Halaman Credit Manager / Admin
│
└── tests/                        # Vitest Component Unit Tests (JS DOM Environment)
    ├── DepositForm.test.jsx
    ├── AuctionStateTransitions.test.jsx
    └── DataLabelChips.test.jsx
```

---

## Pengelompokan & Labeling Data (PRD Compliance)

Setiap komponen pada antarmuka mematuhi aturan pelabelan data sebagai berikut:

1. **`Onchain`** (Warna Hijau Mint `#7CFFB2`):
   - TVL Vault, Balance Share, Alokasi Pinjaman, Tx Event Log.
2. **`Verified offchain`** (Warna Kuning `#FFD66B`):
   - Hasil Penilaian Sertifikat Rumah, Bukti Verifikasi Pertanahan (BPN).
3. **`Simulated`** (Warna Merah Muda `#FF8FA3`):
   - Data simulasi *walletless demo mode*.
4. **`Pending review`** (Warna Biru `#90CAF9`):
   - Aplikasi kredit borrower yang belum disetujui admin.
5. **`DEMO DATA`**:
   - Ditempatkan wajib di samping angka estimasi APY / Yield proyeksi.

---

## Alur Smart Contract Backend Terkait

- **`HousingCreditVault.sol`**: `deposit(assets)`, `withdraw(shares)`, `availableCapital()`, `totalDeployedCapital()`.
- **`CreditAuction.sol`**: `approveBorrower()`, `startAuction()`, `commitBid(bytes32)`, `revealBid(amount, rate, term, salt)`, `finalizeAuction()`.
- **`LoanManager.sol`**: `repayLoan(loanId, amount)`, `loans(loanId)`.
- **`MockUSDC.sol`**: `mint(to, amount)`, `approve(spender, amount)`.
