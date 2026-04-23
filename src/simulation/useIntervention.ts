import { useCallback, useState } from 'react';
import { interventions, Intervention, InterventionId } from '../data/interventions';

export interface InterventionHandle {
  activeIntervention: Intervention | null;
  /** Monotonic token — bumps on every trigger, so the banner can key off it
   *  to restart entrance + decay animations even when the same scenario fires twice. */
  triggerToken: number;
  trigger: (id: InterventionId) => void;
  dismiss: () => void;
}

/**
 * Manages which intervention is active.
 *
 * Auto-dismiss timing is intentionally owned by NotificationBanner itself so
 * the banner can pause the clock while the confirmation panel is open and
 * restart it on cancel — without needing cross-component timer coordination.
 */
export function useIntervention(): InterventionHandle {
  const [activeId, setActiveId]       = useState<InterventionId | null>(null);
  const [triggerToken, setTriggerToken] = useState(0);

  const dismiss = useCallback(() => setActiveId(null), []);

  const trigger = useCallback((id: InterventionId) => {
    setActiveId(id);
    setTriggerToken((t) => t + 1);
  }, []);

  return {
    activeIntervention: activeId ? interventions[activeId] : null,
    triggerToken,
    trigger,
    dismiss,
  };
}
