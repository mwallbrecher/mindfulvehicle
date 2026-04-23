import { useState, useEffect, useRef, useCallback } from 'react';
import { playlist, Track } from '../data/playlist';

export interface MediaPlayerState {
  currentTrack: Track;
  currentTrackIndex: number;
  currentSeconds: number;
  isPlaying: boolean;
  shuffle: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
}

/** Pick a random playlist index that isn't the current one. */
function randomOtherIndex(current: number): number {
  if (playlist.length <= 1) return 0;
  let r = Math.floor(Math.random() * (playlist.length - 1));
  if (r >= current) r += 1; // skip `current`, shift the tail up
  return r;
}

export function useMediaPlayer(): MediaPlayerState {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentSeconds, setCurrentSeconds]       = useState(0);
  const [isPlaying, setIsPlaying]                 = useState(true);
  const [shuffle, setShuffle]                     = useState(false);

  const currentTrack = playlist[currentTrackIndex];

  // Keep duration + shuffle in refs so the interval closure never goes stale
  const durationRef = useRef(currentTrack.duration);
  durationRef.current = currentTrack.duration;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;

  // Tick +1 every second while playing; auto-advance when track ends
  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 1;
        if (next >= durationRef.current) {
          setCurrentTrackIndex((i) =>
            shuffleRef.current ? randomOtherIndex(i) : (i + 1) % playlist.length,
          );
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying]);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    setCurrentTrackIndex((i) =>
      shuffleRef.current ? randomOtherIndex(i) : (i + 1) % playlist.length,
    );
    setCurrentSeconds(0);
  }, []);

  const prev = useCallback(() => {
    // Spotify-like: if > 3 s in, restart current; otherwise go back one
    // (shuffle doesn't affect "back" — users expect it to undo the last jump,
    //  which sequential back-step approximates well enough for a demo)
    setCurrentSeconds((s) => {
      if (s > 3) return 0;
      setCurrentTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
      return 0;
    });
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  return {
    currentTrack,
    currentTrackIndex,
    currentSeconds,
    isPlaying,
    shuffle,
    toggle,
    next,
    prev,
    toggleShuffle,
  };
}
