import React from 'react';
import { ShieldAlert, BookOpen, Check, Layers } from 'lucide-react';
import { AS1170Combo, DesignStandard } from '../../../calculations/overturning';

interface StandardsToggleProps {
  standard: DesignStandard;
  onStandardChange: (standard: DesignStandard) => void;
  as1170Combo: AS1170Combo;
  onComboChange: (combo: AS1170Combo) => void;
}

export const StandardsToggle: React.FC<StandardsToggleProps> = ({
  standard,
  onStandardChange,
  as1170Combo,
  onComboChange,
}) => {
  return (
    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Design Standard & Load Combinations</span>
        </label>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
          {standard === 'AS_NZS_1170' ? 'AS/NZS 1170.0:2002' : 'Working Stress (ASD)'}
        </span>
      </div>

      {/* Primary Toggle: ASD vs Australian Standards */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onStandardChange('ASD')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg border font-mono text-xs transition ${
            standard === 'ASD'
              ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-xs'
              : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold">Working Stress Design (ASD)</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Service Loads • FS ≥ 1.50</span>
        </button>

        <button
          type="button"
          onClick={() => onStandardChange('AS_NZS_1170')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg border font-mono text-xs transition ${
            standard === 'AS_NZS_1170'
              ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-xs'
              : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold flex items-center gap-1 text-cyan-300">
            <span>Australian Standards</span>
            <span className="text-[10px] px-1 bg-cyan-800/80 rounded">AS 1170</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Ultimate Limit State (ULS)</span>
        </button>
      </div>

      {/* Sub-combinations for Australian Standards */}
      {standard === 'AS_NZS_1170' && (
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-cyan-400">
              <Layers className="w-3.5 h-3.5" />
              <span>AS/NZS 1170.0 Table 4.1 Combinations:</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => onComboChange('stability_0.9G_Wu')}
              className={`p-2 rounded border text-left transition ${
                as1170Combo === 'stability_0.9G_Wu'
                  ? 'border-cyan-500 bg-cyan-950/80 text-white font-semibold'
                  : 'border-slate-800 bg-slate-850/60 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-cyan-300 font-bold">0.9G + 1.0W_u</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Stability Overturning (Min dead load)
              </div>
            </button>

            <button
              type="button"
              onClick={() => onComboChange('bearing_1.2G_Wu_psiQ')}
              className={`p-2 rounded border text-left transition ${
                as1170Combo === 'bearing_1.2G_Wu_psiQ'
                  ? 'border-cyan-500 bg-cyan-950/80 text-white font-semibold'
                  : 'border-slate-800 bg-slate-850/60 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-cyan-300 font-bold">1.2G + 1.0W_u + 0.4Q</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ULS Bearing (Wind critical)
              </div>
            </button>

            <button
              type="button"
              onClick={() => onComboChange('bearing_1.2G_1.5Q')}
              className={`p-2 rounded border text-left transition ${
                as1170Combo === 'bearing_1.2G_1.5Q'
                  ? 'border-cyan-500 bg-cyan-950/80 text-white font-semibold'
                  : 'border-slate-800 bg-slate-850/60 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-cyan-300 font-bold">1.2G + 1.5Q</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ULS Bearing (Gravity critical)
              </div>
            </button>
          </div>

          <p className="text-[10px] font-mono text-slate-500 pt-0.5">
            Per AS/NZS 1170.0:2002 Clause 4.2.2: Stabilizing components are reduced by factor 0.90 to assess equilibrium stability against overturning.
          </p>
        </div>
      )}
    </div>
  );
};
