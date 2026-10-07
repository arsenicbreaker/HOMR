import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAddress } from 'viem';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { claimFaucetToken, fetchFaucetInfo } from '../api/faucet';
import './faucet.css';

const FAUCET_CHAIN_ID = 97;
const tokens = [
  { id: 'bnb', label: 'BNB testnet', kind: 'TRANSACTION GAS', detail: 'Pay transaction fees when trying onchain features.', amountKey: 'dripBnb', suffix: 'BNB' },
  { id: 'usdc', label: 'mUSDC', kind: 'TEST TOKEN', detail: 'Try depositing into the Housing Credit Vault.', amountKey: 'dripUsdc', suffix: 'mUSDC' }
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
  const serviceOffline = import.meta.env.DEV && infoError.startsWith('Cannot connect to the faucet');

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
      <a className="skip-link" href="#faucet-main">Skip to content</a>
      <div className="topbar-wrapper">
        <header className="topbar faucet-topbar">
          <Link to="/" className="brand-link" aria-label="HOMR, back to home"><span className="wordmark">HOMR<span className="wordmark-dot">.</span></span></Link>
          <nav className="faucet-nav" aria-label="Faucet navigation">
            <Link to="/">Home</Link>
            <span aria-current="page">Faucet</span>
          </nav>
          <Link to="/app/invest" className="cta-button">Open dashboard</Link>
        </header>
      </div>

      <main id="faucet-main" className="faucet-main">
        <section className="faucet-intro" aria-labelledby="faucet-title">
          <div className="hero-network">
            <span>Built on</span>
            <span className="hero-network-brand"><img src="/brand/bnb-chain-symbol.svg" width="22" height="22" alt="" /><strong>BNB Chain Testnet</strong></span>
          </div>
          <h1 id="faucet-title">Test tokens to <span className="hero-highlight">use HOMR.</span></h1>
          <p>Get BNB for transaction fees and mUSDC to try depositing into the HOMR vault. These tokens work only on testnet.</p>
          <span className="faucet-intro__note">BNB CHAIN TESTNET <span aria-hidden="true">·</span> CHAIN ID 97 <span aria-hidden="true">·</span> NO MONETARY VALUE</span>
        </section>

        <div className="faucet-workspace">
          <div className="faucet-workspace__bar" aria-hidden="true">
            <span className="faucet-workspace__lights"><i /><i /><i /></span>
            <span>HOMR <span>·</span> Testnet Faucet</span>
            <span className="faucet-workspace__network">BNB TESTNET</span>
          </div>
          <div className="faucet-layout">
          <section className="faucet-address-panel" aria-labelledby="faucet-address-title">
            <div className="faucet-panel-index">01 <span>/</span> RECIPIENT ADDRESS</div>
            <h2 id="faucet-address-title">Send to your wallet.</h2>
            <p>Connect your wallet or enter a BNB Chain address manually.</p>

            <label className="faucet-address-label" htmlFor="faucet-address">Wallet address</label>
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
              {targetAddress && !validAddress ? 'Invalid address. Check that it has 42 characters and starts with 0x.' : 'Use the address of the wallet you plan to connect to the dashboard.'}
            </p>

            {isConnected ? (
              <p className="faucet-wallet-state"><span aria-hidden="true" /> Connected wallet: {address.slice(0, 6)}…{address.slice(-4)}</p>
            ) : (
              <button
                type="button"
                className="faucet-secondary-button"
                onClick={() => connectors?.[0] && connect({ connector: connectors[0] })}
                disabled={!connectors?.length || isConnecting}
              >
                {isConnecting ? 'Connecting…' : connectors?.length ? 'Connect wallet' : 'No browser wallet detected'}
              </button>
            )}
            {connectError && <p className="faucet-inline-error" role="alert">{connectError.shortMessage || connectError.message}</p>}
            {wrongChain && (
              <div className="faucet-network-warning" role="status">
                <p>Your wallet is on a different network. Switch to BNB Chain Testnet before claiming.</p>
                <button type="button" className="faucet-secondary-button" onClick={() => switchChain({ chainId: FAUCET_CHAIN_ID })} disabled={isSwitching}>
                  {isSwitching ? 'Switching networks…' : 'Switch to testnet'}
                </button>
              </div>
            )}
            {switchError && <p className="faucet-inline-error" role="alert">{switchError.shortMessage || switchError.message}</p>}

            <div className="faucet-next-step">
              <span>NEXT STEP</span>
              <p>After claiming, open the Investor dashboard and select Live mode to try depositing mUSDC.</p>
              <Link to="/app/invest">Open dashboard <span aria-hidden="true">↗</span></Link>
            </div>
          </section>

          <section className="faucet-claim-panel" aria-labelledby="faucet-claim-title">
            <div className="faucet-panel-index">02 <span>/</span> CLAIM TEST TOKENS</div>
            <div className="faucet-claim-heading">
              <div>
                <h2 id="faucet-claim-title">Choose a test token.</h2>
                <p>Each address can claim each token once per hour.</p>
              </div>
              <span className={`faucet-service-state is-${infoState}`} role="status">
                <span aria-hidden="true" />{infoState === 'ready' ? 'Faucet ready' : infoState === 'loading' ? 'Checking faucet' : 'Server unavailable'}
              </span>
            </div>

            {infoState === 'error' && (
              <div className="faucet-service-error" role="alert">
                <div>
                  <strong>{serviceOffline ? 'Local service is not running' : 'Faucet is not ready'}</strong>
                  <p>{infoError}</p>
                  {serviceOffline && <details>
                    <summary>How to start the local faucet</summary>
                    <ol>
                      <li>In <code>backend/faucet</code>, copy <code>.env.example</code> to <code>.env</code>.</li>
                      <li>Set <code>FAUCET_PRIVATE_KEY</code> to the private key of a dedicated testnet wallet with enough BNB for claims and minting fees.</li>
                      <li>Run <code>npm install</code>, then <code>npm start</code>.</li>
                    </ol>
                  </details>}
                </div>
                <button type="button" onClick={loadInfo}>Try again</button>
              </div>
            )}

            <div className="faucet-token-list">
              {tokens.map((token) => {
                const result = results[token.id];
                return (
                  <article className="faucet-token" key={token.id}>
                    <div className="faucet-token__symbol" aria-hidden="true">{token.id === 'bnb' ? <img src="/brand/bnb-chain-symbol.svg" width="26" height="26" alt="" /> : '$'}</div>
                    <div className="faucet-token__body">
                      <div className="faucet-token__top"><span>{token.kind}</span><strong>{info ? `${info[token.amountKey]} ${token.suffix}` : 'Waiting for data'}</strong></div>
                      <h3>{token.label}</h3>
                      <p>{token.detail}</p>
                    </div>
                    <button type="button" className="faucet-claim-button" disabled={!canClaim} onClick={() => handleClaim(token.id)}>
                      {claiming === token.id ? 'Sending…' : `Claim ${token.label}`}
                    </button>
                    {result && (
                      <div className={`faucet-result is-${result.type}`} role={result.type === 'error' ? 'alert' : 'status'}>
                        <p>{result.message}</p>
                        {result.txHash && <a href={`https://testnet.bscscan.com/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">View transaction on BscScan</a>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          </div>
        </div>
        <p className="faucet-footer-note">This faucet is only for the HOMR simulation on BNB Chain Testnet.</p>
      </main>
    </div>
  );
}

export default FaucetPage;
