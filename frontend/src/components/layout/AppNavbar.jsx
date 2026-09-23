import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import WalletConnectButton from '../wallet/WalletConnectButton';

export function AppNavbar() {
  const location = useLocation();

  const roleMap = {
    '/app/invest': { label: 'Investor Dashboard' },
    '/app/borrow': { label: 'Borrower Portal' },
    '/app/admin': { label: 'Credit Manager Panel' }
  };

  const currentRole = roleMap[location.pathname] || { label: 'App Portal' };

  return (
    <header
      style={{
        backgroundColor: colors.base,
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand & Isolated Active Role Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            to="/"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: colors.ink.primary,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: colors.accent
              }}
            />
            HOUSD <span style={{ fontSize: '11px', fontFamily: tokens.fonts.mono, color: colors.ink.tertiary, fontWeight: 400 }}>[BNB MVP]</span>
          </Link>

          {/* Hairline Divider */}
          <span style={{ width: '1px', height: '18px', backgroundColor: colors.border }} />

          {/* Strict Single Role Label (No Dropdown / Switcher) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: tokens.radii.sm,
              fontSize: '13px',
              fontWeight: 600,
              color: colors.ink.primary,
              backgroundColor: 'rgba(124, 124, 255, 0.12)',
              border: `1px solid ${colors.accent}`,
              letterSpacing: '0.01em'
            }}
          >
            {currentRole.label}
          </div>
        </div>

        {/* Action Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{
              fontSize: '12px',
              color: colors.ink.tertiary,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: tokens.radii.sm,
              border: `1px solid ${colors.border}`
            }}
          >
            ← Landing Page
          </Link>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}

export default AppNavbar;
