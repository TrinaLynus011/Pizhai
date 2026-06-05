// components/AudioPlayer.jsx
// Tamil TTS audio player with play button and loading state
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';

export default function AudioPlayer({ audioUrl, label = 'Play Correct Pronunciation' }) {
  const [status, setStatus] = useState('idle'); // idle | loading | playing | error
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  async function handlePlay() {
    if (status === 'playing') {
      audioRef.current?.pause();
      setStatus('idle');
      return;
    }

    if (!audioUrl) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setStatus('idle');
      audio.onerror = () => setStatus('error');
      await audio.play();
      setStatus('playing');
    } catch (e) {
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';
  const isError = status === 'error';

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading || isError}
      className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isPlaying
          ? 'linear-gradient(135deg, #10B981, #059669)'
          : isError
          ? 'linear-gradient(135deg, #6B7280, #4B5563)'
          : 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.2))',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'white',
        boxShadow: isPlaying ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
      }}
    >
      {isLoading ? (
        <Loader size={18} className="animate-spin" />
      ) : isPlaying ? (
        <Volume2 size={18} />
      ) : isError ? (
        <VolumeX size={18} />
      ) : (
        <Volume2 size={18} />
      )}
      {isError ? 'Audio unavailable' : isPlaying ? 'Playing...' : label}
    </button>
  );
}
