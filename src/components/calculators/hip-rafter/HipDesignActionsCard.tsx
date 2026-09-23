import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Activity,
  Maximize2,
  ShieldAlert,
} from 'lucide-react';
import {
  HipRafterInputs,
  HipRafterResults,
} from '../../../calculations/hipRafter';

interface HipDesignActionsCardProps {
  inputs: HipRafterInputs;
  results: HipRafterResults;
}

export const HipDesignActionsCard: React.FC<HipDesignActionsCardProps> = ({
  inputs,
  results,
}) => {
  const { governingActions, section, geometry } = results;

  const isPass = governingActions.overallStatus === 'pass';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Governing Structural Design Actions (M*, V*, N*, R*)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Values for timber / steel hip rafter & support tie-down design
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
              isPass
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-rose-950 text-rose-300 border border-rose-700/60'
            }`}
          >
            {isPass ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>MEMBER ADEQUATE (PASS)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>OVERSTRESSED (FAIL)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid of 4 Key Design Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* 1. Design Moment M* */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-cyan-300">Design Moment (M*)</span>
            <span className="text-[10px] text-slate-500">Bending</span>
          </div>
          <div className="text-xl font-black text-cyan-400">
            {governingActions.mStar.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">kNm</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
            <span className="text-slate-500">Cap φM_n: {section.bendingCapacityKNm.toFixed(2)} kNm</span>
            <span
              className={`font-bold ${
                governingActions.bendingUtilization <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(governingActions.bendingUtilization * 100).toFixed(0)}% Util
            </span>
          </div>
        </div>

        {/* 2. Design Shear V* */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-emerald-300">Design Shear (V*)</span>
            <span className="text-[10px] text-slate-500">Transverse</span>
          </div>
          <div className="text-xl font-black text-emerald-400">
            {governingActions.vStar.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">kN</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
            <span className="text-slate-500">Cap φV_n: {section.shearCapacityKN.toFixed(2)} kN</span>
            <span
              className={`font-bold ${
                governingActions.shearUtilization <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(governingActions.shearUtilization * 100).toFixed(0)}% Util
            </span>
          </div>
        </div>

        {/* 3. Axial Thrust N* */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-300">Axial Thrust (N*)</span>
            <span className="text-[10px] text-slate-500">Along Rake</span>
          </div>
          <div className="text-xl font-black text-amber-400">
            {governingActions.axialThrustKN.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">kN</span>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
            From {geometry.hipSlopeAngleDeg.toFixed(1)}° rafter slope thrust
          </div>
        </div>

        {/* 4. Serviceability Deflection */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-purple-300">Deflection (δ)</span>
            <span className="text-[10px] text-slate-500">G + 0.7Q</span>
          </div>
          <div className="text-xl font-black text-purple-400">
            {governingActions.serviceDeflectionMm.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
            <span className="text-slate-500">Limit: {governingActions.allowableDeflectionMm.toFixed(1)} mm</span>
            <span
              className={`font-bold ${
                governingActions.deflectionUtilization <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(governingActions.deflectionUtilization * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Support Reactions & Tie-Down Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200">Support Reactions & Uplift Tie-Down Requirements:</span>
          <span className="text-[11px] text-cyan-400">Ultimate Limit State (ULS)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Eaves Support Reaction */}
          <div className="space-y-1.5 p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>1. Eaves Wall Plate Support:</span>
              </span>
              <span className="text-[10px] text-slate-500">Node x = 0</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Governing Downward Reaction:</span>
              <strong className="text-white text-sm">
                R*_eaves = {governingActions.rEavesMaxDownKN.toFixed(2)} kN
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Net Wind Hold-Down Uplift:</span>
              </span>
              <strong className="text-cyan-400">
                {governingActions.eavesTieDownUpliftKN > 0
                  ? `${governingActions.eavesTieDownUpliftKN.toFixed(2)} kN (Uplift Tie-Down Req.)`
                  : '0.00 kN (Self-weight Restrains)'}
              </strong>
            </div>
          </div>

          {/* Ridge / Apex Support Reaction */}
          <div className="space-y-1.5 p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>2. Ridge / Apex Girder Support:</span>
              </span>
              <span className="text-[10px] text-slate-500">Node x = L_true</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Governing Downward Reaction:</span>
              <strong className="text-white text-sm">
                R*_ridge = {governingActions.rRidgeMaxDownKN.toFixed(2)} kN
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Net Wind Hold-Down Uplift:</span>
              </span>
              <strong className="text-cyan-400">
                {governingActions.ridgeTieDownUpliftKN > 0
                  ? `${governingActions.ridgeTieDownUpliftKN.toFixed(2)} kN (Uplift Tie-Down Req.)`
                  : '0.00 kN (Self-weight Restrains)'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
