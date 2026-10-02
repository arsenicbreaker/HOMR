// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FaucetPage from '../pages/FaucetPage';
import { claimFaucetToken, fetchFaucetInfo } from '../api/faucet';

const wallet = vi.hoisted(() => ({ address: undefined, isConnected: false, chainId: undefined }));
vi.mock('wagmi', () => ({
  useAccount: () => wallet,
  useConnect: () => ({ connect: vi.fn(), connectors: [], isPending: false }),
  useSwitchChain: () => ({ switchChain: vi.fn(), isPending: false })
}));
vi.mock('../api/faucet', () => ({
  fetchFaucetInfo: vi.fn(),
  claimFaucetToken: vi.fn()
}));

const target = '0x1111111111111111111111111111111111111111';
const info = { success: true, dripBnb: '0.1', dripUsdc: '1000', cooldownSeconds: 3600 };

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  Object.assign(wallet, { address: undefined, isConnected: false, chainId: undefined });
});

function renderPage() {
  return render(<MemoryRouter><FaucetPage /></MemoryRouter>);
}

describe('faucet page', () => {
  it('claims mUSDC to a manually entered address and shows the transaction', async () => {
    fetchFaucetInfo.mockResolvedValue(info);
    claimFaucetToken.mockResolvedValue({ success: true, message: 'Berhasil mengirim 1000 MockUSDC!', txHash: '0xabc' });
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Faucet siap');
    fireEvent.change(screen.getByLabelText('Alamat wallet'), { target: { value: target } });
    await user.click(screen.getByRole('button', { name: 'Klaim mUSDC' }));

    expect(claimFaucetToken).toHaveBeenCalledWith('usdc', target);
    expect(await screen.findByText('Berhasil mengirim 1000 MockUSDC!')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat transaksi di BscScan' }).getAttribute('href')).toBe('https://testnet.bscscan.com/tx/0xabc');
  });

  it('keeps claims disabled while the service is unavailable and recovers on retry', async () => {
    fetchFaucetInfo.mockRejectedValueOnce(new Error('Server faucet lokal belum terhubung.')).mockResolvedValue(info);
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Server faucet lokal belum terhubung.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Alamat wallet'), { target: { value: target } });
    expect(screen.getByRole('button', { name: 'Klaim BNB testnet' }).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    await screen.findByText('Faucet siap');
    expect(screen.getByRole('button', { name: 'Klaim BNB testnet' }).disabled).toBe(false);
  });

  it('asks a connected wallet on another chain to switch before claiming', async () => {
    Object.assign(wallet, { address: target, isConnected: true, chainId: 1 });
    fetchFaucetInfo.mockResolvedValue(info);
    renderPage();

    await screen.findByText('Faucet siap');
    expect(screen.getByRole('button', { name: 'Pindah ke testnet' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Klaim mUSDC' }).disabled).toBe(true);
  });

  it('shows the cooldown error returned after a claim attempt', async () => {
    fetchFaucetInfo.mockResolvedValue(info);
    claimFaucetToken.mockRejectedValue(new Error('Tunggu 1 jam untuk klaim USDC lagi'));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Faucet siap');
    fireEvent.change(screen.getByLabelText('Alamat wallet'), { target: { value: target } });
    await user.click(screen.getByRole('button', { name: 'Klaim mUSDC' }));

    expect(await screen.findByText('Tunggu 1 jam untuk klaim USDC lagi')).toBeTruthy();
  });
});
