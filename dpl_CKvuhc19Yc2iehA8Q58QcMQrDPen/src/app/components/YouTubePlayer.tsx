'use client';

import { useState, useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  startTime: number;
  endTime: number;
  title: string;
}

export default function YouTubePlayer({ videoId, startTime, endTime, title }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new (window as any).YT.Player(playerRef.current, {
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
            setPlayer(newPlayer);
          }
        }
      });
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId, startTime, endTime]);

  const playVideo = () => {
    if (player) {
      player.playVideo();
    }
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
