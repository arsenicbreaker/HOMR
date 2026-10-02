import { useDemoMode } from '../context/DemoModeContext';
import { useProtocolQuery, useProtocolTransaction } from './useProtocol';

export function useVault() {
  const { isDemoMode, seededData, depositDemoVault, withdrawDemoVault } = useDemoMode();
  const query = useProtocolQuery('vault', true);
  const { transact, progress } = useProtocolTransaction();
  return {
    ...(isDemoMode ? seededData.vault : query.data || {
      tvl: 'Unavailable', availableCapital: 'Unavailable', deployedCapital: 'Unavailable',
      userShares: 'Unavailable', userDeposited: 'Unavailable', sharePrice: 'Unavailable', estimatedApy: 'Not calculated'
    }),
    isDemoMode, isLoading: !isDemoMode && query.isPending, error: !isDemoMode && query.error,
    refresh: query.refetch, progress,
    deposit: (amount) => isDemoMode ? depositDemoVault(amount) : transact('deposit', amount),
    withdraw: (shares) => isDemoMode ? withdrawDemoVault(shares) : transact('withdraw', shares)
  };
}
