import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const proofItems = [
  { label: 'Vault', value: 'Housing Credit Vault', state: 'ONCHAIN' },
  { label: 'Network', value: 'BNB Chain Testnet', state: 'ONCHAIN' },
  { label: 'Borrower data', value: 'Contoh untuk demo', state: 'SIMULATED' },
  { label: 'Collateral review', value: 'Referensi privat', state: 'VERIFIED OFFCHAIN' },
];

const decisions = [
  {
    id: 'eligibility',
    number: '01',
    kicker: 'Credit eligibility',
    title: 'Review yang menjaga data sensitif tetap privat.',
    body:
      'Credit manager memeriksa borrower, properti, valuasi, dan batas risiko. Hanya hasil keputusan dan referensi yang masuk ke alur publik.',
    state: 'VERIFIED OFFCHAIN',
    stateKey: 'offchain',
  },
  {
    id: 'allocation',
    number: '02',
    kicker: 'Capital allocation',
    title: 'Lelang tertutup yang hasilnya bisa diaudit.',
    body:
      'Borrower yang disetujui mengirim commitment, membuka bid, dan menerima alokasi deterministik sesuai likuiditas dan limit vault.',
    state: 'ONCHAIN',
    stateKey: 'onchain',
  },
];

const journeys = {
  investor: {
    eyebrow: 'Jalur investor',
    title: 'Satu vault, alokasi yang bisa ditelusuri.',
    copy: 'Deposit mock USDC, terima vault shares, lalu lihat bagaimana modal dialokasikan dan dikembalikan.',
    steps: ['Deposit mock USDC', 'Terima vault shares', 'Pantau loan dan repayment'],
    shortcut: 'I',
  },
  borrower: {
    eyebrow: 'Jalur borrower',
    title: 'Bersaing untuk modal, tanpa membuka dokumen sensitif.',
    copy: 'Borrower yang sudah lolos review mengikuti lelang tertutup. Smart contract memvalidasi reveal dan menentukan alokasi.',
    steps: ['Dapatkan approval', 'Commit lalu reveal bid', 'Terima hasil alokasi'],
    shortcut: 'B',
  },
};

const proofStats = [
  { id: 'eligibility', label: 'Eligibility', detail: 'review offchain' },
  { id: 'allocation', label: 'Allocation', detail: 'auction onchain' },
  { id: 'proof', label: 'Proof', detail: 'testnet events' },
];

const shortcuts = [
  { keys: ['J', 'K'], label: 'navigasi' },
  { keys: ['Enter'], label: 'buka' },
  { keys: ['⌘', 'K'], label: 'command bar' },
];

function Kbd({ children }) {
  return <kbd className="kbd">{children}</kbd>;
}

