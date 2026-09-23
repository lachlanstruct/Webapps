import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Layers,
  CheckSquare,
  Square,
  BookOpen,
  Eye,
} from 'lucide-react';
import {
  HipRafterInputs,
  HipRafterResults,
} from '../../../calculations/hipRafter';
import { HipDiagram } from './HipDiagram';
import { HipHandCalculationsSheet } from './HipHandCalculationsSheet';

interface HipReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: HipRafterInputs;
  results: HipRafterResults;
}

export const HipReportModal: React.FC<HipReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
}) => {
  const [projectName, setProjectName] = useState('Residential Hip Roof Construction');
  const [docRef, setDocRef] = useState('CALC-ROOF-HIP-001');
  const [engineerName, setEngineerName] = useState('Structural Engineer');
  const [checkerName, setCheckerName] = useState('Senior Timber Specialist');
  const [copied, setCopied] = useState(false);

  // Section Toggles
  const [includeHandCalculations, setIncludeHandCalculations] = useState(true);
  const [includeDiagram, setIncludeDiagram] = useState(true);
  const [includeDesignActions, setIncludeDesignActions] = useState(true);
  const [includeCombinations, setIncludeCombinations] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const { geometry, section, governingActions, combinations } = results;

  const handleCopyText = async () => {
    const summary = `
============================================================
STRUCTURAL CALCULATION REPORT: HIP TRUSS / RAFTER ANALYSIS
Project: ${projectName} | Ref: ${docRef} | Date: ${new Date().toLocaleDateString()}
Design Standard: ${inputs.designStandard} | Member: ${section.depthMm}x${section.widthMm}mm Timber
============================================================

1. 3D HIP GEOMETRY:
- Plan Run: Lx = ${inputs.spanX.toFixed(2)} m × Ly = ${inputs.spanY.toFixed(2)} m
- Roof Pitch: ${inputs.pitchDeg.toFixed(1)}° | Ridge Rise H: ${geometry.roofRise.toFixed(3)} m
- Plan Hip Span: ${geometry.planLength.toFixed(3)} m (Angle α: ${geometry.hipPlanAngleDeg.toFixed(1)}°)
- True 3D Hip Span: ${geometry.trueLength.toFixed(3)} m (Rake Angle ψ: ${geometry.hipSlopeAngleDeg.toFixed(1)}°)
- Tributary Area (Plan): ${geometry.tributaryAreaPlan.toFixed(2)} m²
- Peak Tributary Width:  ${geometry.maxTributaryWidthPlan.toFixed(3)} m @ ridge apex

2. APPLIED DESIGN PRESSURES (kPa on plan):
- Dead Load (G): ${inputs.deadLoadKPa.toFixed(2)} kPa
- Live Load (Q): ${inputs.liveLoadKPa.toFixed(2)} kPa
- Wind Uplift (Wu): ${inputs.windUpliftKPa.toFixed(2)} kPa
- Member Self-Weight: ${section.selfWeightKNm.toFixed(3)} kN/m

3. GOVERNING STRUCTURAL DESIGN ACTIONS (M*, V*, N*, R*):
- Design Bending Moment (M*): ${governingActions.mStar.toFixed(2)} kNm [${governingActions.mStarCase}]
  * Capacity (phi*Mn): ${section.bendingCapacityKNm.toFixed(2)} kNm (Utilization: ${(governingActions.bendingUtilization * 100).toFixed(1)}%)
- Design Shear Force (V*):    ${governingActions.vStar.toFixed(2)} kN
  * Capacity (phi*Vn): ${section.shearCapacityKN.toFixed(2)} kN (Utilization: ${(governingActions.shearUtilization * 100).toFixed(1)}%)
- Axial Thrust (N*):          ${governingActions.axialThrustKN.toFixed(2)} kN (Along rafter slope)
- Support Reactions:
  * Eaves Support Downward (R*_eaves):  ${governingActions.rEavesMaxDownKN.toFixed(2)} kN
  * Eaves Support Uplift Tie-Down:     ${governingActions.eavesTieDownUpliftKN.toFixed(2)} kN
  * Ridge Apex Downward (R*_ridge):    ${governingActions.rRidgeMaxDownKN.toFixed(2)} kN
  * Ridge Apex Uplift Tie-Down:        ${governingActions.ridgeTieDownUpliftKN.toFixed(2)} kN
- Serviceability Deflection:   ${governingActions.serviceDeflectionMm.toFixed(1)} mm (Limit L/${inputs.deflectionLimitRatio}: ${governingActions.allowableDeflectionMm.toFixed(1)} mm)

OVERALL ASSESSMENT: ${governingActions.overallStatus === 'pass' ? 'SUITABLE / ADEQUATE (PASS)' : 'UNSATISFACTORY / OVERSTRESSED (FAIL)'}
============================================================
    `.trim();

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="print-modal-content relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex flex-col gap-2 px-5 py-3 bg-slate-850 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  HIP TRUSS / RAFTER CALCULATION REPORT (A4 PDF EXPORT)
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Ready to print or save to PDF with full LaTeX hand calculations & diagrams
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-mono transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save to PDF (A4)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
            <span className="text-slate-400 font-bold text-[11px] uppercase">Include in Report:</span>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeHandCalculations}
                onChange={e => setIncludeHandCalculations(e.target.checked)}
                className="sr-only"
              />
              {includeHandCalculations ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Hand Calculations (LaTeX)</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeDiagram}
                onChange={e => setIncludeDiagram(e.target.checked)}
                className="sr-only"
              />
              {includeDiagram ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Schematic Diagrams</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeDesignActions}
                onChange={e => setIncludeDesignActions(e.target.checked)}
                className="sr-only"
              />
              {includeDesignActions ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Design Values (M*, V*, N*, R*)</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeCombinations}
                onChange={e => setIncludeCombinations(e.target.checked)}
                className="sr-only"
              />
              {includeCombinations ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span>Load Combinations Table</span>
            </label>
          </div>
        </div>

        {/* Printable Report Document Body (A4 Dimensions) */}
        <div className="print-page flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 font-sans">
          {/* Engineering Title Block */}
          <div className="border-2 border-slate-900 p-4 rounded-lg mb-5 bg-slate-50 page-break-inside-avoid">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-300 pb-3 mb-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-xl shadow-xs">
                  ∠
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    HIP TRUSS / RAFTER STRUCTURAL CALCULATION SHEET
                  </h1>
                  <p className="text-xs font-mono text-slate-600">
                    Tributary Loading, 3D Geometry, Moments, Shears & Support Reactions
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-700">
                <div className="font-bold text-slate-900">
                  Doc Ref: <span className="text-cyan-800">{docRef}</span>
                </div>
                <div>Date: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Editable Project Metadata inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Project:</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Calculation Ref:</span>
                <input
                  type="text"
                  value={docRef}
                  onChange={e => setDocRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Engineer:</span>
                <input
                  type="text"
                  value={engineerName}
                  onChange={e => setEngineerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-900 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Member Section:</span>
                <span className="font-bold text-slate-900 block pt-0.5">
                  {section.depthMm}×{section.widthMm}mm Timber
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary Callout */}
          <div className="page-break-inside-avoid p-3.5 rounded-lg border-2 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-50 border-slate-300">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  governingActions.overallStatus === 'pass' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
              <div>
                <span className="font-sans font-bold text-slate-800 uppercase block">
                  Design Adequacy Assessment:
                </span>
                <span className="text-slate-600 text-[11px]">
                  Bending Stress ({(governingActions.bendingUtilization * 100).toFixed(0)}%) • Shear Stress ({(governingActions.shearUtilization * 100).toFixed(0)}%) • Deflection ({governingActions.serviceDeflectionMm.toFixed(1)} mm)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 block text-[10px]">Peak Moment (M*):</span>
                <strong className="text-slate-900 text-sm">
                  {governingActions.mStar.toFixed(2)} kNm
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Eaves Uplift Tie-Down:</span>
                <strong className="text-cyan-800 text-sm">
                  {governingActions.eavesTieDownUpliftKN.toFixed(2)} kN
                </strong>
              </div>

              <span
                className={`px-3 py-1 rounded text-xs font-black ${
                  governingActions.overallStatus === 'pass'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {governingActions.overallStatus === 'pass' ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Section 2: Diagrams (When toggled) */}
          {includeDiagram && (
            <div className="page-break-inside-avoid mb-5 print-diagram-box rounded-lg border border-slate-300 p-2 bg-slate-900 text-white">
              <HipDiagram inputs={inputs} results={results} />
            </div>
          )}

          {/* Section 3: Governing Member Design Actions (M*, V*, N*, R*) (When toggled) */}
          {includeDesignActions && (
            <div className="page-break-inside-avoid mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Governing Structural Design Actions (M*, V*, N*, R*)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs mb-3">
                <div className="p-2.5 rounded border border-slate-300 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Bending Moment:</span>
                  <div className="text-base font-bold text-cyan-800">{governingActions.mStar.toFixed(2)} kNm</div>
                  <div className="text-[10px] text-slate-600">Cap φMn = {section.bendingCapacityKNm.toFixed(2)} kNm</div>
                </div>

                <div className="p-2.5 rounded border border-slate-300 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Transverse Shear:</span>
                  <div className="text-base font-bold text-emerald-800">{governingActions.vStar.toFixed(2)} kN</div>
                  <div className="text-[10px] text-slate-600">Cap φVn = {section.shearCapacityKN.toFixed(2)} kN</div>
                </div>

                <div className="p-2.5 rounded border border-slate-300 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Axial Thrust:</span>
                  <div className="text-base font-bold text-amber-800">{governingActions.axialThrustKN.toFixed(2)} kN</div>
                  <div className="text-[10px] text-slate-600">Slope angle {geometry.hipSlopeAngleDeg.toFixed(1)}°</div>
                </div>

                <div className="p-2.5 rounded border border-slate-300 bg-slate-50 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Service Deflection:</span>
                  <div className="text-base font-bold text-purple-800">{governingActions.serviceDeflectionMm.toFixed(1)} mm</div>
                  <div className="text-[10px] text-slate-600">Limit = {governingActions.allowableDeflectionMm.toFixed(1)} mm</div>
                </div>
              </div>

              {/* Support reactions callout */}
              <div className="p-3 rounded border border-slate-300 bg-slate-50 font-mono text-xs space-y-1">
                <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                  Support Reactions & Tie-Down Connections:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <strong>Eaves Wall Plate Support: </strong>
                    <span className="text-slate-800">Downward R* = {governingActions.rEavesMaxDownKN.toFixed(2)} kN</span>
                    <span className="text-cyan-800 font-bold ml-2">
                      | Uplift Tie-Down = {governingActions.eavesTieDownUpliftKN.toFixed(2)} kN
                    </span>
                  </div>
                  <div>
                    <strong>Ridge Apex Support: </strong>
                    <span className="text-slate-800">Downward R* = {governingActions.rRidgeMaxDownKN.toFixed(2)} kN</span>
                    <span className="text-cyan-800 font-bold ml-2">
                      | Uplift Tie-Down = {governingActions.ridgeTieDownUpliftKN.toFixed(2)} kN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Load Combinations Table */}
          {includeCombinations && (
            <div className="page-break-inside-avoid mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                Load Combination Results Summary
              </h2>
              <table className="w-full text-xs font-mono border border-slate-300 rounded overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 text-left border-b border-slate-300">Combination Case</th>
                    <th className="p-2 text-right border-b border-slate-300">Peak w (kN/m)</th>
                    <th className="p-2 text-right border-b border-slate-300">R_eaves (kN)</th>
                    <th className="p-2 text-right border-b border-slate-300">R_ridge (kN)</th>
                    <th className="p-2 text-right border-b border-slate-300">Max M* (kNm)</th>
                    <th className="p-2 text-right border-b border-slate-300">Max V* (kN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(combinations).map(([key, item]) => (
                    <tr key={key}>
                      <td className="p-2 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-2 text-right">{item.wPeak.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-rose-700">{item.rEavesKN.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">{item.rRidgeKN.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-cyan-800">{item.maxMomentKNm.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-slate-800">{item.maxShearKN.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Hand Calculations (LaTeX) */}
          {includeHandCalculations && (
            <div className="page-break-before mb-6 pt-4 border-t-2 border-slate-300">
              <HipHandCalculationsSheet inputs={inputs} results={results} />
            </div>
          )}

          {/* Section 6: Engineering Certification Sign-Off Block */}
          <div className="page-break-inside-avoid border border-slate-300 rounded p-4 bg-slate-50 text-xs font-mono mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Calculated By:</span>
                <div className="font-bold text-slate-900 pt-1 border-b border-slate-400 min-w-[160px]">
                  {engineerName}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Reviewed / Checked By:</span>
                <div className="font-bold text-slate-900 pt-1 border-b border-slate-400 min-w-[160px]">
                  {checkerName}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Overall Conclusion:</span>
                <div
                  className={`font-black text-sm pt-1 ${
                    governingActions.overallStatus === 'pass' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {governingActions.overallStatus === 'pass'
                    ? 'DESIGN ADEQUATE (PASS)'
                    : 'DESIGN INADEQUATE (FAIL)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
