import { useDemoMode } from '../context/DemoModeContext';
import { useProtocolQuery, useProtocolTransaction } from './useProtocol';

export function useAuction() {
  const { isDemoMode, seededData, commitDemoBid, revealDemoBid, approveDemoBorrower, startDemoAuction, finalizeDemoAuction } = useDemoMode();
  const query = useProtocolQuery('auction', true);
  const { transact, progress, refresh } = useProtocolTransaction();
  return {
    ...(isDemoMode ? {
      ...seededData.auction, userApproval: seededData.borrower,
      canCommit: true, canReveal: true, canStart: true, canFinalize: true, creditManager: true, auctionManager: true,
      decimals: 18
    } : query.data || { state: 'Unavailable', bids: [], userApproval: null }),
    isDemoMode, isLoading: !isDemoMode && query.isPending, error: !isDemoMode && query.error, refresh, progress,
    commitBid: (input) => isDemoMode ? commitDemoBid(input) : transact('commitBid', input),
    revealBid: (input) => isDemoMode ? revealDemoBid(input) : transact('revealBid', input),
    approveBorrower: (...args) => isDemoMode ? approveDemoBorrower(...args) : transact('approveBorrower', ...args),
    startAuction: (...args) => isDemoMode ? startDemoAuction(...args) : transact('startAuction', ...args),
    finalizeAuction: () => isDemoMode ? finalizeDemoAuction() : transact('finalizeAuction')
  };
}

export default useAuction;
