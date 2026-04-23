import { Radio, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useNewsPlayer } from '../../simulation/useNewsPlayer';

interface Props {
  ducked?: boolean;
  duckLevel?: number; // 0–1
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function NewsWidget({ ducked = false, duckLevel = 1 }: Props) {
  const { currentChannel, currentSeconds, isPlaying, toggle, next, prev } = useNewsPlayer();
  const progress =
    currentChannel.duration > 0 ? currentSeconds / currentChannel.duration : 0;

  return (
    <div
      className={`
        bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50
        transition-opacity duration-700
        ${ducked ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Radio Station</h3>
        {ducked ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/60 border border-slate-600/40">
            <VolumeX className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{Math.round(duckLevel * 100)}%</span>
          </div>
        ) : (
          <Volume2 className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Channel "cover" */}
      <div
        className={`bg-gradient-to-br ${currentChannel.accent} rounded-xl aspect-square mb-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 p-4`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Radio className="w-10 h-10 text-white/40 mb-2 relative" />
        <div className="text-xs text-white/70 tracking-widest uppercase font-semibold relative">
          {currentChannel.name}
        </div>
      </div>

      {/* Segment info */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-white truncate">
          {currentChannel.segmentTitle}
        </div>
        <div className="text-xs text-slate-400 leading-snug line-clamp-2">
          {currentChannel.headline}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{fmt(currentSeconds)}</span>
          <span>{fmt(currentChannel.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={prev}
          className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors"
          title="Previous channel"
        >
          <SkipBack className="w-4 h-4 text-slate-300" />
        </button>

        <button
          onClick={toggle}
          className="p-2.5 bg-gradient-to-br from-rose-600 to-orange-600 rounded-full hover:from-rose-500 hover:to-orange-500 transition-all shadow-md shadow-rose-900/40"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          )}
        </button>

        <button
          onClick={next}
          className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors"
          title="Next channel"
        >
          <SkipForward className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}
