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
  ShieldAlert,
} from 'lucide-react';
import {
  OverturningInputs,
  OverturningResults,
} from '../../../calculations/overturning';
import { EngineeringDiagram } from './EngineeringDiagram';
import { HandCalculationsSheet } from './HandCalculationsSheet';
import { MathEquation } from '../../common/MathEquation';

interface CalculationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: OverturningInputs;
  results: OverturningResults;
}

export const CalculationReportModal: React.FC<CalculationReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
}) => {
  const [projectName, setProjectName] = useState('Commercial Boundary Screen Wall');
  const [docRef, setDocRef] = useState('CALC-STR-001');
  const [engineerName, setEngineerName] = useState('Structural Engineer');
  const [checkerName, setCheckerName] = useState('Senior Reviewer');
  const [copied, setCopied] = useState(false);

  // Report Content Toggles
  const [includeHandCalculations, setIncludeHandCalculations] = useState(true);
  const [includeDiagram, setIncludeDiagram] = useState(true);
  const [includeDesignActions, setIncludeDesignActions] = useState(true);
  const [includeBearingCheck, setIncludeBearingCheck] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const { designActions, designStandard } = results;
  const { wall, toe, heel, footing } = designActions;
  const isAS = designStandard === 'AS_NZS_1170';

  const handleCopyText = async () => {
    const summary = `
============================================================
STRUCTURAL CALCULATION REPORT: CANTILEVER WALL & FOOTING
Project: ${projectName} | Ref: ${docRef} | Date: ${new Date().toLocaleDateString()}
Design Standard: ${results.standardFactors.name} (${results.standardFactors.codeReference})
============================================================

1. DESIGN GEOMETRY & LOADS:
- Wall Height (H_w): ${inputs.wallHeight.toFixed(2)} m | Thickness: ${inputs.wallThickness.toFixed(2)} m
- Footing: ${inputs.footingWidth.toFixed(2)} m (B) × ${inputs.footingDepth.toFixed(2)} m (D)
- Wind Pressure (p): ${inputs.windPressure.toFixed(2)} kPa × ${inputs.windCoefficient.toFixed(2)} = ${results.designPressure.toFixed(3)} kPa
- Resultant Wind Force (H): ${results.horizontalForce.toFixed(3)} kN/m @ ${(inputs.footingDepth + inputs.wallHeight / 2).toFixed(2)}m from base

2. OVERTURNING STABILITY CHECK:
- Overturning Moment (M_OT): ${results.overturningMoment.toFixed(2)} kNm/m
- Resisting Moment (M_R):   ${results.totalResistingMoment.toFixed(2)} kNm/m
- Factor of Safety (FS):    ${results.overturningRatio !== null ? results.overturningRatio.toFixed(2) : 'N/A'} (Required: ${inputs.requiredRatio?.toFixed(2) ?? (isAS ? '1.00' : '1.50')})
- Overturning Status:       ${results.status.toUpperCase()}

3. SOIL BEARING PRESSURE CHECK:
- Total Vertical Load (N):  ${results.bearing.totalVerticalLoad.toFixed(2)} kN/m
- Eccentricity (e):         ${results.bearing.eccentricity.toFixed(3)} m (Kern limit B/6 = ${results.bearing.kernLimit.toFixed(3)} m)
- Contact Status:           ${results.bearing.contactStatus.replace('_', ' ').toUpperCase()} (Contact: ${results.bearing.contactRatio.toFixed(0)}%)
- Peak Soil Pressure (q_max):${results.bearing.qMax.toFixed(1)} kPa
- Allowable Soil Capacity:  ${results.bearing.allowableCapacity.toFixed(0)} kPa (Utilization: ${(results.bearing.utilizationRatio * 100).toFixed(1)}%)
- Bearing Status:           ${results.bearing.bearingStatus.toUpperCase()}

4. STRUCTURAL MEMBER DESIGN ACTIONS (M*, V*, N*):
- Wall Stem Base:
  * Design Moment (M*_wall): ${wall.mStar.toFixed(2)} kNm/m
  * Design Shear (V*_wall):  ${wall.vStar.toFixed(2)} kN/m
  * Design Axial (N*_wall):  ${wall.nStar.toFixed(2)} kN/m
- Footing Toe Cantilever (L_toe = ${toe.length.toFixed(3)} m):
  * Design Moment (M*_toe):  ${toe.mStar.toFixed(2)} kNm/m (Bottom Steel)
  * Design Shear (V*_toe):   ${toe.vStar.toFixed(2)} kN/m
  * Critical Shear (V* @ d): ${toe.vStarAtD.toFixed(2)} kN/m (d = ${(toe.effectiveDepthD * 1000).toFixed(0)} mm)
- Footing Heel Cantilever (L_heel = ${heel.length.toFixed(3)} m):
  * Design Moment (M*_heel): ${heel.mStar.toFixed(2)} kNm/m (Top Steel)
  * Design Shear (V*_heel):  ${heel.vStar.toFixed(2)} kN/m
- Base Foundation Actions:
  * Total Base Vertical (N*): ${footing.nStar.toFixed(2)} kN/m
  * Total Base Shear (V*):    ${footing.vStar.toFixed(2)} kN/m
  * Sliding Capacity (phi*Vu):${footing.slidingCapacity.toFixed(2)} kN/m [${footing.slidingStatus.toUpperCase()}]

OVERALL ASSESSMENT: ${results.status === 'pass' && results.bearing.bearingStatus !== 'fail' ? 'SATISFACTORY (PASS)' : 'UNSATISFACTORY (FAIL)'}
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
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print flex flex-col gap-2 px-5 py-3 bg-slate-850 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  ENGINEERING CALCULATION REPORT (A4 PDF EXPORT)
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Formatted for standard A4 portrait sheets with LaTeX equations & design actions
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

          {/* Section Inclusions Toggles */}
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
                <span>Vector Diagram</span>
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
                <span>Design Values (M*, V*, N*)</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeBearingCheck}
                onChange={e => setIncludeBearingCheck(e.target.checked)}
                className="sr-only"
              />
              {includeBearingCheck ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span>Soil Bearing Check</span>
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
                  Σ
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    STRUCTURAL ENGINEERING CALCULATION SHEET
                  </h1>
                  <p className="text-xs font-mono text-slate-600">
                    Cantilever Wall Overturning Stability & Concrete Member Design Actions
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
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Design Standard:</span>
                <span className="font-bold text-slate-900 block pt-0.5">
                  {results.standardFactors.name}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Engineering Assessment Callout */}
          <div className="page-break-inside-avoid p-3.5 rounded-lg border-2 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-slate-50 border-slate-300">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  results.status === 'pass' && results.bearing.bearingStatus !== 'fail'
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}
              />
              <div>
                <span className="font-sans font-bold text-slate-800 uppercase block">
                  Overall Compliance Assessment:
                </span>
                <span className="text-slate-600 text-[11px]">
                  Overturning Factor of Safety + Soil Bearing Capacity Checks
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 block text-[10px]">Overturning Ratio:</span>
                <strong className="text-slate-900 text-sm">
                  {results.overturningRatio !== null ? results.overturningRatio.toFixed(2) : 'N/A'}{' '}
                  <span className="text-slate-500 text-xs font-normal">
                    (Req: ≥ {inputs.requiredRatio?.toFixed(2) ?? (isAS ? '1.00' : '1.50')})
                  </span>
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Peak Soil Bearing:</span>
                <strong className="text-slate-900 text-sm">
                  {results.bearing.qMax.toFixed(1)}{' '}
                  <span className="text-slate-500 text-xs font-normal">
                    / {results.bearing.allowableCapacity} kPa
                  </span>
                </strong>
              </div>

              <span
                className={`px-3 py-1 rounded text-xs font-black ${
                  results.status === 'pass' && results.bearing.bearingStatus !== 'fail'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {results.status === 'pass' && results.bearing.bearingStatus !== 'fail'
                  ? 'PASS'
                  : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Section 2: Vector Diagram (When toggled) */}
          {includeDiagram && (
            <div className="page-break-inside-avoid mb-5 print-diagram-box rounded-lg border border-slate-300 p-2 bg-slate-900 text-white">
              <div className="text-[11px] font-mono text-slate-400 px-2 pt-1 font-bold">
                ENGINEERING SECTION SCHEMATIC & FREE-BODY DIAGRAM
              </div>
              <EngineeringDiagram inputs={inputs} results={results} />
            </div>
          )}

          {/* Section 3: Structural Member Design Actions (M*, V*, N*) (When toggled) */}
          {includeDesignActions && (
            <div className="page-break-inside-avoid mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center justify-between">
                <span>Governing Structural Member Design Actions (M*, V*, N*)</span>
                <span className="text-[10px] font-mono text-cyan-800 font-normal">
                  {isAS ? 'AS 3600:2018 Limit State Design' : 'ASD Working Stress Design'}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mb-3">
                {/* Wall Stem */}
                <div className="p-3 rounded border border-slate-300 bg-slate-50/70 space-y-1.5">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>1. Wall Stem Base</span>
                    <span className="text-[10px] text-slate-500">t = {wall.stemThickness.toFixed(2)}m</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Design Moment (M*):</span>
                      <strong className="text-cyan-800">{wall.mStar.toFixed(2)} kNm/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Design Shear (V*):</span>
                      <strong className="text-cyan-800">{wall.vStar.toFixed(2)} kN/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Design Axial (N*):</span>
                      <strong className="text-cyan-800">{wall.nStar.toFixed(2)} kN/m</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    Location: Base joint at top of footing
                  </div>
                </div>

                {/* Footing Toe */}
                <div className="p-3 rounded border border-slate-300 bg-slate-50/70 space-y-1.5">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>2. Footing Toe</span>
                    <span className="text-[10px] text-slate-500">L = {toe.length.toFixed(3)}m</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Toe Moment (M*):</span>
                      <strong className="text-emerald-800">{toe.mStar.toFixed(2)} kNm/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Face Shear (V*):</span>
                      <strong className="text-emerald-800">{toe.vStar.toFixed(2)} kN/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Critical Shear (V* @ d):</span>
                      <strong className="text-emerald-800">{toe.vStarAtD.toFixed(2)} kN/m</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    Bottom reinforcement layer (Sagging)
                  </div>
                </div>

                {/* Footing Heel */}
                <div className="p-3 rounded border border-slate-300 bg-slate-50/70 space-y-1.5">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>3. Footing Heel</span>
                    <span className="text-[10px] text-slate-500">L = {heel.length.toFixed(3)}m</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Heel Moment (M*):</span>
                      <strong className="text-amber-800">{heel.mStar.toFixed(2)} kNm/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Heel Shear (V*):</span>
                      <strong className="text-amber-800">{heel.vStar.toFixed(2)} kN/m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Downward Load (w):</span>
                      <strong className="text-amber-800">{heel.downwardPressure.toFixed(1)} kPa</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    Top reinforcement layer (Hogging)
                  </div>
                </div>
              </div>

              {/* Foundation Sliding check */}
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-slate-600">Foundation Base Shear & Sliding: </span>
                  <span className="text-slate-800 font-bold">
                    V* = {footing.vStar.toFixed(2)} kN/m
                  </span>
                  <span className="text-slate-500 ml-2">
                    (Sliding Capacity φV_u = {footing.slidingCapacity.toFixed(2)} kN/m)
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
          )}

          {/* Section 4: Input Summary & Overturning Table */}
          <div className="page-break-inside-avoid mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Overturning Moment & Resisting Moment Analysis (1.0 m strip)
            </h2>
            <table className="w-full text-xs font-mono border border-slate-300 rounded overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2 text-left border-b border-slate-300">Action / Load Component</th>
                  <th className="p-2 text-right border-b border-slate-300">Force</th>
                  <th className="p-2 text-right border-b border-slate-300">Lever Arm</th>
                  <th className="p-2 text-right border-b border-slate-300">Overturning (M_OT)</th>
                  <th className="p-2 text-right border-b border-slate-300">Resisting (M_R)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2">
                    Horizontal Wind Load (w = {results.lineLoad.toFixed(2)} kN/m)
                  </td>
                  <td className="p-2 text-right font-semibold">{results.horizontalForce.toFixed(2)} kN</td>
                  <td className="p-2 text-right">{results.windResultantHeightFromBase.toFixed(2)} m</td>
                  <td className="p-2 text-right font-bold text-rose-700">
                    {results.windOverturningMoment.toFixed(2)} kNm
                  </td>
                  <td className="p-2 text-right text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="p-2">Footing Self-Weight (Concrete γ = {inputs.footingUnitWeight} kN/m³)</td>
                  <td className="p-2 text-right font-semibold">{results.footingWeight.toFixed(2)} kN</td>
                  <td className="p-2 text-right">{results.footingLeverArm.toFixed(2)} m</td>
                  <td className="p-2 text-right text-slate-400">—</td>
                  <td className="p-2 text-right font-bold text-emerald-700">
                    {results.footingResistingMoment.toFixed(2)} kNm
                  </td>
                </tr>
                {inputs.includeWallWeight && (
                  <tr>
                    <td className="p-2">Wall Self-Weight (t = {inputs.wallThickness.toFixed(2)}m)</td>
                    <td className="p-2 text-right font-semibold">{results.wallWeight.toFixed(2)} kN</td>
                    <td className="p-2 text-right">{results.wallLeverArm.toFixed(2)} m</td>
                    <td className="p-2 text-right text-slate-400">—</td>
                    <td className="p-2 text-right font-bold text-emerald-700">
                      {results.wallResistingMoment.toFixed(2)} kNm
                    </td>
                  </tr>
                )}
                {results.additionalLoadsDecomposition.map(item => (
                  <tr key={item.id}>
                    <td className="p-2">{item.description} ({item.action})</td>
                    <td className="p-2 text-right font-semibold">
                      {item.verticalForce > 0 ? `${item.verticalForce.toFixed(2)} kN (V)` : `${item.horizontalForce.toFixed(2)} kN (H)`}
                    </td>
                    <td className="p-2 text-right">{item.leverArmToToe.toFixed(2)} m</td>
                    <td className="p-2 text-right font-bold text-rose-700">
                      {item.overturningMoment > 0 ? `${item.overturningMoment.toFixed(2)} kNm` : '—'}
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-700">
                      {item.resistingMoment > 0 ? `${item.resistingMoment.toFixed(2)} kNm` : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2">TOTAL ACTIONS</td>
                  <td className="p-2 text-right">Σ V = {results.bearing.totalVerticalLoad.toFixed(2)} kN</td>
                  <td className="p-2 text-right">—</td>
                  <td className="p-2 text-right text-rose-700">
                    {results.overturningMoment.toFixed(2)} kNm
                  </td>
                  <td className="p-2 text-right text-emerald-700">
                    {results.totalResistingMoment.toFixed(2)} kNm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5: Soil Bearing Pressure (When toggled) */}
          {includeBearingCheck && (
            <div className="page-break-inside-avoid mb-5 p-4 rounded border border-slate-300 bg-slate-50 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-800 uppercase font-sans">
                  Soil Bearing Pressure Distribution & Contact Ratio
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    results.bearing.bearingStatus === 'pass'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {results.bearing.bearingStatus.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Peak Pressure (q_max):</span>
                  <strong className="text-slate-900 text-sm">{results.bearing.qMax.toFixed(1)} kPa</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Allowable Capacity:</span>
                  <strong className="text-slate-900 text-sm">{results.bearing.allowableCapacity} kPa</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Eccentricity (e):</span>
                  <strong className="text-slate-900">{results.bearing.eccentricity.toFixed(3)} m</strong>
                  <span className="text-slate-400 block text-[9px]">(Kern: {results.bearing.kernLimit.toFixed(3)}m)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Contact Status:</span>
                  <strong className="text-slate-900">{results.bearing.contactRatio.toFixed(0)}% in contact</strong>
                  <span className="text-slate-400 block text-[9px]">{results.bearing.contactStatus.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Full Hand Calculations (LaTeX equations) (When toggled) */}
          {includeHandCalculations && (
            <div className="page-break-before mb-6 pt-4 border-t-2 border-slate-300">
              <HandCalculationsSheet inputs={inputs} results={results} />
            </div>
          )}

          {/* Section 7: Engineering Sign-off & Certification Block */}
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
                    results.status === 'pass' && results.bearing.bearingStatus !== 'fail'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {results.status === 'pass' && results.bearing.bearingStatus !== 'fail'
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
