import { Calendar, MapPin, AlertCircle, Clock } from 'lucide-react';
import { CalendarState } from '../../data/drivingModes';

interface Props {
  calendar: CalendarState;
  /** When true, the "next" meeting is highlighted in red (meeting at risk). */
  atRisk?: boolean;
  /** Projected arrival ETA (e.g. "9:26"). Shown on the at-risk meeting card. */
  arrivalEta?: string;
}

/** Parse "H:MM" / "HH:MM" into minutes since midnight. Returns NaN on bad input. */
function parseClock(t: string): number {
  const parts = t.split(':');
  if (parts.length !== 2) return NaN;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

export function CalendarWidget({ calendar, atRisk = false, arrivalEta }: Props) {
  // ─── Collapsed state — thin strip, minimal distraction ───────────────
  if (calendar.collapsed) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/40 px-4 py-2.5 flex items-center gap-2.5">
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-400 font-medium">Calendar</span>
        <span className="text-xs text-slate-600 ml-auto">
          {calendar.meetings.length === 0 ? 'Clear' : `${calendar.meetings.length} today`}
        </span>
      </div>
    );
  }

  // ─── Expanded state — next meeting highlighted + compact list ────────
  const nextMeeting = calendar.meetings.find((m) => m.isNext) ?? calendar.meetings[0];
  const upcoming    = calendar.meetings.filter((m) => m !== nextMeeting).slice(0, 3);

  const nextCardClasses = atRisk
    ? 'bg-rose-600/10 border-rose-500/40'
    : 'bg-blue-600/10 border-blue-500/30';
  const nextLabelClasses = atRisk ? 'text-rose-400' : 'text-blue-400';
  const nextLabel        = atRisk ? 'At risk' : 'Next';

  // Compute "X min late" when both the meeting time and ETA are available.
  let minutesLate: number | null = null;
  if (atRisk && arrivalEta && nextMeeting) {
    const meetingMin = parseClock(nextMeeting.time);
    const arrivalMin = parseClock(arrivalEta);
    if (Number.isFinite(meetingMin) && Number.isFinite(arrivalMin)) {
      const delta = arrivalMin - meetingMin;
      if (delta > 0) minutesLate = delta;
    }
  }

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border transition-colors duration-500 ${
        atRisk ? 'border-rose-500/30' : 'border-slate-700/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Calendar</h3>
          {atRisk && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-semibold text-rose-300 tracking-wider uppercase">
                Conflict
              </span>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500">{calendar.meetings.length} today</span>
      </div>

      {/* Next meeting — highlighted */}
      {nextMeeting && (
        <div className={`border rounded-xl px-3 py-2.5 mb-2 transition-colors duration-500 ${nextCardClasses}`}>
          <div className="flex items-baseline justify-between mb-0.5">
            <span className={`text-xs font-semibold tracking-wide uppercase ${nextLabelClasses}`}>
              {nextLabel}
            </span>
            <span className="text-sm text-white font-semibold">{nextMeeting.time}</span>
          </div>
          <div className="text-sm text-white leading-snug mb-1">{nextMeeting.title}</div>
          {nextMeeting.location && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span>{nextMeeting.location}</span>
            </div>
          )}

          {/* Arrival ETA — only shown when the meeting is at risk */}
          {atRisk && arrivalEta && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-rose-500/20 text-xs">
              <Clock className="w-3 h-3 text-rose-400" />
              <span className="text-rose-300">Arriving {arrivalEta}</span>
              {minutesLate !== null && (
                <span className="text-rose-400/80 ml-auto font-medium">
                  {minutesLate} min late
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Later today — compact rows */}
      {upcoming.length > 0 && (
        <div className="space-y-1">
          {upcoming.map((m, i) => (
            <div
              key={`${m.time}-${i}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs text-slate-500 font-medium w-10 shrink-0">{m.time}</span>
              <span className="text-xs text-slate-300 truncate flex-1">{m.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
