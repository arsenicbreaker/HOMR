// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DemoModeProvider } from '../context/DemoModeContext';
import BorrowerDashboard from '../pages/BorrowerDashboard';

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', isConnected: true }),
  useReadContract: () => ({ data: null }),
  useWriteContract: () => ({ writeContractAsync: vi.fn() }),
  useConnect: () => ({ connect: vi.fn(), connectors: [] }),
  useDisconnect: () => ({ disconnect: vi.fn() })
}));

afterEach(cleanup);

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

  it('separates approval status from commit and reveal actions', () => {
    renderBorrower();
    fireEvent.click(screen.getByRole('button', { name: /Property.*Application/ }));
    expect(screen.getByRole('heading', { name: 'Credit approval' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Auction.*Commit/ }));
    expect(screen.getByRole('button', { name: 'Commit bid hash' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reveal and verify bid' })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: '2. Reveal terms' }));
    expect(screen.getByRole('button', { name: 'Reveal and verify bid' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Commit bid hash' })).toBeNull();
  });

  it('triggers commit hash submission', async () => {
    renderBorrower();
    fireEvent.click(screen.getByRole('button', { name: /Auction.*Commit/ }));
    const commitBtn = screen.getByRole('button', { name: 'Commit bid hash' });

    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(screen.getByText('Bid commitment submitted.')).toBeTruthy();
    });
  });

  it('triggers reveal bid parameters submission', async () => {
    renderBorrower();
    fireEvent.click(screen.getByRole('button', { name: /Auction.*Commit/ }));
    fireEvent.click(screen.getByRole('tab', { name: '2. Reveal terms' }));
    const revealBtn = screen.getByRole('button', { name: 'Reveal and verify bid' });

    fireEvent.click(revealBtn);

    await waitFor(() => {
      expect(screen.getByText('Bid parameters revealed and validated.')).toBeTruthy();
    });
  });
});
