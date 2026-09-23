import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Shield,
  Building,
  User,
  Calendar,
} from 'lucide-react';
import {
  OverturningInputs,
  OverturningResults,
} from '../../../calculations/overturning';
import { EngineeringDiagram } from './EngineeringDiagram';

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const summary = `
============================================================
STRUCTURAL CALCULATION REPORT: CANTILEVER WALL & FOOTING
Project: ${projectName} | Ref: ${docRef} | Date: ${new Date().toLocaleDateString()}
Design Standard: ${results.standardFactors.name} (${results.standardFactors.codeReference})
============================================================

1. DESIGN GEOMETRY & LOADS:
- Wall Height (z): ${inputs.wallHeight.toFixed(2)} m
- Wall Thickness (t): ${inputs.wallThickness.toFixed(2)} m
- Footing: ${inputs.footingWidth.toFixed(2)} m (B) × ${inputs.footingDepth.toFixed(2)} m (D)
- Wind Pressure (p): ${inputs.windPressure.toFixed(2)} kPa × ${inputs.windCoefficient.toFixed(2)} = ${results.designPressure.toFixed(3)} kPa
- Resultant Wind Force (H): ${results.horizontalForce.toFixed(3)} kN/m @ ${(inputs.footingDepth + inputs.wallHeight / 2).toFixed(2)}m from base

2. OVERTURNING STABILITY CHECK:
- Overturning Moment (M_OT): ${results.overturningMoment.toFixed(2)} kNm/m
- Resisting Moment (M_R):   ${results.totalResistingMoment.toFixed(2)} kNm/m
- Factor of Safety (FS):    ${results.overturningRatio !== null ? results.overturningRatio.toFixed(2) : 'N/A'} (Required: ${inputs.requiredRatio?.toFixed(2) ?? '1.50'})
- Overturning Status:       ${results.status.toUpperCase()}

3. SOIL BEARING PRESSURE CHECK:
- Total Vertical Load (N):  ${results.bearing.totalVerticalLoad.toFixed(2)} kN/m
- Eccentricity (e):         ${results.bearing.eccentricity.toFixed(3)} m (Kern limit B/6 = ${results.bearing.kernLimit.toFixed(3)} m)
- Contact Status:           ${results.bearing.contactStatus.replace('_', ' ').toUpperCase()} (Contact: ${results.bearing.contactRatio.toFixed(0)}%)
- Peak Soil Pressure (q_max):${results.bearing.qMax.toFixed(1)} kPa
- Allowable Soil Capacity:  ${results.bearing.allowableCapacity.toFixed(0)} kPa (Utilization: ${(results.bearing.utilizationRatio * 100).toFixed(1)}%)
- Bearing Status:           ${results.bearing.bearingStatus.toUpperCase()}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                ENGINEERING CALCULATION SHEET (PDF EXPORT)
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Ready to print or save as PDF with complete design checks & vector diagram
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
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
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save to PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 font-sans print-page">
          {/* Engineering Title Block */}
          <div className="border-2 border-slate-800 p-4 rounded-lg mb-6 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-300 pb-3 mb-3 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-lg">
                  Σ
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    STRUCTURAL ENGINEERING CALCULATION SHEET
                  </h1>
                  <p className="text-xs font-mono text-slate-600">
                    Cantilever Wall Overturning Stability & Soil Bearing Pressure Check
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-600">
                <div className="font-bold text-slate-900">
                  Doc Ref: <span className="text-cyan-700">{docRef}</span>
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
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-800 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Calculation ID:</span>
                <input
                  type="text"
                  value={docRef}
                  onChange={e => setDocRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-800 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Engineer:</span>
                <input
                  type="text"
                  value={engineerName}
                  onChange={e => setEngineerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-800 text-xs focus:outline-none focus:border-cyan-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Design Code:</span>
                <span className="font-bold text-slate-800 block pt-0.5">
                  {results.standardFactors.name}
                </span>
              </div>
            </div>
          </div>

          {/* High Quality Engineering Diagram */}
          <div className="mb-6 p-2 rounded-lg border border-slate-200 bg-slate-900 text-white">
            <EngineeringDiagram inputs={inputs} results={results} />
          </div>

          {/* Section 1: Design Input Summary */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
              1. Design Input Parameters & Basis of Analysis (1.0 m strip)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block">Wall Height (z):</span>
                <strong className="text-slate-900">{inputs.wallHeight.toFixed(2)} m</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Wall Thickness (t):</span>
                <strong className="text-slate-900">{inputs.wallThickness.toFixed(2)} m</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Footing Width (B):</span>
                <strong className="text-slate-900">{inputs.footingWidth.toFixed(2)} m</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Footing Depth (D):</span>
                <strong className="text-slate-900">{inputs.footingDepth.toFixed(2)} m</strong>
              </div>

              <div>
                <span className="text-slate-500 block">Wind Pressure (p):</span>
                <strong className="text-slate-900">{inputs.windPressure.toFixed(2)} kPa</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Pressure Multiplier (C):</span>
                <strong className="text-slate-900">{inputs.windCoefficient.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Concrete Unit Weight (γ_f):</span>
                <strong className="text-slate-900">{inputs.footingUnitWeight.toFixed(1)} kN/m³</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Allowable Bearing (q_all):</span>
                <strong className="text-slate-900">{inputs.allowableBearingCapacity ?? 150} kPa</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Overturning Calculations Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">
              2. Overturning Moment & Resisting Moment Calculation
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

          {/* Section 3: Summary Results & Bearing Pressure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Overturning Factor of Safety */}
            <div className="p-4 rounded border border-slate-300 bg-slate-50 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-700">
                Overturning Stability Factor of Safety
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  FS = {results.overturningRatio !== null ? results.overturningRatio.toFixed(2) : 'N/A'}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  (Required: ≥ {inputs.requiredRatio?.toFixed(2) ?? '1.50'})
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600">
                Status:{' '}
                <strong
                  className={results.status === 'pass' ? 'text-emerald-700' : 'text-rose-700'}
                >
                  {results.status.toUpperCase()}
                </strong>{' '}
                (Design margin:{' '}
                {results.ratioMargin !== null
                  ? `${results.ratioMargin >= 0 ? '+' : ''}${results.ratioMargin.toFixed(2)}`
                  : 'N/A'}
                )
              </p>
            </div>

            {/* Soil Bearing Pressure */}
            <div className="p-4 rounded border border-slate-300 bg-slate-50 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-700">
                Soil Bearing Pressure Check
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">
                  q_max = {results.bearing.qMax.toFixed(1)} kPa
                </span>
                <span className="text-xs font-mono text-slate-500">
                  (Allowable: {results.bearing.allowableCapacity} kPa)
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600">
                Eccentricity: e = {results.bearing.eccentricity.toFixed(3)} m (Kern B/6 ={' '}
                {results.bearing.kernLimit.toFixed(3)} m) • Contact:{' '}
                <strong>{results.bearing.contactRatio.toFixed(0)}%</strong>
              </p>
              <p className="text-[11px] font-mono text-slate-600">
                Bearing Status:{' '}
                <strong
                  className={
                    results.bearing.bearingStatus === 'pass'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {results.bearing.bearingStatus.toUpperCase()}
                </strong>{' '}
                (Utilization: {(results.bearing.utilizationRatio * 100).toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Section 4: Engineering Sign-off & Certification Block */}
          <div className="border border-slate-300 rounded p-4 bg-slate-50 text-xs font-mono">
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
