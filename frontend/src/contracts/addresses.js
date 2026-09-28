// Contract addresses with environment variable overrides and placeholders
export const CONTRACT_ADDRESSES = {
  MockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '0x68F7aAbB357cEF15F8245468f4b66619Bbba051a',
  HousingCreditVault: import.meta.env.VITE_VAULT_ADDRESS || '0xDab816f3B857084e2dA394e4ef142FF680671525',
  LoanManager: import.meta.env.VITE_LOAN_MANAGER_ADDRESS || '0xDb2aceAd65bF79bf304d97979ea14cbc4e74dfab',
  CreditAuction: import.meta.env.VITE_CREDIT_AUCTION_ADDRESS || '0x99123ADC1dc2594b94ca02A65F553E5c1d0fC4c5'
};

export const CHAIN_CONFIG = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 97), // BNB Smart Chain Testnet (default 97)
  chainName: 'BNB Smart Chain Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  blockExplorer: import.meta.env.VITE_EXPLORER_URL || 'https://testnet.bscscan.com'
};
