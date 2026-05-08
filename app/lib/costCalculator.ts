/**
 * Cost Calculator for Visual Narrator v2.3 "Radical Transparency"
 * REAL pricing from spec: Frame-based (OpenAI/Claude) vs Time-based (Google)
 */

// REAL pricing from Visual Narrator Architecture v2.3dec14.md lines 202-209
export const REAL_PRICING = {
  // Frame-based pricing (Jump - shows cost suddenly when response arrives)
  OPENAI_GPT4O: {
    pricePerMillionTokens: 2.50, // $2.50 per 1M tokens
    tokensPerFrame: 1105, // 85 base + 170 × 6 tiles for 1080p
    calculateCost: (frameCount: number): number => {
      return (2.50 / 1_000_000) * 1105 * frameCount;
    }
  },
  
  ANTHROPIC_CLAUDE: {
    pricePerMillionTokens: 3.00, // $3.00 per 1M tokens
    tokensPerFrame: 2800, // (1920×1080)/750
    calculateCost: (frameCount: number): number => {
      return (3.00 / 1_000_000) * 2800 * frameCount;
    }
  },
  
  // Time-based pricing (Crawl - increments gradually during processing)
  GOOGLE_GEMINI: {
    pricePerMillionTokens: 1.25, // $1.25 per 1M tokens
    tokensPerSecond: 263, // Video = 263 tokens/sec
    calculateCost: (seconds: number): number => {
      return (1.25 / 1_000_000) * 263 * seconds;
    }
  },
  
  // Visual Narrator (free infrastructure)
  VISUAL_NARRATOR: {
    costPerClip: 0.000,
    fixedInfrastructureMonthly: 900, // $900/month for 1 GH200
  }
} as const;

export type Provider = keyof typeof REAL_PRICING;

/**
 * Calculate cost for a 30-second clip (standard demo length)
 */
export function calculateClipCost(provider: Exclude<Provider, 'VISUAL_NARRATOR'>): number {
  switch(provider) {
    case 'OPENAI_GPT4O':
      return REAL_PRICING.OPENAI_GPT4O.calculateCost(30); // 30 frames @ 1fps
    case 'ANTHROPIC_CLAUDE':
      return REAL_PRICING.ANTHROPIC_CLAUDE.calculateCost(30); // 30 frames @ 1fps
    case 'GOOGLE_GEMINI':
      return REAL_PRICING.GOOGLE_GEMINI.calculateCost(30); // 30 seconds
    default:
      return 0;
  }
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(cost);
}

// Convenience functions
export function calculateOpenAICost(): number { return calculateClipCost('OPENAI_GPT4O'); }
export function calculateAnthropicCost(): number { return calculateClipCost('ANTHROPIC_CLAUDE'); }
export function calculateGoogleCost(): number { return calculateClipCost('GOOGLE_GEMINI'); }

/**
 * Get cost explanation for display
 */
export function getCostExplanation(provider: Provider): string {
  switch(provider) {
    case 'OPENAI_GPT4O':
      return '$2.50/1M tokens × 1,105 tokens/frame × 30 frames';
    case 'ANTHROPIC_CLAUDE':
      return '$3.00/1M tokens × 2,800 tokens/frame × 30 frames';
    case 'GOOGLE_GEMINI':
      return '$1.25/1M tokens × 263 tokens/sec × 30 sec';
    case 'VISUAL_NARRATOR':
      return 'Fixed infrastructure: $900/month';
  }
}
