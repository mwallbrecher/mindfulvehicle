import { Thermometer, Wind, Droplets } from 'lucide-react';
import { useState } from 'react';

export function ClimateWidget() {
  const [temperature, setTemperature] = useState(72);

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-3 border border-slate-700/50">
      <div className="flex items-center justify-between gap-6">
        {/* Climate Label */}
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">Climate</span>
        </div>

        {/* Temperature Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTemperature(Math.max(60, temperature - 1))}
            className="bg-slate-700/50 hover:bg-slate-600/50 rounded-lg px-4 py-1.5 text-white text-sm font-semibold transition-colors"
          >
            -
          </button>
          <div className="text-xl font-semibold text-white min-w-[3rem] text-center">
            {temperature}°
          </div>
          <button
            onClick={() => setTemperature(Math.min(85, temperature + 1))}
            className="bg-slate-700/50 hover:bg-slate-600/50 rounded-lg px-4 py-1.5 text-white text-sm font-semibold transition-colors"
          >
            +
          </button>
        </div>

        {/* Climate Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5 border border-slate-700/30">
            <Wind className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Fan:</span>
            <span className="text-sm text-white">Auto</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5 border border-slate-700/30">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Mode:</span>
            <span className="text-sm text-white">Cool</span>
          </div>
        </div>
      </div>
    </div>
  );
}
