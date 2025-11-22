'use client';

import { useState, useEffect } from 'react';
import { calculateRealMetrics, calculateComparativeMetrics, QualityMetrics as QualityMetricsType } from './RealMetricsCalculator';

interface QualityMetricsProps {
  sceneData: any;
  onMetricsChange?: (metrics: QualityMetricsType) => void;
}

export default function QualityMetrics({ sceneData, onMetricsChange }: QualityMetricsProps) {
  const [metrics, setMetrics] = useState<QualityMetricsType>({
    emotionalResonance: 0,
    timingPrecision: 0,
    userComprehension: 0,
    cinematicLanguage: 0,
    adjectiveDensity: 0
  });

  const [improvement, setImprovement] = useState<number>(1);

  useEffect(() => {
    if (sceneData) {
      const comparative = calculateComparativeMetrics(sceneData);
      setMetrics(comparative);
      setImprovement(comparative.improvementOverCompetitors || 1);
      onMetricsChange?.(comparative);
    }
  }, [sceneData, onMetricsChange]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 70) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Professional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Developing';
  };

  const metricConfigs = [
    { key: 'emotionalResonance' as keyof QualityMetricsType, label: 'Emotional Resonance', description: 'Captures scene mood and feeling' },
    { key: 'timingPrecision' as keyof QualityMetricsType, label: 'Timing Precision', description: 'Optimal narration placement' },
    { key: 'userComprehension' as keyof QualityMetricsType, label: 'User Comprehension', description: 'Clarity for visually impaired' },
    { key: 'cinematicLanguage' as keyof QualityMetricsType, label: 'Cinematic Language', description: 'Film terminology and structure' },
    { key: 'adjectiveDensity' as keyof QualityMetricsType, label: 'Adjective Density', description: 'Descriptive richness' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Quality Metrics</h3>
        <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          {improvement.toFixed(1)}x better than standard
        </div>
      </div>
      
      <div className="space-y-4">
        {metricConfigs.map(({ key, label, description }) => (
          <div key={key} className="group">
            <div className="flex justify-between text-sm mb-1">
              <div>
                <span className="text-gray-600 font-medium">{label}</span>
                <div className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                  {description}
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium">{metrics[key]}%</span>
                <div className="text-xs text-gray-400">{getScoreLabel(metrics[key])}</div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreColor(metrics[key])}`}
                style={{ width: `${metrics[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quality Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Quality Score</span>
          <span className="font-semibold text-green-700">
            {Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 5)}%
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Based on professional audio description standards
        </div>
      </div>
    </div>
  );
}
