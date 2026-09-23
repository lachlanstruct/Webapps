import React, { useEffect, useMemo, useState } from 'react';
import {
  RotateCcw,
  Trash2,
  Wind,
  Layers,
  Box,
  Compass,
  Sliders,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Bookmark,
  FileText,
  Activity,
  PlusCircle,
} from 'lucide-react';
import {
  calculateOverturning,
  DEFAULT_OVERTURNING_INPUTS,
  getWallCentroidForPreset,
  OverturningInputs,
  validateOverturningInputs,
  WallPositionPreset,
  WindDirection,
} from '../../../calculations/overturning';
import { NumberInput } from '../../common/NumberInput';
import { DimensionUnit, UnitToggle } from '../../common/UnitToggle';
import { EngineeringDiagram } from './EngineeringDiagram';
import { ResultSummaryCard } from './ResultSummaryCard';
import { BearingPressureCard } from './BearingPressureCard';
import { CalculationDetails } from './CalculationDetails';
import { QuickResultsStickyBar } from './QuickResultsStickyBar';
import { StandardsToggle } from './StandardsToggle';
import { AdditionalLoadsManager } from './AdditionalLoadsManager';
import { PresetModal } from './PresetModal';
import { CalculationReportModal } from './CalculationReportModal';

const STORAGE_KEY = 'structural_tools_overturning_inputs_v2';

