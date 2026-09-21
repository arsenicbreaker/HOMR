// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
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

    await user.click(screen.getByRole('button', { name: 'Coba demo' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('chooses the borrower demo and updates its journey', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Masuk ke demo' }));
    await user.click(screen.getByRole('button', { name: /Borrower/ }));

    expect(screen.getByText('Dapatkan approval')).toBeTruthy();
    expect(screen.getByText('Commit lalu reveal bid')).toBeTruthy();
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('switches persona tabs and toggles the mobile menu state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Borrower' }));
    expect(screen.getByRole('tab', { name: 'Borrower' }).getAttribute('aria-selected')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('button', { name: 'Tutup' }).getAttribute('aria-expanded')).toBe('true');
    await user.click(screen.getByRole('link', { name: 'Risiko' }));
    expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('false');
  });
});
