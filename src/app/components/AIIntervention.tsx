import { useEffect, useState } from 'react';
import { Video, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

// ─── Self-contained types ────────────────────────────────────────────────
// Previously imported from scenarioData; inlined so this component can stand
// alone until the notification-banner / AI-intervention iteration lands.

export type AIIconId = 'video' | 'message' | 'calendar';

export interface AIAction {
  id: string;
  label: string;
  sublabel?: string;
  icon: AIIconId;
  primary?: boolean;
}

export interface AIState {
  active: boolean;
  state: 'idle' | 'suggesting' | 'confirmed';
  headline?: string;
  prompt?: string;
  contextNote?: string;
  confirmation?: string;
  actions: AIAction[];
}

interface Props {
  ai: AIState;
  onAction?: (actionId: string) => void;
}

const ICON_MAP = {
  video: Video,
  message: MessageSquare,
  calendar: Calendar,
} as const;

function ActionButton({ action, onAction }: { action: AIAction; onAction?: (id: string) => void }) {
  const Icon = ICON_MAP[action.icon];
  return (
    <button
      onClick={() => onAction?.(action.id)}
      className={`
        flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200
        ${
          action.primary
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${action.primary ? 'text-white' : 'text-slate-300'}`} />
      <span className="text-sm font-medium leading-tight">{action.label}</span>
      {action.sublabel && (
        <span className={`text-xs leading-tight ${action.primary ? 'text-blue-200' : 'text-slate-500'}`}>
          {action.sublabel}
        </span>
      )}
    </button>
  );
}

export function AIIntervention({ ai, onAction }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (ai.active) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [ai.active]);

  if (!ai.active) return null;

  if (ai.state === 'confirmed') {
    return (
      <div
        className={`
          absolute bottom-0 left-0 right-0 z-20
          transition-transform duration-500 ease-out
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="m-4 bg-black/90 backdrop-blur-md border border-emerald-700/40 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 w-9 h-9 rounded-full bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-medium tracking-wider uppercase mb-1">
                {ai.headline}
              </div>
              <div className="text-white text-sm leading-relaxed">{ai.confirmation}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Suggesting state
  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0 z-20
        transition-transform duration-500 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="m-4 bg-black/92 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Thin accent line at top */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-slate-400 tracking-widest uppercase font-medium">
              Vehicle Intelligence
            </span>
            {ai.contextNote && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500">{ai.contextNote}</span>
              </>
            )}
          </div>

          {/* Main prompt */}
          <div className="text-white text-base leading-snug mb-4 font-medium">
            {ai.prompt}
          </div>

          {/* Action buttons */}
          {ai.actions.length > 0 && (
            <div className="flex gap-2">
              {ai.actions.map((action) => (
                <ActionButton key={action.id} action={action} onAction={onAction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
