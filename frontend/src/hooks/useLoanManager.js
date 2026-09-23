import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useDemoMode } from '../context/DemoModeContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import LoanManagerABI from '../contracts/abi/LoanManager';
import MockUSDCABI from '../contracts/abi/MockUSDC';

export function useLoanManager() {
  const { isDemoMode, seededData, repayDemoLoan } = useDemoMode();
  const { isConnected } = useAccount();

  const { data: nextLoanId } = useReadContract({
    address: CONTRACT_ADDRESSES.LoanManager,
    abi: LoanManagerABI,
    functionName: 'nextLoanId',
    query: { enabled: !isDemoMode && isConnected }
  });

  const { writeContractAsync } = useWriteContract();

  const repayLoan = async (loanId, amountUsdc) => {
    if (isDemoMode) {
      repayDemoLoan(loanId, amountUsdc);
      return { hash: '0xdemo_repay...' };
    }

    const parsedAmount = parseUnits(amountUsdc.toString(), 6);

    // 1. Approve USDC to LoanManager
    await writeContractAsync({
      address: CONTRACT_ADDRESSES.MockUSDC,
      abi: MockUSDCABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.LoanManager, parsedAmount]
    });

    // 2. Repay loan
    const tx = await writeContractAsync({
      address: CONTRACT_ADDRESSES.LoanManager,
      abi: LoanManagerABI,
      functionName: 'repayLoan',
      args: [BigInt(loanId), parsedAmount]
    });

    return tx;
  };

  if (isDemoMode) {
    return {
      isDemoMode: true,
      loans: seededData.loans,
      nextLoanId: seededData.loans.length,
      repayLoan
    };
  }

  return {
    isDemoMode: false,
    loans: [],
    nextLoanId: nextLoanId ? Number(nextLoanId) : 0,
    repayLoan
  };
}
