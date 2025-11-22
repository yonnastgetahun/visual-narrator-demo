// Integrate timing detection with existing QualityMetrics
import { enhanceMetricsWithTiming } from './timing-detection';

export const integrateTimingIntelligence = (sceneData: any, currentMetrics: any) => {
  return enhanceMetricsWithTiming(sceneData, currentMetrics);
};

// Hook into the existing scene analysis
export const analyzeSceneTiming = async (scene: any) => {
  console.log(`🕒 Analyzing timing intelligence for: ${scene.title}`);
  
  // This would be connected to actual audio analysis
  const timingMetrics = {
    hasTimingIntelligence: true,
    optimalNarrationPoints: 3, // Would be calculated from audio analysis
    averageGapDuration: 2.1, // seconds
    timingPrecision: 88 // from timing-detection.ts
  };
  
  return timingMetrics;
};

// Update QualityMetrics to use timing intelligence
export const updateQualityMetricsWithTiming = (sceneData: any, existingMetrics: any) => {
  const sceneType = sceneData?.category || 'drama';
  const timingEnhanced = integrateTimingIntelligence(sceneData, existingMetrics);
  
  return {
    ...timingEnhanced,
    timingIntelligence: true,
    lastUpdated: new Date().toISOString()
  };
};
