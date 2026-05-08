'use client';

import { useEffect } from 'react';
import { useLiveTimer } from '@/app/hooks/useLiveTimer';

export interface LiveTimerDisplayProps {
  initialElapsed?: number;
  showControls?: boolean;
  autoStart?: boolean;
  className?: string;
}

/**
 * LiveTimerDisplay Component
 *
 * Displays a live-updating timer with color-coded thresholds per v2.3 spec:
 * - 0-500ms: Green (latency-fast)
 * - 500-1500ms: Yellow (latency-med)
 * - 1500ms+: Red (latency-slow)
 *
 * @param initialElapsed - Starting time in milliseconds (default: 0)
 * @param showControls - Show start/pause/reset buttons (default: false)
 * @param autoStart - Automatically start timer on mount (default: false)
 * @param className - Additional CSS classes
 */
export default function LiveTimerDisplay({
  initialElapsed = 0,
  showControls = false,
  autoStart = false,
  className = '',
}: LiveTimerDisplayProps) {
  const { elapsed, formatted, isRunning, start, pause, reset } = useLiveTimer(initialElapsed);

  // Auto-start timer on mount if requested
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Determine color class based on elapsed time thresholds
  const getColorClass = (ms: number): string => {
    if (ms < 500) return 'text-latency-fast';
    if (ms < 1500) return 'text-latency-med';
    return 'text-latency-slow';
  };

  const colorClass = getColorClass(elapsed);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Timer Display */}
      <span
        className={`font-mono text-2xl font-bold tabular-nums ${colorClass}`}
        role="timer"
        aria-live="polite"
      >
        {formatted}
      </span>

      {/* Optional Control Buttons */}
      {showControls && (
        <div className="flex gap-1">
          {!isRunning ? (
            <button
              onClick={start}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              aria-label="Start timer"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              aria-label="Pause timer"
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            aria-label="Reset timer"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
