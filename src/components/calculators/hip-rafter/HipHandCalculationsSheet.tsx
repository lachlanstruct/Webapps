import React from 'react';
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import {
  HipRafterInputs,
  HipRafterResults,
} from '../../../calculations/hipRafter';
import { MathEquation } from '../../common/MathEquation';

interface HipHandCalculationsSheetProps {
  inputs: HipRafterInputs;
  results: HipRafterResults;
}

export const HipHandCalculationsSheet: React.FC<HipHandCalculationsSheetProps> = ({
  inputs,
  results,
}) => {
  const { geometry, section, governingActions, combinations } = results;
  const governing = combinations['strength_1.2G_1.5Q'];

  return (
    <div className="space-y-6 text-slate-900 bg-white font-sans text-xs">
      {/* Title Header */}
      <div className="border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-800">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-sm font-black uppercase tracking-wider">
            ANALYTICAL HAND CALCULATIONS & MATHEMATICAL DERIVATIONS
          </h2>
        </div>
        <p className="text-[11px] font-mono text-slate-600 mt-0.5">
          Detailed step-by-step derivation of 3D geometry, tributary triangular loading, reactions, shear, moment, and deflection equations
        </p>
      </div>

      {/* SECTION 1: 3D Hip Geometry & Angles */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Hip Rafter 3D Geometry & True Rake Angle Derivation</span>
        </h3>
        <p className="text-slate-600 text-[11px]">
          Given plan lengths <MathEquation math="L_x" /> and <MathEquation math="L_y" />, the plan span <MathEquation math="L_p" />, roof rise <MathEquation math="H" />, and true 3D rake angle <MathEquation math="\psi" /> are solved analytically:
        </p>
        <div className="space-y-1.5 py-1">
          <MathEquation
            math={`L_p = \\sqrt{L_x^2 + L_y^2} = \\sqrt{${inputs.spanX.toFixed(2)}^2 + ${inputs.spanY.toFixed(2)}^2} = ${geometry.planLength.toFixed(4)}\\text{ m}`}
            displayMode
          />
          <MathEquation
            math={`H = L_x \\cdot \\tan(\\theta) = ${inputs.spanX.toFixed(2)} \\cdot \\tan(${inputs.pitchDeg.toFixed(1)}^\\circ) = ${geometry.roofRise.toFixed(4)}\\text{ m}`}
            displayMode
          />
          <MathEquation
            math={`\\alpha = \\arctan\\left(\\frac{L_y}{L_x}\\right) = \\arctan\\left(\\frac{${inputs.spanY.toFixed(2)}}{${inputs.spanX.toFixed(2)}}\\right) = ${geometry.hipPlanAngleDeg.toFixed(2)}^\\circ`}
            displayMode
          />
          <MathEquation
            math={`\\psi = \\arctan\\left(\\frac{H}{L_p}\\right) = \\arctan\\left(\\frac{${geometry.roofRise.toFixed(3)}}{${geometry.planLength.toFixed(3)}}\\right) = ${geometry.hipSlopeAngleDeg.toFixed(2)}^\\circ`}
            displayMode
          />
          <MathEquation
            math={`L_{\\text{true}} = \\sqrt{L_p^2 + H^2} = \\sqrt{${geometry.planLength.toFixed(3)}^2 + ${geometry.roofRise.toFixed(3)}^2} = ${geometry.trueLength.toFixed(4)}\\text{ m}`}
            displayMode
          />
        </div>
      </div>

      {/* SECTION 2: Tributary Area & Linear Width Distribution */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Tributary Area & Triangular Tributary Width Formulation</span>
        </h3>
        <p className="text-slate-600 text-[11px]">
          Jack rafters framed at right angles to the external walls span onto the hip rafter. The plan tributary area forms a right triangle / kite bounded by the hip line and the mid-spans of the jack rafters:
        </p>
        <div className="space-y-1.5 py-1">
          <MathEquation
            math={`A_{\\text{trib,plan}} = \\frac{1}{2} \\cdot L_x \\cdot L_y = \\frac{1}{2} \\cdot ${inputs.spanX.toFixed(2)} \\cdot ${inputs.spanY.toFixed(2)} = ${geometry.tributaryAreaPlan.toFixed(3)}\\text{ m}^2`}
            displayMode
          />
          <MathEquation
            math={`w_{\\text{max,plan}} = \\frac{2 \\cdot A_{\\text{trib,plan}}}{L_p} = \\frac{2 \\cdot ${geometry.tributaryAreaPlan.toFixed(2)}}{${geometry.planLength.toFixed(3)}} = ${geometry.maxTributaryWidthPlan.toFixed(3)}\\text{ m}`}
            displayMode
          />
          <MathEquation
            math={`w_{\\text{trib}}(x) = w_{\\text{max}} \\cdot \\left(\\frac{x}{L_{\\text{true}}}\\right) = ${geometry.maxTributaryWidthPlan.toFixed(3)} \\cdot \\left(\\frac{x}{${geometry.trueLength.toFixed(3)}}\\right)`}
            displayMode
          />
        </div>
        <p className="text-[11px] text-slate-600">
          At the eaves corner wall support (<MathEquation math="x = 0" />), tributary width is zero. At the ridge apex (<MathEquation math="x = L" />), tributary width reaches maximum <MathEquation math="w_{\text{max}}" />.
        </p>
      </div>

      {/* SECTION 3: Line Load Conversion */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Line Load Resolution (Governing Combination: 1.2G + 1.5Q)</span>
        </h3>
        <p className="text-slate-600 text-[11px]">
          Area pressures on plan are converted to distributed transverse line load normal to the rafter axis using the slope cosine multiplier <MathEquation math="\cos(\psi)" />:
        </p>
        <div className="space-y-1 py-1">
          <MathEquation
            math={`w_{\\text{peak,tri}} = (1.2 G + 1.5 Q) \\cdot w_{\\text{max,plan}} \\cdot \\cos(\\psi) = [1.2(${inputs.deadLoadKPa}) + 1.5(${inputs.liveLoadKPa})] \\cdot ${geometry.maxTributaryWidthPlan.toFixed(3)} \\cdot \\cos(${geometry.hipSlopeAngleDeg.toFixed(1)}^\\circ) = ${governing.wPeak.toFixed(3)}\\text{ kN/m}`}
            displayMode
          />
          <MathEquation
            math={`w_{\\text{sw}} = 1.2 \\cdot \\gamma \\cdot A_{\\text{section}} \\cdot \\cos(\\psi) = ${section.selfWeightKNm.toFixed(3)}\\text{ kN/m}`}
            displayMode
          />
        </div>
      </div>

      {/* SECTION 4: Reactions via Analytical Integration */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            4
          </span>
          <span>Support Reactions via Definite Integration of Triangular Load</span>
        </h3>
        <p className="text-slate-600 text-[11px]">
          Total resultant triangular load <MathEquation math="W_{\text{tri}}" /> acts at its centroid <MathEquation math="\bar{x} = \frac{2}{3} L" /> from the eaves support:
        </p>
        <div className="space-y-1.5 py-1">
          <MathEquation
            math={`W_{\\text{tri}} = \\int_0^L w_0 \\frac{x}{L} dx = \\frac{1}{2} w_0 L = \\frac{1}{2} (${governing.wPeak.toFixed(2)}) (${geometry.trueLength.toFixed(3)}) = ${(0.5 * governing.wPeak * geometry.trueLength).toFixed(3)}\\text{ kN}`}
            displayMode
          />
          <MathEquation
            math={`R_{\\text{eaves}} = \\frac{1}{6} w_0 L + \\frac{1}{2} w_{\\text{sw}} L = \\frac{1}{6} (${governing.wPeak.toFixed(2)}) (${geometry.trueLength.toFixed(2)}) + \\frac{1}{2} (${section.selfWeightKNm.toFixed(2)}) (${geometry.trueLength.toFixed(2)}) = ${governing.rEavesKN.toFixed(2)}\\text{ kN}`}
            displayMode
          />
          <MathEquation
            math={`R_{\\text{ridge}} = \\frac{1}{3} w_0 L + \\frac{1}{2} w_{\\text{sw}} L = \\frac{1}{3} (${governing.wPeak.toFixed(2)}) (${geometry.trueLength.toFixed(2)}) + \\frac{1}{2} (${section.selfWeightKNm.toFixed(2)}) (${geometry.trueLength.toFixed(2)}) = ${governing.rRidgeKN.toFixed(2)}\\text{ kN}`}
            displayMode
          />
        </div>
        <p className="text-[11px] font-mono text-emerald-800">
          Equilibrium check: <MathEquation math="R_{\text{eaves}} + R_{\text{ridge}} = W_{\text{total}}" /> ✓
        </p>
      </div>

      {/* SECTION 5: Shear & Maximum Bending Moment Derivation */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            5
          </span>
          <span>Zero Shear Location & Maximum Bending Moment (M*)</span>
        </h3>
        <p className="text-slate-600 text-[11px]">
          Shear force distribution <MathEquation math="V(x)" /> along the rafter length:
        </p>
        <div className="space-y-1.5 py-1">
          <MathEquation
            math={`V(x) = R_{\\text{eaves}} - \\int_0^x \\left(w_0 \\frac{t}{L} + w_{\\text{sw}}\\right) dt = R_{\\text{eaves}} - \\frac{w_0 x^2}{2 L} - w_{\\text{sw}} x`}
            displayMode
          />
          <p className="text-slate-600 text-[11px]">
            Setting <MathEquation math="V(x) = 0" /> to find the exact point of maximum bending moment:
          </p>
          <MathEquation
            math={`\\frac{w_0}{2L} x^2 + w_{\\text{sw}} x - R_{\\text{eaves}} = 0 \\implies x_{M_{\\text{max}}} = ${governing.maxMomentLocationM.toFixed(3)}\\text{ m}`}
            displayMode
          />
          <p className="text-slate-600 text-[11px]">
            Note: For pure triangular loading without uniform dead weight, <MathEquation math="x_{M_{\text{max}}} = \\frac{L}{\\sqrt{3}} = 0.57735 L" />.
          </p>
          <MathEquation
            math={`M(x) = R_{\\text{eaves}} x - \\frac{w_0 x^3}{6L} - \\frac{w_{\\text{sw}} x^2}{2}`}
            displayMode
          />
          <MathEquation
            math={`M^*_{\\text{max}} = M(${governing.maxMomentLocationM.toFixed(2)}) = ${governing.maxMomentKNm.toFixed(2)}\\text{ kNm}`}
            displayMode
          />
        </div>
      </div>

      {/* SECTION 6: Member Capacity Checks */}
      <div className="space-y-2 p-3.5 rounded border border-slate-300 bg-slate-50/60 page-break-inside-avoid">
        <h3 className="font-bold text-slate-900 uppercase font-mono text-xs flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center text-[10px]">
            6
          </span>
          <span>Member Section Capacity & Stress Verification</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 font-mono text-xs">
          <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 border-b pb-1">Bending Strength Check:</div>
            <div><MathEquation math={`Z = \\frac{b d^2}{6} = \\frac{(${section.widthMm})(${section.depthMm})^2}{6} = ${(section.sectionModulusZmm3 / 1e3).toFixed(0)} \\times 10^3\\text{ mm}^3`} /></div>
            <div><MathEquation math={`\\phi M_n = \\phi f_b Z = 0.85(${section.f_b_MPa})(${section.sectionModulusZmm3.toFixed(0)}) = ${section.bendingCapacityKNm.toFixed(2)}\\text{ kNm}`} /></div>
            <div className="font-bold text-cyan-800">
              Ratio: <MathEquation math={`\\frac{M^*}{\\phi M_n} = \\frac{${governingActions.mStar.toFixed(2)}}{${section.bendingCapacityKNm.toFixed(2)}} = ${(governingActions.bendingUtilization * 100).toFixed(1)}\\%`} />
            </div>
          </div>

          <div className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 border-b pb-1">Shear Strength Check:</div>
            <div><MathEquation math={`A = b \\cdot d = ${section.widthMm} \\times ${section.depthMm} = ${section.areaMm2}\\text{ mm}^2`} /></div>
            <div><MathEquation math={`\\phi V_n = \\phi \\frac{2}{3} f_v A = 0.85 \\cdot \\frac{2}{3} (${section.f_v_MPa}) (${section.areaMm2}) = ${section.shearCapacityKN.toFixed(2)}\\text{ kN}`} /></div>
            <div className="font-bold text-emerald-800">
              Ratio: <MathEquation math={`\\frac{V^*}{\\phi V_n} = \\frac{${governingActions.vStar.toFixed(2)}}{${section.shearCapacityKN.toFixed(2)}} = ${(governingActions.shearUtilization * 100).toFixed(1)}\\%`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
