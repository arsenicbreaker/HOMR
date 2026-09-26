import React from 'react';
import InboxRow from '../ui/InboxRow';
import TxLink from '../ui/TxLink';
import { useTransparencyEvents } from '../../hooks/useTransparencyEvents';

export function TransparencyLedger({ embedded = false }) {
  const { events } = useTransparencyEvents();

  return (
    <section className={`transparency-ledger${embedded ? ' transparency-ledger--embedded' : ''}`}>
      <header className="transparency-ledger__header">
        <div>
          <h2>Transparency ledger</h2>
          <p>Contract events, borrower approvals, and verified offchain references.</p>
        </div>
        <span className="transparency-ledger__count">{events.length} events</span>
      </header>

      {events.length === 0 ? (
        <div className="dashboard-empty">
          <strong>No recorded activity</strong>
          <p>Verified workflow events will appear here as they occur.</p>
        </div>
      ) : (
        <div className="dashboard-row-list">
          {events.map((event) => (
            <InboxRow
              key={event.id}
              statusDotColor={event.dataType === 'onchain' ? 'var(--badge-success)' : event.dataType === 'offchain' ? 'var(--badge-warning)' : 'var(--primary)'}
              title={event.title}
              subtitle={`${event.detail} · ${event.timestamp}`}
              dataType={event.dataType}
              customRight={event.txHash ? <TxLink hash={event.txHash} /> : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TransparencyLedger;
