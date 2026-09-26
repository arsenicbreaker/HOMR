import { useState, useEffect } from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { fetchEvents } from '../api/client';

export function useTransparencyEvents() {
  const { isDemoMode, seededData } = useDemoMode();
  const [apiEvents, setApiEvents] = useState([]);

  useEffect(() => {
    if (!isDemoMode) {
      fetchEvents(50)
        .then((data) => {
          if (data?.events && data.events.length > 0) {
            const formatted = data.events.map((e) => ({
              id: e.id,
              type: e.eventName,
              title: e.eventName ? e.eventName.replace(/([A-Z])/g, ' $1').trim() : 'Contract Event',
              detail: `Block #${e.blockNumber} • Log #${e.logIndex}`,
              txHash: e.txHash,
              timestamp: e.createdAt ? new Date(e.createdAt).toLocaleString() : 'Recent',
              dataType: 'onchain'
            }));
            setApiEvents(formatted);
          }
        })
        .catch(() => {});
    }
  }, [isDemoMode]);

  return {
    events: isDemoMode ? seededData.events : (apiEvents.length > 0 ? apiEvents : seededData.events),
    isDemoMode
  };
}

export default useTransparencyEvents;
