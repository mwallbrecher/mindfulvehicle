import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { useMediaPlayer } from '../../simulation/useMediaPlayer';

interface Props {
  ducked?: boolean;
  duckLevel?: number; // 0–1 — passed from simulation for AI context awareness
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function MusicWidget({ ducked = false, duckLevel = 1 }: Props) {
  const {
    currentTrack,
    currentSeconds,
    isPlaying,
    shuffle,
    toggle,
    next,
    prev,
    toggleShuffle,
  } = useMediaPlayer();

  const progress = currentTrack.duration > 0 ? currentSeconds / currentTrack.duration : 0;

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
        <h3 className="text-sm font-semibold text-white">Spotify</h3>
        {ducked ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/60 border border-slate-600/40">
            <VolumeX className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{Math.round(duckLevel * 100)}%</span>
          </div>
        ) : (
          <Volume2 className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Album Art — real cover image, object-cover handles resolution differences */}
      <div className="relative rounded-xl aspect-square mb-3 overflow-hidden bg-slate-900 shadow-lg shadow-black/30">
        <img
          key={currentTrack.cover}
          src={currentTrack.cover}
          alt={`${currentTrack.title} — ${currentTrack.artist}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          loading="eager"
          draggable={false}
        />
        {/* Subtle bottom vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Track Info */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-white truncate">{currentTrack.title}</div>
        <div className="text-xs text-slate-400 truncate">{currentTrack.artist}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{fmt(currentSeconds)}</span>
          <span>{fmt(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleShuffle}
          className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors relative"
          title={shuffle ? 'Shuffle on' : 'Shuffle off'}
        >
          <Shuffle
            className={`w-4 h-4 transition-colors ${shuffle ? 'text-purple-400' : 'text-slate-500'}`}
          />
          {shuffle && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
          )}
        </button>

        <button
          onClick={prev}
          className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors"
          title="Previous / Restart"
        >
          <SkipBack className="w-4 h-4 text-slate-300" />
        </button>

        <button
          onClick={toggle}
          className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-md shadow-purple-900/40"
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
          title="Next track"
        >
          <SkipForward className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}
