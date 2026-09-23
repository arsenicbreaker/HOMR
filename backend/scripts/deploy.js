import hardhat from "hardhat";
const { ethers } = hardhat;
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", mockUSDCAddress);

  // 2. Deploy Vault
  const Vault = await ethers.getContractFactory("HousingCreditVault");
  const vault = await Vault.deploy(mockUSDCAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("HousingCreditVault deployed to:", vaultAddress);

  // 3. Deploy LoanManager
  const LoanManager = await ethers.getContractFactory("LoanManager");
  const loanManager = await LoanManager.deploy(vaultAddress, mockUSDCAddress);
  await loanManager.waitForDeployment();
  const loanManagerAddress = await loanManager.getAddress();
  console.log("LoanManager deployed to:", loanManagerAddress);

  // 4. Deploy CreditAuction
  const CreditAuction = await ethers.getContractFactory("CreditAuction");
  const auction = await CreditAuction.deploy(loanManagerAddress);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("CreditAuction deployed to:", auctionAddress);

  // 5. Setup Roles
  console.log("Setting up roles...");
  await vault.grantRole(await vault.LOAN_MANAGER_ROLE(), loanManagerAddress);
  await loanManager.grantRole(await loanManager.AUCTION_MANAGER_ROLE(), auctionAddress);
  
  // For demo, we give the deployer the Credit and Auction Manager roles
  await auction.grantRole(await auction.CREDIT_MANAGER_ROLE(), deployer.address);
  await auction.grantRole(await auction.AUCTION_MANAGER_ROLE(), deployer.address);
  
  console.log("Deployment and setup complete!");

  // Save addresses for frontend
  const addresses = {
    MockUSDC: mockUSDCAddress,
    HousingCreditVault: vaultAddress,
    LoanManager: loanManagerAddress,
    CreditAuction: auctionAddress
  };

  const deployNotes = `
# HOMR Deployment Notes
Deployer Address: ${deployer.address}
Network: BNB Chain Testnet (or Hardhat Local)

## Contract Addresses
- MockUSDC: ${mockUSDCAddress}
- HousingCreditVault: ${vaultAddress}
- LoanManager: ${loanManagerAddress}
- CreditAuction: ${auctionAddress}
`;

  fs.writeFileSync(path.join(__dirname, "../../DEPLOY_NOTES.md"), deployNotes.trim());
  console.log("Saved DEPLOY_NOTES.md in project root.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
