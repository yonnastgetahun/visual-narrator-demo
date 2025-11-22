'use client';

import { useRef, useEffect, useState, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  autoPlay?: boolean;
  muted?: boolean;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, title, autoPlay = false, muted = false }, ref) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(muted);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handleEnded = () => setIsPlaying(false);

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('ended', handleEnded);

      if (autoPlay) {
        video.play().catch(console.error);
      }

      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('ended', handleEnded);
      };
    }, [autoPlay]);

    const togglePlay = () => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = !video.muted;
      setIsMuted(!isMuted);
    };

    return (
      <div className="bg-black rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            muted={muted}
            playsInline
            className="w-full h-full object-cover"
            preload="metadata"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white">Loading video...</div>
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <button
                onClick={togglePlay}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-4 transition-all transform hover:scale-105"
              >
                <Play size={32} fill="black" />
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="hover:bg-gray-800 p-2 rounded transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={toggleMute}
              className="hover:bg-gray-800 p-2 rounded transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <span className="text-sm text-gray-300">30s</span>
          </div>
          
          <div className="text-sm font-medium">{title}</div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
