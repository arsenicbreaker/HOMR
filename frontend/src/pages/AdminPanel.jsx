import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import DataLabelChip from '../components/ui/DataLabelChip';
import DemoTag from '../components/ui/DemoTag';
import InboxRow from '../components/ui/InboxRow';
import ShortcutBar from '../components/ui/ShortcutBar';
import { useAuction } from '../hooks/useAuction';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

export function AdminPanel() {
  const {
    isDemoMode,
    state: auctionState,
    bids,
    approveBorrower,
    startAuction,
    finalizeAuction
  } = useAuction();

  // Approve borrower form
  const [borrowerAddress, setBorrowerAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [maxPrincipal, setMaxPrincipal] = useState('50000');
  const [propertyHash, setPropertyHash] = useState('0xa7f8...e4b (Jakarta Residential Cluster B2)');

  // Auction config
  const [commitDuration, setCommitDuration] = useState('3600');
  const [revealDuration, setRevealDuration] = useState('3600');

  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Granting credit approval onchain...' });
    try {
      await approveBorrower(borrowerAddress, maxPrincipal, propertyHash);
      setStatusMsg({ type: 'success', text: `Granted max principal $${maxPrincipal} to ${borrowerAddress.slice(0, 8)}...` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartAuction = async () => {
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Initiating new credit auction onchain...' });
    try {
      await startAuction(parseInt(commitDuration), parseInt(revealDuration));
      setStatusMsg({ type: 'success', text: 'Auction started! Commit phase is active.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Start auction failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeAuction = async () => {
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Sorting revealed bids and executing LoanManager creation...' });
    try {
      await finalizeAuction();
      setStatusMsg({ type: 'success', text: 'Auction finalized! Loan created for winning bid.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Finalize auction failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: tokens.spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
                Credit Manager & Admin Panel
              </h1>
              <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
            </div>
            <p style={{ fontSize: '14px', color: colors.ink.tertiary, marginTop: '6px' }}>
              Underwrite offchain housing deeds, approve borrower credit limits, and control auction execution cycles.
            </p>
          </div>
          <ShortcutBar shortcuts={[{ key: 'A', label: 'Approve' }, { key: 'F', label: 'Finalize' }]} />
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: tokens.radii.sm,
            fontSize: '13px',
            marginBottom: tokens.spacing.lg,
            backgroundColor: statusMsg.type === 'error' ? 'rgba(255, 143, 163, 0.12)' : 'rgba(124, 255, 178, 0.12)',
            color: statusMsg.type === 'error' ? colors.state.simulated.color : colors.state.onchain.color,
            border: `1px solid ${statusMsg.type === 'error' ? colors.state.simulated.border : colors.state.onchain.border}`
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Grid: Approve Borrower & Auction Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: tokens.spacing.xl }}>
        {/* Approve Borrower Form */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Underwrite & Approve Borrower Limit
            </h3>
            <DataLabelChip type="offchain" label="Offchain Underwriting" />
          </div>

          <form onSubmit={handleApproveSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                Borrower EVM Address
              </label>
              <input
                type="text"
                value={borrowerAddress}
                onChange={(e) => setBorrowerAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: colors.base,
                  border: `1px solid ${colors.border}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontFamily: tokens.fonts.mono,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                Maximum Approved Principal (mUSDC)
              </label>
              <input
                type="number"
                value={maxPrincipal}
                onChange={(e) => setMaxPrincipal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: colors.base,
                  border: `1px solid ${colors.border}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontFamily: tokens.fonts.mono,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                Verified Property Hash / Registry ID
              </label>
              <input
                type="text"
                value={propertyHash}
                onChange={(e) => setPropertyHash(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: colors.base,
                  border: `1px solid ${colors.border}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontFamily: tokens.fonts.mono,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: colors.cardHover,
                border: `1px solid ${colors.accent}`,
                borderRadius: tokens.radii.sm,
                color: colors.ink.primary,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Grant Credit Approval Onchain
            </button>
          </form>
        </div>

        {/* Auction Lifecycle Control */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Auction Lifecycle Control
            </h3>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} label={`State: ${auctionState}`} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: colors.ink.secondary, marginBottom: '8px' }}>
              Phase Configuration (Seconds)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.ink.tertiary }}>Commit Duration</label>
                <input
                  type="number"
                  value={commitDuration}
                  onChange={(e) => setCommitDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: colors.base,
                    border: `1px solid ${colors.border}`,
                    borderRadius: tokens.radii.sm,
                    color: colors.ink.primary,
                    fontFamily: tokens.fonts.mono,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.ink.tertiary }}>Reveal Duration</label>
                <input
                  type="number"
                  value={revealDuration}
                  onChange={(e) => setRevealDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: colors.base,
                    border: `1px solid ${colors.border}`,
                    borderRadius: tokens.radii.sm,
                    color: colors.ink.primary,
                    fontFamily: tokens.fonts.mono,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleStartAuction}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: colors.cardHover,
                border: `1px solid ${colors.border}`,
                borderRadius: tokens.radii.sm,
                color: colors.ink.primary,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              ▶ Start New Auction Cycle
            </button>

            <button
              onClick={handleFinalizeAuction}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: colors.cardHover,
                border: `1px solid ${colors.state.onchain.color}`,
                borderRadius: tokens.radii.sm,
                color: colors.state.onchain.color,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              ✓ Finalize Auction & Allocate Capital
            </button>
          </div>
        </div>
      </div>

      {/* Bids Evaluation Table */}
      <div
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: tokens.radii.lg,
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
            Auction Bids Evaluation Queue
          </h3>
          <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
        </div>

        {bids.map((bid, idx) => (
          <InboxRow
            key={idx}
            statusDotColor={colors.accent}
            title={`${bid.borrower.slice(0, 10)}... • Requested $${bid.amount} @ ${bid.rate}% APR`}
            subtitle={`Property: ${bid.property} • Term: ${bid.term} Months`}
            dataType={isDemoMode ? 'simulated' : 'onchain'}
            customRight={
              <span style={{ fontSize: '12px', fontFamily: tokens.fonts.mono, color: colors.state.onchain.color }}>
                {bid.status}
              </span>
            }
          />
        ))}
      </div>
    </AppLayout>
  );
}

export default AdminPanel;
