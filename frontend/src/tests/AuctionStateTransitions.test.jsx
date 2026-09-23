// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DemoModeProvider } from '../context/DemoModeContext';
import BorrowerDashboard from '../pages/BorrowerDashboard';

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', isConnected: true }),
  useReadContract: () => ({ data: null }),
  useWriteContract: () => ({ writeContractAsync: vi.fn() })
}));

describe('Auction State Transitions & Commit/Reveal Bidding', () => {
  const renderBorrower = () => {
    return render(
      <DemoModeProvider>
        <MemoryRouter>
          <BorrowerDashboard />
        </MemoryRouter>
      </DemoModeProvider>
    );
  };

  it('renders credit line approval status and commit/reveal forms', () => {
    renderBorrower();
    expect(screen.getByText('Approved Credit Limit')).toBeTruthy();
    expect(screen.getByText('Step 1: Commit Bid Hash')).toBeTruthy();
    expect(screen.getByText('Step 2: Reveal Bid Parameters')).toBeTruthy();
  });

  it('triggers commit hash submission', async () => {
    renderBorrower();
    const commitBtn = screen.getByText('Commit Hash to Auction');

    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(screen.getByText('Bid commitment successfully submitted!')).toBeTruthy();
    });
  });

  it('triggers reveal bid parameters submission', async () => {
    renderBorrower();
    const revealBtn = screen.getByText('Reveal & Verify Bid');

    fireEvent.click(revealBtn);

    await waitFor(() => {
      expect(screen.getByText('Bid parameters revealed and validated!')).toBeTruthy();
    });
  });
});
