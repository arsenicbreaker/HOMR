import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './styles.css';

import Web3Provider from './context/Web3Provider';
import { DemoModeProvider } from './context/DemoModeContext';
import InvestorDashboard from './pages/InvestorDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import AdminPanel from './pages/AdminPanel';
import FaucetPage from './pages/FaucetPage';
import DashboardEntry from './components/layout/DashboardEntry';
import DecisionCard from './components/DecisionCard';
import RiskGlobe from './components/RiskGlobe';
import BorderGlow from './components/ui/BorderGlow';
import { API_BASE, fetchVault, fetchLoans, fetchEvents } from './api/client';

const proofItems = [
  { label: 'Vault', value: 'Housing Credit Vault', state: 'ONCHAIN' },
  { label: 'Network', value: 'BNB Chain Testnet', state: 'ONCHAIN' },
  { label: 'Borrower data', value: 'Demo example', state: 'SIMULATED' },
  { label: 'Collateral review', value: 'Private reference', state: 'VERIFIED OFFCHAIN' },
];

const proofGlow = {
  glowColor: '260 90 85',
  backgroundColor: '#120F17',
  borderRadius: 28,
  glowRadius: 40,
  glowIntensity: 0.85,
  coneSpread: 25,
  colors: ['#cbb7fb', '#a884e5', '#8caaf0'],
  fillOpacity: 0.18,
};

const API_ENDPOINTS = {
  vault: `${API_BASE}/api/vault`,
  loans: `${API_BASE}/api/loans`,
  events: `${API_BASE}/api/events`,
};

const decisions = [
  {
    id: 'eligibility',
    number: '01',
    kicker: 'Credit eligibility',
    title: 'Reviews that keep sensitive data private.',
    body:
      'A credit manager reviews the borrower, property, valuation, and risk limits. Only the decision and its references enter the public process.',
    state: 'VERIFIED OFFCHAIN',
    stateKey: 'offchain',
  },
  {
    id: 'allocation',
    number: '02',
    kicker: 'Capital allocation',
    title: 'Sealed-bid auctions with auditable results.',
    body:
      'Approved borrowers submit commitments, reveal their bids, and receive allocations determined by fixed rules based on vault liquidity and limits.',
    state: 'ONCHAIN',
    stateKey: 'onchain',
  },
];

const journeys = {
  investor: {
    eyebrow: 'Investor journey',
    title: 'One vault, traceable allocations.',
    copy: 'Deposit mock USDC, receive vault shares, and track how capital is allocated and repaid.',
    steps: ['Deposit mock USDC', 'Receive vault shares', 'Track loans and repayments'],
    shortcut: 'I',
  },
  borrower: {
    eyebrow: 'Borrower journey',
    title: 'Compete for capital while keeping sensitive documents private.',
    copy: 'Approved borrowers take part in sealed-bid auctions. The smart contract validates revealed bids and determines allocations.',
    steps: ['Get approved', 'Commit and reveal your bid', 'Receive your allocation results'],
    shortcut: 'B',
  },
};

const proofStats = [
  { id: 'eligibility', label: 'Eligibility', detail: 'offchain review' },
  { id: 'allocation', label: 'Allocation', detail: 'onchain auction' },
  { id: 'proof', label: 'Proof', detail: 'testnet events' },
];

const shortcuts = [
  { keys: ['J', 'K'], label: 'navigate' },
  { keys: ['Enter'], label: 'open' },
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
                  <span className="app-row-title">Credit Application #0412, Cluster Residential BSD</span>
                  <span className="app-row-sub">Offchain Review Complete · Sealed Bid #0x82f...a1</span>
                </div>
                <span className="state-chip state-chip--onchain">ALLOCATED ONCHAIN</span>
              </div>
              <div className="app-row">
                <div className="app-row-info">
                  <span className="app-row-title">Credit Application #0413, Modern Housing Bintaro</span>
                  <span className="app-row-sub">Collateral Document Verification · Risk Limit Checked</span>
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

function useSafeNavigate() {
  try {
    return useNavigate();
  } catch (e) {
    return (path) => {
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = path;
      }
    };
  }
}

/**
 * LiveVaultPanel
 * Baca state vault langsung dari backend → kontrak BNB testnet.
 * Semua angka di sini berasal dari onchain (kecuali yang ditandai SIMULATED).
 */