function ShortcutRow({ keys: keysList, label }) {
  return (
    <span className="shortcut">
      {keysList.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
      <span className="shortcut-label">{label}</span>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="wordmark" aria-hidden="true">
      HOUSD<span className="wordmark-dot">.</span>
    </span>
  );
}

function HeroAppPreview() {
  return (
    <div className="hero-app-container">
      <div className="hero-app-window">
        <div className="hero-app-header">
          <div className="hero-app-controls">
            <span className="control-dot close" />
            <span className="control-dot minimize" />
            <span className="control-dot maximize" />
          </div>
          <div className="hero-app-title">
            <span className="wordmark-mini">HOUSD</span>
            <span className="topbar-divider">·</span>
            <span>Housing Credit Vault (BNB Testnet)</span>
          </div>
          <span className="state-chip state-chip--onchain">LIVE ONCHAIN</span>
        </div>
        <div className="hero-app-body">
          <div className="hero-app-sidebar">
            <div className="sidebar-item is-active">
              <span className="sidebar-icon">❖</span>
              <span>Vault Overview</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">⟁</span>
              <span>Commit-Reveal Bids</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">🛡</span>
              <span>Underwriting Proof</span>
            </div>
          </div>
          <div className="hero-app-main">
            <div className="hero-app-stat-grid">
              <div className="app-stat-card">
                <span className="app-stat-label">Total Vault Liquidity</span>
                <span className="app-stat-value">$2,500,000 USDC</span>
              </div>
              <div className="app-stat-card">
                <span className="app-stat-label">Auction Mode</span>
                <span className="app-stat-value">Sealed Commit-Reveal</span>
              </div>
              <div className="app-stat-card">
                <span className="app-stat-label">Max Risk LTV</span>
                <span className="app-stat-value">70.0%</span>
              </div>
            </div>
            <div className="hero-app-rows">
              <div className="app-row">
                <div className="app-row-info">
                  <span className="app-row-title">Permohonan Kredit #0412 — Cluster Residential BSD</span>
                  <span className="app-row-sub">Evaluasi Offchain Selesai · Bid Sealed #0x82f...a1</span>
                </div>
                <span className="state-chip state-chip--onchain">ALLOCATED ONCHAIN</span>
              </div>
              <div className="app-row">
                <div className="app-row-info">
                  <span className="app-row-title">Permohonan Kredit #0413 — Modern Housing Bintaro</span>
                  <span className="app-row-sub">Verifikasi Dokumen Agunan · Risk Limit Checked</span>
                </div>
                <span className="state-chip state-chip--offchain">VERIFIED OFFCHAIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [journey, setJourney] = useState('investor');

  useEffect(() => {
    if (!dialogOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDialogOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dialogOpen]);

  const chooseJourney = (nextJourney) => {
    setJourney(nextJourney);
    setDialogOpen(false);
    requestAnimationFrame(() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' }));
  };

  const activeJourney = journeys[journey];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Lewati ke konten</a>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="topbar-wrapper">
            <header className="topbar">
              <a className="brand-link" href="#top" aria-label="HOUSD, kembali ke atas">
                <Wordmark />
              </a>
              <nav
                id="site-nav"
                className={menuOpen ? 'nav-links is-open' : 'nav-links'}
                aria-label="Navigasi utama"
              >
                <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara kerja</a>
                <a href="#demo" onClick={() => setMenuOpen(false)}>Demo</a>
                <a href="#transparansi" onClick={() => setMenuOpen(false)}>Transparansi</a>
                <a href="#risiko" onClick={() => setMenuOpen(false)}>Risiko</a>
              </nav>
              <div className="topbar-actions">
                <button
                  className="menu-button"
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="site-nav"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <span>{menuOpen ? 'Tutup' : 'Menu'}</span>
                </button>
                <button className="cta-button" type="button" onClick={() => setDialogOpen(true)}>
                  Mulai demo
                </button>
              </div>
            </header>
          </div>

          <div className="hero-eyebrow">
            <span className="eyebrow-mark" />
            <span>Live · Housing credit market · Indonesia</span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Modal untuk rumah,<br />
            dialokasikan <span className="hero-highlight">terbuka.</span>
          </h1>
          <p className="hero-copy">
            HOUSD menyatukan investor stablecoin dan borrower properti yang telah lolos review
            melalui vault sederhana dan lelang yang dapat diverifikasi.
          </p>
          <div className="hero-actions">
            <button className="cta-button cta-button--primary" type="button" onClick={() => setDialogOpen(true)}>
              Mulai demo
              <span aria-hidden="true" className="cta-arrow">›</span>
            </button>
            <a className="ghost-link" href="#cara-kerja">
              Lihat mekanismenya
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="hero-disclosure">Simulasi hackathon. Bukan produk investasi atau janji imbal hasil.</p>

          <HeroAppPreview />

          <div className="proof-strip" aria-label="Ringkasan status demo">
            {proofStats.map((stat) => (
              <div className="proof-stat" key={stat.id}>
                <span className="proof-stat-label">{stat.label}</span>
                <span className="proof-stat-detail">{stat.detail}</span>
              </div>
            ))}
          </div>

          <div className="shortcut-strip" aria-label="Pintasan keyboard">
            {shortcuts.map((shortcut) => (
              <ShortcutRow key={shortcut.label} {...shortcut} />
            ))}
          </div>
        </section>

        <section className="decisions" id="cara-kerja" aria-labelledby="decision-title">
          <header className="section-header">
            <p className="section-eyebrow">Dua keputusan, dua lapisan</p>
            <h2 id="decision-title" className="section-title">
              Kredit dinilai manusia.<br />
              Modal dialokasikan kontrak.
            </h2>
          </header>
          <ul className="decision-list">
            {decisions.map((decision) => (
              <li className="decision-row" key={decision.id}>
                <span className={`decision-dot decision-dot--${decision.stateKey}`} aria-hidden="true" />
                <div className="decision-body">
                  <span className="decision-number">{decision.number}</span>
                  <p className="decision-kicker">{decision.kicker}</p>
                  <h3 className="decision-title">{decision.title}</h3>
                  <p className="decision-copy">{decision.body}</p>
                </div>
                <span className={`state-chip state-chip--${decision.stateKey}`}>{decision.state}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="demo" id="demo" aria-labelledby="demo-title">
          <div className="demo-tabs" role="tablist" aria-label="Pilih perjalanan demo">
            {Object.keys(journeys).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={journey === key}
                className={journey === key ? 'demo-tab is-active' : 'demo-tab'}
                onClick={() => setJourney(key)}
                type="button"
              >
                <span className="demo-tab-label">
                  {key === 'investor' ? 'Investor' : 'Borrower'}
                </span>
                <span className="demo-tab-shortcut">
                  Tekan <Kbd>{journeys[key].shortcut}</Kbd>
                </span>
              </button>
            ))}
          </div>
          <div className="demo-panel">
            <p className="section-eyebrow">{activeJourney.eyebrow}</p>
            <h2 id="demo-title" className="section-title section-title--md">
              {activeJourney.title}
            </h2>
            <p className="demo-copy">{activeJourney.copy}</p>
            <ol className="journey-steps">
              {activeJourney.steps.map((step, index) => (
                <li className="journey-step" key={step}>
                  <span className="journey-step-number">
                    0{index + 1}
                  </span>
                  <span className="journey-step-label">{step}</span>
                  <span className="journey-step-meta" aria-hidden="true">›</span>
                </li>
              ))}
            </ol>
            <div className="demo-notice">
              <span className="state-chip state-chip--simulated">SIMULATED DEMO</span>
              <p>Alur dapat dijalankan tanpa wallet atau dana nyata. Transaksi onchain akan ditandai terpisah.</p>
            </div>
          </div>
        </section>

        <section className="transparency" id="transparansi" aria-labelledby="transparency-title">
          <header className="section-header">
            <p className="section-eyebrow">Bukti sebelum klaim</p>
            <h2 id="transparency-title" className="section-title">
              Selalu tahu apa yang nyata, privat, atau simulasi.
            </h2>
          </header>
          <div className="ledger" role="list">
            <div className="ledger-head" aria-hidden="true">
              <span>Field</span>
              <span>Value</span>
              <span>State</span>
            </div>
            {proofItems.map((item) => {
              const stateKey = item.state.toLowerCase().replace(' ', '-');
              return (
                <div className="ledger-row" key={item.label} role="listitem">
                  <span className="ledger-label">{item.label}</span>
                  <strong className="ledger-value">{item.value}</strong>
                  <span className={`state-chip state-chip--${stateKey}`}>{item.state}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="risk" id="risiko" aria-labelledby="risk-title">
          <div className="risk-copy">
            <p className="section-eyebrow">Batas yang terlihat</p>
            <h2 id="risk-title" className="section-title">
              Transparan bukan berarti tanpa risiko.
            </h2>
            <p className="risk-body">
              HOUSD memperlihatkan LTV, konsentrasi, maturity, status loan, dan bukti transaksi.
              Prototype tidak memverifikasi agunan nyata dan belum diaudit.
            </p>
            <a className="ghost-link" href="#top">
              Kembali ke atas <span aria-hidden="true">↑</span>
            </a>
          </div>
          <div className="risk-stamp" aria-hidden="true">
            <span>NO YIELD</span>
            <span>PROMISES</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Wordmark />
        <p>Finance &amp; Commerce track · Indonesia Web3 Hackathon 2026</p>
        <p className="footer-meta">v0.1 · testnet</p>
      </footer>

      {dialogOpen && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <div className="journey-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="dialog-header">
              <p className="section-eyebrow">SIMULATED DEMO</p>
              <button
                className="dialog-close"
                type="button"
                aria-label="Tutup pilihan demo"
                onClick={() => setDialogOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <h2 id="dialog-title" className="dialog-title">
              Kamu mau melihat HOUSD dari sisi mana?
            </h2>
            <div className="dialog-options">
              {Object.keys(journeys).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="dialog-option"
                  onClick={() => chooseJourney(key)}
                >
                  <span className="dialog-option-label">
                    {key === 'investor' ? 'Investor' : 'Borrower'}
                  </span>
                  <span className="dialog-option-detail">
                    {key === 'investor'
                      ? 'Deposit dan pantau vault'
                      : 'Commit dan reveal bid'}
                  </span>
                  <span className="dialog-option-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            <p className="dialog-fineprint">
              Tidak perlu wallet. Semua nilai di halaman demo diberi label sesuai sumbernya.
              <span className="dialog-hint">
                Tekan <Kbd>ESC</Kbd> untuk tutup.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
