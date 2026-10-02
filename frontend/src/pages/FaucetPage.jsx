import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAddress } from 'viem';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { claimFaucetToken, fetchFaucetInfo } from '../api/faucet';
import './faucet.css';

const FAUCET_CHAIN_ID = 97;
const tokens = [
  { id: 'bnb', label: 'BNB testnet', kind: 'GAS TRANSAKSI', detail: 'Untuk membayar biaya transaksi saat mencoba fitur onchain.', amountKey: 'dripBnb', suffix: 'BNB' },
  { id: 'usdc', label: 'mUSDC', kind: 'TOKEN UJI', detail: 'Untuk mencoba deposit ke Housing Credit Vault.', amountKey: 'dripUsdc', suffix: 'mUSDC' }
];

export function FaucetPage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { switchChain, error: switchError, isPending: isSwitching } = useSwitchChain();
  const [targetAddress, setTargetAddress] = useState(address || '');
  const [info, setInfo] = useState(null);
  const [infoState, setInfoState] = useState('loading');
  const [infoError, setInfoError] = useState('');
  const [claiming, setClaiming] = useState(null);
  const [results, setResults] = useState({ bnb: null, usdc: null });

  useEffect(() => {
    if (address) setTargetAddress(address);
  }, [address]);

  async function loadInfo() {
    setInfoState('loading');
    setInfoError('');
    try {
      const data = await fetchFaucetInfo();
      setInfo(data);
      setInfoState('ready');
    } catch (error) {
      setInfo(null);
      setInfoState('error');
      setInfoError(error.message);
    }
  }

  useEffect(() => { loadInfo(); }, []);

  const validAddress = isAddress(targetAddress);
  const wrongChain = isConnected && chainId !== FAUCET_CHAIN_ID;
  const canClaim = validAddress && infoState === 'ready' && !wrongChain && !claiming;
  const serviceOffline = infoError.startsWith('Faucet belum terhubung');

  async function handleClaim(token) {
    if (!canClaim) return;
    setClaiming(token);
    setResults((current) => ({ ...current, [token]: null }));
    try {
      const data = await claimFaucetToken(token, targetAddress);
      setResults((current) => ({ ...current, [token]: { type: 'success', message: data.message, txHash: data.txHash } }));
      loadInfo();
    } catch (error) {
      setResults((current) => ({ ...current, [token]: { type: 'error', message: error.message } }));
    } finally {
      setClaiming(null);
    }
  }

  function updateAddress(value) {
    setTargetAddress(value.trim());
    setResults({ bnb: null, usdc: null });
  }

  return (
    <div className="faucet-app">
      <a className="skip-link" href="#faucet-main">Lewati ke konten</a>
      <div className="topbar-wrapper">
        <header className="topbar faucet-topbar">
          <Link to="/" className="brand-link" aria-label="HOUSD, kembali ke landing page"><span className="wordmark">HOUSD<span className="wordmark-dot">.</span></span></Link>
          <nav className="faucet-nav" aria-label="Navigasi faucet">
            <Link to="/">Beranda</Link>
            <span aria-current="page">Faucet</span>
          </nav>
          <Link to="/app/invest" className="cta-button">Buka dashboard</Link>
        </header>
      </div>

      <main id="faucet-main" className="faucet-main">
        <section className="faucet-intro" aria-labelledby="faucet-title">
          <div className="hero-network">
            <span>Built on</span>
            <span className="hero-network-brand"><img src="/brand/bnb-chain-symbol.svg" width="22" height="22" alt="" /><strong>BNB Chain Testnet</strong></span>
          </div>
          <h1 id="faucet-title">Token uji untuk <span className="hero-highlight">memulai demo.</span></h1>
          <p>Siapkan BNB untuk biaya transaksi dan mUSDC untuk mencoba deposit di vault HOUSD. Token ini hanya berlaku di testnet.</p>
          <span className="faucet-intro__note">BNB CHAIN TESTNET <span aria-hidden="true">·</span> CHAIN ID 97 <span aria-hidden="true">·</span> TANPA NILAI UANG</span>
        </section>

        <div className="faucet-workspace">
          <div className="faucet-workspace__bar" aria-hidden="true">
            <span className="faucet-workspace__lights"><i /><i /><i /></span>
            <span>HOUSD <span>·</span> Testnet Faucet</span>
            <span className="faucet-workspace__network">BNB TESTNET</span>
          </div>
          <div className="faucet-layout">
          <section className="faucet-address-panel" aria-labelledby="faucet-address-title">
            <div className="faucet-panel-index">01 <span>/</span> ALAMAT TUJUAN</div>
            <h2 id="faucet-address-title">Kirim ke wallet kamu.</h2>
            <p>Hubungkan wallet atau masukkan alamat BNB Chain secara manual.</p>

            <label className="faucet-address-label" htmlFor="faucet-address">Alamat wallet</label>
            <input
              id="faucet-address"
              className="faucet-address-input"
              value={targetAddress}
              onChange={(event) => updateAddress(event.target.value)}
              placeholder="0x..."
              autoComplete="off"
              spellCheck="false"
              disabled={Boolean(claiming)}
              aria-invalid={Boolean(targetAddress && !validAddress)}
              aria-describedby="faucet-address-help"
            />
            <p id="faucet-address-help" className={targetAddress && !validAddress ? 'faucet-field-help is-error' : 'faucet-field-help'}>
              {targetAddress && !validAddress ? 'Alamat belum valid. Periksa 42 karakter yang diawali 0x.' : 'Pastikan alamat ini milik wallet yang akan kamu pakai di dashboard.'}
            </p>

            {isConnected ? (
              <p className="faucet-wallet-state"><span aria-hidden="true" /> Wallet terhubung: {address.slice(0, 6)}…{address.slice(-4)}</p>
            ) : (
              <button
                type="button"
                className="faucet-secondary-button"
                onClick={() => connectors?.[0] && connect({ connector: connectors[0] })}
                disabled={!connectors?.length || isConnecting}
              >
                {isConnecting ? 'Menghubungkan…' : connectors?.length ? 'Hubungkan wallet' : 'Wallet browser tidak terdeteksi'}
              </button>
            )}
            {connectError && <p className="faucet-inline-error" role="alert">{connectError.shortMessage || connectError.message}</p>}
            {wrongChain && (
              <div className="faucet-network-warning" role="status">
                <p>Wallet sedang di jaringan lain. Pindah ke BNB Chain Testnet sebelum klaim.</p>
                <button type="button" className="faucet-secondary-button" onClick={() => switchChain({ chainId: FAUCET_CHAIN_ID })} disabled={isSwitching}>
                  {isSwitching ? 'Mengganti jaringan…' : 'Pindah ke testnet'}
                </button>
              </div>
            )}
            {switchError && <p className="faucet-inline-error" role="alert">{switchError.shortMessage || switchError.message}</p>}

            <div className="faucet-next-step">
              <span>LANGKAH BERIKUTNYA</span>
              <p>Setelah klaim, buka dashboard Investor dan pilih mode Live untuk mencoba deposit mUSDC.</p>
              <Link to="/app/invest">Buka dashboard <span aria-hidden="true">↗</span></Link>
            </div>
          </section>

          <section className="faucet-claim-panel" aria-labelledby="faucet-claim-title">
            <div className="faucet-panel-index">02 <span>/</span> KLAIM TOKEN UJI</div>
            <div className="faucet-claim-heading">
              <div>
                <h2 id="faucet-claim-title">Pilih token uji.</h2>
                <p>Masing-masing token dapat diklaim sekali per alamat setiap 1 jam.</p>
              </div>
              <span className={`faucet-service-state is-${infoState}`} role="status">
                <span aria-hidden="true" />{infoState === 'ready' ? 'Faucet siap' : infoState === 'loading' ? 'Memeriksa faucet' : 'Server belum aktif'}
              </span>
            </div>

            {infoState === 'error' && (
              <div className="faucet-service-error" role="alert">
                <div>
                  <strong>{serviceOffline ? 'Layanan lokal belum berjalan' : 'Faucet belum siap'}</strong>
                  <p>{infoError}</p>
                  {serviceOffline && <details>
                    <summary>Cara mengaktifkan faucet lokal</summary>
                    <ol>
                      <li>Di <code>backend/faucet</code>, salin <code>.env.example</code> menjadi <code>.env</code>.</li>
                      <li>Isi <code>FAUCET_PRIVATE_KEY</code> dengan wallet khusus testnet yang memiliki BNB untuk klaim dan gas mint.</li>
                      <li>Jalankan <code>npm install</code>, lalu <code>npm start</code>.</li>
                    </ol>
                  </details>}
                </div>
                <button type="button" onClick={loadInfo}>Coba lagi</button>
              </div>
            )}

            <div className="faucet-token-list">
              {tokens.map((token) => {
                const result = results[token.id];
                return (
                  <article className="faucet-token" key={token.id}>
                    <div className="faucet-token__symbol" aria-hidden="true">{token.id === 'bnb' ? <img src="/brand/bnb-chain-symbol.svg" width="26" height="26" alt="" /> : '$'}</div>
                    <div className="faucet-token__body">
                      <div className="faucet-token__top"><span>{token.kind}</span><strong>{info ? `${info[token.amountKey]} ${token.suffix}` : 'Menunggu data'}</strong></div>
                      <h3>{token.label}</h3>
                      <p>{token.detail}</p>
                    </div>
                    <button type="button" className="faucet-claim-button" disabled={!canClaim} onClick={() => handleClaim(token.id)}>
                      {claiming === token.id ? 'Mengirim…' : `Klaim ${token.label}`}
                    </button>
                    {result && (
                      <div className={`faucet-result is-${result.type}`} role={result.type === 'error' ? 'alert' : 'status'}>
                        <p>{result.message}</p>
                        {result.txHash && <a href={`https://testnet.bscscan.com/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">Lihat transaksi di BscScan</a>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          </div>
        </div>
        <p className="faucet-footer-note">Faucet ini hanya untuk simulasi HOUSD di BNB Chain Testnet.</p>
      </main>
    </div>
  );
}

export default FaucetPage;
