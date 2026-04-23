import { useEffect, useRef, useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Calendar,
  Coffee,
  Music,
  Snowflake,
  Wind,
  Sun,
  MapPin,
  AlertCircle,
  Sparkles,
  Mic,
  Pencil,
  Check,
} from 'lucide-react';
import {
  Intervention,
  InterventionTone,
  Suggestion,
  SuggestionIconId,
} from '../../data/interventions';

interface Props {
  intervention: Intervention;
  /** Bumped on every trigger() — key this component off it to restart
   *  entrance + decay animations when the same scenario fires twice. */
  triggerToken: number;
  onSuggestion?: (id: string) => void;
  onDismiss: () => void;
}

// ─── Icon maps ───────────────────────────────────────────────────────────────
const SUGGESTION_ICONS: Record<SuggestionIconId, typeof Phone> = {
  phone:     Phone,
  message:   MessageSquare,
  calendar:  Calendar,
  coffee:    Coffee,
  music:     Music,
  snowflake: Snowflake,
  wind:      Wind,
  sun:       Sun,
  'map-pin': MapPin,
};

const HEAD_ICONS: Record<InterventionTone, typeof AlertCircle> = {
  alert:    AlertCircle,
  warn:     AlertCircle,
  wellness: Sparkles,
};

// In-car controls fire immediately — no confirmation step.
const IN_CAR_IDS = new Set(['ac', 'window', 'panorama', 'music']);

type View = 'suggestions' | 'confirming' | 'editing';

const CONFIRM_DECAY_S = 12;

