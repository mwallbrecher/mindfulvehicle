import { Battery, Sun, Moon, Zap, Gauge } from 'lucide-react';
import { DrivingMode, NavState, RouteStatus } from '../../data/drivingModes';

interface Props {
  mode: DrivingMode;
  /** Optional override — used when an active intervention mutates the nav state
   *  (e.g. route flipped to 'heavy', ETA pushed later). Falls back to mode.navigation. */
  navigation?: NavState;
}

const ROUTE_COLORS: Record<RouteStatus, string> = {
  clear:    'text-emerald-400',
  moderate: 'text-amber-400',
  heavy:    'text-rose-400',
};

const ROUTE_LABELS: Record<RouteStatus, string> = {
  clear:    'Clear',
  moderate: 'Moderate',
  heavy:    'Heavy',
};

export function StatusBar({ mode, navigation = mode.navigation }: Props) {
  const routeColor = ROUTE_COLORS[navigation.routeStatus];
  const routeLabel = ROUTE_LABELS[navigation.routeStatus];
  const CommuteIcon = mode.id === 'to_work' ? Sun : Moon;

  return (
    <div className="flex items-center justify-between px-7 py-3.5 bg-black/40 backdrop-blur-sm border-b border-slate-800/50">

      {/* Left — time + commute label */}
      <div className="flex items-center gap-4">
        <div>
          <span className="text-2xl font-semibold text-white tracking-tight">
            {mode.simulatedTime}
          </span>
          <span className="text-xs text-slate-500 ml-1">{mode.timeMeridian}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CommuteIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{mode.subLabel}</span>
        </div>
      </div>

      {/* Centre — route status + EV metrics */}
      <div className="flex items-center gap-5">

        {/* Route status */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Route</div>
          <div className={`text-sm font-semibold ${routeColor}`}>{routeLabel}</div>
        </div>

        <div className="w-px h-6 bg-slate-800" />

        {/* Range remaining */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Range</div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-sm font-semibold text-white">{mode.rangeKm} km</span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-800" />

        {/* Efficiency */}
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Efficiency</div>
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-semibold text-white">
              {mode.efficiencyKwh.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">kWh/km</span>
          </div>
        </div>

      </div>

      {/* Right — battery */}
      <div className="flex items-center gap-1.5">
        <Battery className="w-5 h-5 text-emerald-400" />
        <span className="text-sm text-white">87%</span>
      </div>

    </div>
  );
}
