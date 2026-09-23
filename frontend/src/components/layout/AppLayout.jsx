import React from 'react';
import AppNavbar from './AppNavbar';
import TransparencyLedger from '../transparency/TransparencyLedger';
import { colors } from '../../theme/colors';

export function AppLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.canvas,
        color: colors.ink.primary,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <AppNavbar />

      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 24px',
          minHeight: 'calc(100vh - 400px)'
        }}
      >
        {children}
      </main>

      <TransparencyLedger />

      <footer
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: colors.ink.quaternary,
          fontFamily: '"JetBrains Mono", monospace'
        }}
      >
        HOUSD Protocol • BNB Smart Chain Testnet Hackathon MVP • RWA Housing Credit Vault
      </footer>
    </div>
  );
}

export default AppLayout;
