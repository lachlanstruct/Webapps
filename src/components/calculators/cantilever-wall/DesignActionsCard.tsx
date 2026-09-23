import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import {
  OverturningInputs,
  OverturningResults,
} from '../../../calculations/overturning';
import { MathEquation } from '../../common/MathEquation';

interface DesignActionsCardProps {
  inputs: OverturningInputs;
  results: OverturningResults;
}

export const DesignActionsCard: React.FC<DesignActionsCardProps> = ({
  inputs,
  results,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showFormulaNotes, setShowFormulaNotes] = useState(false);

  const { designActions, designStandard } = results;
  const { wall, toe, heel, footing } = designActions;

  const isAS = designStandard === 'AS_NZS_1170';

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-850 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-750 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Structural Design Actions (<span className="text-cyan-400 font-mono">M*, V*, N*</span>)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-900/50 text-cyan-300 border border-cyan-700/60">
                {isAS ? 'AS 3600 / AS 1170 ULS' : 'ASD / Working Stress'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Critical governing internal forces for reinforced concrete wall stem & footing slab sizing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormulaNotes(!showFormulaNotes)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            title="Toggle code equations & references"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showFormulaNotes ? 'Hide Equations' : 'Show Equations'}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle section"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Informational Code Note */}
          {showFormulaNotes && (
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono space-y-2 text-slate-300">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Basis of Section Design Actions (Limit State Design / AS 3600:2018):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>
                  <strong className="text-white">Wall Stem:</strong> Cantilever action under lateral wind and stem loads evaluated at the stem-footing construction joint interface.
                </li>
                <li>
                  <strong className="text-white">Footing Toe Cantilever:</strong> Upward soil bearing reaction acting on projection <span className="text-cyan-300">L_toe</span> minus relieving footing slab dead weight (0.9G). Governs bottom longitudinal steel reinforcement (<span className="text-cyan-300">M*</span>) and one-way shear (<span className="text-cyan-300">V* at d</span>).
                </li>
                <li>
                  <strong className="text-white">Footing Heel Cantilever:</strong> Downward slab dead weight (1.2G) + surcharge minus upward soil pressure acting on projection <span className="text-cyan-300">L_heel</span>. Governs top steel reinforcement (<span className="text-cyan-300">M*</span>).
                </li>
              </ul>
            </div>
          )}

          {/* 3 Main Action Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Wall Stem Base Section */}
            <div className="rounded-xl border border-slate-750 bg-slate-900/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>1. Wall Stem (Base)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    H = {wall.stemHeight.toFixed(2)}m, t = {wall.stemThickness.toFixed(2)}m
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mb-3">
                  Critical section at top of footing interface
                </p>

                <div className="space-y-2.5 font-mono">
                  {/* Bending Moment M* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Design Moment (M*):</span>
                      <span className="text-[10px] text-slate-500">Stem bending tension</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-cyan-400">
                        {wall.mStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kNm/m</span>
                    </div>
                  </div>

                  {/* Shear Force V* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Design Shear (V*):</span>
                      <span className="text-[10px] text-slate-500">Stem joint shear</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-cyan-400">
                        {wall.vStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kN/m</span>
                    </div>
                  </div>

                  {/* Axial Force N* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Design Axial (N*):</span>
                      <span className="text-[10px] text-slate-500">Stem self-weight compression</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-cyan-400">
                        {wall.nStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kN/m</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Reinforcement:</span>
                <span className="text-cyan-300 font-semibold">Tension face (windward)</span>
              </div>
            </div>

            {/* 2. Footing Toe Cantilever */}
            <div className="rounded-xl border border-slate-750 bg-slate-900/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>2. Footing Toe (Front Face)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    L_toe = {toe.length.toFixed(3)}m
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mb-3">
                  Critical section at front face of stem (Sagging / Bottom Tension)
                </p>

                <div className="space-y-2.5 font-mono">
                  {/* Bending Moment M* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Toe Moment (M*):</span>
                      <span className="text-[10px] text-slate-500">At stem face</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">
                        {toe.mStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kNm/m</span>
                    </div>
                  </div>

                  {/* Shear Force at Face V* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Face Shear (V*):</span>
                      <span className="text-[10px] text-slate-500">At stem face</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">
                        {toe.vStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kN/m</span>
                    </div>
                  </div>

                  {/* Shear Force at distance d V*_d */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Critical Shear (V* at d):</span>
                      <span className="text-[10px] text-slate-500">d = {(toe.effectiveDepthD * 1000).toFixed(0)} mm</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">
                        {toe.vStarAtD.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kN/m</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Reinforcement:</span>
                <span className="text-emerald-300 font-semibold">Bottom Layer Steel</span>
              </div>
            </div>

            {/* 3. Footing Heel Cantilever */}
            <div className="rounded-xl border border-slate-750 bg-slate-900/80 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>3. Footing Heel (Back Face)</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    L_heel = {heel.length.toFixed(3)}m
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mb-3">
                  Critical section at back face of stem (Hogging / Top Tension)
                </p>

                <div className="space-y-2.5 font-mono">
                  {/* Bending Moment M* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Heel Moment (M*):</span>
                      <span className="text-[10px] text-slate-500">At back face</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-400">
                        {heel.mStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kNm/m</span>
                    </div>
                  </div>

                  {/* Shear Force at Face V* */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Heel Shear (V*):</span>
                      <span className="text-[10px] text-slate-500">At back face</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-400">
                        {heel.vStar.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kN/m</span>
                    </div>
                  </div>

                  {/* Downward Pressure */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Heel Downward w:</span>
                      <span className="text-[10px] text-slate-500">Slab wt + Surcharge</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-amber-400">
                        {heel.downwardPressure.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">kPa</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Reinforcement:</span>
                <span className="text-amber-300 font-semibold">Top Layer Steel</span>
              </div>
            </div>
          </div>

          {/* 4. Overall Footing Foundation Summary Strip */}
          <div className="p-3.5 rounded-xl border border-slate-750 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase text-[11px]">
                Foundation Base Summary:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <span className="text-slate-400 text-[11px]">Total N*: </span>
                <strong className="text-white">{footing.nStar.toFixed(2)} kN/m</strong>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Total V* (Base): </span>
                <strong className="text-white">{footing.vStar.toFixed(2)} kN/m</strong>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Max Bearing q*: </span>
                <strong className="text-cyan-400">{footing.qStarMax.toFixed(1)} kPa</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Base Sliding (φV_u): </span>
                <strong className="text-white">{footing.slidingCapacity.toFixed(2)} kN/m</strong>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    footing.slidingStatus === 'pass'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {footing.slidingStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
