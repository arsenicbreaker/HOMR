# HOMR Deployment Notes

## Network
- Name: tbnb
- Chain ID: 97
- RPC URL: https://data-seed-prebsc-1-s1.bnbchain.org:8545
- Explorer: https://testnet.bscscan.com
- Deploy Block: 132821935

## Deployer
- Address: 0xEDCBD7A4A4935eC62730b18f6E2616d615cA3d6c

## Contracts
- MockUSDC:           0x68F7aAbB357cEF15F8245468f4b66619Bbba051a
- HousingCreditVault: 0xDab816f3B857084e2dA394e4ef142FF680671525
- LoanManager:        0xDb2aceAd65bF79bf304d97979ea14cbc4e74dfab
- CreditAuction:      0x99123ADC1dc2594b94ca02A65F553E5c1d0fC4c5

## Roles Setup
- Vault.LOAN_MANAGER_ROLE         -> LoanManager (0xDb2aceAd65bF79bf304d97979ea14cbc4e74dfab)
- LoanManager.AUCTION_MANAGER_ROLE -> CreditAuction (0x99123ADC1dc2594b94ca02A65F553E5c1d0fC4c5)
- CreditAuction.CREDIT_MANAGER_ROLE -> Deployer (0xEDCBD7A4A4935eC62730b18f6E2616d615cA3d6c)
- CreditAuction.AUCTION_MANAGER_ROLE -> Deployer (0xEDCBD7A4A4935eC62730b18f6E2616d615cA3d6c)

## Backend .env (copy-paste)
```
CHAIN_ID=97
RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
EXPLORER_URL=https://testnet.bscscan.com
VAULT_ADDRESS=0xDab816f3B857084e2dA394e4ef142FF680671525
AUCTION_ADDRESS=0x99123ADC1dc2594b94ca02A65F553E5c1d0fC4c5
LOAN_MANAGER_ADDRESS=0xDb2aceAd65bF79bf304d97979ea14cbc4e74dfab
MOCK_USDC_ADDRESS=0x68F7aAbB357cEF15F8245468f4b66619Bbba051a
DEPLOY_BLOCK=132821935
```