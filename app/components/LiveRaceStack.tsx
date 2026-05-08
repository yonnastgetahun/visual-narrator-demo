  'use client';

  import { useState } from 'react';
  import LiveTimerDisplay from './LiveTimerDisplay';
  import SkeletonLoader from './SkeletonLoader';
  import { formatCost } from '../lib/costCalculator';

  export interface CompetitorStatus {
    status: 'idle' | 'requesting' | 'complete';
    latency: number | null;
    text: string;
    cost: number;
  }

  export interface RaceState {
    vn: {
      status: 'complete';
      latency: 2.4;
      text: string;
    };
    gpt4o: CompetitorStatus;
    claude: CompetitorStatus;
    gemini: CompetitorStatus;
    currentClip: number;
    totalClips: number;
  }

  export interface LiveRaceStackProps {
    raceState?: RaceState;
    onNextScene?: () => void;
  }

  export default function LiveRaceStack({
    raceState,
    onNextScene
  }: LiveRaceStackProps) {
    const [demoState] = useState<RaceState>({
      vn: {
        status: 'complete',
        latency: 2.4,
        text: 'A sleek silver sports car accelerates down an empty desert highway under brilliant blue skies, gleaming chrome details catching intense sunlight.'
      },
      gpt4o: {
        status: 'requesting',
        latency: null,
        text: '',
        cost: 0.083
      },
      claude: {
        status: 'requesting',
        latency: null,
        text: '',
        cost: 0.252
      },
      gemini: {
        status: 'requesting',
        latency: null,
        text: '',
        cost: 0.010
      },
      currentClip: 1,
      totalClips: 3
    });

    const currentState = raceState || demoState;

    return (
      <div className="relative w-full lg:hidden">
        <div className="flex flex-col space-y-4 pb-24">

          {/* Sticky Video Player Area */}
          <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm">
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-b-2 border-white/10">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-2">VIDEO PLAYER</div>
                <div className="text-white text-lg font-medium">Clip {currentState.currentClip} of {currentState.totalClips}</div>
                <div className="text-gray-400 text-xs mt-1">Action Scene</div>
              </div>
            </div>
          </div>

          {/* VN Card - Hero Position */}
          <div className="mx-4 bg-white/5 backdrop-blur-sm rounded-xl border-2 border-latency-fast overflow-hidden shadow-lg">
            <div className="p-4">
              {/* Header with Badge */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Our Engine</div>
                  <div className="text-lg font-bold text-white">Visual Narrator</div>
                </div>
                <div className="px-3 py-1 bg-latency-fast text-black text-xs font-bold rounded-full">
                  FREE
                </div>
              </div>

              {/* Status & Latency */}
              <div className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">STATUS</div>
                  <span className="inline-flex items-center gap-1 text-latency-fast font-medium text-sm">
                    <span>✓</span> Complete
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">LATENCY</div>
                  <div className="text-xl font-bold text-latency-fast tabular-nums">
                    2.4ms
                  </div>
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="text-xs text-gray-400 mb-2">OUTPUT</div>
                <div className="text-sm text-white leading-relaxed">
                  {currentState.vn.text}
                </div>
              </div>
            </div>
          </div>

          {/* GPT-4o Card - Competitor */}
          <div className="mx-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden opacity-60">
            <div className="p-4">
              {/* Header with Badge */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">OpenAI</div>
                  <div className="text-lg font-bold text-white">GPT-4o</div>
                </div>
                <div className="px-3 py-1 bg-latency-slow text-white text-xs font-bold rounded-full">
                  EXPENSIVE ({formatCost(currentState.gpt4o.cost)})
                </div>
              </div>

              {/* Status & Latency */}
              <div className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">STATUS</div>
                  {currentState.gpt4o.status === 'requesting' ? (
                    <span className="inline-flex items-center gap-1 text-latency-med font-medium text-sm animate-pulse-fast">
                      <span>●</span> Requesting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-latency-fast font-medium text-sm">
                      <span>✓</span> Complete
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">LATENCY</div>
                  {currentState.gpt4o.status === 'requesting' ? (
                    <LiveTimerDisplay autoStart className="scale-90 origin-left" />
                  ) : (
                    <div className="text-xl font-bold text-latency-slow tabular-nums">
                      {currentState.gpt4o.latency}ms
                    </div>
                  )}
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="text-xs text-gray-400 mb-2">OUTPUT</div>
                {currentState.gpt4o.status === 'requesting' ? (
                  <SkeletonLoader barCount={4} />
                ) : (
                  <div className="text-sm text-white leading-relaxed">
                    {currentState.gpt4o.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Claude Card - Competitor */}
          <div className="mx-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden opacity-60">
            <div className="p-4">
              {/* Header with Badge */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Anthropic</div>
                  <div className="text-lg font-bold text-white">Claude 3.5</div>
                </div>
                <div className="px-3 py-1 bg-latency-slow text-white text-xs font-bold rounded-full">
                  EXPENSIVE ({formatCost(currentState.claude.cost)})
                </div>
              </div>

              {/* Status & Latency */}
              <div className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">STATUS</div>
                  {currentState.claude.status === 'requesting' ? (
                    <span className="inline-flex items-center gap-1 text-latency-med font-medium text-sm animate-pulse-fast">
                      <span>●</span> Requesting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-latency-fast font-medium text-sm">
                      <span>✓</span> Complete
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">LATENCY</div>
                  {currentState.claude.status === 'requesting' ? (
                    <LiveTimerDisplay autoStart className="scale-90 origin-left" />
                  ) : (
                    <div className="text-xl font-bold text-latency-slow tabular-nums">
                      {currentState.claude.latency}ms
                    </div>
                  )}
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="text-xs text-gray-400 mb-2">OUTPUT</div>
                {currentState.claude.status === 'requesting' ? (
                  <SkeletonLoader barCount={4} />
                ) : (
                  <div className="text-sm text-white leading-relaxed">
                    {currentState.claude.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gemini Card - Competitor */}
          <div className="mx-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden opacity-60">
            <div className="p-4">
              {/* Header with Badge */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Google</div>
                  <div className="text-lg font-bold text-white">Gemini 2.5 Flash</div>
                </div>
                <div className="px-3 py-1 bg-latency-fast text-black text-xs font-bold rounded-full">
                  CHEAP ({formatCost(currentState.gemini.cost)})
                </div>
              </div>

              {/* Status & Latency */}
              <div className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">STATUS</div>
                  {currentState.gemini.status === 'requesting' ? (
                    <span className="inline-flex items-center gap-1 text-latency-med font-medium text-sm animate-pulse-fast">
                      <span>●</span> Requesting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-latency-fast font-medium text-sm">
                      <span>✓</span> Complete
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">LATENCY</div>
                  {currentState.gemini.status === 'requesting' ? (
                    <LiveTimerDisplay autoStart className="scale-90 origin-left" />
                  ) : (
                    <div className="text-xl font-bold text-latency-slow tabular-nums">
                      {currentState.gemini.latency}ms
                    </div>
                  )}
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="text-xs text-gray-400 mb-2">OUTPUT</div>
                {currentState.gemini.status === 'requesting' ? (
                  <SkeletonLoader barCount={4} />
                ) : (
                  <div className="text-sm text-white leading-relaxed">
                    {currentState.gemini.text}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Floating Next Scene Button */}
        {currentState.currentClip < currentState.totalClips && (
          <button
            onClick={onNextScene}
            className="fixed bottom-4 right-4 z-40 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full shadow-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 flex items-center gap-2 animate-pulse-fast"
            style={{ boxShadow: 'var(--shadow-neon)' }}
          >
            <span>TEST NEXT SCENE ({currentState.currentClip + 1}/{currentState.totalClips})</span>
            <span className="text-lg">➔</span>
          </button>
        )}
      </div>
    );
  }
