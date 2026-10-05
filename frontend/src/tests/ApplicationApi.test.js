import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApplication } from '../api/client';

afterEach(() => vi.unstubAllGlobals());

describe('application submission', () => {
  it('explains a connection failure without reporting a successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(createApplication({})).rejects.toThrow('Cannot reach the application service');
  });

  it('preserves an error returned by the application service', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'walletAddress and propertyHash required' }),
    }));

    await expect(createApplication({})).rejects.toThrow('walletAddress and propertyHash required');
  });

  it('returns the saved application after a successful submission', async () => {
    const application = { id: 'test-application', status: 'PENDING' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => application,
    }));

    await expect(createApplication({})).resolves.toEqual(application);
  });
});
