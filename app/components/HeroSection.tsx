'use client';

import { useSearchParams } from 'next/navigation';

export default function HeroSection() {
  const searchParams = useSearchParams();
  const token = searchParams.get('access_token');
  const isAuthenticated = token === 'vn_investor_2025';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Visual Narrator v2.3
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time AI Video Benchmark • Radical Transparency
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Latency Stat */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="text-sm text-gray-400 mb-2">LATENCY</div>
            <div className="text-3xl font-bold text-latency-fast">2.4ms</div>
            <div className="text-sm text-gray-500 mt-2">Real-time streaming</div>
          </div>

          {/* Accuracy Stat */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="text-sm text-gray-400 mb-2">ACCURACY</div>
            <div className="text-3xl font-bold text-blue-500">71.6%</div>
            <div className="text-sm text-gray-500 mt-2">Scene understanding</div>
          </div>

          {/* Cost Stat */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="text-sm text-gray-400 mb-2">LIVE COST</div>
            <div className="text-3xl font-bold text-purple-400">VN: $0.00</div>
            <div className="text-sm text-gray-500 mt-2">vs Others: $0.15/clip</div>
          </div>
        </div>

        {/* Auth & CTA Section */}
        <div className="text-center pt-6 border-t border-gray-800">
          {isAuthenticated ? (
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Investor Access Granted
              </div>
              <div>
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-xl font-bold text-white shadow-lg hover:shadow-green-500/25 transition-all">
                  START LIVE DEMO →
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  Compare real latency & cost across AI providers
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-full mb-4">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                Demo Access Required
              </div>
              <div>
                <button className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl text-xl font-bold text-gray-300 shadow-lg transition-all">
                  Request Demo Access
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  Contact for investor preview token
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Demo Hint */}
        {!isAuthenticated && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>
              <span className="font-mono">Hint:</span> Add{' '}
              <code className="bg-gray-900 px-2 py-1 rounded">?access_token=vn_investor_2025</code>{' '}
              to URL for instant access
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
