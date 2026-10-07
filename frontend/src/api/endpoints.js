export function serviceBase(configured, development, localBase, productionBase) {
  return (configured?.trim() || (development ? localBase : productionBase)).replace(/\/+$/, '');
}

export const API_BASE = serviceBase(
  import.meta.env.VITE_API_BASE, import.meta.env.DEV,
  'http://localhost:4000', 'https://api.homr.web.id',
);

export const FAUCET_API_BASE = serviceBase(
  import.meta.env.VITE_FAUCET_API_BASE, import.meta.env.DEV,
  'http://localhost:3001', 'https://api.homr.web.id/faucet',
);
