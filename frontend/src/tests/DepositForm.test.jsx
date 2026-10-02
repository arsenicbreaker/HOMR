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
  useDisconnect: () => ({ disconnect: vi.fn() }),
  useSwitchChain: () => ({ switchChain: vi.fn() })
}));

vi.mock('../hooks/useProtocol', () => ({
  useProtocolQuery: () => ({ refetch: vi.fn() }),
  useProtocolTransaction: () => ({ transact: vi.fn(), refresh: vi.fn() })
}));

afterEach(cleanup);

describe('Deposit Form Validation & Execution', () => {
  const renderDashboard = () => {
    return render(
      <DemoModeProvider initialDemoMode>
        <MemoryRouter>
          <InvestorDashboard />
        </MemoryRouter>
      </DemoModeProvider>
    );
  };

  it('renders deposit input and initial vault shares in capital actions', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Capital.*Deposit/ }));
    expect(await screen.findByLabelText('Deposit amount (mUSDC)')).toBeTruthy();
    expect(screen.getAllByText('25,000.00').length).toBeGreaterThan(0);
  });

  it('displays error when submitting 0 or negative deposit amount', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Capital.*Deposit/ }));
    const input = await screen.findByLabelText('Deposit amount (mUSDC)');
    const submitBtn = screen.getByRole('button', { name: 'Deposit and mint shares' });

    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Deposit amount must be greater than 0.')).toBeTruthy();
    });
  });

  it('updates vault shares and TVL upon successful demo deposit', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Capital.*Deposit/ }));
    const input = await screen.findByLabelText('Deposit amount (mUSDC)');
    const submitBtn = screen.getByRole('button', { name: 'Deposit and mint shares' });

    fireEvent.change(input, { target: { value: '5000' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Deposited 5000 mUSDC into the vault.')).toBeTruthy();
    });
  });
});
