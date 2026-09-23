// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from './main';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
});

afterEach(cleanup);

describe('HOMR landing page interactions', () => {
  it('opens the journey dialog and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(<App />);

    // The topbar and hero both expose a "Mulai demo" button — pick the topbar one.
    const ctaButtons = screen.getAllByRole('button', { name: 'Mulai demo' });
    await user.click(ctaButtons[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('chooses the borrower demo and updates its journey', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: 'Mulai demo' })[0]);
    await user.click(screen.getByRole('button', { name: /Borrower/ }));

    expect(screen.getByText('Dapatkan approval')).toBeTruthy();
    expect(screen.getByText('Commit lalu reveal bid')).toBeTruthy();
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('switches persona tabs and toggles the mobile menu state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const tablist = screen.getByRole('tablist', { name: 'Pilih perjalanan demo' });
    const borrowerTab = within(tablist).getByRole('tab', { name: /Borrower/ });
    await user.click(borrowerTab);
    expect(borrowerTab.getAttribute('aria-selected')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('button', { name: 'Tutup' }).getAttribute('aria-expanded')).toBe('true');
    await user.click(screen.getByRole('link', { name: 'Risiko' }));
    expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('false');
  });
});
