import {
  Briefcase,
  Home,
  AlertCircle,
  Clock,
  Utensils,
  Coffee,
  Thermometer,
  RotateCcw,
} from 'lucide-react';
import { DrivingModeId } from '../../data/drivingModes';
import {
  InterventionId,
  interventionOrder,
  interventions,
} from '../../data/interventions';

interface Props {
  currentModeId: DrivingModeId;
  activeInterventionId: InterventionId | null;
  hasTrafficOverride: boolean;
  onSelectMode: (id: DrivingModeId) => void;
  onTriggerIntervention: (id: InterventionId) => void;
  onResetTraffic: () => void;
}

// ─── Mode row ────────────────────────────────────────────────────────────
const MODE_BUTTONS: { id: DrivingModeId; label: string; Icon: typeof Briefcase }[] = [
  { id: 'to_work', label: 'To Work',      Icon: Briefcase },
  { id: 'to_home', label: 'Heading Home', Icon: Home      },
];

// ─── Intervention row ────────────────────────────────────────────────────
// Icons map intuitively to each scenario; label comes from interventions.ts.
const INTERVENTION_ICONS: Record<InterventionId, typeof AlertCircle> = {
  late_meeting:     AlertCircle,
  late_home:        Clock,
  late_reservation: Utensils,
  tired:            Coffee,
  sweaty:           Thermometer,
};

/**
 * Bottom scenario panel — two rows:
 *  1. Context (driving mode)
 *  2. Intervention triggers (fires a notification banner)
 *
 * This replaces the auto-advance timeline. The demo runner can jump into any
 * state, then layer any intervention on top.
 */
export function ModeSwitcher({
  currentModeId,
  activeInterventionId,
  hasTrafficOverride,
  onSelectMode,
  onTriggerIntervention,
  onResetTraffic,
}: Props) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 bg-black/50 backdrop-blur-sm border-t border-slate-800/60">

      {/* ── Row 1: Context ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 w-28 shrink-0">
          <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
            Context
          </span>
        </div>

        <div className="flex gap-2">
          {MODE_BUTTONS.map(({ id, label, Icon }) => {
            const active = id === currentModeId;
            return (
              <button
                key={id}
                onClick={() => onSelectMode(id)}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-medium transition-all
                  ${
                    active
                      ? 'bg-blue-600/90 border-blue-400/60 text-white shadow-md shadow-blue-900/40'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Interventions ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 w-28 shrink-0">
          <div className="w-1 h-1 rounded-full bg-rose-400" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
            Intervention
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {interventionOrder.map((id) => {
            const Icon = INTERVENTION_ICONS[id];
            const def  = interventions[id];
            const active = id === activeInterventionId;

            // Tone-matched accent when this one is firing
            const activeAccent =
              def.tone === 'alert'    ? 'bg-rose-600/20 border-rose-400/60 text-rose-200'  :
              def.tone === 'warn'     ? 'bg-amber-600/20 border-amber-400/60 text-amber-200':
                                        'bg-cyan-600/20 border-cyan-400/60 text-cyan-200';

            return (
              <button
                key={id}
                onClick={() => onTriggerIntervention(id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${
                    active
                      ? activeAccent + ' shadow-md'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                  }
                `}
                title={def.message}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{def.label}</span>
              </button>
            );
          })}

          {/* Normal Traffic reset — only visible while a traffic override is active */}
          {hasTrafficOverride && (
            <button
              onClick={onResetTraffic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-blue-900/30 border-blue-500/40 text-blue-300 hover:bg-blue-800/40 hover:text-blue-200"
              title="Reset route to normal traffic"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Normal Traffic</span>
            </button>
          )}
        </div>

        <div className="ml-auto text-[10px] text-slate-600 whitespace-nowrap">
          12s · auto-dismiss
        </div>
      </div>
    </div>
  );
}
