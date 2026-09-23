import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  HelpCircle,
  ShieldCheck,
  Scale,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { OverturningInputs, OverturningResults } from '../../../calculations/overturning';

interface ResultSummaryCardProps {
  inputs: OverturningInputs;
  results: OverturningResults;
  onRequiredRatioChange: (val: number | null) => void;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({
  inputs,
  results,
  onRequiredRatioChange,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [reqInput, setReqInput] = useState<string>(
    inputs.requiredRatio ? inputs.requiredRatio.toString() : ''
  );

  const {
    overturningMoment,
    totalResistingMoment,
    overturningRatio,
    footingResistingMoment,
    wallResistingMoment,
    additionalResistingMoment,
    additionalOverturningMoment,
    horizontalForce,
    wallBaseMoment,
    shearTransferMoment,
    designStandard,
    standardFactors,
    factoredResistingMoment,
    factoredOverturningMoment,
    designRatio,
    status,
    ratioMargin,
    bearing,
  } = results;

  const isAS1170 = designStandard === 'AS_NZS_1170';
  const displayRatio = isAS1170 ? designRatio : overturningRatio;

  const handleReqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReqInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      onRequiredRatioChange(parsed);
    } else if (val.trim() === '') {
      onRequiredRatioChange(null);
    }
  };

