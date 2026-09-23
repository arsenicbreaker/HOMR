import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useDemoMode } from '../context/DemoModeContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import HousingCreditVaultABI from '../contracts/abi/HousingCreditVault';
import MockUSDCABI from '../contracts/abi/MockUSDC';

export function useVault() {
  const { isDemoMode, seededData, depositDemoVault } = useDemoMode();
  const { address, isConnected } = useAccount();

  // Onchain contract reads
  const { data: availableCapital } = useReadContract({
    address: CONTRACT_ADDRESSES.HousingCreditVault,
    abi: HousingCreditVaultABI,
    functionName: 'availableCapital',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { data: totalDeployed } = useReadContract({
    address: CONTRACT_ADDRESSES.HousingCreditVault,
    abi: HousingCreditVaultABI,
    functionName: 'totalDeployedCapital',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { data: userShares } = useReadContract({
    address: CONTRACT_ADDRESSES.HousingCreditVault,
    abi: HousingCreditVaultABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !isDemoMode && isConnected && !!address }
  });

  const { writeContractAsync } = useWriteContract();

  const deposit = async (amountUsdc) => {
    if (isDemoMode) {
      depositDemoVault(amountUsdc);
      return { hash: '0xdemo...' };
    }

    const parsedAmount = parseUnits(amountUsdc.toString(), 6); // USDC 6 decimals

    // 1. Approve USDC to Vault
    await writeContractAsync({
      address: CONTRACT_ADDRESSES.MockUSDC,
      abi: MockUSDCABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.HousingCreditVault, parsedAmount]
    });

    // 2. Deposit into Vault
    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.HousingCreditVault,
      abi: HousingCreditVaultABI,
      functionName: 'deposit',
      args: [parsedAmount]
    });

    return tx;
  };

  const withdraw = async (shares) => {
    if (isDemoMode) {
      return { hash: '0xdemo_withdraw...' };
    }

    const parsedShares = parseUnits(shares.toString(), 6);
    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.HousingCreditVault,
      abi: HousingCreditVaultABI,
      functionName: 'withdraw',
      args: [parsedShares]
    });

    return tx;
  };

  if (isDemoMode) {
    return {
      isDemoMode: true,
      tvl: seededData.vault.tvl,
      sharePrice: seededData.vault.sharePrice,
      deployedCapital: seededData.vault.deployedCapital,
      availableCapital: seededData.vault.availableCapital,
      userShares: seededData.vault.userShares,
      userDeposited: seededData.vault.userDeposited,
      estimatedApy: seededData.vault.estimatedApy,
      deposit,
      withdraw
    };
  }

  const avail = availableCapital ? formatUnits(availableCapital, 6) : '0.00';
  const deployed = totalDeployed ? formatUnits(totalDeployed, 6) : '0.00';
  const tvlVal = (parseFloat(avail) + parseFloat(deployed)).toFixed(2);
  const sharesVal = userShares ? formatUnits(userShares, 6) : '0.00';

  return {
    isDemoMode: false,
    tvl: tvlVal,
    sharePrice: '1.0000',
    deployedCapital: deployed,
    availableCapital: avail,
    userShares: sharesVal,
    userDeposited: sharesVal,
    estimatedApy: '8.4%',
    deposit,
    withdraw
  };
}
