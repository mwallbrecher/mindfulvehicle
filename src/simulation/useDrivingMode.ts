import { useState, useCallback } from 'react';
import { drivingModes, DrivingMode, DrivingModeId } from '../data/drivingModes';

export interface DrivingModeState {
  currentMode: DrivingMode;
  currentModeId: DrivingModeId;
  setMode: (id: DrivingModeId) => void;
  toggleMode: () => void;
}

/**
 * Top-level scenario state. For now it's just a simple toggle between
 * two driving contexts ('to_work' / 'to_home'). Notification banner and
 * AI-intervention use-cases will layer on top of this later.
 */
export function useDrivingMode(initial: DrivingModeId = 'to_work'): DrivingModeState {
  const [currentModeId, setCurrentModeId] = useState<DrivingModeId>(initial);

  const setMode = useCallback((id: DrivingModeId) => {
    setCurrentModeId(id);
  }, []);

  const toggleMode = useCallback(() => {
    setCurrentModeId((prev) => (prev === 'to_work' ? 'to_home' : 'to_work'));
  }, []);

  return {
    currentMode: drivingModes[currentModeId],
    currentModeId,
    setMode,
    toggleMode,
  };
}