export const CantileverWallCalculator: React.FC = () => {
  // Dimension display unit mode (metres or millimetres)
  const [dimUnit, setDimUnit] = useState<DimensionUnit>('m');

  // Active wall position preset
  const [wallPreset, setWallPreset] = useState<WallPositionPreset>('centred');

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loadedPresetBanner, setLoadedPresetBanner] = useState<string | null>(null);

  // Mobile accordion sections state
  const [openSections, setOpenSections] = useState({
    standards: true,
    wind: true,
    wall: true,
    footing: true,
    materials: true,
    additionalLoads: true,
  });

  // Main calculation inputs state, initialized with localStorage or default
  const [inputs, setInputs] = useState<OverturningInputs>(() => {
    if (typeof window === 'undefined') return DEFAULT_OVERTURNING_INPUTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_OVERTURNING_INPUTS, ...parsed };
      }
    } catch {
      // fallback to default
    }
    return DEFAULT_OVERTURNING_INPUTS;
  });

  // Save to localStorage on input change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // ignore quota errors
    }
  }, [inputs]);

  // Validation issues
  const validationIssues = useMemo(() => validateOverturningInputs(inputs), [inputs]);
  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const issue of validationIssues) {
      map[issue.field] = issue.message;
    }
    return map;
  }, [validationIssues]);

  // Pure deterministic results calculation
  const results = useMemo(() => calculateOverturning(inputs), [inputs]);

  // Helper conversions between display unit and internal metres
  const toDisplayDim = (valInMetres: number) => {
    return dimUnit === 'mm' ? Math.round(valInMetres * 1000) : Number(valInMetres.toFixed(3));
  };

  const toInternalMetres = (valInDisplay: number) => {
    return dimUnit === 'mm' ? valInDisplay / 1000 : valInDisplay;
  };

  // Dimension step
  const dimStep = dimUnit === 'mm' ? 10 : 0.05;

  // Handlers for inputs
  const updateInput = <K extends keyof OverturningInputs>(key: K, value: OverturningInputs[K]) => {
    setInputs(prev => {
      const next = { ...prev, [key]: value };

      // If footing width or wall thickness changes, re-evaluate preset if not custom
      if (key === 'footingWidth' || key === 'wallThickness') {
        if (wallPreset !== 'custom') {
          const nextB = key === 'footingWidth' ? (value as number) : prev.footingWidth;
          const nextT = key === 'wallThickness' ? (value as number) : prev.wallThickness;
          next.wallCentroidX = getWallCentroidForPreset(wallPreset, nextB, nextT);
        }
      }
      return next;
    });
  };

  const handlePresetChange = (preset: WallPositionPreset) => {
    setWallPreset(preset);
    const newX = getWallCentroidForPreset(
      preset,
      inputs.footingWidth,
      inputs.wallThickness,
      inputs.wallCentroidX
    );
    updateInput('wallCentroidX', newX);
  };

  const handleWindDirectionChange = (direction: WindDirection) => {
    updateInput('windDirection', direction);
  };

  const handleResetDefaults = () => {
    setInputs(DEFAULT_OVERTURNING_INPUTS);
    setWallPreset('centred');
    setDimUnit('m');
    setLoadedPresetBanner(null);
  };

  const handleClearInputs = () => {
    setInputs({
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0,
      windCoefficient: 1.0,
      wallHeight: 1.0,
      wallThickness: 0.15,
      footingWidth: 0.5,
      footingDepth: 0.5,
      footingUnitWeight: 24.0,
      wallUnitWeight: 24.0,
      includeWallWeight: false,
      wallCentroidX: 0.25,
      windDirection: 'left_to_right',
      requiredRatio: 1.5,
      additionalLoads: [],
    });
    setWallPreset('centred');
    setLoadedPresetBanner(null);
  };

  const handleLoadPreset = (newInputs: OverturningInputs, presetName: string) => {
    setInputs(newInputs);
    // Detect if centroid corresponds to standard preset
    const B = newInputs.footingWidth;
    const t = newInputs.wallThickness;
    const x = newInputs.wallCentroidX;
    if (Math.abs(x - B / 2) < 0.01) {
      setWallPreset('centred');
    } else if (Math.abs(x - t / 2) < 0.01) {
      setWallPreset('left');
    } else if (Math.abs(x - (B - t / 2)) < 0.01) {
      setWallPreset('right');
    } else {
      setWallPreset('custom');
    }
    setLoadedPresetBanner(`Loaded preset: "${presetName}"`);
    setTimeout(() => setLoadedPresetBanner(null), 4000);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Allowable bounds for wallCentroidX
  const minCentroidX = inputs.wallThickness / 2;
  const maxCentroidX = Math.max(minCentroidX, inputs.footingWidth - inputs.wallThickness / 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar: Title, Presets, PDF Export, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-[11px] font-semibold">
              FOUNDATIONS & RETAINING
            </span>
            <span className="text-xs text-slate-400 font-mono">1.0 m continuous strip</span>
            {inputs.designStandard === 'AS_NZS_1170' && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-800/80 text-white font-mono text-[10px] font-bold">
                AS/NZS 1170.0
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Cantilever Wall & Footing Stability Calculator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Overturning stability factor of safety, Australian Standards limit states, and soil bearing pressure checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle */}
          <UnitToggle unit={dimUnit} onChange={setDimUnit} />

          {/* Presets Button */}
          <button
            type="button"
            onClick={() => setIsPresetsOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-cyan-800 bg-cyan-950/60 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition shadow-xs"
            title="Load built-in Australian Standards presets or save custom configurations"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          {/* PDF Report Generation Button */}
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-white hover:bg-slate-700 transition shadow-xs"
            title="Generate print-ready engineering calculation sheet and save as PDF"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Calculation Sheet / PDF</span>
          </button>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Reset to default example"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Clear Inputs */}
          <button
            type="button"
            onClick={handleClearInputs}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 hover:border-rose-800 transition"
            title="Clear all fields"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Banner feedback */}
      {loadedPresetBanner && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/80 border border-cyan-700 text-xs font-mono text-cyan-200 animate-fadeIn">
          <span>{loadedPresetBanner}</span>
          <button
            onClick={() => setLoadedPresetBanner(null)}
            className="text-cyan-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Inputs on Left, Diagram & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS COLUMN (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section: Design Standard (ASD vs Australian Standards) */}
          <StandardsToggle
            standard={inputs.designStandard ?? 'ASD'}
            onStandardChange={std => {
              updateInput('designStandard', std);
              if (std === 'AS_NZS_1170') {
                updateInput('requiredRatio', 1.0);
              } else {
                updateInput('requiredRatio', 1.5);
              }
            }}
            as1170Combo={inputs.as1170Combo ?? 'stability_0.9G_Wu'}
            onComboChange={combo => updateInput('as1170Combo', combo)}
          />

          {/* Section 1: Wind Loading */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('wind')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  1. Wind Loading Inputs
                </span>
              </div>
              {openSections.wind ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.wind && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="windPressure"
                    label="Wind Pressure"
                    symbol="p"
                    value={inputs.windPressure}
                    onChange={v => updateInput('windPressure', v)}
                    unit="kPa"
                    step="0.05"
                    min={0}
                    error={errorMap['windPressure']}
                    helperText="Characteristic wind pressure"
                  />
                  <NumberInput
                    id="windCoefficient"
                    label="Pressure Multiplier"
                    symbol="C"
                    value={inputs.windCoefficient}
                    onChange={v => updateInput('windCoefficient', v)}
                    unit="—"
                    step="0.05"
                    min={0}
                    error={errorMap['windCoefficient']}
                    helperText="e.g. 1.30 aerodynamic factor"
                  />
                </div>

                {/* Substituted Line Load banner */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-900/50 text-[11px] font-mono text-cyan-300">
                  <span>
                    Design: {inputs.windPressure.toFixed(2)} × {inputs.windCoefficient.toFixed(2)} ={' '}
                    <strong>{results.designPressure.toFixed(3)} kPa</strong>
                  </span>
                  <span className="text-slate-400">w = {results.lineLoad.toFixed(3)} kN/m</span>
                </div>

                {/* Wind Direction Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Wind Direction & Active Overturning Pivot Toe</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleWindDirectionChange('left_to_right')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border font-mono text-xs transition ${
                        inputs.windDirection === 'left_to_right'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-xs'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold text-cyan-400">Wind →</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Left to Right</span>
                      <span className="text-[9px] text-rose-400 font-semibold mt-0.5">
                        Active Toe: RIGHT edge
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWindDirectionChange('right_to_left')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border font-mono text-xs transition ${
                        inputs.windDirection === 'right_to_left'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white shadow-xs'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-bold text-cyan-400">← Wind</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Right to Left</span>
                      <span className="text-[9px] text-rose-400 font-semibold mt-0.5">
                        Active Toe: LEFT edge
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Cantilever Wall Geometry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('wall')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  2. Wall Geometry & Position
                </span>
              </div>
              {openSections.wall ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.wall && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="wallHeight"
                    label="Wall Height (above footing)"
                    symbol="z"
                    value={toDisplayDim(inputs.wallHeight)}
                    onChange={v => updateInput('wallHeight', Math.max(0.01, toInternalMetres(v)))}
                    unit={dimUnit}
                    step={dimStep}
                    min={0.01}
                    error={errorMap['wallHeight']}
                    helperText="Top of footing to top of wall"
                  />
                  <NumberInput
                    id="wallThickness"
                    label="Wall Thickness"
                    symbol="t"
                    value={toDisplayDim(inputs.wallThickness)}
                    onChange={v => updateInput('wallThickness', Math.max(0.01, toInternalMetres(v)))}
                    unit={dimUnit}
                    step={dimStep}
                    min={0.01}
                    error={errorMap['wallThickness']}
                    helperText="t ≤ footing width B"
                  />
                </div>

                {/* Wall Position Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Wall Alignment on Footing</span>
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400">
                      x_wall = {inputs.wallCentroidX.toFixed(3)} m
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handlePresetChange('left')}
                      className={`py-1.5 px-2 rounded border transition text-center ${
                        wallPreset === 'left'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Left Edge
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange('centred')}
                      className={`py-1.5 px-2 rounded border transition text-center ${
                        wallPreset === 'centred'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Centred
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange('right')}
                      className={`py-1.5 px-2 rounded border transition text-center ${
                        wallPreset === 'right'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Right Edge
                    </button>
                    <button
                      type="button"
                      onClick={() => setWallPreset('custom')}
                      className={`py-1.5 px-2 rounded border transition text-center ${
                        wallPreset === 'custom'
                          ? 'border-cyan-500 bg-cyan-950/60 text-white font-bold'
                          : 'border-slate-800 bg-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Custom x
                    </button>
                  </div>

                  {wallPreset === 'custom' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <NumberInput
                        id="wallCentroidX"
                        label="Wall Centroid Distance (from left edge)"
                        symbol="x_wall"
                        value={toDisplayDim(inputs.wallCentroidX)}
                        onChange={v => {
                          const internalVal = toInternalMetres(v);
                          const clamped = Math.max(minCentroidX, Math.min(maxCentroidX, internalVal));
                          updateInput('wallCentroidX', clamped);
                        }}
                        unit={dimUnit}
                        step={dimStep}
                        min={toDisplayDim(minCentroidX)}
                        max={toDisplayDim(maxCentroidX)}
                        error={errorMap['wallCentroidX']}
                        helperText={`Valid range: ${toDisplayDim(minCentroidX)} to ${toDisplayDim(maxCentroidX)} ${dimUnit}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Footing Geometry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('footing')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  3. Concrete Footing Dimensions
                </span>
              </div>
              {openSections.footing ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.footing && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumberInput
                    id="footingWidth"
                    label="Footing Width"
                    symbol="B"
                    value={toDisplayDim(inputs.footingWidth)}
                    onChange={v => updateInput('footingWidth', Math.max(0.01, toInternalMetres(v)))}
                    unit={dimUnit}
                    step={dimStep}
                    min={0.01}
                    error={errorMap['footingWidth']}
                    helperText="Total horizontal width of footing"
                  />
                  <NumberInput
                    id="footingDepth"
                    label="Footing Depth"
                    symbol="D"
                    value={toDisplayDim(inputs.footingDepth)}
                    onChange={v => updateInput('footingDepth', Math.max(0.01, toInternalMetres(v)))}
                    unit={dimUnit}
                    step={dimStep}
                    min={0.01}
                    error={errorMap['footingDepth']}
                    helperText="Total vertical thickness of footing"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Material Densities & Weights */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('materials')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  4. Material Densities & Self-Weight
                </span>
              </div>
              {openSections.materials ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.materials && (
              <div className="p-4 space-y-3.5">
                <NumberInput
                  id="footingUnitWeight"
                  label="Concrete Unit Weight"
                  symbol="γ_f"
                  value={inputs.footingUnitWeight}
                  onChange={v => updateInput('footingUnitWeight', v)}
                  unit="kN/m³"
                  step="0.5"
                  min={1}
                  error={errorMap['footingUnitWeight']}
                  helperText="Normal reinforced concrete: 24–25 kN/m³"
                />

                {/* Wall Self Weight Checkbox */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.includeWallWeight}
                      onChange={e => updateInput('includeWallWeight', e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 accent-cyan-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">
                        Include Wall Self-Weight in Resisting Moment
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Adds W_wall = γ_w × t × z into the resisting moment M_R
                      </p>
                    </div>
                  </label>

                  {inputs.includeWallWeight && (
                    <div className="mt-3 pl-6">
                      <NumberInput
                        id="wallUnitWeight"
                        label="Wall Unit Weight"
                        symbol="γ_w"
                        value={inputs.wallUnitWeight}
                        onChange={v => updateInput('wallUnitWeight', v)}
                        unit="kN/m³"
                        step="0.5"
                        min={1}
                        error={errorMap['wallUnitWeight']}
                        helperText="Masonry/Concrete: 20–24 kN/m³ • Timber: 6–8 kN/m³"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Additional Applied Loads (UDL, Point Loads, Moments) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('additionalLoads')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-850 hover:bg-slate-800/80 transition text-left"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  5. Additional Loads (UDL, Point, Moments)
                </span>
                {(inputs.additionalLoads?.length ?? 0) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
                    {inputs.additionalLoads?.length} active
                  </span>
                )}
              </div>
              {openSections.additionalLoads ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.additionalLoads && (
              <div className="p-4">
                <AdditionalLoadsManager
                  loads={inputs.additionalLoads ?? []}
                  onChange={loads => updateInput('additionalLoads', loads)}
                  footingWidth={inputs.footingWidth}
                  wallHeight={inputs.wallHeight}
                  footingDepth={inputs.footingDepth}
                  wallCentroidX={inputs.wallCentroidX}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols on lg): Live Diagram & Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic SVG Diagram with Layer Toggles */}
          <EngineeringDiagram inputs={inputs} results={results} />

          {/* Results Summary Card */}
          <ResultSummaryCard
            inputs={inputs}
            results={results}
            onRequiredRatioChange={val => updateInput('requiredRatio', val)}
          />

          {/* Soil Bearing Pressure Check Card */}
          <BearingPressureCard
            bearing={results.bearing}
            footingWidth={inputs.footingWidth}
            allowableCapacity={inputs.allowableBearingCapacity ?? 150}
            onAllowableCapacityChange={val => updateInput('allowableBearingCapacity', val)}
          />

          {/* Expandable Calculation Details Breakdown */}
          <CalculationDetails inputs={inputs} results={results} />
        </div>
      </div>

      {/* Mobile Sticky Quick Summary Bar */}
      <QuickResultsStickyBar
        results={results}
        requiredRatio={inputs.requiredRatio}
      />

      {/* Presets Management Modal */}
      <PresetModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        currentInputs={inputs}
        onLoadPreset={handleLoadPreset}
      />

      {/* Engineering Calculation Sheet / PDF Export Modal */}
      <CalculationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        results={results}
      />
    </div>
  );
};
