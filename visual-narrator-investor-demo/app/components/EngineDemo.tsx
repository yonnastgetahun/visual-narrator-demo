/**
 * Engine Demo Component - Shows live integration with Visual Narrator LLM Engine
 */

'use client';

import React, { useState, useEffect } from 'react';

// Import the engine client from the lib directory
import { EngineClient } from '../../lib/engine-client';

// Custom hook for engine integration
function useEngine() {
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

  const analyzeScene = async (videoPath: string, timestamp: number) => {
    try {
      const analysis = await EngineClient.analyzeFrame(videoPath, timestamp);
      return analysis;
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
    getDemoData,
    refreshHealth: checkEngineHealth
  };
}

const EngineDemo = () => {
  const { 
    engineStatus, 
    performance, 
    error, 
    analyzeScene, 
    getDemoData 
  } = useEngine();
  
  const [demoData, setDemoData] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      const data = await getDemoData();
      setDemoData(data);
    } catch (err) {
      console.error('Failed to load demo data:', err);
    }
  };

  const testFrameAnalysis = async (timestamp: number) => {
    setLoading(true);
    try {
      const analysis = await analyzeScene('gameofthronesseason1episode1.mp4', timestamp);
      setCurrentAnalysis(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production_ready': return 'text-green-600';
      case 'offline': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="engine-demo p-6 bg-white rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-4">🎯 Visual Narrator LLM Engine</h2>
      
      {/* Engine Status */}
      <div className="status-section mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Engine Status</h3>
        <div className="flex items-center gap-4">
          <span className={`font-bold ${getStatusColor(engineStatus)}`}>
            {engineStatus.toUpperCase()}
          </span>
          {performance && (
            <div className="text-sm text-gray-600">
              {performance.processing_speed} • {performance.semantic_accuracy}
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="metrics-section mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="metric-card p-3 bg-blue-50 rounded text-center">
            <div className="metric-value font-bold text-blue-700">
              {performance.processing_speed}
            </div>
            <div className="metric-label text-sm text-gray-600">Speed</div>
          </div>
          <div className="metric-card p-3 bg-green-50 rounded text-center">
            <div className="metric-value font-bold text-green-700">
              {performance.semantic_accuracy}
            </div>
            <div className="metric-label text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="metric-card p-3 bg-purple-50 rounded text-center">
            <div className="metric-value font-bold text-purple-700">
              {performance.speed_advantage}
            </div>
            <div className="metric-label text-sm text-gray-600">Advantage</div>
          </div>
          <div className="metric-card p-3 bg-orange-50 rounded text-center">
            <div className="metric-value font-bold text-orange-700">
              {performance.cost_reduction || '90% reduction'}
            </div>
            <div className="metric-label text-sm text-gray-600">Cost</div>
          </div>
        </div>
      )}

      {/* Demo Controls */}
      <div className="demo-controls mb-6">
        <h3 className="text-lg font-semibold mb-3">Live Analysis Test</h3>
        <div className="flex gap-2 flex-wrap">
          {[5, 75, 120].map(timestamp => (
            <button
              key={timestamp}
              onClick={() => testFrameAnalysis(timestamp)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              Test {timestamp}s
            </button>
          ))}
        </div>
      </div>

      {/* Current Analysis Result */}
      {currentAnalysis && (
        <div className="analysis-result p-4 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-2">
            Frame Analysis - {currentAnalysis.timestamp}s
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Visual:</strong> {currentAnalysis.frame_analysis?.objects_detected?.join(', ')}
            </div>
            <div>
              <strong>Emotion:</strong> {currentAnalysis.frame_analysis?.emotional_tone}
            </div>
            <div>
              <strong>Narration:</strong> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                currentAnalysis.inclusion_analysis?.needs_narration 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentAnalysis.inclusion_analysis?.needs_narration ? 'Required' : 'Silent'}
              </span>
            </div>
          </div>
          {currentAnalysis.gap_analysis?.gap_reason && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Reason:</strong> {currentAnalysis.gap_analysis.gap_reason}
            </div>
          )}
        </div>
      )}

      {/* Demo Data */}
      {demoData && (
        <div className="demo-data mt-6">
          <h3 className="text-lg font-semibold mb-3">Game of Thrones Analysis</h3>
          <div className="space-y-3">
            {demoData.key_moments?.map((moment: any, index: number) => (
              <div key={index} className="p-3 border rounded bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{moment.timestamp}s</strong> - {moment.scene}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    moment.narration_decision === 'Narrate' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {moment.narration_decision}
                  </span>
                </div>
                {moment.sample_narration && (
                  <div className="mt-2 text-sm text-gray-700 italic">
                    "{moment.sample_narration}"
                  </div>
                )}
                {moment.reason && (
                  <div className="mt-1 text-xs text-gray-500">
                    {moment.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineDemo;
