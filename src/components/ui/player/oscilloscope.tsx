'use client';
import { RefObject, useEffect, useRef } from 'react';

export const Oscilloscope = ({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const audioCtx = audioCtxRef.current;

    if (!sourceRef.current) {
      sourceRef.current = audioCtx.createMediaElementSource(audio);
    }

    if (!analyserRef.current) {
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 1024;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtx.destination);
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      const analyser = analyserRef.current;
      if (!analyser) return;
      analyser.getByteTimeDomainData(dataArray);

      const progress = audio.duration ? audio.currentTime / audio.duration : 0;

      const playedWidth = width * progress;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const amplitude = 0.8;
      const centerBlend = 0.8;

      for (let i = 0; i < dataArray.length; i++) {
        const raw = (dataArray[i] - 128) / 128;

        const blended = raw * (1 - centerBlend);

        const y = centerY + blended * amplitude * centerY;

        const x = (i / dataArray.length) * playedWidth;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    draw();
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [audioRef]);

  return <canvas ref={canvasRef} width={900} height={70} className="w-full h-full" />;
};
