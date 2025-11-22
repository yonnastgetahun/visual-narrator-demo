'use client';

import { Calculator } from 'lucide-react';
import { useState } from 'react';
import BusinessCalculator from './BusinessCalculator';

export default function CalculatorButton() {
  const [showCalculator, setShowCalculator] = useState(false);

  const toggleCalculator = () => {
    setShowCalculator(!showCalculator);
    if (!showCalculator) {
      // Scroll to calculator when showing
      setTimeout(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <button 
        onClick={toggleCalculator}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold mb-8"
      >
        <Calculator size={20} />
        {showCalculator ? 'Hide Financial Opportunity' : 'See the Financial Opportunity'}
      </button>

      {showCalculator && (
        <div id="calculator" className="mt-8 animate-fade-in">
          <BusinessCalculator />
        </div>
      )}
    </>
  );
}
