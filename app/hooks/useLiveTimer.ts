import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseLiveTimerReturn {
  elapsed: number;          // Raw milliseconds
  formatted: string;        // Formatted as "XXXms" (rounded to 10ms)
  isRunning: boolean;       // Timer state
  start: () => void;        // Start timer
  pause: () => void;        // Pause timer  
  reset: () => void;        // Reset to zero
}

export function useLiveTimer(initialElapsed = 0): UseLiveTimerReturn {
  const [elapsed, setElapsed] = useState<number>(initialElapsed);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(initialElapsed);

  // Format function: rounds to nearest 10ms per v2.3 spec
  const formatTime = useCallback((ms: number): string => {
    const rounded = Math.round(ms / 10) * 10;
    return `${rounded}ms`;
  }, []);

  // Animation frame callback
  const updateTimer = useCallback(function tick() {
    if (!startTimeRef.current) return;

    const now = performance.now();
    const delta = now - startTimeRef.current;
    const total = accumulatedRef.current + delta;
    
    setElapsed(total);
    
    // Continue animation if running
    if (isRunning) {
      animationRef.current = requestAnimationFrame(tick);
    }
  }, [isRunning]);

  // Start timer
  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(updateTimer);
  }, [isRunning, updateTimer]);

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning || !startTimeRef.current) return;
    
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Accumulate elapsed time
    const now = performance.now();
    const delta = now - startTimeRef.current;
    accumulatedRef.current += delta;
    startTimeRef.current = null;
  }, [isRunning]);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsed(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    elapsed,
    formatted: formatTime(elapsed),
    isRunning,
    start,
    pause,
    reset,
  };
}
