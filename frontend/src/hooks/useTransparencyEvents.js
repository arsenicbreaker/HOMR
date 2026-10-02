import { useDemoMode } from '../context/DemoModeContext';
import { useProtocolQuery } from './useProtocol';

export function useTransparencyEvents() {
  const { isDemoMode, seededData } = useDemoMode();
  const query = useProtocolQuery('recentEvents');
  return {
    events: isDemoMode ? seededData.events.map((event) => ({ ...event, dataType: 'simulated', txHash: null })) : query.data?.events || [],
    isDemoMode, isLoading: !isDemoMode && query.isPending, error: !isDemoMode && query.error,
    refresh: query.refetch, fromBlock: query.data?.fromBlock, toBlock: query.data?.toBlock
  };
}

export default useTransparencyEvents;