export function NotificationBanner({
  intervention,
  triggerToken,
  onSuggestion,
  onDismiss,
}: Props) {
  const HeadIcon = HEAD_ICONS[intervention.tone];

  // ── All timer refs (defined first so cleanup can always reach them) ──────
  type TRef = ReturnType<typeof setTimeout> | null;
  const suggestionTimer = useRef<TRef>(null);
  const suggestionKicker = useRef<TRef>(null);
  const confirmTimer = useRef<TRef>(null);
  const confirmKicker = useRef<TRef>(null);

  // ── View / animation state ───────────────────────────────────────────────
  const [visible,          setVisible]          = useState(false);
  const [shrinking,        setShrinking]        = useState(false);
  const [view,             setView]             = useState<View>('suggestions');
  const [pending,          setPending]          = useState<Suggestion | null>(null);
  const [editText,         setEditText]         = useState('');
  const [confirmShrinking, setConfirmShrinking] = useState(false);

  // ── Timer helpers ────────────────────────────────────────────────────────
  const clearSuggestionTimers = () => {
    if (suggestionTimer.current)  { clearTimeout(suggestionTimer.current);  suggestionTimer.current  = null; }
    if (suggestionKicker.current) { clearTimeout(suggestionKicker.current); suggestionKicker.current = null; }
  };

  const clearConfirmTimers = () => {
    if (confirmTimer.current)  { clearTimeout(confirmTimer.current);  confirmTimer.current  = null; }
    if (confirmKicker.current) { clearTimeout(confirmKicker.current); confirmKicker.current = null; }
  };

  /**
   * (Re)start the suggestion decay bar + auto-dismiss timer.
   * Called on mount and again whenever the user cancels out of confirming.
   */
  const startSuggestionDecay = () => {
    clearSuggestionTimers();
    setShrinking(false);
    suggestionKicker.current = setTimeout(() => setShrinking(true), 80);
    suggestionTimer.current  = setTimeout(onDismiss, intervention.duration * 1_000);
  };

  const startConfirmDecay = () => {
    clearConfirmTimers();
    setConfirmShrinking(false);
    confirmKicker.current = setTimeout(() => setConfirmShrinking(true), 80);
  };

  // ── Mount / re-trigger (component remounts via key={triggerToken}) ────────
  useEffect(() => {
    setVisible(false);
    const visTimer = setTimeout(() => setVisible(true), 20);
    startSuggestionDecay();

    return () => {
      clearTimeout(visTimer);
      clearSuggestionTimers();
      clearConfirmTimers();
    };
  }, [triggerToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Confirmation / edit flow ─────────────────────────────────────────────
  const backToSuggestions = () => {
    clearConfirmTimers();
    setView('suggestions');
    setPending(null);
    setConfirmShrinking(false);
    // Restart suggestion decay from 100%
    startSuggestionDecay();
  };

  const enterConfirming = (s: Suggestion) => {
    // Pause the suggestion auto-dismiss while the user decides
    clearSuggestionTimers();
    clearConfirmTimers();
    setPending(s);
    setView('confirming');
    startConfirmDecay();
    // 12-second confirm-panel timeout → back to suggestions
    confirmTimer.current = setTimeout(backToSuggestions, CONFIRM_DECAY_S * 1_000);
  };

  const enterEditing = () => {
    if (!pending) return;
    clearConfirmTimers();
    setEditText(pending.label);
    setView('editing');
    startConfirmDecay();
    confirmTimer.current = setTimeout(backToSuggestions, CONFIRM_DECAY_S * 1_000);
  };

  const handleConfirm = () => {
    clearSuggestionTimers();
    clearConfirmTimers();
    onSuggestion?.(pending?.id ?? '');
    onDismiss();
  };

  const handleSuggestionClick = (s: Suggestion) => {
    if (IN_CAR_IDS.has(s.id)) {
      clearSuggestionTimers();
      onSuggestion?.(s.id);
      onDismiss();
    } else {
      enterConfirming(s);
    }
  };

  // ── Shared button classes ────────────────────────────────────────────────
  const btnBase    = 'flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border';
  const btnNeutral = `${btnBase} bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50 text-slate-300`;
  const btnGreen   = `${btnBase} bg-emerald-700/70 hover:bg-emerald-600/70 border-emerald-600/50 text-white font-semibold`;
  const btnRed     = `${btnBase} bg-rose-900/50 hover:bg-rose-800/60 border-rose-700/40 text-rose-300`;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`
        absolute inset-x-0 top-0 z-30
        bg-slate-800/50 backdrop-blur-md rounded-2xl
        border border-slate-700/50
        shadow-2xl shadow-black/40
        overflow-hidden
        transition-all duration-300 ease-out
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}
      `}
    >
      <div className="p-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-700/60 border border-slate-600/50">
            <HeadIcon className="w-3.5 h-3.5 text-slate-300" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-white text-sm font-medium leading-snug">
              {intervention.message}
            </p>
          </div>

          {/* Mic + "Start Speaking" */}
          <button
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 hover:bg-slate-700/50 rounded-full transition-colors -mt-0.5 shrink-0"
            title="Voice input"
          >
            {/* Mic icon with subtle listening pulse */}
            <div className="relative flex items-center justify-center w-5 h-5">
              {/* Soft halo that breathes — stays within its container */}
              <span className="absolute inset-0 rounded-full bg-slate-400/15 animate-pulse" />
              <Mic className="w-3.5 h-3.5 text-slate-300 relative z-10" />
            </div>
            <span className="text-xs text-slate-400 leading-none">Start Speaking</span>
          </button>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors -mt-0.5 -mr-0.5 shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* ── Suggestions ─────────────────────────────────────────────── */}
        {view === 'suggestions' && intervention.suggestions.length > 0 && (
          <div className="flex gap-2">
            {intervention.suggestions.map((s) => {
              const Icon = SUGGESTION_ICONS[s.icon];
              return (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  className="
                    flex-1 flex items-center justify-center gap-2 px-3 py-2
                    rounded-xl bg-slate-700/50 hover:bg-slate-600/50
                    border border-slate-600/50
                    text-slate-100 text-xs font-medium
                    transition-all duration-200
                  "
                >
                  <Icon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Confirmation panel ──────────────────────────────────────── */}
        {view === 'confirming' && pending && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 px-0.5 leading-snug truncate">
              <span className="text-slate-200 font-medium">{pending.label}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={enterEditing}  className={`flex-1 ${btnNeutral}`}>
                <Pencil className="w-3 h-3 shrink-0" /> Edit
              </button>
              <button onClick={handleConfirm} className={`flex-1 ${btnGreen}`}>
                <Check className="w-3 h-3 shrink-0" /> Confirm
              </button>
              {/* Dismiss — fills up as the 12 s window expires */}
              <button
                onClick={backToSuggestions}
                className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-700/40 text-rose-300 text-xs font-medium overflow-hidden"
              >
                <span
                  className="absolute inset-0 bg-rose-900/50"
                  style={{
                    width: confirmShrinking ? '100%' : '0%',
                    transition: confirmShrinking ? `width ${CONFIRM_DECAY_S}s linear` : 'none',
                  }}
                />
                <X className="w-3 h-3 relative z-10 shrink-0" />
                <span className="relative z-10">Dismiss</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Edit panel ──────────────────────────────────────────────── */}
        {view === 'editing' && (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              autoFocus
              className="
                w-full rounded-xl
                bg-slate-700/60 border border-slate-600/50
                text-white text-xs px-3 py-2 resize-none
                focus:outline-none focus:border-slate-500/60
                placeholder:text-slate-500
              "
            />
            <div className="flex gap-2">
              <button onClick={handleConfirm} className={`flex-1 ${btnGreen}`}>
                <Check className="w-3 h-3 shrink-0" /> Send
              </button>
              {/* Dismiss — fills up as the 12 s window expires */}
              <button
                onClick={() => pending && enterConfirming(pending)}
                className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-700/40 text-rose-300 text-xs font-medium overflow-hidden"
              >
                <span
                  className="absolute inset-0 bg-rose-900/50"
                  style={{
                    width: confirmShrinking ? '100%' : '0%',
                    transition: confirmShrinking ? `width ${CONFIRM_DECAY_S}s linear` : 'none',
                  }}
                />
                <X className="w-3 h-3 relative z-10 shrink-0" />
                <span className="relative z-10">Dismiss</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Decay bar — suggestion view only; confirm view uses the Cancel button ── */}
      {view === 'suggestions' && (
        <div className="h-1 bg-slate-700/60 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-slate-400/50"
            style={{
              width: shrinking ? '0%' : '100%',
              transition: shrinking ? `width ${intervention.duration}s linear` : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
