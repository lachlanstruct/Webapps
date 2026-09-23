import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Calculator,
  Layers,
  Sparkles,
  Info,
  Activity,
  BookOpen,
} from 'lucide-react';
import { OverturningInputs, OverturningResults } from '../../../calculations/overturning';

interface CalculationDetailsProps {
  inputs: OverturningInputs;
  results: OverturningResults;
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({ inputs, results }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);

  const {
    windPressure,
    windCoefficient,
    wallHeight,
    wallThickness,
    footingWidth,
    footingDepth,
    footingUnitWeight,
    wallUnitWeight,
    includeWallWeight,
    wallCentroidX,
    windDirection,
    requiredRatio,
    designStandard,
  } = inputs;

  const {
    designPressure,
    lineLoad,
    horizontalForce,
    windResultantHeightFromBase,
    wallBaseMoment,
    shearTransferMoment,
    windOverturningMoment,
    overturningMoment,
    footingWeight,
    footingLeverArm,
    footingResistingMoment,
    wallWeight,
    wallLeverArm,
    wallResistingMoment,
    additionalLoadsDecomposition,
    additionalResistingMoment,
    additionalOverturningMoment,
    totalResistingMoment,
    overturningRatio,
    activeToe,
    status,
    standardFactors,
    factoredResistingMoment,
    factoredOverturningMoment,
    designRatio,
    bearing,
  } = results;

  const isLeftToRight = windDirection === 'left_to_right';
  const isAS1170 = designStandard === 'AS_NZS_1170';