  const generateSummaryText = () => {
    return [
      '==================================================',
      'CANTILEVER WALL OVERTURNING STABILITY CHECK',
      `Standard: ${standardFactors.name} (${standardFactors.codeReference})`,
      'Analysis basis: 1.0 m strip perpendicular to wall',
      '==================================================',
      `Wind pressure (p):        ${inputs.windPressure.toFixed(2)} kPa`,
      `Multiplier coefficient (C):${inputs.windCoefficient.toFixed(2)}`,
      `Design wind pressure (p_d):${results.designPressure.toFixed(3)} kPa`,
      `Horizontal line load (w):  ${results.lineLoad.toFixed(3)} kN/m`,
      '',
      `Wall height (z):          ${inputs.wallHeight.toFixed(2)} m`,
      `Footing dimensions:       ${inputs.footingWidth.toFixed(2)} m (B) × ${inputs.footingDepth.toFixed(2)} m (D)`,
      `Wall self-weight:         ${inputs.includeWallWeight ? `Included (t = ${inputs.wallThickness.toFixed(2)} m, γ_w = ${inputs.wallUnitWeight} kN/m³)` : 'Not included'}`,
      `Wind direction:           ${inputs.windDirection === 'left_to_right' ? 'Left to Right (→)' : 'Right to Left (←)'}`,
      `Active overturning toe:   ${results.activeToe.toUpperCase()} edge`,
      '--------------------------------------------------',
      'ACTIONS & OVERTURNING MOMENTS:',
      `Horizontal resultant (H): ${horizontalForce.toFixed(3)} kN/m`,
      `Wall-base moment (M_wall):${wallBaseMoment.toFixed(3)} kNm/m`,
      `Shear transfer (H × D):   ${shearTransferMoment.toFixed(3)} kNm/m`,
      `OVERTURNING MOMENT (M_OT): ${overturningMoment.toFixed(3)} kNm/m`,
      isAS1170 ? `Factored M_d,OT:          ${factoredOverturningMoment.toFixed(3)} kNm/m` : '',
      '--------------------------------------------------',
      'RESISTING ACTIONS:',
      `Footing weight (W_f):      ${results.footingWeight.toFixed(3)} kN/m`,
      `Footing resisting (M_R,f): ${footingResistingMoment.toFixed(3)} kNm/m`,
      inputs.includeWallWeight
        ? `Wall weight (W_wall):      ${results.wallWeight.toFixed(3)} kN/m\nWall resisting (M_R,wall): ${wallResistingMoment.toFixed(3)} kNm/m`
        : 'Wall resisting (M_R,wall): 0.000 kNm/m',
      additionalResistingMoment > 0
        ? `Additional Loads Resisting:${additionalResistingMoment.toFixed(3)} kNm/m`
        : '',
      `TOTAL RESISTING MOMENT(M_R):${totalResistingMoment.toFixed(3)} kNm/m`,
      isAS1170 ? `Factored M_d,R (0.9G):    ${factoredResistingMoment.toFixed(3)} kNm/m` : '',
      '--------------------------------------------------',
      'STABILITY ASSESSMENT:',
      `Stability Ratio:          ${displayRatio !== null ? displayRatio.toFixed(2) : 'N/A'}`,
      `Soil Bearing peak q_max:  ${bearing.qMax.toFixed(1)} kPa (Allowable: ${bearing.allowableCapacity.toFixed(0)} kPa)`,
      `Soil Bearing Status:      ${bearing.bearingStatus.toUpperCase()}`,
      `Overall Status:           ${status.toUpperCase()}`,
      '==================================================',
    ].filter(Boolean).join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-850 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                STABILITY CHECK RESULTS
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                {isAS1170 ? 'AS/NZS 1170.0 ULS' : 'ASD Working Stress'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              1.0 m strip • Pivot: bottom {results.activeToe.toUpperCase()} toe
            </p>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Copy formatted summary to clipboard"
        >
          {copiedSummary ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Main 3 Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-900/60 p-4 gap-4 md:gap-0">
        {/* Overturning Moment */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>OVERTURNING MOMENT</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {isAS1170 ? 'M_d,OT' : 'M_OT'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {(isAS1170 ? factoredOverturningMoment : overturningMoment).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">kNm/m</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/80 pt-1.5">
            <span className="flex justify-between">
              <span>Wind component:</span>
              <span className="text-slate-300">
                {results.windOverturningMoment.toFixed(2)} kNm
              </span>
            </span>
            {additionalOverturningMoment > 0 && (
              <span className="flex justify-between">
                <span>Additional loads:</span>
                <span className="text-rose-300">
                  +{additionalOverturningMoment.toFixed(2)} kNm
                </span>
              </span>
            )}
            {isAS1170 && (
              <span className="flex justify-between text-[10px] text-slate-500">
                <span>Load factor (Wu):</span>
                <span>× 1.0</span>
              </span>
            )}
          </div>
        </div>

        {/* Resisting Moment */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>RESISTING MOMENT</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {isAS1170 ? 'M_d,R (0.9G)' : 'M_R'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {(isAS1170 ? factoredResistingMoment : totalResistingMoment).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">kNm/m</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/80 pt-1.5">
            <span className="flex justify-between">
              <span>Footing self-weight:</span>
              <span className="text-slate-300">
                {footingResistingMoment.toFixed(2)} kNm
              </span>
            </span>
            <span className="flex justify-between">
              <span>Wall self-weight:</span>
              <span className="text-slate-300">
                {inputs.includeWallWeight ? `${wallResistingMoment.toFixed(2)} kNm` : '0.00 kNm (Off)'}
              </span>
            </span>
            {additionalResistingMoment > 0 && (
              <span className="flex justify-between">
                <span>Additional loads:</span>
                <span className="text-emerald-300">
                  +{additionalResistingMoment.toFixed(2)} kNm
                </span>
              </span>
            )}
            {isAS1170 && (
              <span className="flex justify-between text-[10px] text-cyan-400">
                <span>AS 1170 0.9G factor:</span>
                <span>Applied</span>
              </span>
            )}
          </div>
        </div>

        {/* Overturning Ratio */}
        <div className="md:px-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAS1170 ? 'CAPACITY RATIO' : 'FACTOR OF SAFETY'}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {isAS1170 ? 'M_d,R / M_d,OT' : 'FS = M_R / M_OT'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${
                status === 'pass'
                  ? 'text-emerald-400'
                  : status === 'fail'
                  ? 'text-rose-400'
                  : 'text-cyan-300'
              }`}
            >
              {displayRatio !== null ? displayRatio.toFixed(2) : 'N/A'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {displayRatio !== null ? `: 1.00` : '(zero wind)'}
            </span>
          </div>

          {/* User Required Ratio Input & Pass/Fail Status */}
          <div className="mt-2 border-t border-slate-800/80 pt-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="req-ratio-input"
                className="text-[11px] font-medium text-slate-400 flex items-center gap-1"
                title="Minimum stability factor to evaluate Pass/Fail"
              >
                <span>Req. min {isAS1170 ? 'ratio' : 'FS'}:</span>
              </label>
              <input
                id="req-ratio-input"
                type="number"
                inputMode="decimal"
                step="0.05"
                min="0"
                placeholder={isAS1170 ? '1.00' : '1.50'}
                value={reqInput}
                onChange={handleReqChange}
                className="w-20 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-right font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compliance / Status Banner if requiredRatio is set */}
      {inputs.requiredRatio ? (
        <div
          className={`flex items-center justify-between px-4 py-2.5 text-xs font-mono border-t ${
            status === 'pass'
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {status === 'pass' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-bold tracking-wide">
              {status === 'pass'
                ? `PASS — ${displayRatio?.toFixed(2)} ≥ ${inputs.requiredRatio.toFixed(2)}`
                : `FAIL — ${displayRatio?.toFixed(2)} < ${inputs.requiredRatio.toFixed(2)}`}
            </span>
          </div>
          <span className="text-[11px] opacity-80">
            Margin: {ratioMargin !== null ? (ratioMargin >= 0 ? `+${ratioMargin.toFixed(2)}` : ratioMargin.toFixed(2)) : 'N/A'}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono text-slate-400 bg-slate-850/50 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Enter a required ratio above to evaluate automatic PASS / FAIL.</span>
          </span>
          <span className="text-slate-500">M_OT = {overturningMoment.toFixed(2)} kNm/m</span>
        </div>
      )}
    </div>
  );
};
