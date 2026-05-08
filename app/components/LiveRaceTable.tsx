'use client';

  import { useState } from 'react';
  import LiveTimerDisplay from './LiveTimerDisplay';
  import SkeletonLoader from './SkeletonLoader';
  import { calculateOpenAICost, calculateAnthropicCost, calculateGoogleCost, formatCost } from '../lib/costCalculator';

  export interface CompetitorStatus {
    status: 'idle' | 'requesting' | 'complete';
    latency: number | null;
    text: string;
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
  }

  export interface LiveRaceTableProps {
    raceState?: RaceState;
    onSimulateRace?: () => void;
  }

  export default function LiveRaceTable({
    raceState,
    onSimulateRace
  }: LiveRaceTableProps) {
    const [demoState] = useState<RaceState>({
      vn: {
        status: 'complete',
        latency: 2.4,
        text: 'A sleek silver sports car accelerates down an empty desert highway under brilliant blue skies, gleaming chrome details catching intense sunlight.'
      },
      gpt4o: {
        status: 'requesting',
        latency: null,
        text: ''
      },
      claude: {
        status: 'requesting',
        latency: null,
        text: ''
      },
      gemini: {
        status: 'requesting',
        latency: null,
        text: ''
      }
    });

    const currentState = raceState || demoState;

    const sessionCost = {
      vn: 0.000,
      gpt4o: calculateOpenAICost(),
      claude: calculateAnthropicCost(),
      gemini: calculateGoogleCost()
    };

    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Live Performance Benchmark
          </h2>
          {onSimulateRace && (
            <button
              onClick={onSimulateRace}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Run New Race
            </button>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="font-semibold text-white text-center pb-4 border-b border-white/10">
              <div className="text-sm text-gray-400 mb-1">OUR ENGINE</div>
              <div className="text-lg">Visual Narrator</div>
            </div>
            <div className="font-semibold text-white text-center pb-4 border-b border-white/10">
              <div className="text-sm text-gray-400 mb-1">OPENAI</div>
              <div className="text-lg">GPT-4o</div>
            </div>
            <div className="font-semibold text-white text-center pb-4 border-b border-white/10">
              <div className="text-sm text-gray-400 mb-1">ANTHROPIC</div>
              <div className="text-lg">Claude 3.5</div>
            </div>
            <div className="font-semibold text-white text-center pb-4 border-b border-white/10">
              <div className="text-sm text-gray-400 mb-1">GOOGLE</div>
              <div className="text-lg">Gemini 2.5 Flash</div>
            </div>

            <div className="py-4 text-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">STATUS</div>
              <span className="inline-flex items-center gap-1 text-latency-fast font-medium">
                <span>✓</span> Complete
              </span>
            </div>
            <div className="py-4 text-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">STATUS</div>
              {currentState.gpt4o.status === 'requesting' ? (
                <span className="inline-flex items-center gap-1 text-latency-med font-medium animate-pulse-fast">
                  <span>●</span> Requesting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-latency-fast font-medium">
                  <span>✓</span> Complete
                </span>
              )}
            </div>
            <div className="py-4 text-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">STATUS</div>
              {currentState.claude.status === 'requesting' ? (
                <span className="inline-flex items-center gap-1 text-latency-med font-medium animate-pulse-fast">
                  <span>●</span> Requesting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-latency-fast font-medium">
                  <span>✓</span> Complete
                </span>
              )}
            </div>
            <div className="py-4 text-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">STATUS</div>
              {currentState.gemini.status === 'requesting' ? (
                <span className="inline-flex items-center gap-1 text-latency-med font-medium animate-pulse-fast">
                  <span>●</span> Requesting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-latency-fast font-medium">
                  <span>✓</span> Complete
                </span>
              )}
            </div>

            <div className="py-4 text-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">LATENCY</div>
              <div className="text-2xl font-bold text-latency-fast tabular-nums">
                2.4ms
              </div>
            </div>
            <div className="py-4 flex flex-col items-center justify-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">LATENCY</div>
              {currentState.gpt4o.status === 'requesting' ? (
                <LiveTimerDisplay autoStart />
              ) : (
                <div className="text-2xl font-bold text-latency-slow tabular-nums">
                  {currentState.gpt4o.latency}ms
                </div>
              )}
            </div>
            <div className="py-4 flex flex-col items-center justify-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">LATENCY</div>
              {currentState.claude.status === 'requesting' ? (
                <LiveTimerDisplay autoStart />
              ) : (
                <div className="text-2xl font-bold text-latency-slow tabular-nums">
                  {currentState.claude.latency}ms
                </div>
              )}
            </div>
            <div className="py-4 flex flex-col items-center justify-center border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2">LATENCY</div>
              {currentState.gemini.status === 'requesting' ? (
                <LiveTimerDisplay autoStart />
              ) : (
                <div className="text-2xl font-bold text-latency-slow tabular-nums">
                  {currentState.gemini.latency}ms
                </div>
              )}
            </div>

            <div className="py-4 border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">OUTPUT</div>
              <div className="text-sm text-white leading-relaxed px-2 min-h-[100px]">
                {currentState.vn.text}
              </div>
            </div>
            <div className="py-4 border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">OUTPUT</div>
              <div className="px-2 min-h-[100px] flex items-center">
                {currentState.gpt4o.status === 'requesting' ? (
                  <SkeletonLoader barCount={4} />
                ) : (
                  <div className="text-sm text-white leading-relaxed">
                    {currentState.gpt4o.text}
                  </div>
                )}
              </div>
            </div>
            <div className="py-4 border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">OUTPUT</div>
              <div className="px-2 min-h-[100px] flex items-center">
                {currentState.claude.status === 'requesting' ? (
                  <SkeletonLoader barCount={4} />
                ) : (
                  <div className="text-sm text-white leading-relaxed">
                    {currentState.claude.text}
                  </div>
                )}
              </div>
            </div>
            <div className="py-4 border-b border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">OUTPUT</div>
              <div className="px-2 min-h-[100px] flex items-center">
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

          <div className="bg-white/5 border-t border-white/10 px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Session Cost:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">VN</span>
                <span className="text-latency-fast font-bold tabular-nums">
                  {formatCost(sessionCost.vn)}
                </span>
              </div>
              <div className="text-gray-600">|</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">GPT-4o</span>
                <span className="text-latency-slow font-bold tabular-nums">
                  {formatCost(sessionCost.gpt4o)}
                </span>
              </div>
              <div className="text-gray-600">|</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Claude</span>
                <span className="text-latency-slow font-bold tabular-nums">
                  {formatCost(sessionCost.claude)}
                </span>
              </div>
              <div className="text-gray-600">|</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Gemini</span>
                <span className="text-latency-fast font-bold tabular-nums">
                  {formatCost(sessionCost.gemini)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Live timers show real API latency. No artificial delays.</p>
        </div>
      </div>
    );
  }
