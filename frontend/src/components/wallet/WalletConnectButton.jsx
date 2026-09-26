import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useDemoMode } from '../../context/DemoModeContext';
import DemoTag from '../ui/DemoTag';

export function WalletConnectButton() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="wallet-controls">
      <button
        onClick={toggleDemoMode}
        className={`wallet-mode${isDemoMode ? ' is-active' : ''}`}
      >
        <span className="wallet-control__dot" />
        <span className="wallet-mode__label">{isDemoMode ? 'Demo active' : 'Enable demo'}</span>
        {isDemoMode && <DemoTag text="MOCKED" />}
      </button>

      {isConnected ? (
        <button onClick={() => disconnect()} className="wallet-account">
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
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnectButton;