  const generateMarkdownReport = () => {
    return [
      '# CANTILEVER WALL / FOOTING OVERTURNING CALCULATION REPORT',
      'Analysis Basis: 1.0 m continuous wall strip perpendicular to plane',
      `Standard: ${standardFactors.name} (${standardFactors.codeReference})`,
      `Date/Time: ${new Date().toISOString()}`,
      '',
      '## 1. Design Inputs',
      `- Wind Pressure (p): ${windPressure.toFixed(3)} kPa`,
      `- Load Coefficient (C): ${windCoefficient.toFixed(2)}`,
      `- Wall Height (z): ${wallHeight.toFixed(3)} m`,
      `- Wall Thickness (t): ${wallThickness.toFixed(3)} m`,
      `- Footing Width (B): ${footingWidth.toFixed(3)} m`,
      `- Footing Depth (D): ${footingDepth.toFixed(3)} m`,
      `- Footing Concrete Unit Weight (γ_f): ${footingUnitWeight.toFixed(1)} kN/m³`,
      includeWallWeight
        ? `- Wall Unit Weight (γ_w): ${wallUnitWeight.toFixed(1)} kN/m³ (Wall weight included)`
        : '- Wall Self-Weight: Excluded',
      `- Wall Centroid (x_wall): ${wallCentroidX.toFixed(3)} m from left footing edge`,
      `- Wind Direction: ${isLeftToRight ? 'Left to Right (→)' : 'Right to Left (←)'}`,
      `- Active Overturning Pivot Toe: ${activeToe.toUpperCase()} footing edge`,
      '',
      '## 2. Wind Loading Calculations',
      `Design Wind Pressure: p_d = p × C = ${designPressure.toFixed(3)} kPa`,
      `Equivalent Line Load: w = p_d × 1.0 m = ${lineLoad.toFixed(3)} kN/m`,
      `Horizontal Wind Force: H = w × z = ${horizontalForce.toFixed(3)} kN/m`,
      `Resultant height above base: D + z/2 = ${windResultantHeightFromBase.toFixed(3)} m`,
      '',
      '## 3. Overturning Moments (M_OT)',
      `Wind overturning moment: M_OT,wind = H × (D + z/2) = ${windOverturningMoment.toFixed(3)} kNm/m`,
      additionalOverturningMoment > 0
        ? `Additional loads moment: +${additionalOverturningMoment.toFixed(3)} kNm/m`
        : '',
      `Total Overturning Moment: ${overturningMoment.toFixed(3)} kNm/m`,
      isAS1170 ? `Factored M_d,OT: ${factoredOverturningMoment.toFixed(3)} kNm/m` : '',
      '',
      '## 4. Resisting Moments (M_R)',
      `Footing Weight: W_f = γ_f × B × D = ${footingWeight.toFixed(3)} kN/m`,
      `Footing Resisting Moment: M_R,f = W_f × (B/2) = ${footingResistingMoment.toFixed(3)} kNm/m`,
      includeWallWeight
        ? `Wall Weight: W_wall = γ_w × t × z = ${wallWeight.toFixed(3)} kN/m\nWall Resisting Moment: M_R,wall = W_wall × L_w = ${wallResistingMoment.toFixed(3)} kNm/m (L_w = ${wallLeverArm.toFixed(3)} m)`
        : 'Wall Resisting Moment: Excluded (0.000 kNm/m)',
      additionalResistingMoment > 0
        ? `Additional Loads Resisting: +${additionalResistingMoment.toFixed(3)} kNm/m`
        : '',
      `Total Resisting Moment: M_R = ${totalResistingMoment.toFixed(3)} kNm/m`,
      isAS1170 ? `Factored M_d,R (0.9G): ${factoredResistingMoment.toFixed(3)} kNm/m` : '',
      '',
      '## 5. Overturning Stability Assessment',
      `Stability Ratio: ${isAS1170 ? (designRatio !== null ? designRatio.toFixed(2) : 'N/A') : (overturningRatio !== null ? overturningRatio.toFixed(2) : 'N/A')}`,
      `Required Minimum Ratio: ${requiredRatio?.toFixed(2) ?? '1.50'}`,
      `Stability Status: ${status.toUpperCase()}`,
      '',
      '## 6. Soil Bearing Pressure Analysis',
      `- Total Vertical Force (N): ${bearing.totalVerticalLoad.toFixed(2)} kN/m`,
      `- Eccentricity (e = |M_net| / N): ${bearing.eccentricity.toFixed(3)} m`,
      `- Middle-Third Kern Limit (B/6): ${bearing.kernLimit.toFixed(3)} m`,
      `- Contact Status: ${bearing.contactStatus.replace('_', ' ').toUpperCase()} (Contact: ${bearing.contactRatio.toFixed(0)}%)`,
      `- Peak Bearing Pressure (q_max): ${bearing.qMax.toFixed(1)} kPa`,
      `- Allowable Bearing Capacity (q_all): ${bearing.allowableCapacity.toFixed(0)} kPa`,
      `- Bearing Utilization: ${(bearing.utilizationRatio * 100).toFixed(1)}%`,
      `- Bearing Status: ${bearing.bearingStatus.toUpperCase()}`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownReport());
      setCopiedBreakdown(true);
      setTimeout(() => setCopiedBreakdown(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left group"
        >
          <div className="p-1 rounded bg-slate-800 text-cyan-400 group-hover:bg-slate-700 transition">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full Engineering Calculation Breakdown
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                {standardFactors.name}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Formulas, load step decomposition, middle-third kern & bearing pressure equations
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition"
            title="Copy entire engineering markdown report"
          >
            {copiedBreakdown ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-6 text-xs font-mono text-slate-300 divide-y divide-slate-800">
          {/* Section 1: Basis & Design Standard */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Basis of Analysis & Design Standard</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-400">
              <p className="text-white font-semibold">{standardFactors.name}</p>
              <p>Reference: {standardFactors.codeReference}</p>
              <p>Analysis strip width: 1.00 m continuous strip perpendicular to wall plane</p>
              <p>Active pivot edge: Bottom {activeToe.toUpperCase()} toe (x = {results.activeToeX.toFixed(2)} m)</p>
            </div>
          </div>

          {/* Section 2: Wind Loading */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <span>2. Wind Loading Calculations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <p className="text-slate-400">Design wind pressure:</p>
                <p className="text-white font-semibold">p_d = p × C</p>
                <p className="text-slate-300">
                  p_d = {windPressure.toFixed(3)} × {windCoefficient.toFixed(2)} ={' '}
                  <strong className="text-cyan-400">{designPressure.toFixed(3)} kPa</strong>
                </p>
                <p className="text-[11px] text-slate-500">Uniform horizontal pressure on wall surface</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Horizontal force & resultant height:</p>
                <p className="text-white font-semibold">H = w × z</p>
                <p className="text-slate-300">
                  H = {lineLoad.toFixed(3)} × {wallHeight.toFixed(2)} ={' '}
                  <strong className="text-cyan-400">{horizontalForce.toFixed(3)} kN/m</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Height above base = D + z/2 = {footingDepth.toFixed(2)} + {(wallHeight / 2).toFixed(2)} ={' '}
                  <strong>{windResultantHeightFromBase.toFixed(2)} m</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Overturning Moment */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <span>3. Overturning Moment (M_OT) About Footing Base</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <p className="text-slate-400">
                Overturning moment calculated about the bottom active {activeToe.toUpperCase()} toe:
              </p>
              <p className="text-white font-semibold">M_OT,wind = H × (D + z / 2) = w × z × (D + z / 2)</p>
              <p className="text-slate-300">
                M_OT,wind = {horizontalForce.toFixed(3)} × {windResultantHeightFromBase.toFixed(2)} ={' '}
                <strong className="text-rose-400">{windOverturningMoment.toFixed(3)} kNm/m</strong>
              </p>

              {additionalOverturningMoment > 0 && (
                <div className="pt-1 text-slate-300">
                  <span>Additional loads overturning contribution: </span>
                  <strong className="text-rose-400">+{additionalOverturningMoment.toFixed(3)} kNm/m</strong>
                </div>
              )}

              <p className="text-rose-400 font-bold text-sm pt-1">
                Total Overturning M_OT = {overturningMoment.toFixed(3)} kNm/m
              </p>

              {isAS1170 && (
                <p className="text-cyan-300 text-xs">
                  Factored Design Overturning M_d,OT (1.0 Wu) = {factoredOverturningMoment.toFixed(3)} kNm/m
                </p>
              )}
            </div>

            {/* Load Transfer Verification Box */}
            <div className="bg-slate-850/80 p-3 rounded-lg border border-slate-700/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shear & Moment Transfer Decomposition Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 pt-1">
                <div>
                  <span className="text-slate-300 block">1. Wall-base moment:</span>
                  M_wall = w·z² / 2 = {wallBaseMoment.toFixed(3)} kNm
                </div>
                <div>
                  <span className="text-slate-300 block">2. Shear through footing:</span>
                  M_HD = H·D = {shearTransferMoment.toFixed(3)} kNm
                </div>
                <div>
                  <span className="text-slate-300 block">3. Combined check:</span>
                  M_wall + M_HD = {(wallBaseMoment + shearTransferMoment).toFixed(3)} kNm (≡ M_OT,wind)
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Footing Resisting Moment */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span>4. Footing Self-Weight (W_f) & Resisting Moment (M_R,f)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <p className="text-slate-400">Footing weight (1.0 m strip):</p>
                <p className="text-white font-semibold">W_f = γ_f × B × D</p>
                <p className="text-slate-300">
                  W_f = {footingUnitWeight.toFixed(1)} × {footingWidth.toFixed(2)} × {footingDepth.toFixed(2)}
                </p>
                <p className="text-emerald-400 font-bold">W_f = {footingWeight.toFixed(3)} kN/m</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400">Resisting moment about {activeToe.toUpperCase()} toe:</p>
                <p className="text-white font-semibold">M_R,f = W_f × (B / 2)</p>
                <p className="text-slate-300">
                  M_R,f = {footingWeight.toFixed(3)} × {footingLeverArm.toFixed(2)}
                </p>
                <p className="text-emerald-400 font-bold">
                  M_R,f = {footingResistingMoment.toFixed(3)} kNm/m
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Wall Resisting Moment */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span>5. Wall Self-Weight (W_wall) & Resisting Moment (M_R,wall)</span>
            </div>
            {includeWallWeight ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="space-y-1">
                  <p className="text-slate-400">Wall weight (1.0 m strip):</p>
                  <p className="text-white font-semibold">W_wall = γ_w × t × z</p>
                  <p className="text-slate-300">
                    W_wall = {wallUnitWeight.toFixed(1)} × {wallThickness.toFixed(2)} × {wallHeight.toFixed(2)}
                  </p>
                  <p className="text-emerald-400 font-bold">W_wall = {wallWeight.toFixed(3)} kN/m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">
                    Wall resisting moment to active {activeToe.toUpperCase()} toe:
                  </p>
                  <p className="text-white font-semibold">
                    M_R,wall = W_wall × L_wall
                  </p>
                  <p className="text-slate-300">
                    L_wall = {isLeftToRight ? `B - x_wall = ${footingWidth.toFixed(2)} - ${wallCentroidX.toFixed(2)} = ` : 'x_wall = '}
                    {wallLeverArm.toFixed(3)} m
                  </p>
                  <p className="text-emerald-400 font-bold">
                    M_R,wall = {wallWeight.toFixed(3)} × {wallLeverArm.toFixed(3)} = {wallResistingMoment.toFixed(3)} kNm/m
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-400">
                <p>Wall self-weight is currently toggled <span className="text-amber-400 font-bold">OFF</span>.</p>
                <p className="text-[11px] text-slate-500 pt-0.5">W_wall = 0.000 kN/m and M_R,wall = 0.000 kNm/m.</p>
              </div>
            )}
          </div>

          {/* Additional Loads Section if present */}
          {additionalLoadsDecomposition.length > 0 && (
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <span>6. Additional Applied Loads Decomposition</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2">Load</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Action</th>
                      <th className="p-2 text-right">Force</th>
                      <th className="p-2 text-right">Arm</th>
                      <th className="p-2 text-right">Resisting</th>
                      <th className="p-2 text-right">Overturning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {additionalLoadsDecomposition.map(item => (
                      <tr key={item.id}>
                        <td className="p-2 font-semibold text-white">{item.name}</td>
                        <td className="p-2 text-slate-400">{item.type}</td>
                        <td className="p-2 text-cyan-300">{item.action}</td>
                        <td className="p-2 text-right font-mono">
                          {item.verticalForce > 0 ? `${item.verticalForce.toFixed(2)} kN (V)` : `${item.horizontalForce.toFixed(2)} kN (H)`}
                        </td>
                        <td className="p-2 text-right font-mono">{item.leverArmToToe.toFixed(2)} m</td>
                        <td className="p-2 text-right font-mono text-emerald-400">
                          {item.resistingMoment > 0 ? `${item.resistingMoment.toFixed(2)} kNm` : '—'}
                        </td>
                        <td className="p-2 text-right font-mono text-rose-400">
                          {item.overturningMoment > 0 ? `${item.overturningMoment.toFixed(2)} kNm` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 7: Combined Resistance & Stability Ratio */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <span>7. Total Resisting Moment (M_R) & Stability Assessment</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <p className="text-slate-400">Total resisting moment:</p>
                <p className="text-white font-semibold">M_R = M_R,f + M_R,wall + M_R,add</p>
                <p className="text-slate-300">
                  M_R = {footingResistingMoment.toFixed(3)} + {wallResistingMoment.toFixed(3)} + {additionalResistingMoment.toFixed(3)}
                </p>
                <p className="text-emerald-400 font-bold">M_R = {totalResistingMoment.toFixed(3)} kNm/m</p>

                {isAS1170 && (
                  <p className="text-cyan-300 text-xs pt-1">
                    Factored Resisting M_d,R (0.9G) = {factoredResistingMoment.toFixed(3)} kNm/m
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">{isAS1170 ? 'AS 1170 Capacity Ratio:' : 'Overturning factor of safety:'}</p>
                <p className="text-white font-semibold">{isAS1170 ? 'Ratio = M_d,R / M_d,OT' : 'FS = M_R / M_OT'}</p>
                <p className="text-slate-300">
                  {isAS1170
                    ? `${factoredResistingMoment.toFixed(3)} / ${factoredOverturningMoment.toFixed(3)}`
                    : `${totalResistingMoment.toFixed(3)} / ${overturningMoment.toFixed(3)}`}
                </p>
                <p
                  className={`font-black text-sm ${
                    status === 'pass'
                      ? 'text-emerald-400'
                      : status === 'fail'
                      ? 'text-rose-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {isAS1170
                    ? `Ratio = ${designRatio !== null ? designRatio.toFixed(2) : 'N/A'}`
                    : `FS = ${overturningRatio !== null ? overturningRatio.toFixed(2) : 'N/A'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Section 8: Soil Bearing Pressure Equations */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>8. Soil Bearing Pressure & Middle-Third Kern Equations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <p className="text-slate-400">Total vertical load & eccentricity:</p>
                <p className="text-white font-semibold">N = Σ V = {bearing.totalVerticalLoad.toFixed(2)} kN/m</p>
                <p className="text-slate-300">e = |M_net| / N = {bearing.eccentricity.toFixed(3)} m</p>
                <p className="text-[11px] text-slate-400">Kern limit B/6 = {bearing.kernLimit.toFixed(3)} m</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Contact & Kern condition:</p>
                <p className="text-white font-semibold">
                  {bearing.contactStatus === 'full_contact'
                    ? 'e ≤ B/6: Full base contact (Trapezoidal)'
                    : 'e > B/6: Partial contact (Tension lift-off)'}
                </p>
                <p className="text-slate-300">Effective width B&apos; = {bearing.effectiveContactWidth.toFixed(2)} m</p>
                <p className="text-amber-400 font-bold">Contact: {bearing.contactRatio.toFixed(0)}% of width</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Peak pressure vs allowable:</p>
                <p className="text-white font-semibold">
                  q_max = {bearing.qMax.toFixed(1)} kPa
                </p>
                <p className="text-slate-300">
                  Allowable q_all = {bearing.allowableCapacity.toFixed(0)} kPa
                </p>
                <p
                  className={`font-bold ${
                    bearing.bearingStatus === 'pass' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  Status: {bearing.bearingStatus.toUpperCase()} ({(bearing.utilizationRatio * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
