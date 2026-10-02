// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DemoModeProvider } from '../context/DemoModeContext';
import BorrowerDashboard from '../pages/BorrowerDashboard';
import TransparencyLedger from '../components/transparency/TransparencyLedger';

const state = vi.hoisted(() => ({ address: '0x0000000000000000000000000000000000000001', error: null, repay: vi.fn() }));
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: state.address, isConnected: true, chainId: 97 }),
  useConnect: () => ({ connect: vi.fn(), connectors: [] }), useDisconnect: () => ({ disconnect: vi.fn() }),
  useSwitchChain: () => ({ switchChain: vi.fn() })
}));
vi.mock('../hooks/useProtocol', () => ({
  useProtocolTransaction: () => ({ transact: state.repay, refresh: vi.fn() }),
  useProtocolQuery: (resource) => ({ error: state.error, refetch: vi.fn(), isPending: false, data:
    resource === 'auction' ? { state: 'RevealPhase', canReveal: true, canCommit: false, bids: [], decimals: 18 } :
      resource === 'loans' ? { loans: [
        { id: '1', borrower: '0x0000000000000000000000000000000000000001', principal: '12.5', isActive: true, rate: '9', term: '12' },
        { id: '2', borrower: '0x0000000000000000000000000000000000000002', principal: '50', isActive: true, rate: '9', term: '12' }
      ] } : undefined
  })
}));
const wrap = (child) => <DemoModeProvider><MemoryRouter>{child}</MemoryRouter></DemoModeProvider>;
beforeEach(() => { state.error = null; state.address = '0x0000000000000000000000000000000000000001'; state.repay.mockReset(); });
afterEach(cleanup);

describe('live dashboard', () => {
  it('defaults to live and never falls back to demo events on an empty or failed read', () => {
    const view = render(wrap(<TransparencyLedger />));
    expect(screen.getByText('No activity in this window')).toBeTruthy();
    expect(screen.queryByText('Vault Deposit Received')).toBeNull();
    state.error = new Error('RPC unavailable');
    view.rerender(wrap(<TransparencyLedger />));
    expect(screen.getByRole('alert').textContent).toContain('RPC unavailable');
    expect(screen.queryByText('No activity in this window')).toBeNull();
    expect(screen.queryByText('Vault Deposit Received')).toBeNull();
  });
  it('filters loans by the current wallet and only submits full principal', async () => {
    const view = render(wrap(<BorrowerDashboard />));
    fireEvent.click(screen.getByRole('button', { name: /Repay.*Payment/ }));
    const amount = screen.getByLabelText('Full principal repayment (mUSDC)');
    expect(amount.value).toBe('12.5');
    expect(amount.readOnly).toBe(true);
    expect(screen.queryByText('Loan #2')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Submit repayment' }));
    expect(state.repay).toHaveBeenCalledWith('repayLoan', '1');
    state.address = '0x0000000000000000000000000000000000000002';
    view.rerender(wrap(<BorrowerDashboard />));
    expect(screen.getByLabelText('Full principal repayment (mUSDC)').value).toBe('50');
    expect(screen.queryByText('Loan #1')).toBeNull();
  });
  it('allows reveal when the adapter derives the deadline transition', () => {
    render(wrap(<BorrowerDashboard />));
    fireEvent.click(screen.getByRole('button', { name: /Auction.*Commit/ }));
    fireEvent.click(screen.getByRole('tab', { name: '2. Reveal terms' }));
    expect(screen.getByRole('button', { name: 'Reveal and verify bid' }).disabled).toBe(false);
    expect(screen.getByLabelText('Original secret salt')).toBeTruthy();
  });
});
