import React from 'react';
import {
  OverturningInputs,
  OverturningResults,
} from '../../../calculations/overturning';
import { MathEquation } from '../../common/MathEquation';

interface HandCalculationsSheetProps {
  inputs: OverturningInputs;
  results: OverturningResults;
}

export const HandCalculationsSheet: React.FC<HandCalculationsSheetProps> = ({
  inputs,
  results,
}) => {
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
    allowableBearingCapacity = 150,
  } = inputs;

  const {
    designPressure,
    lineLoad,
    horizontalForce,
    windResultantHeightFromBase,
    windOverturningMoment,
    overturningMoment,
    footingWeight,
    footingLeverArm,
    footingResistingMoment,
    wallWeight,
    wallLeverArm,
    wallResistingMoment,
    totalResistingMoment,
    overturningRatio,
    activeToe,
    designStandard,
    standardFactors,
    factoredResistingMoment,
    factoredOverturningMoment,
    designRatio,
    bearing,
    designActions,
    status,
  } = results;

  const isAS = designStandard === 'AS_NZS_1170';
  const reqFS = requiredRatio ?? (isAS ? 1.0 : 1.5);
  const activeFS = isAS ? designRatio : overturningRatio;

  const { wall, toe, heel, footing } = designActions;

  return (
    <div className="hand-calc-sheet font-serif text-slate-900 space-y-6 text-xs sm:text-sm">
      {/* Title Header */}
      <div className="border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight text-slate-900 uppercase">
              Detailed Hand Calculations & Theoretical Derivations
            </h2>
            <p className="text-xs font-mono text-slate-600">
              Formulated in accordance with AS/NZS 1170.0:2002, AS 3600:2018 & Engineering Mechanics
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800">
            Unit Strip: 1.0 m
          </span>
        </div>
      </div>

      {/* 1. SECTION 1: GEOMETRY & MATERIAL SPECIFICATION */}
      <div className="page-break-inside-avoid space-y-2 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          1. Geometric Parameters & Section Properties
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          The calculation considers a nominal 1.0 metre wide longitudinal slice of the cantilever boundary wall and continuous strip footing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-1">
          <div className="space-y-1">
            <div>• Footing Width: <MathEquation math={`B = ${footingWidth.toFixed(2)}\\,\\text{m}`} /></div>
            <div>• Footing Depth: <MathEquation math={`D = ${footingDepth.toFixed(2)}\\,\\text{m}`} /></div>
            <div>• Wall Stem Height: <MathEquation math={`H_w = ${wallHeight.toFixed(2)}\\,\\text{m}`} /></div>
            <div>• Wall Thickness: <MathEquation math={`t_w = ${wallThickness.toFixed(2)}\\,\\text{m}`} /></div>
          </div>
          <div className="space-y-1">
            <div>• Concrete Unit Weight: <MathEquation math={`\\gamma_c = ${footingUnitWeight.toFixed(1)}\\,\\text{kN/m}^3`} /></div>
            <div>• Wall Centroid from Left: <MathEquation math={`x_{\\text{wall}} = ${wallCentroidX.toFixed(3)}\\,\\text{m}`} /></div>
            <div>• Wind Direction: <strong className="text-slate-900 font-sans">{windDirection === 'left_to_right' ? 'Left to Right (Active Toe @ Right Edge)' : 'Right to Left (Active Toe @ Left Edge)'}</strong></div>
            <div>• Middle-Third Kern Limit: <MathEquation math={`e_{\\text{kern}} = \\frac{B}{6} = \\frac{${footingWidth.toFixed(2)}}{6} = ${bearing.kernLimit.toFixed(3)}\\,\\text{m}`} /></div>
          </div>
        </div>
      </div>

      {/* 2. SECTION 2: LATERAL WIND LOADING */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          2. Lateral Wind Load Determination
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          The design wind pressure <MathEquation math="p" /> is factored by the pressure/shape coefficient <MathEquation math="C_{\text{fig}}" /> to obtain the distributed line load acting across the cantilever stem.
        </p>

        <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-sans text-xs text-slate-600">Design Wind Pressure:</span>
            <MathEquation math={`p_d = p \\cdot C = ${windPressure.toFixed(2)}\\,\\text{kPa} \\times ${windCoefficient.toFixed(2)} = ${designPressure.toFixed(3)}\\,\\text{kPa}`} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-sans text-xs text-slate-600">Uniform Line Load (1m strip):</span>
            <MathEquation math={`w = p_d \\times 1.0\\,\\text{m} = ${lineLoad.toFixed(3)}\\,\\text{kN/m}`} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="font-sans text-xs font-semibold text-slate-800">Total Lateral Wind Force Resultant:</span>
            <MathEquation math={`F_{\\text{wind}} = w \\cdot H_w = ${lineLoad.toFixed(3)}\\,\\text{kN/m} \\times ${wallHeight.toFixed(2)}\\,\\text{m} = ${horizontalForce.toFixed(3)}\\,\\text{kN/m}`} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-sans text-xs font-semibold text-slate-800">Height of Wind Resultant above Base:</span>
            <MathEquation math={`y_{\\text{wind}} = D + \\frac{H_w}{2} = ${footingDepth.toFixed(2)} + \\frac{${wallHeight.toFixed(2)}}{2} = ${windResultantHeightFromBase.toFixed(2)}\\,\\text{m}`} />
          </div>
        </div>
      </div>

      {/* 3. SECTION 3: GRAVITY SELF-WEIGHT DETERMINATION */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          3. Gravity Self-Weights & Lever Arms to Active Overturning Toe
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          The active overturning fulcrum is the bottom corner toe <MathEquation math={`x_{\\text{toe}} = ${results.activeToeX.toFixed(2)}\\,\\text{m}`} /> ({activeToe.toUpperCase()} edge).
        </p>

        <div className="bg-white p-3 rounded border border-slate-200 space-y-3">
          {/* Footing Self-Weight */}
          <div>
            <div className="font-sans text-xs font-semibold text-slate-800 mb-1">
              (a) Footing Concrete Self-Weight:
            </div>
            <MathEquation
              block
              math={`W_{\\text{footing}} = B \\cdot D \\cdot \\gamma_f = ${footingWidth.toFixed(2)} \\times ${footingDepth.toFixed(2)} \\times ${footingUnitWeight.toFixed(1)} = ${footingWeight.toFixed(2)}\\,\\text{kN/m}`}
            />
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Centroid lever arm to active toe:</span>
              <MathEquation math={`\\bar{x}_f = \\frac{B}{2} = \\frac{${footingWidth.toFixed(2)}}{2} = ${footingLeverArm.toFixed(2)}\\,\\text{m}`} />
            </div>
          </div>

          {/* Wall Stem Self-Weight */}
          {includeWallWeight ? (
            <div className="border-t border-slate-100 pt-2">
              <div className="font-sans text-xs font-semibold text-slate-800 mb-1">
                (b) Wall Stem Concrete Self-Weight:
              </div>
              <MathEquation
                block
                math={`W_{\\text{wall}} = H_w \\cdot t_w \\cdot \\gamma_w = ${wallHeight.toFixed(2)} \\times ${wallThickness.toFixed(2)} \\times ${wallUnitWeight.toFixed(1)} = ${wallWeight.toFixed(2)}\\,\\text{kN/m}`}
              />
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>Wall lever arm to active toe:</span>
                <MathEquation math={`L_{\\text{wall}} = |x_{\\text{toe}} - x_{\\text{wall}}| = ${wallLeverArm.toFixed(3)}\\,\\text{m}`} />
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-2 text-xs font-mono text-amber-700 bg-amber-50 p-2 rounded">
              Note: Wall stem self-weight is conservative omitted from resisting calculations per user setting.
            </div>
          )}

          {/* Total Vertical Gravity Load */}
          <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-sans text-xs font-bold text-slate-900">
            <span>Total Gravity Vertical Force:</span>
            <MathEquation math={`R_v = \\sum V = ${bearing.totalVerticalLoad.toFixed(2)}\\,\\text{kN/m}`} />
          </div>
        </div>
      </div>

      {/* 4. SECTION 4: OVERTURNING & RESTORING MOMENTS */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          4. Moments About Active Overturning Toe (<MathEquation math="x_{\text{toe}}" />)
        </h3>

        <div className="space-y-3 bg-white p-3 rounded border border-slate-200">
          <div>
            <div className="font-sans text-xs font-semibold text-rose-800 mb-1">
              (a) Overturning Moment (Destabilizing Actions):
            </div>
            <MathEquation
              block
              math={`M_{\\text{OT,wind}} = F_{\\text{wind}} \\cdot y_{\\text{wind}} = ${horizontalForce.toFixed(3)}\\,\\text{kN/m} \\times ${windResultantHeightFromBase.toFixed(2)}\\,\\text{m} = ${windOverturningMoment.toFixed(2)}\\,\\text{kNm/m}`}
            />
            {results.additionalOverturningMoment > 0 && (
              <div className="text-xs text-slate-600 font-mono flex items-center justify-between">
                <span>Additional applied overturning moments:</span>
                <MathEquation math={`\\sum M_{\\text{OT,add}} = ${results.additionalOverturningMoment.toFixed(2)}\\,\\text{kNm/m}`} />
              </div>
            )}
            <div className="flex items-center justify-between font-mono font-bold text-rose-700 border-t border-slate-100 pt-1 mt-1">
              <span>Total Overturning Moment (M_OT):</span>
              <MathEquation math={`M_{\\text{OT}} = ${overturningMoment.toFixed(2)}\\,\\text{kNm/m}`} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2">
            <div className="font-sans text-xs font-semibold text-emerald-800 mb-1">
              (b) Restoring Moment (Stabilizing Actions):
            </div>
            <MathEquation
              block
              math={`M_{\\text{rest,footing}} = W_{\\text{footing}} \\cdot \\bar{x}_f = ${footingWeight.toFixed(2)} \\times ${footingLeverArm.toFixed(2)} = ${footingResistingMoment.toFixed(2)}\\,\\text{kNm/m}`}
            />
            {includeWallWeight && (
              <MathEquation
                block
                math={`M_{\\text{rest,wall}} = W_{\\text{wall}} \\cdot L_{\\text{wall}} = ${wallWeight.toFixed(2)} \\times ${wallLeverArm.toFixed(3)} = ${wallResistingMoment.toFixed(2)}\\,\\text{kNm/m}`}
              />
            )}
            <div className="flex items-center justify-between font-mono font-bold text-emerald-700 border-t border-slate-100 pt-1 mt-1">
              <span>Total Restoring Moment (M_R):</span>
              <MathEquation math={`M_{\\text{rest}} = ${totalResistingMoment.toFixed(2)}\\,\\text{kNm/m}`} />
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION 5: STABILITY FACTOR OF SAFETY */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          5. Stability Evaluation & Factor of Safety Check
        </h3>

        <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
          {isAS ? (
            <div>
              <p className="text-xs text-slate-700 font-sans mb-1">
                Evaluated under Limit State Combination <span className="font-mono font-bold text-slate-900">{standardFactors.codeReference}</span>:
              </p>
              <MathEquation
                block
                math={`E_d \\le R_d \\implies M_{d,\\text{OT}} = ${factoredOverturningMoment.toFixed(2)}\\,\\text{kNm/m} \\le M_{d,\\text{rest}} = ${factoredResistingMoment.toFixed(2)}\\,\\text{kNm/m}`}
              />
              <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-slate-100">
                <span>Design Ratio (R_d / E_d):</span>
                <MathEquation math={`\\lambda = \\frac{M_{d,\\text{rest}}}{M_{d,\\text{OT}}} = \\frac{${factoredResistingMoment.toFixed(2)}}{${factoredOverturningMoment.toFixed(2)}} = ${(designRatio ?? 0).toFixed(2)}`} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-700 font-sans mb-1">
                Evaluated under Working Stress Design (ASD) with minimum factor of safety <MathEquation math={`\\text{FoS}_{\\text{req}} = ${reqFS.toFixed(2)}`} />:
              </p>
              <MathEquation
                block
                math={`\\text{FoS} = \\frac{M_{\\text{rest}}}{M_{\\text{OT}}} = \\frac{${totalResistingMoment.toFixed(2)}}{${overturningMoment.toFixed(2)}} = ${(overturningRatio ?? 0).toFixed(2)}`}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-2 font-mono text-xs">
            <span className="font-sans font-bold text-slate-900">Overturning Stability Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded font-black text-xs ${
                status === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {status === 'pass' ? 'PASS (ADEQUATE MARGIN)' : 'FAIL (INADEQUATE RESISTANCE)'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. SECTION 6: SOIL BEARING PRESSURE & MIDDLE-THIRD KERN */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          6. Foundation Soil Bearing Pressure & Eccentricity Analysis
        </h3>

        <div className="bg-white p-3 rounded border border-slate-200 space-y-3">
          {/* Resultant line of action */}
          <div>
            <div className="font-sans text-xs font-semibold text-slate-800 mb-1">
              (a) Resultant Line of Action from Active Toe:
            </div>
            <MathEquation
              block
              math={`\\bar{x} = \\frac{M_{\\text{rest}} - M_{\\text{OT}}}{R_v} = \\frac{${totalResistingMoment.toFixed(2)} - ${overturningMoment.toFixed(2)}}{${bearing.totalVerticalLoad.toFixed(2)}} = ${(bearing.kernLimit * 3 - bearing.eccentricity * 3 >= 0 ? (footingWidth / 2 - bearing.eccentricity) : 0).toFixed(3)}\\,\\text{m}`}
            />
          </div>

          {/* Eccentricity */}
          <div className="border-t border-slate-100 pt-2">
            <div className="font-sans text-xs font-semibold text-slate-800 mb-1">
              (b) Load Eccentricity from Footing Centerline:
            </div>
            <MathEquation
              block
              math={`e = \\left|\\frac{B}{2} - \\bar{x}\\right| = ${bearing.eccentricity.toFixed(3)}\\,\\text{m}`}
            />
            <div className="text-xs font-mono text-slate-600 flex items-center justify-between">
              <span>Middle-Third Kern Limit (B / 6):</span>
              <MathEquation math={`e_{\\text{kern}} = \\frac{${footingWidth.toFixed(2)}}{6} = ${bearing.kernLimit.toFixed(3)}\\,\\text{m}`} />
            </div>
          </div>

          {/* Bearing distribution formulation */}
          <div className="border-t border-slate-100 pt-2">
            <div className="font-sans text-xs font-semibold text-slate-800 mb-1">
              (c) Pressure Distribution (
              {bearing.contactStatus === 'full_contact'
                ? 'Full Contact / Trapezoidal Distribution'
                : 'Tension Separation / Triangular Distribution'}
              ):
            </div>

            {bearing.contactStatus === 'full_contact' ? (
              <div className="space-y-1">
                <MathEquation
                  block
                  math={`q_{\\text{toe}} = \\frac{R_v}{B}\\left(1 + \\frac{6e}{B}\\right) = \\frac{${bearing.totalVerticalLoad.toFixed(2)}}{${footingWidth.toFixed(2)}}\\left(1 + \\frac{6(${bearing.eccentricity.toFixed(3)})}{${footingWidth.toFixed(2)}}\\right) = ${bearing.qMax.toFixed(1)}\\,\\text{kPa}`}
                />
                <MathEquation
                  block
                  math={`q_{\\text{heel}} = \\frac{R_v}{B}\\left(1 - \\frac{6e}{B}\\right) = ${bearing.qMin.toFixed(1)}\\,\\text{kPa}`}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <MathEquation
                  block
                  math={`L_{\\text{contact}} = 3\\bar{x} = 3(${Math.max(0, footingWidth / 2 - bearing.eccentricity).toFixed(3)}) = ${bearing.effectiveContactWidth.toFixed(3)}\\,\\text{m}`}
                />
                <MathEquation
                  block
                  math={`q_{\\text{max}} = \\frac{2 R_v}{3\\bar{x}} = \\frac{2 \\times ${bearing.totalVerticalLoad.toFixed(2)}}{${bearing.effectiveContactWidth.toFixed(3)}} = ${bearing.qMax.toFixed(1)}\\,\\text{kPa} \\quad (q_{\\text{heel}} = 0\\,\\text{kPa})`}
                />
              </div>
            )}
          </div>

          {/* Capacity Check */}
          <div className="border-t-2 border-slate-200 pt-2 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="font-sans font-bold text-slate-900 block">Bearing Pressure Check:</span>
              <span className="text-[11px] text-slate-500">
                q_max ({bearing.qMax.toFixed(1)} kPa) vs Allowable ({allowableBearingCapacity} kPa)
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded font-black text-xs ${
                bearing.bearingStatus === 'pass'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {bearing.bearingStatus === 'pass'
                ? `PASS (UTILIZATION ${(bearing.utilizationRatio * 100).toFixed(1)}%)`
                : 'FAIL (OVERSTRESSED)'}
            </span>
          </div>
        </div>
      </div>

      {/* 7. SECTION 7: STRUCTURAL MEMBER DESIGN ACTIONS (M*, V*, N*) */}
      <div className="page-break-inside-avoid space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/60">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
          7. Governing Structural Member Design Actions (<MathEquation math="M^*, V^*, N^*" />)
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          These design values represent the ultimate internal design actions to be used directly in the flexural and shear reinforcement design of the wall stem and footing slab per AS 3600:2018.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Stem */}
          <div className="p-3 rounded bg-white border border-slate-200 space-y-2">
            <div className="font-sans font-bold text-xs text-slate-900 border-b border-slate-100 pb-1">
              Wall Stem (At Footing Interface)
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Design Moment M*:</span>
                <strong className="text-cyan-800">{wall.mStar.toFixed(2)} kNm/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Design Shear V*:</span>
                <strong className="text-cyan-800">{wall.vStar.toFixed(2)} kN/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Design Axial N*:</span>
                <strong className="text-cyan-800">{wall.nStar.toFixed(2)} kN/m</strong>
              </div>
            </div>
            <div className="pt-1 text-[10px] text-slate-400 font-sans border-t border-slate-100">
              Formulas: <MathEquation math="M^* = w H_w^2 / 2" />, <MathEquation math="V^* = w H_w" />
            </div>
          </div>

          {/* Toe */}
          <div className="p-3 rounded bg-white border border-slate-200 space-y-2">
            <div className="font-sans font-bold text-xs text-slate-900 border-b border-slate-100 pb-1">
              Footing Toe (Front Face)
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Toe Length L_toe:</span>
                <strong className="text-emerald-800">{toe.length.toFixed(3)} m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Toe Moment M*:</span>
                <strong className="text-emerald-800">{toe.mStar.toFixed(2)} kNm/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Face Shear V*:</span>
                <strong className="text-emerald-800">{toe.vStar.toFixed(2)} kN/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shear at d (V*_d):</span>
                <strong className="text-emerald-800">{toe.vStarAtD.toFixed(2)} kN/m</strong>
              </div>
            </div>
            <div className="pt-1 text-[10px] text-slate-400 font-sans border-t border-slate-100">
              Governs: Bottom steel layer tension
            </div>
          </div>

          {/* Heel */}
          <div className="p-3 rounded bg-white border border-slate-200 space-y-2">
            <div className="font-sans font-bold text-xs text-slate-900 border-b border-slate-100 pb-1">
              Footing Heel (Back Face)
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Heel Length L_heel:</span>
                <strong className="text-amber-800">{heel.length.toFixed(3)} m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heel Moment M*:</span>
                <strong className="text-amber-800">{heel.mStar.toFixed(2)} kNm/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heel Shear V*:</span>
                <strong className="text-amber-800">{heel.vStar.toFixed(2)} kN/m</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slab Load w_down:</span>
                <strong className="text-amber-800">{heel.downwardPressure.toFixed(1)} kPa</strong>
              </div>
            </div>
            <div className="pt-1 text-[10px] text-slate-400 font-sans border-t border-slate-100">
              Governs: Top steel layer tension
            </div>
          </div>
        </div>

        {/* Foundation Base Sliding */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div>
            <span className="text-slate-600 font-sans">Base Sliding Friction Check: </span>
            <span className="text-slate-500 text-[11px]">
              V* ({footing.vStar.toFixed(2)} kN/m) vs Capacity φV_u ({footing.slidingCapacity.toFixed(2)} kN/m)
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              footing.slidingStatus === 'pass'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            SLIDING: {footing.slidingStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
