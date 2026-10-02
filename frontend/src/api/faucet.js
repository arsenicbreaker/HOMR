export const FAUCET_API_BASE = (import.meta.env.VITE_FAUCET_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

async function faucetRequest(path, options) {
  let response;
  try {
    response = await fetch(`${FAUCET_API_BASE}${path}`, options);
  } catch {
    throw new Error(`Faucet belum terhubung di ${FAUCET_API_BASE}. Periksa layanan faucet.`);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Permintaan faucet gagal (HTTP ${response.status}).`);
  }
  return data;
}

export async function fetchFaucetInfo() {
  const info = await faucetRequest('/api/info');
  if (typeof info.dripBnb !== 'string' || typeof info.dripUsdc !== 'string') {
    throw new Error('Server faucet perlu diperbarui sebelum klaim bisa digunakan.');
  }
  return info;
}

export function claimFaucetToken(token, address) {
  if (token !== 'bnb' && token !== 'usdc') throw new Error('Token faucet tidak dikenal.');
  return faucetRequest(`/api/claim-${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
}
