import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const proofItems = [
  { label: 'Vault', value: 'Housing Credit Vault', state: 'ONCHAIN' },
  { label: 'Network', value: 'BNB Chain Testnet', state: 'ONCHAIN' },
  { label: 'Borrower data', value: 'Contoh untuk demo', state: 'SIMULATED' },
  { label: 'Collateral review', value: 'Referensi privat', state: 'VERIFIED OFFCHAIN' },
];

const journeys = {
  investor: {
    eyebrow: 'Jalur investor',
    title: 'Satu vault, alokasi yang bisa ditelusuri.',
    copy: 'Deposit mock USDC, terima vault shares, lalu lihat bagaimana modal dialokasikan dan dikembalikan.',
    steps: ['Deposit mock USDC', 'Terima vault shares', 'Pantau loan dan repayment'],
  },
  borrower: {
    eyebrow: 'Jalur borrower',
    title: 'Bersaing untuk modal, tanpa membuka dokumen sensitif.',
    copy: 'Borrower yang sudah lolos review mengikuti lelang tertutup. Smart contract memvalidasi reveal dan menentukan alokasi.',
    steps: ['Dapatkan approval', 'Commit lalu reveal bid', 'Terima hasil alokasi'],
  },
};

function Mark() {
  return <span className="wordmark">HOMR<span>.</span></span>;
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

  return (
    <>
      <header className="site-header">
        <a className="brand-link" href="#top" aria-label="HOMR, kembali ke atas"><Mark /></a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span>{menuOpen ? 'Tutup' : 'Menu'}</span>
        </button>
        <nav id="site-nav" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Navigasi utama">
          <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara kerja</a>
          <a href="#transparansi" onClick={() => setMenuOpen(false)}>Transparansi</a>
          <a href="#risiko" onClick={() => setMenuOpen(false)}>Risiko</a>
        </nav>
        <button className="nav-cta" type="button" onClick={() => setDialogOpen(true)}>
          Coba demo
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-photo" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="floating-notes" aria-hidden="true">
            <span className="note note-one">BNB Testnet</span>
            <span className="note note-two">commit + reveal</span>
            <span className="note note-three">⌂ verified trail</span>
            <span className="note note-four">qualified only</span>
            <span className="note note-five">(˶ᵔ ᵕ ᵔ˶)</span>
            <span className="note note-six">mock USDC</span>
          </div>
          <div className="hero-content">
            <p className="eyebrow">Housing credit market, Indonesia</p>
            <h1 id="hero-title">Modal untuk rumah,<br /><span>dialokasikan terbuka.</span></h1>
            <p className="hero-copy">
              HOMR menyatukan investor stablecoin dan borrower properti yang telah lolos review melalui vault sederhana dan lelang yang dapat diverifikasi.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => setDialogOpen(true)}>Masuk ke demo</button>
              <a className="text-link" href="#cara-kerja">Lihat mekanismenya <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-disclosure">Simulasi hackathon. Bukan produk investasi atau janji imbal hasil.</p>
          </div>
          <div className="proof-strip" aria-label="Ringkasan status demo">
            <div><span>01</span><strong>Eligibility</strong><small>review offchain</small></div>
            <div><span>02</span><strong>Allocation</strong><small>auction onchain</small></div>
            <div><span>03</span><strong>Proof</strong><small>testnet events</small></div>
          </div>
        </section>

        <section className="split-decision" id="cara-kerja" aria-labelledby="decision-title">
          <div className="section-intro">
            <p className="eyebrow dark">Dua keputusan, dua lapisan</p>
            <h2 id="decision-title">Kredit dinilai manusia.<br />Modal dialokasikan kontrak.</h2>
          </div>
          <div className="decision-rail">
            <article className="decision-card human-card">
              <span className="card-number">01</span>
              <p className="card-kicker">Credit eligibility</p>
              <h3>Review yang menjaga data sensitif tetap privat.</h3>
              <p>Credit manager memeriksa borrower, properti, valuasi, dan batas risiko. Hanya hasil keputusan dan referensi yang masuk ke alur publik.</p>
              <span className="status-label offchain">VERIFIED OFFCHAIN</span>
            </article>
            <div className="rail-connector" aria-hidden="true"><span>then</span></div>
            <article className="decision-card contract-card">
              <span className="card-number">02</span>
              <p className="card-kicker">Capital allocation</p>
              <h3>Lelang tertutup yang hasilnya bisa diaudit.</h3>
              <p>Borrower yang disetujui mengirim commitment, membuka bid, dan menerima alokasi deterministik sesuai likuiditas dan limit vault.</p>
              <span className="status-label onchain">ONCHAIN</span>
            </article>
          </div>
        </section>

        <section className="demo-section" id="demo" aria-labelledby="demo-title">
          <div className="demo-tabs" role="tablist" aria-label="Pilih perjalanan demo">
            {Object.keys(journeys).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={journey === key}
                className={journey === key ? 'active' : ''}
                onClick={() => setJourney(key)}
                type="button"
              >
                {key === 'investor' ? 'Investor' : 'Borrower'}
              </button>
            ))}
          </div>
          <div className="demo-copy">
            <p className="eyebrow dark">{journeys[journey].eyebrow}</p>
            <h2 id="demo-title">{journeys[journey].title}</h2>
            <p>{journeys[journey].copy}</p>
          </div>
          <ol className="journey-steps">
            {journeys[journey].steps.map((step, index) => (
              <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>
            ))}
          </ol>
          <div className="demo-notice">
            <span className="status-label simulated">SIMULATED DEMO</span>
            <p>Alur dapat dijalankan tanpa wallet atau dana nyata. Transaksi onchain akan ditandai terpisah.</p>
          </div>
        </section>

        <section className="transparency" id="transparansi" aria-labelledby="transparency-title">
          <div className="transparency-title-wrap">
            <p className="eyebrow dark">Bukti sebelum klaim</p>
            <h2 id="transparency-title">Selalu tahu apa yang nyata, privat, atau simulasi.</h2>
          </div>
          <div className="proof-ledger">
            {proofItems.map((item) => (
              <div className="ledger-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <em className={`state-${item.state.toLowerCase().replace(' ', '-')}`}>{item.state}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="risk-section" id="risiko" aria-labelledby="risk-title">
          <div>
            <p className="eyebrow">Batas yang terlihat</p>
            <h2 id="risk-title">Transparan bukan berarti tanpa risiko.</h2>
          </div>
          <div className="risk-copy">
            <p>HOMR memperlihatkan LTV, konsentrasi, maturity, status loan, dan bukti transaksi. Prototype tidak memverifikasi agunan nyata dan belum diaudit.</p>
            <a href="#top">Baca kembali ringkasan <span aria-hidden="true">↑</span></a>
          </div>
          <div className="risk-stamp" aria-hidden="true">NO<br />YIELD<br />PROMISES</div>
        </section>
      </main>

      <footer>
        <Mark />
        <p>Finance &amp; Commerce track · Indonesia Web3 Hackathon 2026</p>
        <p className="photo-credit">Hero photo: <a href="https://www.rumah123.com/panduan-properti/rekomendasi-rumah-di-ciputat/" target="_blank" rel="noreferrer">Rumah123</a></p>
      </footer>

      {dialogOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialogOpen(false);
        }}>
          <div className="journey-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button className="dialog-close" type="button" aria-label="Tutup pilihan demo" onClick={() => setDialogOpen(false)}>×</button>
            <p className="eyebrow dark">SIMULATED DEMO</p>
            <h2 id="dialog-title">Kamu mau melihat HOMR dari sisi mana?</h2>
            <div className="dialog-options">
              <button type="button" onClick={() => chooseJourney('investor')}>
                <span>Investor</span>
                <small>Deposit dan pantau vault</small>
              </button>
              <button type="button" onClick={() => chooseJourney('borrower')}>
                <span>Borrower</span>
                <small>Commit dan reveal bid</small>
              </button>
            </div>
            <p className="dialog-fineprint">Tidak perlu wallet. Semua nilai di halaman demo diberi label sesuai sumbernya.</p>
          </div>
        </div>
      )}
    </>
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
