import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import AppLayout from '../components/layout/AppLayout';
import {
  EmptyState,
  Field,
  Metric,
  MetricGrid,
  Notice,
  PageIntro,
  Panel,
  PrimarySummary,
  SummaryGrid,
  Workflow
} from '../components/layout/DashboardPrimitives';
import InboxRow from '../components/ui/InboxRow';
import TransparencyLedger from '../components/transparency/TransparencyLedger';
import { useAuction } from '../hooks/useAuction';
import { useLoanManager } from '../hooks/useLoanManager';
import { createApplication } from '../api/client';

const borrowerNavigation = [
  { id: 'overview', icon: 'overview', label: 'Overview', meta: 'Status', group: 'Your financing' },
  { id: 'credit', icon: 'property', label: 'Property', meta: 'Application', group: 'Your financing' },
  { id: 'auction', icon: 'auction', label: 'Auction', meta: 'Commit / reveal', group: 'Borrowing process' },
  { id: 'loans', icon: 'loan', label: 'Loan', meta: 'Terms', group: 'Loan management' },
  { id: 'repayment', icon: 'repayment', label: 'Repay', meta: 'Payment', group: 'Loan management' },
  { id: 'activity', icon: 'activity', label: 'Activity', meta: 'Audit trail', group: 'Records' }
];

