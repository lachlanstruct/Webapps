import React, { useState } from 'react';
import {
  Layers,
  Compass,
  Maximize2,
  Activity,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  HipRafterInputs,
  HipRafterResults,
} from '../../../calculations/hipRafter';

interface HipDiagramProps {
  inputs: HipRafterInputs;
  results: HipRafterResults;
}

export type DiagramViewMode = 'plan' | 'elevation' | 'sfd_bmd';

export const HipDiagram: React.FC<HipDiagramProps> = ({ inputs, results }) => {
  const [viewMode, setViewMode] = useState<DiagramViewMode>('plan');
  const [showTributaryHatch, setShowTributaryHatch] = useState(true);

  const { geometry, governingActions, combinations } = results;
  const governingCombo = combinations['strength_1.2G_1.5Q'];

  // Base canvas coordinates
  const svgWidth = 640;
  const svgHeight = 420;

  // Plan View calculations
  const maxSpan = Math.max(inputs.spanX, inputs.spanY, 1.0);
  const planScale = Math.min(220 / maxSpan, 45); // pixels per metre

  const originX = 120;
  const originY = 320; // eaves corner (0,0)

  const wallX_len = inputs.spanX * planScale;
  const wallY_len = inputs.spanY * planScale;

  const apexX = originX + wallX_len;
  const apexY = originY - wallY_len;

  // Jack rafters coordinates for visual demonstration
  const numJacks = Math.max(3, Math.min(8, Math.round(inputs.spanX / 0.6)));
  const jackCoordsX: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const jackCoordsY: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (let i = 1; i < numJacks; i++) {
    const fraction = i / numJacks;
    const hipPtX = originX + fraction * wallX_len;
    const hipPtY = originY - fraction * wallY_len;

    // Jack parallel to Y (spanning from bottom wall)
    jackCoordsX.push({
      x1: hipPtX,
      y1: originY,
      x2: hipPtX,
      y2: hipPtY,
    });

    // Jack parallel to X (spanning from left wall)
    jackCoordsY.push({
      x1: originX,
      y1: hipPtY,
      x2: hipPtX,
      y2: hipPtY,
    });
  }

  // Elevation View calculations
  const elevStartX = 90;
  const elevStartY = 280;
  const elevEndX = 540;
  const elevHeight = Math.min(160, Math.max(40, (geometry.roofRise / geometry.planLength) * 350));
  const elevEndY = elevStartY - elevHeight;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-3">
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider block">
              Hip Geometry & Analysis Diagrams
            </span>
            <span className="text-[10px] text-slate-400">
              {viewMode === 'plan'
                ? 'Roof Plan: Tributary Area & Jack Rafter Framing'
                : viewMode === 'elevation'
                ? 'Rafter Slope Section & Triangular Line Load'
                : 'Shear Force (SFD) & Bending Moment (BMD)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('plan')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              viewMode === 'plan'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Plan View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('elevation')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              viewMode === 'elevation'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Slope Section
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sfd_bmd')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              viewMode === 'sfd_bmd'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SFD / BMD
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative bg-slate-950/70 rounded-lg border border-slate-800/80 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[420px] select-none font-sans"
        >
          <defs>
            {/* Tributary Area Hatch Pattern */}
            <pattern
              id="tribHatch"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="#06b6d4" strokeWidth="1.2" opacity="0.35" />
            </pattern>

            <linearGradient id="hipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="momentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* VIEW 1: PLAN VIEW */}
          {viewMode === 'plan' && (
            <g>
              {/* Tributary Polygon Fill */}
              {showTributaryHatch && (
                <polygon
                  points={`${originX},${originY} ${apexX},${originY} ${apexX},${apexY} ${originX},${apexY}`}
                  fill="url(#tribHatch)"
                  stroke="#0891b2"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* External Walls Perimeter */}
              {/* Bottom Wall along X */}
              <line
                x1={originX}
                y1={originY}
                x2={originX + wallX_len + 50}
                y2={originY}
                stroke="#64748b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text x={originX + wallX_len / 2} y={originY + 22} textAnchor="middle" className="fill-slate-400 font-mono text-[11px]">
                Eaves Wall Plate (Lx = {inputs.spanX.toFixed(2)}m)
              </text>

              {/* Left Wall along Y */}
              <line
                x1={originX}
                y1={originY}
                x2={originX}
                y2={originY - wallY_len - 50}
                stroke="#64748b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x={originX - 22}
                y={originY - wallY_len / 2}
                textAnchor="middle"
                transform={`rotate(-90 ${originX - 22} ${originY - wallY_len / 2})`}
                className="fill-slate-400 font-mono text-[11px]"
              >
                Side Wall Plate (Ly = {inputs.spanY.toFixed(2)}m)
              </text>

              {/* Jack Rafters Framing */}
              {jackCoordsX.map((c, i) => (
                <line
                  key={`jx-${i}`}
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              ))}
              {jackCoordsY.map((c, i) => (
                <line
                  key={`jy-${i}`}
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              ))}

              {/* Central Hip Rafter Member Line */}
              <line
                x1={originX}
                y1={originY}
                x2={apexX}
                y2={apexY}
                stroke="#38bdf8"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Eaves Overhang projection */}
              {inputs.overhangPlan > 0 && (
                <line
                  x1={originX}
                  y1={originY}
                  x2={originX - (inputs.overhangPlan * planScale * Math.cos((geometry.hipPlanAngleDeg * Math.PI) / 180))}
                  y2={originY + (inputs.overhangPlan * planScale * Math.sin((geometry.hipPlanAngleDeg * Math.PI) / 180))}
                  stroke="#0ea5e9"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* Supports / Nodes */}
              {/* Eaves Wall Node */}
              <circle cx={originX} cy={originY} r="6" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
              <text x={originX - 12} y={originY + 16} className="fill-rose-400 font-mono font-bold text-xs">
                EAVES SUPPORT
              </text>

              {/* Apex Node */}
              <circle cx={apexX} cy={apexY} r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <text x={apexX + 10} y={apexY - 8} className="fill-emerald-400 font-mono font-bold text-xs">
                RIDGE APEX
              </text>

              {/* Plan Angle Indicator Arc */}
              <path
                d={`M ${originX + 35} ${originY} A 35 35 0 0 0 ${originX + 35 * Math.cos((geometry.hipPlanAngleDeg * Math.PI) / 180)} ${originY - 35 * Math.sin((geometry.hipPlanAngleDeg * Math.PI) / 180)}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text x={originX + 44} y={originY - 14} className="fill-cyan-300 font-mono font-bold text-[10px]">
                α = {geometry.hipPlanAngleDeg.toFixed(1)}°
              </text>

              {/* Peak Tributary Width callout at Apex */}
              <line x1={apexX} y1={apexY} x2={apexX + 40} y2={apexY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1={apexX} y1={originY} x2={apexX + 40} y2={originY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1={apexX + 35} y1={apexY} x2={apexX + 35} y2={originY} stroke="#f59e0b" strokeWidth="1.5" />
              <text
                x={apexX + 42}
                y={(apexY + originY) / 2}
                className="fill-amber-400 font-mono text-[10px] font-bold"
              >
                w_max = {geometry.maxTributaryWidthPlan.toFixed(2)}m
              </text>

              {/* Hip Rafter Plan Dimension Callout */}
              <text
                x={(originX + apexX) / 2 - 20}
                y={(originY + apexY) / 2 - 16}
                className="fill-cyan-300 font-mono text-xs font-bold bg-slate-900 px-1"
              >
                L_plan = {geometry.planLength.toFixed(2)} m (True: {geometry.trueLength.toFixed(2)} m)
              </text>

              {/* Corner Info Legend */}
              <g transform="translate(420, 20)">
                <rect width="200" height="95" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="12" y="20" className="fill-slate-300 font-mono text-[11px] font-bold">
                  PLAN GEOMETRY SUMMARY:
                </text>
                <text x="12" y="38" className="fill-slate-400 font-mono text-[10px]">
                  • Plan Run: {inputs.spanX.toFixed(2)}m (X) × {inputs.spanY.toFixed(2)}m (Y)
                </text>
                <text x="12" y="54" className="fill-cyan-400 font-mono text-[10px] font-bold">
                  • Plan Hip Span: {geometry.planLength.toFixed(3)} m
                </text>
                <text x="12" y="70" className="fill-emerald-400 font-mono text-[10px]">
                  • Trib Area: {geometry.tributaryAreaPlan.toFixed(2)} m²
                </text>
                <text x="12" y="86" className="fill-amber-400 font-mono text-[10px]">
                  • Max Trib Width: {geometry.maxTributaryWidthPlan.toFixed(2)} m
                </text>
              </g>
            </g>
          )}

          {/* VIEW 2: ELEVATION / SLOPE SECTION VIEW */}
          {viewMode === 'elevation' && (
            <g>
              {/* Ground / Wall level line */}
              <line x1="40" y1={elevStartY} x2="600" y2={elevStartY} stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="590" y={elevStartY + 14} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">
                TOP OF WALL PLATES
              </text>

              {/* Roof Rise Vertical Dimension */}
              <line x1={elevEndX} y1={elevStartY} x2={elevEndX} y2={elevEndY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x={elevEndX + 10} y={(elevStartY + elevEndY) / 2 + 4} className="fill-slate-300 font-mono text-xs font-bold">
                H = {geometry.roofRise.toFixed(2)} m
              </text>

              {/* Triangular Line Load Polygon on Rafter */}
              <polygon
                points={`${elevStartX},${elevStartY} ${elevEndX},${elevEndY} ${elevEndX},${elevEndY - 60}`}
                fill="url(#loadGrad)"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />

              {/* Line load arrows */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => {
                const px = elevStartX + ratio * (elevEndX - elevStartX);
                const py = elevStartY + ratio * (elevEndY - elevStartY);
                const arrowH = ratio * 55;
                return (
                  <g key={`arrow-${ratio}`}>
                    <line x1={px} y1={py - arrowH} x2={px} y2={py - 4} stroke="#fbbf24" strokeWidth="1.5" />
                    <polygon
                      points={`${px - 3},${py - 7} ${px + 3},${py - 7} ${px},${py - 1}`}
                      fill="#fbbf24"
                    />
                  </g>
                );
              })}

              <text x={elevEndX - 10} y={elevEndY - 68} textAnchor="end" className="fill-amber-400 font-mono text-xs font-bold">
                Peak Line Load w_max = {governingCombo.wPeak.toFixed(2)} kN/m
              </text>

              {/* Hip Rafter Member (on true rake slope) */}
              <line
                x1={elevStartX}
                y1={elevStartY}
                x2={elevEndX}
                y2={elevEndY}
                stroke="#38bdf8"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Overhang extension */}
              {inputs.overhangPlan > 0 && (
                <line
                  x1={elevStartX}
                  y1={elevStartY}
                  x2={elevStartX - 40}
                  y2={elevStartY + (40 * (elevStartY - elevEndY)) / (elevEndX - elevStartX)}
                  stroke="#0284c7"
                  strokeWidth="6"
                  strokeDasharray="4 2"
                />
              )}

              {/* Supports */}
              {/* Eaves Support Pin */}
              <polygon
                points={`${elevStartX},${elevStartY} ${elevStartX - 10},${elevStartY + 18} ${elevStartX + 10},${elevStartY + 18}`}
                fill="#f43f5e"
              />
              <text x={elevStartX} y={elevStartY + 34} textAnchor="middle" className="fill-rose-400 font-mono text-xs font-bold">
                R_eaves = {governingActions.rEavesMaxDownKN.toFixed(2)} kN
              </text>

              {/* Apex Support Roller / Girder */}
              <polygon
                points={`${elevEndX},${elevEndY} ${elevEndX - 10},${elevEndY + 18} ${elevEndX + 10},${elevEndY + 18}`}
                fill="#10b981"
              />
              <text x={elevEndX} y={elevEndY + 34} textAnchor="middle" className="fill-emerald-400 font-mono text-xs font-bold">
                R_ridge = {governingActions.rRidgeMaxDownKN.toFixed(2)} kN
              </text>

              {/* True Slope Angle Arc */}
              <path
                d={`M ${elevStartX + 45} ${elevStartY} A 45 45 0 0 0 ${elevStartX + 45 * Math.cos((geometry.hipSlopeAngleDeg * Math.PI) / 180)} ${elevStartY - 45 * Math.sin((geometry.hipSlopeAngleDeg * Math.PI) / 180)}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text x={elevStartX + 55} y={elevStartY - 10} className="fill-cyan-300 font-mono text-xs font-bold">
                Rake Angle ψ = {geometry.hipSlopeAngleDeg.toFixed(1)}°
              </text>

              {/* True Length Dimension Callout */}
              <text
                x={(elevStartX + elevEndX) / 2}
                y={(elevStartY + elevEndY) / 2 + 25}
                textAnchor="middle"
                className="fill-cyan-400 font-mono text-sm font-black"
              >
                True Span L_true = {geometry.trueLength.toFixed(3)} m
              </text>
            </g>
          )}

          {/* VIEW 3: SFD & BMD DIAGRAMS */}
          {viewMode === 'sfd_bmd' && (
            <g>
              {/* TOP: Shear Force Diagram (SFD) */}
              <g transform="translate(70, 40)">
                <text x="0" y="0" className="fill-slate-400 font-mono text-xs font-bold">
                  SHEAR FORCE DIAGRAM (SFD): Max V* = {governingActions.vStar.toFixed(2)} kN
                </text>
                {/* Baseline */}
                <line x1="0" y1="60" x2="500" y2="60" stroke="#475569" strokeWidth="1.5" />

                {/* Shear curve: R_eaves positive, curving down parabolically to R_ridge negative */}
                {/* At x = 0: V = +R_eaves. At zero: x = xM. At end: V = -R_ridge */}
                <path
                  d={`M 0 60 L 0 ${60 - Math.min(45, governingCombo.rEavesKN * 4)} Q 280 ${60 + Math.min(45, governingCombo.rRidgeKN * 4) * 0.4} 500 ${60 + Math.min(45, governingCombo.rRidgeKN * 4)} L 500 60 Z`}
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Zero Shear Marker */}
                <circle cx="288" cy="60" r="4" fill="#f59e0b" />
                <text x="288" y="76" textAnchor="middle" className="fill-amber-400 font-mono text-[10px] font-bold">
                  V = 0 @ {(governingCombo.maxMomentLocationM).toFixed(2)}m (Max M*)
                </text>

                <text x="-5" y={60 - Math.min(45, governingCombo.rEavesKN * 4)} textAnchor="end" className="fill-cyan-300 font-mono text-[10px]">
                  +{governingCombo.rEavesKN.toFixed(1)} kN
                </text>
                <text x="505" y={60 + Math.min(45, governingCombo.rRidgeKN * 4)} textAnchor="start" className="fill-rose-400 font-mono text-[10px]">
                  -{governingCombo.rRidgeKN.toFixed(1)} kN
                </text>
              </g>

              {/* BOTTOM: Bending Moment Diagram (BMD) */}
              <g transform="translate(70, 220)">
                <text x="0" y="0" className="fill-slate-400 font-mono text-xs font-bold">
                  BENDING MOMENT DIAGRAM (BMD): Max M* = {governingActions.mStar.toFixed(2)} kNm
                </text>
                {/* Baseline */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#475569" strokeWidth="1.5" />

                {/* Moment Curve: 0 at ends, peak at ~0.577 L */}
                <path
                  d="M 0 40 Q 288 150 500 40 Z"
                  fill="url(#momentGrad)"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Peak Moment point */}
                <circle cx="288" cy="95" r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                <text x="288" y="115" textAnchor="middle" className="fill-emerald-300 font-mono text-xs font-black">
                  M* = {governingActions.mStar.toFixed(2)} kNm
                </text>
                <text x="288" y="130" textAnchor="middle" className="fill-slate-400 font-mono text-[10px]">
                  Location x = {governingCombo.maxMomentLocationM.toFixed(2)} m from eaves
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Diagram Footer Data Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1 text-slate-400">
        <div>
          <span>Pitch: </span>
          <strong className="text-white">{inputs.pitchDeg.toFixed(1)}°</strong>
          <span className="text-slate-500 mx-2">|</span>
          <span>True Rake: </span>
          <strong className="text-cyan-400">{geometry.hipSlopeAngleDeg.toFixed(1)}°</strong>
        </div>

        <div>
          <span>Plan Length: </span>
          <strong className="text-white">{geometry.planLength.toFixed(2)}m</strong>
          <span className="text-slate-500 mx-2">|</span>
          <span>True 3D Span: </span>
          <strong className="text-cyan-400">{geometry.trueLength.toFixed(2)}m</strong>
        </div>

        <div>
          <span>Tributary Area: </span>
          <strong className="text-emerald-400">{geometry.tributaryAreaPlan.toFixed(2)} m²</strong>
        </div>
      </div>
    </div>
  );
};
