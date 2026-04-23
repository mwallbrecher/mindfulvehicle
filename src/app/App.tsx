import { useEffect, useState } from 'react';
import { useDrivingMode } from '../simulation/useDrivingMode';
import { useIntervention } from '../simulation/useIntervention';
import { useDrivingSimulation } from '../simulation/useDrivingSimulation';
import { RouteStatus } from '../data/drivingModes';
import { StatusBar } from './components/StatusBar';
import { NavigationMap } from './components/NavigationMap';
import { MusicWidget } from './components/MusicWidget';
import { NewsWidget } from './components/NewsWidget';
import { CalendarWidget } from './components/CalendarWidget';
import { ContactsWidget } from './components/ContactsWidget';
import { ModeSwitcher } from './components/ModeSwitcher';
import { NotificationBanner } from './components/NotificationBanner';

export default function App() {
  // ─── Base state ────────────────────────────────────────────────────────
  const { currentMode, currentModeId, setMode } = useDrivingMode('to_work');

  // ─── Intervention state (banner) ──────────────────────────────────────
  const {
    activeIntervention,
    triggerToken,
    trigger,
    dismiss,
  } = useIntervention();

  // ─── Live driving simulation ───────────────────────────────────────────
  // Resets automatically when currentModeId changes.
  const sim = useDrivingSimulation(
    parseFloat(currentMode.navigation.distance), // "13.5 km" → 13.5
    currentMode.navigation.speed,
    currentMode.simulatedTime,
    currentModeId,
  );

  // ─── Persisted traffic state ───────────────────────────────────────────
  // Route colour + ETA override survive banner dismissal until the user
  // explicitly resets via "Normal Traffic".
  const [persistedOverrides, setPersistedOverrides] = useState<{
    routeStatus?: RouteStatus;
    eta?: string;
  } | null>(null);

  // Capture effects the moment an intervention fires.
  useEffect(() => {
    if (!activeIntervention) return;
    const e = activeIntervention.effects;
    if (e.routeStatusOverride || e.etaOverride) {
      setPersistedOverrides({
        routeStatus: e.routeStatusOverride,
        eta:         e.etaOverride,
      });
    }
  }, [activeIntervention]);

  // Clear persisted overrides when the driving mode switches.
  useEffect(() => {
    setPersistedOverrides(null);
  }, [currentModeId]);

  const resetTraffic = () => setPersistedOverrides(null);

  // ─── Compose effective state ───────────────────────────────────────────
  // Priority: active intervention effects → persisted overrides → live sim
  const effects = activeIntervention?.effects;

  const effectiveNavigation = {
    ...currentMode.navigation,
    speed:       sim.liveSpeed,
    distance:    sim.liveDistance,
    routeStatus: effects?.routeStatusOverride ?? persistedOverrides?.routeStatus ?? currentMode.navigation.routeStatus,
    eta:         effects?.etaOverride         ?? persistedOverrides?.eta         ?? sim.liveEta,
  };

  const effectiveCalendar = effects?.calendarOverride ?? currentMode.calendar;
  const meetingAtRisk     = effects?.meetingAtRisk     ?? false;

  return (
    <div className="size-full flex flex-col bg-slate-950">
      {/* Status bar */}
      <StatusBar mode={currentMode} navigation={effectiveNavigation} />

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 pb-2 min-h-0">

        {/* Map region (also hosts the notification banner overlay) */}
        <div className="flex-1 min-w-0 min-h-0 relative">
          <NavigationMap navigation={effectiveNavigation} modeId={currentModeId} carPos={sim.carPos} />

          {activeIntervention && (
            <NotificationBanner
              key={triggerToken}
              intervention={activeIntervention}
              triggerToken={triggerToken}
              onDismiss={dismiss}
              onSuggestion={(id) => {
                // Suggestions are demo-only — log and close. The underlying
                // effects (mode, calendar, route) remain in place until the
                // banner auto-dismisses or the user clicks ×.
                // eslint-disable-next-line no-console
                console.log(`[intervention] ${activeIntervention.id} → ${id}`);
              }}
            />
          )}
        </div>

        {/* Right panel — context widgets */}
        <div className="w-80 shrink-0 flex flex-col gap-3 min-h-0 overflow-y-auto">
          {currentMode.mediaSource === 'news' ? <NewsWidget /> : <MusicWidget />}
          <CalendarWidget
            calendar={effectiveCalendar}
            atRisk={meetingAtRisk}
            arrivalEta={meetingAtRisk ? effectiveNavigation.eta : undefined}
          />
          <ContactsWidget contacts={currentMode.contacts} />
        </div>
      </div>

      {/* Scenario selector (mode + interventions) */}
      <ModeSwitcher
        currentModeId={currentModeId}
        activeInterventionId={activeIntervention?.id ?? null}
        hasTrafficOverride={!!persistedOverrides?.routeStatus}
        onSelectMode={setMode}
        onTriggerIntervention={trigger}
        onResetTraffic={resetTraffic}
      />
    </div>
  );
}