export function BorrowerDashboard() {
  const { isDemoMode, state: auctionState, userApproval, commitBid, revealBid } = useAuction();
  const { loans, repayLoan } = useLoanManager();
  const { address } = useAccount();

  const [activeSection, setActiveSection] = useState('overview');
  const [auctionAction, setAuctionAction] = useState('commit');
  const [showAppForm, setShowAppForm] = useState(false);
  const [appName, setAppName] = useState('Budi Pratama');
  const [appProperty, setAppProperty] = useState('0xa7f8...e4b (Jakarta Residential Cluster B2)');
  const [appAmount, setAppAmount] = useState('50000');
  const [appRate, setAppRate] = useState('9.5');
  const [appTerm, setAppTerm] = useState('12');
  const [bidAmount, setBidAmount] = useState('50000');
  const [bidRate, setBidRate] = useState('9.5');
  const [bidTerm, setBidTerm] = useState('12');
  const [bidSalt, setBidSalt] = useState('housd_demo_salt_2026');
  const [repayAmount, setRepayAmount] = useState('50000');
  const [statusMsg, setStatusMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeLoans = loans.filter((loan) => loan.isActive);
  const isApproved = Boolean(userApproval?.isApproved);
  const workflowStage = !isApproved ? 1 : auctionState === 'Finalized' ? 3 : 2;
  const outstandingPrincipal = activeLoans.reduce((total, loan) => total + parseFloat(String(loan.principal).replace(/,/g, '')), 0);

  const withProcessing = async (loadingText, action, successText, fallbackText) => {
    setIsProcessing(true);
    setStatusMsg({ type: 'info', text: loadingText });
    try {
      await action();
      setStatusMsg({ type: 'success', text: successText });
      return true;
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.message || fallbackText });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    const submitted = await withProcessing(
      'Submitting application to the credit database...',
      () => createApplication({
        walletAddress: address || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        displayName: appName,
        propertyHash: appProperty,
        requestedAmount: (parseFloat(appAmount) * 1e6).toString(),
        requestedRate: Math.round(parseFloat(appRate) * 100),
        requestedTerm: parseInt(appTerm, 10) * 30 * 86400
      }),
      'Financing application submitted. A Credit Manager will review the property documents.',
      'Application submission failed.'
    );
    if (submitted) setShowAppForm(false);
  };

  const handleCommitSubmit = async (event) => {
    event.preventDefault();
    await withProcessing(
      'Submitting commitment hash onchain...',
      () => commitBid({ amount: bidAmount, rate: bidRate, term: bidTerm, salt: bidSalt }),
      'Bid commitment submitted.',
      'Commit bid failed.'
    );
  };

  const handleRevealSubmit = async (event) => {
    event.preventDefault();
    await withProcessing(
      'Revealing bid parameters to the auction contract...',
      () => revealBid({ amount: bidAmount, rate: bidRate, term: bidTerm, salt: bidSalt }),
      'Bid parameters revealed and validated.',
      'Reveal bid failed.'
    );
  };

  const handleRepaySubmit = async (event, loanId) => {
    event.preventDefault();
    await withProcessing(
      'Processing principal repayment...',
      () => repayLoan(loanId, repayAmount),
      `Loan #${loanId} repayment submitted.`,
      'Loan repayment failed.'
    );
  };

  const nextAction = !isApproved
    ? { label: 'Complete credit application', section: 'credit', detail: 'Submit the property reference and requested financing terms for review.' }
    : auctionState === 'CommitPhase'
      ? { label: 'Commit borrowing bid', section: 'auction', detail: 'Your credit is approved. Commit your bid before the current window closes.' }
      : auctionState === 'RevealPhase'
        ? { label: 'Reveal borrowing bid', section: 'auction', detail: 'Reveal the exact values used in your commitment for contract validation.' }
        : { label: 'Review active loan', section: 'loans', detail: 'The auction is finalized. Review the resulting loan terms and repayment status.' };

  return (
    <AppLayout
      roleLabel="Borrower"
      navItems={borrowerNavigation}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      workflowLabel={isApproved ? auctionState : 'Credit review'}
      workflowDetail={nextAction.detail}
    >
      {statusMsg && <Notice type={statusMsg.type}>{statusMsg.text}</Notice>}

      {activeSection === 'overview' && (
        <>
          <PageIntro
            eyebrow="Borrower workspace"
            title="Loan overview"
            description="A focused view of your approval, borrowing stage, active financing, and next required action."
            chipType={isDemoMode ? 'simulated' : 'onchain'}
          />

          <SummaryGrid>
            <PrimarySummary eyebrow="Approved borrowing limit" value={isApproved ? `$${userApproval.maxPrincipal}` : 'Pending'} unit={isApproved ? 'mUSDC available for auction' : 'Credit assessment in progress'} detail={userApproval?.propertyHash || 'Property reference awaiting approval'} />
            <Metric label="Outstanding" value={`$${outstandingPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} unit="active principal" />
            <Metric label="Auction phase" value={auctionState} unit="current cycle" tone="accent" />
            <Metric label="Collateral" value={isApproved ? 'Verified' : 'In review'} unit="offchain assessment" tone={isApproved ? 'success' : 'warning'} />
          </SummaryGrid>

          <div className="dashboard-split dashboard-split--wide">
            <Panel title="Financing progress" description="Completed stages and the step currently in progress.">
              <Workflow
                current={workflowStage}
                steps={[
                  { label: 'Application submitted', detail: 'Borrower and property information enters review.' },
                  { label: 'Credit assessment', detail: 'Property and credit limit are verified offchain.' },
                  { label: 'Borrowing auction', detail: 'Approved terms are committed and revealed onchain.' },
                  { label: 'Active loan', detail: 'Allocated principal becomes an active loan.' },
                  { label: 'Repayment complete', detail: 'Principal returns to the shared vault.' }
                ]}
              />
            </Panel>

            <Panel title="Recommended next action" description="The most relevant action for the current stage." className="dashboard-panel--accent">
              <p className="dashboard-action-copy">{nextAction.detail}</p>
              <button className="dashboard-primary-button" type="button" onClick={() => {
                if (nextAction.section === 'auction') setAuctionAction(auctionState === 'RevealPhase' ? 'reveal' : 'commit');
                setActiveSection(nextAction.section);
              }}>
                {nextAction.label}
              </button>
            </Panel>
          </div>
        </>
      )}

      {activeSection === 'credit' && (
        <>
          <PageIntro
            eyebrow="Financing / credit"
            title="Credit & property"
            description="Review the property reference, approval status, and financing request kept in the offchain credit workflow."
            chipType="offchain"
            chipLabel="Private review"
            action={<button className="dashboard-primary-button" type="button" onClick={() => setShowAppForm((value) => !value)}>{showAppForm ? 'Close application' : 'Submit new application'}</button>}
          />

          <Panel title="Credit approval" description="Only the approval result and property reference move into the auction workflow." chipType={isApproved ? 'onchain' : 'pending'}>
            <MetricGrid compact>
              <Metric label="Review status" value={isApproved ? 'Approved' : 'Pending'} tone={isApproved ? 'success' : 'warning'} />
              <Metric label="Maximum principal" value={isApproved ? `$${userApproval.maxPrincipal}` : 'Not available'} unit="mUSDC" />
              <Metric label="Property reference" value={userApproval?.propertyHash || appProperty} detail="Verified offchain" />
            </MetricGrid>
          </Panel>

          {showAppForm && (
            <Panel title="Financing application" description="Submit the existing application fields for Credit Manager review." chipType="offchain" chipLabel="Credit database">
              <form className="dashboard-form" onSubmit={handleApplicationSubmit}>
                <div className="dashboard-form-grid dashboard-form-grid--two">
                  <Field label="Applicant full name"><input type="text" value={appName} onChange={(event) => setAppName(event.target.value)} /></Field>
                  <Field label="Property / deed reference"><input type="text" value={appProperty} onChange={(event) => setAppProperty(event.target.value)} /></Field>
                </div>
                <div className="dashboard-form-grid dashboard-form-grid--three">
                  <Field label="Requested principal (mUSDC)"><input type="number" value={appAmount} onChange={(event) => setAppAmount(event.target.value)} /></Field>
                  <Field label="Requested rate (% APR)"><input type="number" step="0.1" value={appRate} onChange={(event) => setAppRate(event.target.value)} /></Field>
                  <Field label="Requested term (months)"><input type="number" value={appTerm} onChange={(event) => setAppTerm(event.target.value)} /></Field>
                </div>
                <button className="dashboard-primary-button" type="submit" disabled={isProcessing}>{isProcessing ? 'Submitting...' : 'Submit for credit review'}</button>
              </form>
            </Panel>
          )}
        </>
      )}

      {activeSection === 'auction' && (
        <>
          <PageIntro
            eyebrow="Borrowing process"
            title="Borrowing auction"
            description="Commit private bid terms first, then reveal those same values during the reveal window."
            chipType={isDemoMode ? 'simulated' : 'onchain'}
            chipLabel={`Phase: ${auctionState}`}
          />

          <Panel title="Auction action" description="Only the selected phase form is visible.">
            <div className="dashboard-tabs" role="tablist" aria-label="Auction action">
              <button type="button" role="tab" aria-selected={auctionAction === 'commit'} className={auctionAction === 'commit' ? 'is-active' : ''} onClick={() => setAuctionAction('commit')}>1. Commit bid</button>
              <button type="button" role="tab" aria-selected={auctionAction === 'reveal'} className={auctionAction === 'reveal' ? 'is-active' : ''} onClick={() => setAuctionAction('reveal')}>2. Reveal terms</button>
            </div>

            {auctionAction === 'commit' ? (
              <form className="dashboard-form" onSubmit={handleCommitSubmit}>
                <Notice>Keep the salt phrase. The reveal step must use the exact same amount, rate, term, and salt.</Notice>
                <div className="dashboard-form-grid dashboard-form-grid--three">
                  <Field label="Principal amount (mUSDC)"><input type="number" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} /></Field>
                  <Field label="Interest rate (% APR)"><input type="number" step="0.1" value={bidRate} onChange={(event) => setBidRate(event.target.value)} /></Field>
                  <Field label="Term (months)"><input type="number" value={bidTerm} onChange={(event) => setBidTerm(event.target.value)} /></Field>
                </div>
                <Field label="Secret salt phrase"><input type="text" value={bidSalt} onChange={(event) => setBidSalt(event.target.value)} /></Field>
                <button className="dashboard-primary-button" type="submit" disabled={isProcessing || (!isDemoMode && auctionState !== 'CommitPhase')}>{isProcessing ? 'Committing...' : 'Commit bid hash'}</button>
              </form>
            ) : (
              <form className="dashboard-form" onSubmit={handleRevealSubmit}>
                <div className="dashboard-review-list">
                  <span><small>Amount</small><strong>${bidAmount} mUSDC</strong></span>
                  <span><small>Rate</small><strong>{bidRate}% APR</strong></span>
                  <span><small>Term</small><strong>{bidTerm} months</strong></span>
                </div>
                <button className="dashboard-primary-button" type="submit" disabled={isProcessing || (!isDemoMode && auctionState !== 'RevealPhase')}>{isProcessing ? 'Verifying...' : 'Reveal and verify bid'}</button>
              </form>
            )}
          </Panel>
        </>
      )}

      {activeSection === 'loans' && (
        <>
          <PageIntro eyebrow="Loan management" title="Active loan" description="Review principal, borrowing terms, collateral reference, and maturity for each active loan." chipType={isDemoMode ? 'simulated' : 'onchain'} />
          <Panel title="Current financing" description="Loans created after auction allocation.">
            {activeLoans.length === 0 ? (
              <EmptyState title="No active loan" detail="An active loan will appear after your borrowing auction is finalized." />
            ) : (
              <div className="dashboard-row-list">
                {activeLoans.map((loan) => (
                  <InboxRow key={loan.id} statusDotColor="var(--badge-success)" title={`Active loan #${loan.id}`} subtitle={`Principal $${loan.principal} · ${loan.rate}% APR · ${loan.term} months · Collateral ${loan.propertyHash}`} dataType={isDemoMode ? 'simulated' : 'onchain'} customRight={<span className="dashboard-row-status">Matures {loan.maturityDate}</span>} />
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {activeSection === 'repayment' && (
        <>
          <PageIntro eyebrow="Loan management" title="Repayment" description="Select an active loan and submit principal repayment through the existing Loan Manager flow." chipType={isDemoMode ? 'simulated' : 'onchain'} />
          {activeLoans.length === 0 ? (
            <EmptyState title="Nothing to repay" detail="Repayment becomes available when a loan is active." />
          ) : activeLoans.map((loan) => (
            <Panel key={loan.id} title={`Loan #${loan.id}`} description={`Outstanding principal: $${loan.principal} mUSDC`} chipType={isDemoMode ? 'simulated' : 'onchain'}>
              <form className="dashboard-inline-form" onSubmit={(event) => handleRepaySubmit(event, loan.id)}>
                <Field label="Repayment amount (mUSDC)"><input type="number" value={repayAmount} onChange={(event) => setRepayAmount(event.target.value)} /></Field>
                <button className="dashboard-primary-button" type="submit" disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Submit repayment'}</button>
              </form>
            </Panel>
          ))}
        </>
      )}

      {activeSection === 'activity' && (
        <>
          <PageIntro eyebrow="Records" title="Activity & proof" description="Approval, auction, and repayment events associated with the financing workflow." />
          <TransparencyLedger embedded />
        </>
      )}
    </AppLayout>
  );
}

export default BorrowerDashboard;
