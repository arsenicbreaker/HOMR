import React from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useDemoMode } from '../../context/DemoModeContext';
import DemoTag from '../ui/DemoTag';
import { CHAIN_CONFIG } from '../../contracts/addresses';

export function WalletConnectButton() {
  const { isDemoMode, toggleDemoMode, isTransacting } = useDemoMode();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { switchChain, error: switchError } = useSwitchChain();
  const { disconnect } = useDisconnect();

  return (
    <div className="wallet-controls">
      <button
        onClick={toggleDemoMode}
        disabled={isTransacting}
        aria-label={isDemoMode ? 'Switch to live mode' : 'Enable demo mode'}
        title={isDemoMode ? 'Switch to live mode' : 'Enable demo mode'}
        className={`wallet-mode${isDemoMode ? ' is-active' : ''}`}
      >
        <span className="wallet-control__dot" />
        <span>{isDemoMode ? 'Demo' : 'Live'}</span>
        <span className="wallet-mode__label">{isDemoMode ? 'Demo active · Switch to live' : 'Live · Enable demo'}</span>
        {isDemoMode && <DemoTag text="MOCKED" />}
      </button>

      {isConnected ? (
        <button onClick={() => disconnect()} disabled={isTransacting} className="wallet-account">
          <span className="wallet-control__dot wallet-control__dot--connected" />
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        </button>
      ) : (
        <button
          onClick={() => {
            if (connectors && connectors.length > 0) {
              connect({ connector: connectors[0] });
            } else {
              alert('No Web3 wallet extension found. Use Demo Mode or install MetaMask / BNB Wallet.');
            }
          }}
          className="wallet-account"
          disabled={isPending}
        >
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {isConnected && chainId !== CHAIN_CONFIG.chainId && <button type="button" className="wallet-account" onClick={() => switchChain({ chainId: CHAIN_CONFIG.chainId })}>Switch to {CHAIN_CONFIG.chainName}</button>}
      {(error || switchError) && <span role="alert">{(error || switchError).shortMessage || (error || switchError).message}</span>}
    </div>
  );
}

export default WalletConnectButton;
