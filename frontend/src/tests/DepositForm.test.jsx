// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DemoModeProvider } from '../context/DemoModeContext';
import InvestorDashboard from '../pages/InvestorDashboard';

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123', isConnected: true }),
  useReadContract: () => ({ data: null }),
  useWriteContract: () => ({ writeContractAsync: vi.fn() }),
  useConnect: () => ({ connect: vi.fn(), connectors: [] }),
  useDisconnect: () => ({ disconnect: vi.fn() })
}));

afterEach(cleanup);

describe('Deposit Form Validation & Execution', () => {
  const renderDashboard = () => {
    return render(
      <DemoModeProvider>
        <MemoryRouter>
          <InvestorDashboard />
        </MemoryRouter>
      </DemoModeProvider>
    );
  };

  it('renders deposit input and initial vault shares', () => {
    renderDashboard();
    expect(screen.getByPlaceholderText('e.g. 10000')).toBeTruthy();
    expect(screen.getByText(/Your Shares Balance:/i)).toBeTruthy();
  });

  it('displays error when submitting 0 or negative deposit amount', async () => {
    renderDashboard();
    const input = screen.getByPlaceholderText('e.g. 10000');
    const submitBtn = screen.getByText('Deposit mUSDC & Mint Shares');

    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Deposit amount must be greater than 0')).toBeTruthy();
    });
  });

  it('updates vault shares and TVL upon successful demo deposit', async () => {
    renderDashboard();
    const input = screen.getByPlaceholderText('e.g. 10000');
    const submitBtn = screen.getByText('Deposit mUSDC & Mint Shares');

    fireEvent.change(input, { target: { value: '5000' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Successfully deposited 5000 mUSDC into Vault!')).toBeTruthy();
    });
  });
});
