import React, { createContext, useContext, useState } from 'react';

const DemoModeContext = createContext(null);

const initialSeededData = {
  // Vault overview (FR-01, FR-02)
  vault: {
    tvl: '150,000.00',
    sharePrice: '1.0000',
    deployedCapital: '95,000.00',
    availableCapital: '55,000.00',
    userShares: '25,000.00',
    userDeposited: '25,000.00',
    estimatedApy: '8.4%'
  },
  // Borrower applications & auction bids (FR-03 to FR-06)
  borrower: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    isApproved: true,
    maxPrincipal: '50,000.00',
    propertyHash: '0xa7f...e4b (Jakarta Residential Cluster B2)',
    bid: {
      committed: true,
      revealed: true,
      amount: '50,000',
      rate: '9.5',
      term: '12',
      salt: 'housd_demo_salt_2026'
    }
  },
  // Auction State (FR-04 to FR-06)
  auction: {
    state: 'RevealPhase', // 'Created' | 'CommitPhase' | 'RevealPhase' | 'Finalized'
    commitDeadline: Date.now() + 3600 * 1000,
    revealDeadline: Date.now() + 7200 * 1000,
    bids: [
      {
        borrower: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: '50,000',
        rate: '9.5',
        term: '12',
        status: 'Revealed',
        property: 'Jakarta Residential Cluster B2'
      },
      {
        borrower: '0x3C44CdD4657315647576828340e5C6070624A9b6',
        amount: '45,000',
        rate: '9.2',
        term: '24',
        status: 'Revealed',
        property: 'Surabaya Suburban House 14'
      }
    ]
  },
  // Active funded loans portfolio (FR-07, FR-08)
  loans: [
    {
      id: 0,
      borrower: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      principal: '50,000.00',
      rate: '9.5',
      term: '12',
      propertyHash: '0xa7f...e4b',
      isActive: true,
      maturityDate: '2027-09-23'
    },
    {
      id: 1,
      borrower: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      principal: '45,000.00',
      rate: '9.0',
      term: '24',
      propertyHash: '0xb8c...f12',
      isActive: true,
      maturityDate: '2028-09-23'
    }
  ],
  // Event transparency ledger (PRD §6.3, §16)
  events: [
    {
      id: 1,
      type: 'Deposit',
      title: 'Vault Deposit Received',
      detail: '25,000 mUSDC deposited by Investor (0x15d3...3a)',
      txHash: '0x4f82a9310c81bf3721e05f63901b52c03889146123bc9e7a8e2913b71bf9a871',
      timestamp: '10 mins ago',
      dataType: 'onchain'
    },
    {
      id: 2,
      type: 'BorrowerApproved',
      title: 'Borrower Approved by Credit Manager',
      detail: 'Max Principal $50,000 granted for 0x7099...79C8',
      txHash: '0x8b12f7410e9944a981c7e1039bc417e912440b8e762a11b092837194821a8123',
      timestamp: '1 hour ago',
      dataType: 'onchain'
    },
    {
      id: 3,
      type: 'BidRevealed',
      title: 'Bid Revealed in Auction #1',
      detail: '$50,000 at 9.5% APR by 0x7099...79C8',
      txHash: '0x3a918247190c12849e7b23c10928e1471029e84712039e148712390847192834',
      timestamp: '2 hours ago',
      dataType: 'onchain'
    },
    {
      id: 4,
      type: 'PropertyVerification',
      title: 'Property Deed Verified Offchain',
      detail: 'Indonesian Land Registry Certificate #31.74.05.1002.04912',
      txHash: null,
      timestamp: '1 day ago',
      dataType: 'offchain'
    }
  ]
};

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [seededData, setSeededData] = useState(initialSeededData);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);

  // Helper actions for demo interaction
  const depositDemoVault = (amount) => {
    const num = parseFloat(amount) || 0;
    setSeededData(prev => {
      const currentTVL = parseFloat(prev.vault.tvl.replace(/,/g, '')) + num;
      const currentAvail = parseFloat(prev.vault.availableCapital.replace(/,/g, '')) + num;
      const currentUser = parseFloat(prev.vault.userDeposited.replace(/,/g, '')) + num;

      return {
        ...prev,
        vault: {
          ...prev.vault,
          tvl: currentTVL.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          availableCapital: currentAvail.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          userDeposited: currentUser.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          userShares: currentUser.toLocaleString('en-US', { minimumFractionDigits: 2 })
        },
        events: [
          {
            id: Date.now(),
            type: 'Deposit',
            title: 'Vault Deposit Received (Demo)',
            detail: `${num.toLocaleString()} mUSDC deposited into Housing Credit Vault`,
            txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
            timestamp: 'Just now',
            dataType: 'simulated'
          },
          ...prev.events
        ]
      };
    });
  };

  const commitDemoBid = ({ amount, rate, term, salt }) => {
    setSeededData(prev => ({
      ...prev,
      borrower: {
        ...prev.borrower,
        bid: { committed: true, revealed: false, amount, rate, term, salt }
      },
      events: [
        {
          id: Date.now(),
          type: 'BidCommitted',
          title: 'Auction Bid Hash Committed (Demo)',
          detail: `Keccak256 commitment submitted for evaluation`,
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          timestamp: 'Just now',
          dataType: 'simulated'
        },
        ...prev.events
      ]
    }));
  };

  const revealDemoBid = ({ amount, rate, term, salt }) => {
    setSeededData(prev => ({
      ...prev,
      borrower: {
        ...prev.borrower,
        bid: { committed: true, revealed: true, amount, rate, term, salt }
      },
      events: [
        {
          id: Date.now(),
          type: 'BidRevealed',
          title: 'Auction Bid Unveiled (Demo)',
          detail: `$${amount} requested at ${rate}% APR (${term} months)`,
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          timestamp: 'Just now',
          dataType: 'simulated'
        },
        ...prev.events
      ]
    }));
  };

  const approveDemoBorrower = (address, maxPrincipal, propertyHash) => {
    setSeededData(prev => ({
      ...prev,
      events: [
        {
          id: Date.now(),
          type: 'BorrowerApproved',
          title: 'Borrower Credit Limit Approved (Demo)',
          detail: `Address ${address.slice(0, 8)}... granted max principal $${maxPrincipal}`,
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          timestamp: 'Just now',
          dataType: 'simulated'
        },
        ...prev.events
      ]
    }));
  };

  const finalizeDemoAuction = () => {
    setSeededData(prev => ({
      ...prev,
      auction: {
        ...prev.auction,
        state: 'Finalized'
      },
      events: [
        {
          id: Date.now(),
          type: 'AuctionFinalized',
          title: 'Credit Auction Finalized (Demo)',
          detail: 'Highest-rate valid bids allocated from vault capital',
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          timestamp: 'Just now',
          dataType: 'simulated'
        },
        ...prev.events
      ]
    }));
  };

  const repayDemoLoan = (loanId, amount) => {
    setSeededData(prev => ({
      ...prev,
      loans: prev.loans.map(l => l.id === loanId ? { ...l, isActive: false } : l),
      events: [
        {
          id: Date.now(),
          type: 'LoanRepaid',
          title: `Loan #${loanId} Principal Repaid (Demo)`,
          detail: `$${amount} returned to Housing Credit Vault`,
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          timestamp: 'Just now',
          dataType: 'simulated'
        },
        ...prev.events
      ]
    }));
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        seededData,
        depositDemoVault,
        commitDemoBid,
        revealDemoBid,
        approveDemoBorrower,
        finalizeDemoAuction,
        repayDemoLoan
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return ctx;
}