function LiveVaultPanel() {
  const [vault, setVault] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error
  const [errorMsg, setErrorMsg] = useState(null);

  const load = async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const data = await fetchVault();
      setVault(data);
      setStatus('ok');
    } catch (err) {
      setErrorMsg(err.message || 'Unknown error');
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="live-panel">
      <header className="live-panel-header">
        <div>
          <span className="live-panel-label">Housing Credit Vault</span>
          <span className="live-panel-sublabel">BNB Chain Testnet · read-only</span>
        </div>
        <span className={`state-chip state-chip--${status === 'ok' ? 'onchain' : status === 'error' ? 'simulated' : 'offchain'}`}>
          {status === 'idle' && 'LOADING'}
          {status === 'loading' && 'LOADING'}
          {status === 'ok' && 'LIVE ONCHAIN'}
          {status === 'error' && 'ERROR'}
        </span>
      </header>

      {status === 'ok' && vault && (
        <div className="live-panel-stats">
          <div className="live-stat">
            <span className="live-stat-label">Total Assets</span>
            <span className="live-stat-value">{(Number(vault.totalAssets) / 1e6).toFixed(2)}</span>
            <span className="live-stat-unit">mock USDC</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-label">Available</span>
            <span className="live-stat-value">{(Number(vault.availableCapital) / 1e6).toFixed(2)}</span>
            <span className="live-stat-unit">mock USDC</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-label">Deployed</span>
            <span className="live-stat-value">{(Number(vault.deployedCapital) / 1e6).toFixed(2)}</span>
            <span className="live-stat-unit">mock USDC</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-label">Total Shares</span>
            <span className="live-stat-value">{vault.totalShares}</span>
            <span className="live-stat-unit">hvSHARE</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="live-panel-error">
          <p>Could not load data from the server: {errorMsg}</p>
          <button type="button" className="live-panel-retry" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {status === 'ok' && vault && (
        <footer className="live-panel-footer">
          <span className="live-panel-address">
            {vault.vaultAddress.slice(0, 6)}…{vault.vaultAddress.slice(-4)}
          </span>
          <a
            className="live-panel-link"
            href={vault.explorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on BscScan →
          </a>
        </footer>
      )}
    </div>
  );
}

/**
 * LiveLoansPanel
 * List loan dari backend. Kalau kosong, tampilkan pesan jujur.
 */
function LiveLoansPanel() {
  const [loans, setLoans] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetchLoans()
      .then((data) => {
        setLoans(data.loans || []);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <p className="live-empty">Loading loans…</p>;
  if (status === 'error') return <p className="live-empty live-empty--error">Could not load loans.</p>;
  if (!loans || loans.length === 0) {
    return (
      <p className="live-empty">
        No active loans yet. Loans will appear once an auction is finalized.
      </p>
    );
  }

  return (
    <ul className="live-loans">
      {loans.map((loan) => (
        <li key={loan.id} className="live-loan-row">
          <span className="live-loan-id">#{loan.onchainLoanId}</span>
          <span className="live-loan-principal">
            {(Number(loan.principal) / 1e6).toFixed(2)} USDC
          </span>
          <span className="live-loan-rate">{loan.rate} bps</span>
          <span className={`state-chip state-chip--${loan.status === 'ACTIVE' ? 'onchain' : 'offchain'}`}>
            {loan.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [journey, setJourney] = useState('investor');
  const navigate = useSafeNavigate();
  const reducedMotion = useReducedMotion();

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
    if (nextJourney === 'investor') {
      navigate('/app/invest');
    } else if (nextJourney === 'borrower') {
      navigate('/app/borrow');
    } else if (nextJourney === 'admin') {
      navigate('/app/admin');
    }
  };

  const activeJourney = journeys[journey];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <div className="topbar-wrapper">
        <header className="topbar">
          <a className="brand-link" href="#top" aria-label="HOUSD, back to top">
            <Wordmark />
          </a>
          <nav
            id="site-nav"
            className={menuOpen ? 'nav-links is-open' : 'nav-links'}
            aria-label="Main navigation"
          >
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#demo" onClick={() => setMenuOpen(false)}>Demo</a>
            <a href="#transparansi" onClick={() => setMenuOpen(false)}>Transparency</a>
            <a href="#risiko" onClick={() => setMenuOpen(false)}>Risks</a>
            <Link to="/faucet" onClick={() => setMenuOpen(false)}>Faucet</Link>
          </nav>
          <div className="topbar-actions">
            <button
              className="menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
            <button className="cta-button" type="button" onClick={() => setDialogOpen(true)}>
              Start demo
            </button>
          </div>
        </header>
      </div>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-network">
            <span>Built on</span>
            <span className="hero-network-brand">
              <img src="/brand/bnb-chain-symbol.svg" width="22" height="22" alt="" />
              <strong>BNB Chain</strong>
            </span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Capital for housing,<br />
            allocated <span className="hero-highlight">openly.</span>
          </h1>
          <p className="hero-copy">
            HOUSD connects stablecoin investors with vetted property borrowers
            through a simple vault and verifiable auctions.
          </p>
          <div className="hero-actions">
            <button className="cta-button cta-button--primary" type="button" onClick={() => setDialogOpen(true)}>
              Start demo
              <span aria-hidden="true" className="cta-arrow">›</span>
            </button>
            <a className="ghost-link" href="#cara-kerja">
              See how it works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 5v14m-6-6 6 6 6-6" />
              </svg>
            </a>
          </div>
          <p className="hero-disclosure">Hackathon simulation. Not an investment product or a promise of returns.</p>

          <HeroAppPreview />

          <div className="proof-strip" aria-label="Demo status summary">
            {proofStats.map((stat) => (
              <div className="proof-stat" key={stat.id}>
                <span className="proof-stat-label">{stat.label}</span>
                <span className="proof-stat-detail">{stat.detail}</span>
              </div>
            ))}
          </div>

          <div className="shortcut-strip" aria-label="Keyboard shortcuts">
            {shortcuts.map((shortcut) => (
              <ShortcutRow key={shortcut.label} {...shortcut} />
            ))}
          </div>
        </section>

        <section className="decisions" id="cara-kerja" aria-labelledby="decision-title">
          <header className="section-header">
            <p className="section-eyebrow">Two decisions, two layers</p>
            <h2 id="decision-title" className="section-title">
              People assess credit.<br />
              Contracts allocate capital.
            </h2>
          </header>
          <ul className="decision-list">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <DecisionCard decision={decision} />
              </li>
            ))}
          </ul>
        </section>

        <section className="demo" id="demo" aria-labelledby="demo-title">
          <div className="demo-tabs" role="tablist" aria-label="Choose a demo journey">
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
                  Press <Kbd>{journeys[key].shortcut}</Kbd>
                </span>
              </button>
            ))}
          </div>
          <div key={journey} className="demo-panel">
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
              <p>Try the demo without a wallet or real funds. Onchain transactions are labeled separately.</p>
            </div>
          </div>
        </section>

        <section className="transparency" id="transparansi" aria-labelledby="transparency-title">
          <header className="section-header">
            <p className="section-eyebrow">Evidence before claims</p>
            <h2 id="transparency-title" className="section-title">
              Know what is real, private, or simulated.
            </h2>
          </header>

          {/* Live data dari backend → kontrak BNB testnet */}
          <div className="live-grid">
            <BorderGlow {...proofGlow} className="proof-glow">
              <LiveVaultPanel />
            </BorderGlow>
            <BorderGlow {...proofGlow} className="proof-glow">
              <div className="live-panel live-panel--loans">
                <header className="live-panel-header">
                  <div>
                    <span className="live-panel-label">Active Loans</span>
                    <span className="live-panel-sublabel">From the onchain LoanManager</span>
                  </div>
                </header>
                <LiveLoansPanel />
              </div>
            </BorderGlow>
          </div>

          {/* Sumber data per field, terpisah dari status fetch panel live. */}
          <BorderGlow {...proofGlow} className="proof-glow proof-glow--ledger">
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
          </BorderGlow>
        </section>

        <RiskGlobe />
      </main>

      <footer className="site-footer">
        <Wordmark />
        <p>Finance &amp; Commerce track · Indonesia Web3 Hackathon 2026</p>
        <p className="footer-meta">v0.1 · testnet</p>
      </footer>

      <AnimatePresence>
      {dialogOpen && (
        <motion.div
          className="dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <motion.div
            className="journey-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 10, scale: reducedMotion ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 6, scale: reducedMotion ? 1 : 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dialog-header">
              <p className="section-eyebrow">SIMULATED DEMO</p>
              <button
                className="dialog-close"
                type="button"
                aria-label="Close demo selection"
                onClick={() => setDialogOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <h2 id="dialog-title" className="dialog-title">
              How would you like to experience HOUSD?
            </h2>
            <div className="dialog-options">
              <button
                type="button"
                className="dialog-option"
                onClick={() => chooseJourney('investor')}
              >
                <span className="dialog-option-label">Investor</span>
                <span className="dialog-option-detail">Deposit and monitor the vault</span>
                <span className="dialog-option-arrow" aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                className="dialog-option"
                onClick={() => chooseJourney('borrower')}
              >
                <span className="dialog-option-label">Borrower</span>
                <span className="dialog-option-detail">Commit and reveal your bid</span>
                <span className="dialog-option-arrow" aria-hidden="true">›</span>
              </button>

              <button
                type="button"
                className="dialog-option"
                onClick={() => chooseJourney('admin')}
              >
                <span className="dialog-option-label">Credit Manager / Admin</span>
                <span className="dialog-option-detail">Underwrite & manage auctions</span>
                <span className="dialog-option-arrow" aria-hidden="true">›</span>
              </button>
            </div>
            <p className="dialog-fineprint">
              No wallet needed. All values on the demo page are labeled by source.
              <span className="dialog-hint">
                Press <Kbd>ESC</Kbd> to close.
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Web3Provider>
        <DemoModeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/app/invest" element={<DashboardEntry role="investor"><InvestorDashboard /></DashboardEntry>} />
              <Route path="/app/borrow" element={<DashboardEntry role="borrower"><BorrowerDashboard /></DashboardEntry>} />
              <Route path="/app/admin" element={<DashboardEntry role="admin"><AdminPanel /></DashboardEntry>} />
              <Route path="/faucet" element={<FaucetPage />} />
            </Routes>
          </BrowserRouter>
        </DemoModeProvider>
      </Web3Provider>
    </React.StrictMode>,
  );
}
