import React from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import {
  BearingPressureResults,
  OverturningInputs,
} from '../../../calculations/overturning';

interface BearingPressureCardProps {
  bearing: BearingPressureResults;
  footingWidth: number;
  allowableCapacity: number;
  onAllowableCapacityChange: (val: number) => void;
}

export const BearingPressureCard: React.FC<BearingPressureCardProps> = ({
  bearing,
  footingWidth,
  allowableCapacity,
  onAllowableCapacityChange,
}) => {
  const {
    totalVerticalLoad,
    eccentricity,
    kernLimit,
    contactStatus,
    qMax,
    qMin,
    effectiveContactWidth,
    contactRatio,
    utilizationRatio,
    bearingStatus,
  } = bearing;

  const isWithinKern = eccentricity <= kernLimit + 1e-6;

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-850 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              SOIL BEARING PRESSURE CHECK
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              Middle-third kern analysis & contact pressure distribution under footing base
            </p>
          </div>
        </div>

        {/* Allowable capacity input */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="allowable-bearing-input"
            className="text-[11px] font-mono text-slate-400"
          >
            Allowable q_all:
          </label>
          <div className="flex items-center rounded border border-slate-700 bg-slate-800 px-2 py-0.5">
            <input
              id="allowable-bearing-input"
              type="number"
              min="1"
              step="5"
              value={allowableCapacity}
              onChange={e => onAllowableCapacityChange(parseFloat(e.target.value) || 100)}
              className="w-16 bg-transparent text-right font-mono text-xs text-white focus:outline-none"
            />
            <span className="ml-1 text-[10px] font-mono text-slate-400">kPa</span>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-900/60 p-4 gap-4 md:gap-0">
        {/* Maximum Bearing Pressure */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 mb-1">
            <span>PEAK PRESSURE</span>
            <span className="font-mono text-[11px] text-slate-400">q_max</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${
                bearingStatus === 'pass'
                  ? 'text-emerald-400'
                  : bearingStatus === 'fail'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {qMax >= 9999 ? '∞' : qMax.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">kPa</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/80 pt-1.5">
            <span className="flex justify-between">
              <span>Minimum pressure (q_min):</span>
              <span className="text-slate-300 font-semibold">{qMin.toFixed(1)} kPa</span>
            </span>
            <span className="flex justify-between">
              <span>Total vertical load (N):</span>
              <span className="text-slate-300">{totalVerticalLoad.toFixed(2)} kN/m</span>
            </span>
          </div>
        </div>

        {/* Eccentricity & Kern Check */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
            <span>ECCENTRICITY</span>
            <span className="font-mono text-[11px] text-slate-400">e = M / N</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {eccentricity.toFixed(3)}
            </span>
            <span className="text-xs font-mono text-slate-400">m</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/80 pt-1.5">
            <span className="flex justify-between">
              <span>Middle-third limit (B/6):</span>
              <span className="text-slate-300">{kernLimit.toFixed(3)} m</span>
            </span>
            <span className="flex justify-between items-center">
              <span>Kern status:</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isWithinKern
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {isWithinKern ? 'Within B/6 (No tension)' : 'Outside B/6 (Tension lift-off)'}
              </span>
            </span>
          </div>
        </div>

        {/* Contact Ratio & Capacity Check */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span>BEARING CONTACT</span>
            <span className="font-mono text-[11px] text-slate-400">B&apos; / B</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
              {contactRatio.toFixed(0)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({effectiveContactWidth.toFixed(2)}m of {footingWidth.toFixed(2)}m)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/80 pt-1.5">
            <span className="flex justify-between">
              <span>Utilization (q_max / q_all):</span>
              <span
                className={`font-bold ${
                  utilizationRatio <= 1.0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(utilizationRatio * 100).toFixed(1)}%
              </span>
            </span>
            <span className="flex justify-between">
              <span>Allowable capacity:</span>
              <span className="text-slate-300">{allowableCapacity.toFixed(0)} kPa</span>
            </span>
          </div>
        </div>
      </div>

      {/* Compliance / Status Footer */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 text-xs font-mono border-t ${
          bearingStatus === 'pass'
            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {bearingStatus === 'pass' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-bold tracking-wide">
            {bearingStatus === 'pass'
              ? `BEARING PASS — Peak pressure ${qMax.toFixed(1)} kPa ≤ Allowable ${allowableCapacity.toFixed(0)} kPa`
              : `BEARING FAIL — Peak pressure ${qMax.toFixed(1)} kPa exceeds allowable capacity (${allowableCapacity.toFixed(0)} kPa)`}
          </span>
        </div>
        <span className="text-[11px] opacity-80">
          Contact: {contactRatio.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};
