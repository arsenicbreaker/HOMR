import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useDemoMode } from '../context/DemoModeContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import LoanManagerABI from '../contracts/abi/LoanManager';
import MockUSDCABI from '../contracts/abi/MockUSDC';
import { fetchLoans } from '../api/client';

export function useLoanManager() {
  const { isDemoMode, seededData, repayDemoLoan } = useDemoMode();
  const { isConnected } = useAccount();
  const [apiLoans, setApiLoans] = useState([]);

  const loadLoans = useCallback(async () => {
    try {
      const data = await fetchLoans();
      if (data?.loans) {
        const formatted = data.loans.map((l) => ({
          id: Number(l.onchainLoanId),
          borrower: l.borrower,
          principal: (Number(l.principal) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2 }),
          rate: (l.rate / 100).toString(),
          term: l.term > 1000 ? Math.round(l.term / (30 * 86400)).toString() : l.term.toString(),
          propertyHash: l.propertyHash,
          isActive: l.status === 'ACTIVE',
          maturityDate: l.maturity ? new Date(l.maturity).toISOString().split('T')[0] : 'N/A',
          txHash: l.createTxHash
        }));
        setApiLoans(formatted);
      }
    } catch {
      // fallback silently
    }
  }, []);

  useEffect(() => {
    if (!isDemoMode) {
      loadLoans();
    }
  }, [isDemoMode, loadLoans]);

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

    // Refresh loans from DB
    setTimeout(loadLoans, 2000);

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
    loans: apiLoans,
    nextLoanId: nextLoanId ? Number(nextLoanId) : apiLoans.length,
    repayLoan
  };
}

export default useLoanManager;
