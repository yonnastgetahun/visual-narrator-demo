'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
  onSyncStatusChange?: (status: string) => void;
}

export default function AudioPlayer({ audioUrl, videoRef, autoPlay = false, onSyncStatusChange }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle');

  // Sync controller
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_DRIFT = 0.1; // More tolerant drift for reliability
  const SYNC_CHECK_INTERVAL = 100; // Check every 100ms

  const updateSyncStatus = (status: 'idle' | 'syncing' | 'synced' | 'failed', message?: string) => {
    setSyncStatus(status);
    if (onSyncStatusChange) {
      const statusMessages = {
        idle: 'Ready',
        syncing: 'Optimizing sync...',
        synced: 'Perfect sync ✅',
        failed: 'Sync issue'
      };
      onSyncStatusChange(message || statusMessages[status]);
    }
  };

  const startSync = () => {
    if (!audioRef.current || !videoRef.current) return;

    updateSyncStatus('syncing');

    syncIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      const video = videoRef.current;
      
      if (!audio || !video || audio.paused) return;

      const drift = video.currentTime - audio.currentTime;
      
      if (Math.abs(drift) > MAX_DRIFT) {
        // Video follows audio (audio as master)
        video.currentTime = audio.currentTime;
      }
      updateSyncStatus('synced');
    }, SYNC_CHECK_INTERVAL);
  };

  const stopSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    updateSyncStatus('idle');
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      updateSyncStatus('idle', 'Loading audio...');
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      updateSyncStatus('idle', 'Audio loaded');
      
      // Auto-play if requested
      if (autoPlay) {
        // Small delay to ensure video is ready
        setTimeout(() => {
          audio.play().catch(error => {
            console.error('Audio play failed:', error);
            updateSyncStatus('failed', 'Playback failed');
          });
        }, 500);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopSync();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startSync();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopSync();
    };

    const handleError = () => {
      setIsLoading(false);
      updateSyncStatus('failed', 'Audio load failed');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      stopSync();
    };
  }, [autoPlay]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    
    if (!audio || !video) return;

    try {
      if (isPlaying) {
        audio.pause();
        video.pause();
      } else {
        // Start audio first, then video
        await audio.play();
        // Unmute video and play
        video.muted = false;
        await video.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      updateSyncStatus('failed', 'Playback error');
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const resetPlayback = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    
    if (audio) audio.currentTime = 0;
    if (video) video.currentTime = 0;
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        className="hidden"
      />
      
      {/* Header with Sync Status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Premium Audio Narration</h3>
        <div className={`text-xs px-2 py-1 rounded-full ${
          syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
          syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
          syncStatus === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {syncStatus === 'synced' ? 'Perfect Sync ✅' :
           syncStatus === 'syncing' ? 'Optimizing...' :
           syncStatus === 'failed' ? 'Sync Issue' : 'Ready'}
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="h-2 bg-gray-200 rounded-full mb-4 cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors disabled:opacity-50"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={resetPlayback}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2"
            title="Restart"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {isLoading && (
            <span className="text-sm text-gray-500">Loading audio...</span>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {formatTime((progress * duration) / 100)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
