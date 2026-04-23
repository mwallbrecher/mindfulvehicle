import { useState, useEffect, useRef, useCallback } from 'react';
import { newsChannels, NewsChannel } from '../data/newsChannels';

export interface NewsPlayerState {
  currentChannel: NewsChannel;
  currentChannelIndex: number;
  currentSeconds: number;
  isPlaying: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

/**
 * News / radio player — mirrors useMediaPlayer in shape so the NewsWidget
 * can use the same progress / controls pattern as the MusicWidget.
 * Auto-advances to the next channel when the current segment's duration elapses.
 */
export function useNewsPlayer(): NewsPlayerState {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentChannel = newsChannels[currentChannelIndex];

  // Keep duration in a ref so the interval closure never goes stale
  const durationRef = useRef(currentChannel.duration);
  durationRef.current = currentChannel.duration;

  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 1;
        if (next >= durationRef.current) {
          setCurrentChannelIndex((i) => (i + 1) % newsChannels.length);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying]);

  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const next = useCallback(() => {
    setCurrentChannelIndex((i) => (i + 1) % newsChannels.length);
    setCurrentSeconds(0);
  }, []);

  const prev = useCallback(() => {
    // Restart current segment if >3s in, otherwise go to previous channel
    setCurrentSeconds((s) => {
      if (s > 3) return 0;
      setCurrentChannelIndex((i) => (i - 1 + newsChannels.length) % newsChannels.length);
      return 0;
    });
  }, []);

  return {
    currentChannel,
    currentChannelIndex,
    currentSeconds,
    isPlaying,
    toggle,
    next,
    prev,
  };
}
