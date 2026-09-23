import React from 'react';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import InboxRow from '../ui/InboxRow';
import TxLink from '../ui/TxLink';
import ShortcutBar from '../ui/ShortcutBar';
import { useTransparencyEvents } from '../../hooks/useTransparencyEvents';

export function TransparencyLedger() {
  const { events } = useTransparencyEvents();

  return (
    <div
      style={{
        marginTop: tokens.spacing.section,
        backgroundColor: colors.base,
        borderTop: `1px solid ${colors.hairline}`,
        paddingTop: tokens.spacing.xl,
        paddingBottom: tokens.spacing.xl
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Transparency Ledger & Onchain Audit Trail
            </h3>
            <p style={{ fontSize: '13px', color: colors.ink.tertiary, marginTop: '4px', margin: 0 }}>
              Real-time contract events, borrower approvals, and verified offchain land deeds.
            </p>
          </div>
          <ShortcutBar
            shortcuts={[
              { key: 'J / K', label: 'Scroll Events' },
              { key: 'Enter', label: 'View Explorer' }
            ]}
          />
        </div>

        {/* Event Inbox List */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            overflow: 'hidden',
            backgroundColor: colors.card
          }}
        >
          {events.map((evt) => (
            <InboxRow
              key={evt.id}
              statusDotColor={
                evt.dataType === 'onchain'
                  ? colors.state.onchain.color
                  : evt.dataType === 'offchain'
                  ? colors.state.offchain.color
                  : colors.state.simulated.color
              }
              title={evt.title}
              subtitle={`${evt.detail} • ${evt.timestamp}`}
              dataType={evt.dataType}
              customRight={evt.txHash ? <TxLink hash={evt.txHash} /> : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransparencyLedger;
