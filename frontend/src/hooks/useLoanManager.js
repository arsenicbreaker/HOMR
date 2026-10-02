import { useAccount } from 'wagmi';
import { useDemoMode } from '../context/DemoModeContext';
import { sameAddress } from '../contracts/protocol';
import { useProtocolQuery, useProtocolTransaction } from './useProtocol';

export function useLoanManager({ borrowerOnly = false } = {}) {
  const { isDemoMode, seededData, repayDemoLoan } = useDemoMode();
  const { address } = useAccount();
  const query = useProtocolQuery('loans');
  const { transact, progress } = useProtocolTransaction();
  const loans = isDemoMode ? seededData.loans : query.data?.loans || [];
  const borrower = isDemoMode ? seededData.borrower.address : address;
  return {
    isDemoMode, loans: borrowerOnly ? loans.filter((loan) => sameAddress(loan.borrower, borrower)) : loans,
    nextLoanId: isDemoMode ? seededData.loans.length : query.data?.nextLoanId,
    isLoading: !isDemoMode && query.isPending, error: !isDemoMode && query.error, refresh: query.refetch, progress,
    repayLoan: (id, amount) => isDemoMode ? repayDemoLoan(id, amount) : transact('repayLoan', id)
  };
}

export default useLoanManager;
