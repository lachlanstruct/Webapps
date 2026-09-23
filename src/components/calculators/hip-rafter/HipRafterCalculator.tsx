import React, { useState, useMemo, useEffect } from 'react';
import {
  Building,
  RotateCcw,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sliders,
  Layers,
  Wind,
  Compass,
  Box,
  Activity,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import {
  calculateHipRafter,
  DEFAULT_HIP_INPUTS,
  HipRafterInputs,
  TIMBER_PRESETS,
} from '../../../calculations/hipRafter';
import { NumberInput } from '../../common/NumberInput';
import { HipDiagram } from './HipDiagram';
import { HipDesignActionsCard } from './HipDesignActionsCard';
import { HipReportModal } from './HipReportModal';

const HIP_STORAGE_KEY = 'structural_tools_hip_rafter_inputs_v1';

export const HipRafterCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<HipRafterInputs>(() => {
    try {
      const saved = localStorage.getItem(HIP_STORAGE_KEY);
      if (saved) return { ...DEFAULT_HIP_INPUTS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_HIP_INPUTS;
  });

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    geometry: true,
    loads: true,
    member: true,
    standards: true,
  });

  useEffect(() => {
    try {
      localStorage.setItem(HIP_STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // fallback
    }
  }, [inputs]);

  const results = useMemo(() => calculateHipRafter(inputs), [inputs]);

  const updateInput = <K extends keyof HipRafterInputs>(key: K, value: HipRafterInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleReset = () => {
    setInputs(DEFAULT_HIP_INPUTS);
  };

  const applyPreset = (preset: 'cottage' | 'residential' | 'large_span') => {
    if (preset === 'cottage') {
      setInputs({
        ...DEFAULT_HIP_INPUTS,
        spanX: 3.0,
        spanY: 3.0,
        pitchDeg: 22.5,
        memberPresetId: '190x45-mgp10',
      });
    } else if (preset === 'residential') {
      setInputs({
        ...DEFAULT_HIP_INPUTS,
        spanX: 4.5,
        spanY: 4.5,
        pitchDeg: 25.0,
        memberPresetId: '240x45-mgp10',
      });
    } else if (preset === 'large_span') {
      setInputs({
        ...DEFAULT_HIP_INPUTS,
        spanX: 6.0,
        spanY: 6.0,
        pitchDeg: 20.0,
        memberPresetId: '2x240x45-mgp10',
      });
    }
  };

  const handleCopySummary = async () => {
    const text = `
HIP TRUSS / RAFTER STRUCTURAL CALCULATION
Geometry: Lx = ${inputs.spanX.toFixed(2)}m, Ly = ${inputs.spanY.toFixed(2)}m, Pitch = ${inputs.pitchDeg.toFixed(1)}°
Plan Span = ${results.geometry.planLength.toFixed(3)}m | True 3D Span = ${results.geometry.trueLength.toFixed(3)}m
Tributary Area = ${results.geometry.tributaryAreaPlan.toFixed(2)} m² (Peak trib width = ${results.geometry.maxTributaryWidthPlan.toFixed(2)}m)
Loads: Dead G = ${inputs.deadLoadKPa} kPa, Live Q = ${inputs.liveLoadKPa} kPa, Wind Uplift = ${inputs.windUpliftKPa} kPa
Governing Actions:
- Design Moment M* = ${results.governingActions.mStar.toFixed(2)} kNm (Util: ${(results.governingActions.bendingUtilization * 100).toFixed(0)}%)
- Design Shear V* = ${results.governingActions.vStar.toFixed(2)} kN (Util: ${(results.governingActions.shearUtilization * 100).toFixed(0)}%)
- Downward Reaction Eaves R* = ${results.governingActions.rEavesMaxDownKN.toFixed(2)} kN
- Downward Reaction Ridge R* = ${results.governingActions.rRidgeMaxDownKN.toFixed(2)} kN
- Eaves Uplift Tie-Down = ${results.governingActions.eavesTieDownUpliftKN.toFixed(2)} kN
- Service Deflection = ${results.governingActions.serviceDeflectionMm.toFixed(1)} mm (Limit: ${results.governingActions.allowableDeflectionMm.toFixed(1)} mm)
Status: ${results.governingActions.overallStatus.toUpperCase()}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-850 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-black text-xl shadow-xs">
            ∠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                Hip Truss / Rafter Analysis
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                NEW MODULE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Triangular line load integration, 3D rake geometry, moments, shears & support reactions
            </p>
          </div>
        </div>

        {/* Quick Presets & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('cottage')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              3×3m
            </button>
            <button
              type="button"
              onClick={() => applyPreset('residential')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              4.5×4.5m
            </button>
            <button
              type="button"
              onClick={() => applyPreset('large_span')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              6×6m
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Calculation Sheet (A4 PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset to default inputs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section 1: 3D Plan Geometry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('geometry')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  1. Plan Span & Rafter Geometry
                </span>
              </div>
              {openSections.geometry ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.geometry && (
              <div className="p-4 space-y-3.5 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="spanX"
                    label="Plan Length in X Direction"
                    symbol="L_x"
                    value={inputs.spanX}
                    onChange={v => updateInput('spanX', Math.max(0.1, v))}
                    unit="m"
                    step="0.1"
                    min={0.1}
                    helperText="Eaves plate span run along X"
                  />
                  <NumberInput
                    id="spanY"
                    label="Plan Length in Y Direction"
                    symbol="L_y"
                    value={inputs.spanY}
                    onChange={v => updateInput('spanY', Math.max(0.1, v))}
                    unit="m"
                    step="0.1"
                    min={0.1}
                    helperText="Eaves plate span run along Y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="pitchDeg"
                    label="Roof Pitch Angle"
                    symbol="θ"
                    value={inputs.pitchDeg}
                    onChange={v => updateInput('pitchDeg', Math.max(1, Math.min(60, v)))}
                    unit="°"
                    step="0.5"
                    min={1}
                    max={60}
                    helperText="Standard pitch (e.g. 22.5° or 25°)"
                  />
                  <NumberInput
                    id="overhangPlan"
                    label="Eaves Overhang (Plan)"
                    symbol="L_oh"
                    value={inputs.overhangPlan}
                    onChange={v => updateInput('overhangPlan', Math.max(0, v))}
                    unit="m"
                    step="0.05"
                    min={0}
                    helperText="e.g. 0.45m (450mm) soffit run"
                  />
                </div>

                {/* Analytical Geometry Derived Callout */}
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-900/60 text-xs space-y-1">
                  <div className="flex justify-between text-cyan-300 font-bold">
                    <span>Plan Span (L_p): {results.geometry.planLength.toFixed(3)} m</span>
                    <span>Rise (H): {results.geometry.roofRise.toFixed(3)} m</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>True 3D Span (L_true): <strong className="text-white">{results.geometry.trueLength.toFixed(3)} m</strong></span>
                    <span>True Rake (ψ): <strong className="text-white">{results.geometry.hipSlopeAngleDeg.toFixed(1)}°</strong></span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-[11px] pt-1 border-t border-cyan-900/40">
                    <span>Tributary Area: <strong>{results.geometry.tributaryAreaPlan.toFixed(2)} m²</strong></span>
                    <span>Max Trib Width: <strong>{results.geometry.maxTributaryWidthPlan.toFixed(2)} m</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Applied Area Loads */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('loads')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  2. Area Loads on Roof Plan (kPa)
                </span>
              </div>
              {openSections.loads ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.loads && (
              <div className="p-4 space-y-3.5 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="deadLoadKPa"
                    label="Dead Load (Roof + Ceiling)"
                    symbol="G"
                    value={inputs.deadLoadKPa}
                    onChange={v => updateInput('deadLoadKPa', Math.max(0, v))}
                    unit="kPa"
                    step="0.05"
                    min={0}
                    helperText="Metal sheet: 0.40–0.45 kPa • Tiles: 0.75 kPa"
                  />
                  <NumberInput
                    id="liveLoadKPa"
                    label="Roof Maintenance Live Load"
                    symbol="Q"
                    value={inputs.liveLoadKPa}
                    onChange={v => updateInput('liveLoadKPa', Math.max(0, v))}
                    unit="kPa"
                    step="0.05"
                    min={0}
                    helperText="AS/NZS 1170.1 (0.25 kPa for A > 14m²)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="windUpliftKPa"
                    label="Wind Uplift Pressure (Suction)"
                    symbol="W_u"
                    value={inputs.windUpliftKPa}
                    onChange={v => updateInput('windUpliftKPa', Math.max(0, v))}
                    unit="kPa"
                    step="0.05"
                    min={0}
                    helperText="Net uplift suction for tie-down check"
                  />
                  <NumberInput
                    id="windDownKPa"
                    label="Wind Downward Pressure"
                    symbol="W_d"
                    value={inputs.windDownKPa}
                    onChange={v => updateInput('windDownKPa', Math.max(0, v))}
                    unit="kPa"
                    step="0.05"
                    min={0}
                    helperText="Net downward wind pressure"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Member Sizing & Properties */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('member')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  3. Timber / Steel Member Section
                </span>
              </div>
              {openSections.member ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {openSections.member && (
              <div className="p-4 space-y-3.5 font-mono">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Member Preset Section
                  </label>
                  <select
                    value={inputs.memberPresetId}
                    onChange={e => updateInput('memberPresetId', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {TIMBER_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (d={p.depthMm}mm, b={p.widthMm}mm)
                      </option>
                    ))}
                  </select>
                </div>

                {inputs.memberPresetId === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <NumberInput
                      id="customDepthMm"
                      label="Section Depth"
                      symbol="d"
                      value={inputs.customDepthMm ?? 240}
                      onChange={v => updateInput('customDepthMm', v)}
                      unit="mm"
                      step="10"
                      min={50}
                    />
                    <NumberInput
                      id="customWidthMm"
                      label="Section Width"
                      symbol="b"
                      value={inputs.customWidthMm ?? 45}
                      onChange={v => updateInput('customWidthMm', v)}
                      unit="mm"
                      step="5"
                      min={20}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Deflection Limit
                    </label>
                    <select
                      value={inputs.deflectionLimitRatio}
                      onChange={e => updateInput('deflectionLimitRatio', Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value={200}>L / 200 (Eaves / Sheds)</option>
                      <option value={250}>L / 250 (Standard Roof)</option>
                      <option value={300}>L / 300 (Recommended AS)</option>
                      <option value={400}>L / 400 (Plasterboard Ceiling)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Design Standard
                    </label>
                    <select
                      value={inputs.designStandard}
                      onChange={e => updateInput('designStandard', e.target.value as any)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="AS_NZS_1170">AS/NZS 1170.0 Limit State</option>
                      <option value="ASD">ASD Working Stress</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span>Capacity φMn: <strong className="text-cyan-400">{results.section.bendingCapacityKNm.toFixed(2)} kNm</strong></span>
                  <span>Capacity φVn: <strong className="text-emerald-400">{results.section.shearCapacityKN.toFixed(2)} kN</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Diagrams & Outputs (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Diagrams (Plan, Elevation, and SFD/BMD) */}
          <HipDiagram inputs={inputs} results={results} />

          {/* Member Design Actions Card (M*, V*, N*, R*, Deflection) */}
          <HipDesignActionsCard inputs={inputs} results={results} />

          {/* Load Combinations Breakdown Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white uppercase tracking-wider">
                Load Combination Analysis Summary
              </span>
              <span className="text-[11px] text-cyan-400">
                AS/NZS 1170.0 Ultimate & Serviceability
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-1.5 pr-2">Combination</th>
                    <th className="py-1.5 px-2 text-right">Peak w (kN/m)</th>
                    <th className="py-1.5 px-2 text-right">R_eaves (kN)</th>
                    <th className="py-1.5 px-2 text-right">R_ridge (kN)</th>
                    <th className="py-1.5 px-2 text-right">M* (kNm)</th>
                    <th className="py-1.5 pl-2 text-right">V* (kN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {Object.entries(results.combinations).map(([k, c]) => (
                    <tr key={k} className="hover:bg-slate-850/50">
                      <td className="py-2 pr-2 font-medium text-slate-200">{c.name}</td>
                      <td className="py-2 px-2 text-right">{c.wPeak.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold text-rose-400">{c.rEavesKN.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold text-emerald-400">{c.rRidgeKN.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold text-cyan-400">{c.maxMomentKNm.toFixed(2)}</td>
                      <td className="py-2 pl-2 text-right">{c.maxShearKN.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Modal */}
      <HipReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        results={results}
      />
    </div>
  );
};
