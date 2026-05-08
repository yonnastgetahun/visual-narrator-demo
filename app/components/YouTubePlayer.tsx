'use client';

import { useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  title: string;
}

export default function YouTubePlayer({ videoId, startTime, endTime, title }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayerInstance | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          start: startTime,
          end: endTime,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: () => {
            youtubePlayerRef.current = newPlayer;
          }
        }
      });
    };

    return () => {
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [videoId, startTime, endTime]);

  const playVideo = () => {
    youtubePlayerRef.current?.playVideo();
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="aspect-video">
        <div ref={playerRef} className="w-full h-full" />
      </div>
      <div className="p-4 bg-gray-900 text-white">
        <h3 className="font-semibold mb-2">{title}</h3>
        <button
          onClick={playVideo}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ▶ Play Scene (30s)
        </button>
      </div>
    </div>
  );
}

type YouTubePlayerInstance = {
  playVideo: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        element: HTMLElement | null,
        options: {
          videoId: string;
          playerVars: Record<string, number>;
          events: {
            onReady: () => void;
          };
        },
      ) => YouTubePlayerInstance;
    };
  }
}
