'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface CalculationResult {
  annualRevenue: number;
  costSavings: number;
  roiMonths: number;
  competitorCost: number;
  ourCost: number;
}

export default function BusinessCalculator() {
  const [librarySize, setLibrarySize] = useState(1000);
  const [tier, setTier] = useState<'premium' | 'standard' | 'free'>('premium');
  const [currentSolution, setCurrentSolution] = useState<'human' | 'api' | 'none'>('human');

  const calculateResults = (): CalculationResult => {
    const minutes = librarySize * 60;
    
    // Tier pricing
    const tierPrices = {
      premium: 5.00,
      standard: 1.00,
      free: 0.00
    };

    // Current solution costs
    const currentCosts = {
      human: 30.00,    // $30/minute for human writers
      api: 0.15,       // $0.15/minute for API + TTS
      none: 0.00
    };

    const ourAnnualCost = minutes * tierPrices[tier] * 4; // Quarterly refresh
    const competitorAnnualCost = minutes * currentCosts[currentSolution] * 4;
    
    const annualRevenue = tier === 'free' ? 0 : ourAnnualCost;
    const costSavings = Math.max(0, competitorAnnualCost - ourAnnualCost);
    
    // ROI calculation
    const setupCost = currentSolution === 'none' ? 5000 : 0;
    const monthlySavings = (costSavings + (tier !== 'free' ? ourAnnualCost / 12 : 0)) / 12;
    const roiMonths = monthlySavings > 0 ? Math.ceil(setupCost / monthlySavings) : 0;

    return {
      annualRevenue,
      costSavings,
      roiMonths,
      competitorCost: competitorAnnualCost,
      ourCost: ourAnnualCost
    };
  };

  const results = calculateResults();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="mr-3 text-blue-600" size={24} />
          Business Value Calculator
        </h2>
        <div className="text-sm text-gray-500">
          See the financial opportunity
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Library Size
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={librarySize}
                onChange={(e) => setLibrarySize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>100 hours</span>
                <span className="font-semibold text-blue-600">{librarySize.toLocaleString()} hours</span>
                <span>10,000 hours</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'premium', label: 'Premium', price: '$5.00/min', color: 'bg-blue-600' },
                { id: 'standard', label: 'Standard', price: '$1.00/min', color: 'bg-green-600' },
                { id: 'free', label: 'Free', price: '$0.00/min', color: 'bg-gray-600' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTier(option.id as any)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    tier === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Solution
            </label>
            <select
              value={currentSolution}
              onChange={(e) => setCurrentSolution(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="human">Human Writers ($30.00/min)</option>
              <option value="api">API Solutions ($0.15/min)</option>
              <option value="none">No Solution Yet</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Annual Financial Impact</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Potential Revenue:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${(results.annualRevenue / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Cost Savings:</span>
                <span className="text-xl font-semibold text-blue-600">
                  ${(results.costSavings / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">ROI Timeline:</span>
                <span className={`text-lg font-semibold ${
                  results.roiMonths <= 6 ? 'text-green-600' : 
                  results.roiMonths <= 12 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {results.roiMonths === 0 ? 'Immediate' : 
                   results.roiMonths === 1 ? '1 month' : 
                   `${results.roiMonths} months`}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp size={16} className="mr-2" />
              Cost Comparison
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Solution:</span>
                <span className="font-semibold">
                  ${(results.competitorCost / 1000000).toFixed(2)}M/year
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visual Narrator:</span>
                <span className="font-semibold text-green-600">
                  ${(results.ourCost / 1000000).toFixed(2)}M/year
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Net Benefit:</span>
                <span className="text-blue-600">
                  ${((results.costSavings + results.annualRevenue) / 1000000).toFixed(2)}M/year
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <DollarSign size={20} className="mx-auto text-green-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">7x</div>
              <div className="text-xs text-gray-600">Price Premium</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <TrendingUp size={20} className="mx-auto text-blue-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">908%</div>
              <div className="text-xs text-gray-600">Quality Advantage</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <Clock size={20} className="mx-auto text-purple-600 mb-1" />
              <div className="text-2xl font-bold text-gray-900">2,161x</div>
              <div className="text-xs text-gray-600">Faster</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
