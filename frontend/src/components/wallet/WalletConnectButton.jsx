import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useDemoMode } from '../../context/DemoModeContext';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import DemoTag from '../ui/DemoTag';

export function WalletConnectButton() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Demo Mode Toggle */}
      <button
        onClick={toggleDemoMode}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: tokens.radii.sm,
          backgroundColor: isDemoMode ? 'rgba(124, 124, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${isDemoMode ? colors.accent : colors.border}`,
          color: isDemoMode ? colors.accent : colors.ink.secondary,
          fontSize: '12px',
          fontFamily: tokens.fonts.sans,
          fontWeight: 500,
          cursor: 'pointer',
          transition: `all ${tokens.motion.fast}`
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isDemoMode ? colors.accent : colors.ink.tertiary
          }}
        />
        <span>{isDemoMode ? 'Demo Mode Active' : 'Enable Demo Mode'}</span>
        {isDemoMode && <DemoTag text="MOCKED" />}
      </button>

      {/* Wallet Connection */}
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: tokens.radii.sm,
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            color: colors.ink.primary,
            fontSize: '12px',
            fontFamily: tokens.fonts.mono,
            cursor: 'pointer'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.state.onchain.color }} />
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
          style={{
            padding: '6px 14px',
            borderRadius: tokens.radii.sm,
            backgroundColor: colors.cardHover,
            border: `1px solid ${colors.border}`,
            color: colors.ink.primary,
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnectButton;
