import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import AppLayout from '../components/layout/AppLayout';
import DataLabelChip from '../components/ui/DataLabelChip';
import DemoTag from '../components/ui/DemoTag';
import InboxRow from '../components/ui/InboxRow';
import ShortcutBar from '../components/ui/ShortcutBar';
import { useAuction } from '../hooks/useAuction';
import { useLoanManager } from '../hooks/useLoanManager';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { createApplication } from '../api/client';

export function BorrowerDashboard() {
  const { isDemoMode, state: auctionState, userApproval, commitBid, revealBid } = useAuction();
  const { loans, repayLoan } = useLoanManager();
  const { address } = useAccount();

  // Application form inputs
  const [showAppForm, setShowAppForm] = useState(false);
  const [appName, setAppName] = useState('Budi Pratama');
  const [appProperty, setAppProperty] = useState('0xa7f8...e4b (Jakarta Residential Cluster B2)');
  const [appAmount, setAppAmount] = useState('50000');
  const [appRate, setAppRate] = useState('9.5');
  const [appTerm, setAppTerm] = useState('12');

  // Commit form inputs
  const [bidAmount, setBidAmount] = useState('50000');
  const [bidRate, setBidRate] = useState('9.5');
  const [bidTerm, setBidTerm] = useState('12');
  const [bidSalt, setBidSalt] = useState('housd_demo_salt_2026');

  // Repayment form input
  const [repayAmount, setRepayAmount] = useState('50000');

  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Submitting loan application to credit database...' });
    try {
      const borrowerWallet = address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
      await createApplication({
        walletAddress: borrowerWallet,
        displayName: appName,
        propertyHash: appProperty,
        requestedAmount: (parseFloat(appAmount) * 1e6).toString(),
        requestedRate: Math.round(parseFloat(appRate) * 100),
        requestedTerm: parseInt(appTerm) * 30 * 86400
      });
      setStatusMsg({
        type: 'success',
        text: 'Financing application submitted successfully! Credit Manager will review offchain deeds.'
      });
      setShowAppForm(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Application submission failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Submitting Keccak256 commitment onchain...' });
    try {
      await commitBid({
        amount: bidAmount,
        rate: bidRate,
        term: bidTerm,
        salt: bidSalt
      });
      setStatusMsg({ type: 'success', text: 'Bid commitment successfully submitted!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Commit bid failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevealSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Unveiling bid parameters to auction contract...' });
    try {
      await revealBid({
        amount: bidAmount,
        rate: bidRate,
        term: bidTerm,
        salt: bidSalt
      });
      setStatusMsg({ type: 'success', text: 'Bid parameters revealed and validated!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Reveal bid failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepaySubmit = async (e, loanId) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Processing principal repayment...' });
    try {
      await repayLoan(loanId, repayAmount);
      setStatusMsg({ type: 'success', text: `Loan #${loanId} successfully repaid!` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Loan repayment failed' });
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
                Borrower Portal
              </h1>
              <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
            </div>
            <p style={{ fontSize: '14px', color: colors.ink.tertiary, marginTop: '6px' }}>
              Submit property collateral for appraisal, participate in competitive credit auctions, and manage loan repayments.
            </p>
          </div>
          <ShortcutBar shortcuts={[{ key: 'C', label: 'Commit' }, { key: 'R', label: 'Reveal' }]} />
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

      {/* Credit Line & Approval Banner */}
      <div
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: tokens.radii.lg,
          padding: '24px',
          marginBottom: tokens.spacing.xl
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>CREDIT APPROVAL STATUS</span>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink.primary, marginTop: '4px' }}>
              {userApproval?.isApproved ? 'Approved Credit Limit' : 'Pending Credit Review'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <DataLabelChip type="offchain" label="Deed Verified offchain" />
            <DataLabelChip type={userApproval?.isApproved ? 'onchain' : 'pending'} />
            <button
              type="button"
              onClick={() => setShowAppForm(!showAppForm)}
              style={{
                marginLeft: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(124, 124, 255, 0.12)',
                border: `1px solid ${colors.accent}`,
                borderRadius: tokens.radii.sm,
                color: colors.ink.primary,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {showAppForm ? 'Close Form' : 'Apply for Credit'}
            </button>
          </div>
        </div>

        {userApproval?.isApproved && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.border}`
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: colors.ink.tertiary }}>Max Approved Principal</span>
              <div style={{ fontSize: '18px', fontWeight: 600, fontFamily: tokens.fonts.mono, color: colors.state.onchain.color }}>
                ${userApproval.maxPrincipal} USDC
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: colors.ink.tertiary }}>Property Collateral Hash</span>
              <div style={{ fontSize: '13px', fontFamily: tokens.fonts.mono, color: colors.ink.secondary }}>
                {userApproval.propertyHash}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: colors.ink.tertiary }}>Current Auction Phase</span>
              <div style={{ fontSize: '14px', fontFamily: tokens.fonts.mono, color: colors.accent }}>
                {auctionState}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offchain Application Form Accordion */}
      {showAppForm && (
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.accent}`,
            borderRadius: tokens.radii.lg,
            padding: '24px',
            marginBottom: tokens.spacing.xl
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Apply for Credit Line (Offchain Collateral Evaluation)
            </h3>
            <DataLabelChip type="offchain" label="Web2 DB + Offchain Review" />
          </div>

          <form onSubmit={handleApplicationSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Applicant Full Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: colors.base,
                    border: `1px solid ${colors.border}`,
                    borderRadius: tokens.radii.sm,
                    color: colors.ink.primary,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Property / Deed Reference (SHM / BPN)
                </label>
                <input
                  type="text"
                  value={appProperty}
                  onChange={(e) => setAppProperty(e.target.value)}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Requested Principal (mUSDC)
                </label>
                <input
                  type="number"
                  value={appAmount}
                  onChange={(e) => setAppAmount(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Requested Rate (% APR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={appRate}
                  onChange={(e) => setAppRate(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Requested Term (Months)
                </label>
                <input
                  type="number"
                  value={appTerm}
                  onChange={(e) => setAppTerm(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.cardHover,
                border: `1px solid ${colors.accent}`,
                borderRadius: tokens.radii.sm,
                color: colors.ink.primary,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Submit Application for Credit Review
            </button>
          </form>
        </div>
      )}

      {/* Auction Commit-Reveal Interactive Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: tokens.spacing.xl }}>
        {/* Phase 1: Commit Bid Form */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px',
            opacity: auctionState === 'CommitPhase' || isDemoMode ? 1 : 0.6
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Step 1: Commit Bid Hash
            </h3>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} label="Blind Commit" />
          </div>

          <p style={{ fontSize: '12px', color: colors.ink.tertiary, marginBottom: '20px' }}>
            Submits a zero-knowledge Keccak256 hash of your requested rate and principal to prevent frontrunning.
          </p>

          <form onSubmit={handleCommitSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                Principal Amount (mUSDC)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Interest Rate (% APR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bidRate}
                  onChange={(e) => setBidRate(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                  Term (Months)
                </label>
                <input
                  type="number"
                  value={bidTerm}
                  onChange={(e) => setBidTerm(e.target.value)}
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
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '4px' }}>
                Secret Salt Phrase
              </label>
              <input
                type="text"
                value={bidSalt}
                onChange={(e) => setBidSalt(e.target.value)}
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
              Commit Hash to Auction
            </button>
          </form>
        </div>

        {/* Phase 2: Reveal Bid Form */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px',
            opacity: auctionState === 'RevealPhase' || isDemoMode ? 1 : 0.6
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.ink.primary, margin: 0 }}>
              Step 2: Reveal Bid Parameters
            </h3>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} label="Public Verification" />
          </div>

          <p style={{ fontSize: '12px', color: colors.ink.tertiary, marginBottom: '20px' }}>
            Submits raw parameters during the reveal window. The smart contract validates against your previously committed hash.
          </p>

          <form onSubmit={handleRevealSubmit}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: tokens.radii.sm,
                border: `1px solid ${colors.border}`,
                marginBottom: '16px',
                fontSize: '12px',
                fontFamily: tokens.fonts.mono,
                color: colors.ink.secondary
              }}
            >
              <div>Revealing Amount: ${bidAmount} USDC</div>
              <div>Revealing Rate: {bidRate}% APR</div>
              <div>Revealing Term: {bidTerm} Months</div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: colors.cardHover,
                border: `1px solid ${colors.state.onchain.color}`,
                borderRadius: tokens.radii.sm,
                color: colors.ink.primary,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Reveal & Verify Bid
            </button>
          </form>
        </div>
      </div>

      {/* Active Loans & Repayment Section (FR-07) */}
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
            Your Active Loans & Repayment
          </h3>
          <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
        </div>

        {loans.filter(l => l.isActive).map(loan => (
          <div key={loan.id} style={{ marginBottom: '16px' }}>
            <InboxRow
              statusDotColor={colors.state.onchain.color}
              title={`Active Loan #${loan.id}`}
              subtitle={`Principal $${loan.principal} • ${loan.rate}% APR • Collateral Hash: ${loan.propertyHash}`}
              dataType={isDemoMode ? 'simulated' : 'onchain'}
            />
            <form
              onSubmit={(e) => handleRepaySubmit(e, loan.id)}
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '12px',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: colors.base,
                borderRadius: tokens.radii.sm
              }}
            >
              <span style={{ fontSize: '12px', color: colors.ink.secondary, fontFamily: tokens.fonts.mono }}>
                Repay Amount (mUSDC):
              </span>
              <input
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontFamily: tokens.fonts.mono
                }}
              />
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.cardHover,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                Submit Repayment
              </button>
            </form>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

export default BorrowerDashboard;
