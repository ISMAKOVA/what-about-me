'use client';
import beats from '@/lib/beats';
import { usePlayerStore } from '@/lib/stores/usePlayerStore';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { Oscilloscope } from './oscilloscope';

export const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggleBeat = usePlayerStore((s) => s.toggleBeat);
  const currentBeatId = usePlayerStore((s) => s.currentBeatId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentBeat = beats.find((b) => b.id === currentBeatId);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoaded = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoaded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [currentBeatId]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentBeat) return;

    audio.src = currentBeat.previewUrl;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [currentBeat, currentBeatId, isPlaying]);

  const togglePlay = () => {
    if (currentBeatId) toggleBeat(currentBeatId);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const scrub = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    const audio = audioRef.current;
    if (audio) audio.currentTime = newTime;
  };

  return (
    <div className="flex h-full w-full max-w-4xl items-center gap-4 mx-auto  select-none">
      <audio ref={audioRef} src={currentBeat?.previewUrl} className="hidden" />

      <span className="text-sm font-medium w-10 text-right">{formatTime(currentTime)}</span>

      <div onClick={scrub} className="relative flex-grow h-8 cursor-pointer group">
        <Oscilloscope audioRef={audioRef} />
      </div>

      <span className="text-sm font-medium w-10">{formatTime(duration)}</span>

      <button onClick={togglePlay} className="text-lg  rounded-full">
        {isPlaying ? '❚❚' : '▶'}
      </button>
    </div>
  );
};
