// Contract addresses with environment variable overrides and placeholders
export const CONTRACT_ADDRESSES = {
  MockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  HousingCreditVault: import.meta.env.VITE_VAULT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  LoanManager: import.meta.env.VITE_LOAN_MANAGER_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  CreditAuction: import.meta.env.VITE_CREDIT_AUCTION_ADDRESS || '0xcCf3655767d42531e21b72eD026e63229b1424E3'
};

export const CHAIN_CONFIG = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 97), // BNB Smart Chain Testnet (default 97)
  chainName: 'BNB Smart Chain Testnet',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  blockExplorer: 'https://testnet.bscscan.com'
};
