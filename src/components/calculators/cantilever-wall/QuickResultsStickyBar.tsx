import React from 'react';
import { OverturningResults } from '../../../calculations/overturning';

interface QuickResultsStickyBarProps {
  results: OverturningResults;
  requiredRatio?: number | null;
}

export const QuickResultsStickyBar: React.FC<QuickResultsStickyBarProps> = ({
  results,
  requiredRatio,
}) => {
  const {
    overturningMoment,
    totalResistingMoment,
    overturningRatio,
    designRatio,
    designStandard,
    bearing,
    status,
  } = results;

  const activeRatio = designStandard === 'AS_NZS_1170' ? designRatio : overturningRatio;

  return (
    <div className="lg:hidden sticky bottom-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-2.5 shadow-2xl flex items-center justify-between font-mono text-xs">
      <div className="flex items-center gap-3">
        <div>
          <span className="text-[10px] text-rose-400 block uppercase font-bold">M_OT</span>
          <span className="font-bold text-white text-sm">
            {overturningMoment.toFixed(1)}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">kNm</span>
          </span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div>
          <span className="text-[10px] text-emerald-400 block uppercase font-bold">M_R</span>
          <span className="font-bold text-white text-sm">
            {totalResistingMoment.toFixed(1)}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">kNm</span>
          </span>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div className="hidden sm:block">
          <span className="text-[10px] text-amber-400 block uppercase font-bold">q_max</span>
          <span className="font-bold text-white text-xs">
            {bearing.qMax.toFixed(0)}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">kPa</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="text-[10px] text-cyan-400 block uppercase font-bold">
            {designStandard === 'AS_NZS_1170' ? 'Ratio' : 'FS'}
          </span>
          <span
            className={`font-black text-base ${
              status === 'pass'
                ? 'text-emerald-400'
                : status === 'fail'
                ? 'text-rose-400'
                : 'text-cyan-300'
            }`}
          >
            {activeRatio !== null ? activeRatio.toFixed(2) : 'N/A'}
          </span>
        </div>
        {requiredRatio && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              status === 'pass'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};
