/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { CantileverWallCalculator } from './components/calculators/cantilever-wall/CantileverWallCalculator';
import { HipRafterCalculator } from './components/calculators/hip-rafter/HipRafterCalculator';
import { Wrench, ArrowLeft } from 'lucide-react';
import { NAVIGATION_CATEGORIES } from './types/navigation';

export default function App() {
  const [activeCalcId, setActiveCalcId] = useState<string>('footing-overturning');

  // Find active metadata
  const activeItem = React.useMemo(() => {
    for (const cat of NAVIGATION_CATEGORIES) {
      for (const item of cat.items) {
        if (item.id === activeCalcId) {
          return item;
        }
      }
    }
    return NAVIGATION_CATEGORIES[0].items[0];
  }, [activeCalcId]);

  return (
    <AppLayout
      activeCalculatorId={activeCalcId}
      onSelectCalculator={setActiveCalcId}
      activeTitle={activeItem?.title || 'Cantilever Wall Overturning'}
    >
      {activeCalcId === 'footing-overturning' ? (
        <CantileverWallCalculator />
      ) : activeCalcId === 'hip-rafter' ? (
        <HipRafterCalculator />
      ) : (
        <div className="py-16 px-4 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Wrench className="w-6 h-6 animate-spin-slow" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {activeItem.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {activeItem.description || 'This engineering calculation module is currently in development for a future release.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveCalcId('footing-overturning')}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cantilever Wall Calculator</span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
