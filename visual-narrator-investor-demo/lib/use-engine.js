/**
 * React Hook for Visual Narrator Engine Integration
 */

import { useState, useEffect } from 'react';
import { EngineClient } from './engine-client';

export function useEngine() {
  const [engineStatus, setEngineStatus] = useState('checking');
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkEngineHealth();
  }, []);

  const checkEngineHealth = async () => {
    try {
      const status = await EngineClient.getEngineStatus();
      setEngineStatus(status.status);
      setPerformance(status.capabilities);
    } catch (err) {
      setEngineStatus('offline');
      setError(err.message);
    }
  };

  const analyzeScene = async (videoPath, timestamp) => {
    try {
      const analysis = await EngineClient.analyzeFrame(videoPath, timestamp);
      return analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const analyzeMultipleFrames = async (videoPath, timestamps) => {
    try {
      const sequence = await EngineClient.analyzeSequence(videoPath, timestamps);
      return sequence;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getDemoData = async () => {
    try {
      const demo = await EngineClient.getGameOfThronesDemo();
      return demo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    engineStatus,
    performance,
    error,
    analyzeScene,
    analyzeMultipleFrames,
    getDemoData,
    refreshHealth: checkEngineHealth
  };
}

export default useEngine;
