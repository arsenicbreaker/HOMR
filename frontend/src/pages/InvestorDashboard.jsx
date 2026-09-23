import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import DataLabelChip from '../components/ui/DataLabelChip';
import DemoTag from '../components/ui/DemoTag';
import InboxRow from '../components/ui/InboxRow';
import ShortcutBar from '../components/ui/ShortcutBar';
import { useVault } from '../hooks/useVault';
import { useLoanManager } from '../hooks/useLoanManager';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

export function InvestorDashboard() {
  const {
    isDemoMode,
    tvl,
    sharePrice,
    deployedCapital,
    availableCapital,
    userShares,
    userDeposited,
    estimatedApy,
    deposit,
    withdraw
  } = useVault();

  const { loans } = useLoanManager();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' | 'withdraw'
  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setStatusMsg({ type: 'error', text: 'Deposit amount must be greater than 0' });
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Processing deposit...' });
    try {
      await deposit(val);
      setStatusMsg({ type: 'success', text: `Successfully deposited ${val} mUSDC into Vault!` });
      setDepositAmount('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Deposit failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      setStatusMsg({ type: 'error', text: 'Withdrawal shares must be greater than 0' });
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: 'Processing withdrawal...' });
    try {
      await withdraw(val);
      setStatusMsg({ type: 'success', text: `Successfully redeemed ${val} hvSHARE` });
      setWithdrawAmount('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Withdrawal failed' });
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
                Housing Credit Vault
              </h1>
              <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
            </div>
            <p style={{ fontSize: '14px', color: colors.ink.tertiary, marginTop: '6px' }}>
              Senior tranche capital allocation pool backing verified Indonesian residential mortgage loans.
            </p>
          </div>
          <ShortcutBar shortcuts={[{ key: 'D', label: 'Deposit' }, { key: 'W', label: 'Withdraw' }]} />
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: tokens.spacing.xl
        }}
      >
        {/* TVL */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>TOTAL VAULT TVL</span>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink.primary, marginTop: '8px', fontFamily: tokens.fonts.mono }}>
            ${tvl} <span style={{ fontSize: '13px', color: colors.ink.tertiary }}>USDC</span>
          </div>
        </div>

        {/* Share Price */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>SHARE PRICE</span>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink.primary, marginTop: '8px', fontFamily: tokens.fonts.mono }}>
            ${sharePrice}
          </div>
        </div>

        {/* Available Liquidity */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>AVAILABLE CAPITAL</span>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: colors.state.onchain.color, marginTop: '8px', fontFamily: tokens.fonts.mono }}>
            ${availableCapital}
          </div>
        </div>

        {/* Deployed Capital */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>DEPLOYED LOANS</span>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink.primary, marginTop: '8px', fontFamily: tokens.fonts.mono }}>
            ${deployedCapital}
          </div>
        </div>

        {/* Yield APY */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: colors.ink.tertiary, fontFamily: tokens.fonts.mono }}>PROJECTED APY</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <DemoTag text="DEMO DATA" />
              <DataLabelChip type="simulated" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: colors.state.offchain.color, marginTop: '8px', fontFamily: tokens.fonts.mono }}>
            {estimatedApy}
          </div>
        </div>
      </div>

      {/* Main Form & Portfolio split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Deposit / Withdraw Action Panel */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px'
          }}
        >
          {/* Action Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('deposit')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'deposit' ? `2px solid ${colors.accent}` : '2px solid transparent',
                color: activeTab === 'deposit' ? colors.ink.primary : colors.ink.tertiary,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Deposit Capital
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'withdraw' ? `2px solid ${colors.accent}` : '2px solid transparent',
                color: activeTab === 'withdraw' ? colors.ink.primary : colors.ink.tertiary,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Redeem Shares
            </button>
          </div>

          {/* User Holdings Info */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: tokens.radii.sm,
              marginBottom: '20px',
              fontSize: '13px',
              fontFamily: tokens.fonts.mono,
              display: 'flex',
              justify: 'space-between'
            }}
          >
            <span style={{ color: colors.ink.tertiary }}>Your Shares Balance:</span>
            <span style={{ color: colors.accent, fontWeight: 600 }}>{userShares} hvSHARE</span>
          </div>

          {statusMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: tokens.radii.sm,
                fontSize: '13px',
                marginBottom: '16px',
                backgroundColor: statusMsg.type === 'error' ? 'rgba(255, 143, 163, 0.12)' : 'rgba(124, 255, 178, 0.12)',
                color: statusMsg.type === 'error' ? colors.state.simulated.color : colors.state.onchain.color,
                border: `1px solid ${statusMsg.type === 'error' ? colors.state.simulated.border : colors.state.onchain.border}`
              }}
            >
              {statusMsg.text}
            </div>
          )}

          {activeTab === 'deposit' ? (
            <form onSubmit={handleDepositSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '8px' }}>
                  Deposit Amount (mUSDC)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: colors.base,
                      border: `1px solid ${colors.border}`,
                      borderRadius: tokens.radii.sm,
                      color: colors.ink.primary,
                      fontSize: '14px',
                      fontFamily: tokens.fonts.mono,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDepositAmount('10000')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      fontSize: '11px',
                      fontFamily: tokens.fonts.mono,
                      backgroundColor: colors.cardHover,
                      border: `1px solid ${colors.border}`,
                      color: colors.accent,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    +10k
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.cardHover,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: `all ${tokens.motion.fast}`
                }}
              >
                {isProcessing ? 'Confirming...' : 'Deposit mUSDC & Mint Shares'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.ink.secondary, marginBottom: '8px' }}>
                  Redeem Shares (hvSHARE)
                </label>
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: colors.base,
                    border: `1px solid ${colors.border}`,
                    borderRadius: tokens.radii.sm,
                    color: colors.ink.primary,
                    fontSize: '14px',
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
                  padding: '14px',
                  backgroundColor: colors.cardHover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: tokens.radii.sm,
                  color: colors.ink.primary,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Processing...' : 'Request Share Redemption'}
              </button>
            </form>
          )}
        </div>

        {/* Portfolio Table of Active Loans (FR-08) */}
        <div
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: tokens.radii.lg,
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: colors.ink.primary }}>
              Funded Loan Portfolio
            </h3>
            <DataLabelChip type={isDemoMode ? 'simulated' : 'onchain'} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loans.map((loan) => (
              <InboxRow
                key={loan.id}
                statusDotColor={colors.state.onchain.color}
                title={`Loan #${loan.id} • ${loan.borrower.slice(0, 8)}...`}
                subtitle={`Principal $${loan.principal} • ${loan.rate}% APR • Term ${loan.term}mo`}
                dataType={isDemoMode ? 'simulated' : 'onchain'}
                customRight={
                  <span style={{ fontSize: '13px', fontFamily: tokens.fonts.mono, color: colors.state.onchain.color }}>
                    Active (Matures {loan.maturityDate})
                  </span>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default InvestorDashboard;
