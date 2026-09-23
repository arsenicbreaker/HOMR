import { useDemoMode } from '../context/DemoModeContext';

export function useTransparencyEvents() {
  const { isDemoMode, seededData } = useDemoMode();

  return {
    events: seededData.events,
    isDemoMode
  };
}

export default useTransparencyEvents;
