import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  Maximize2,
  Check,
  Activity,
  Layers,
  Compass,
} from 'lucide-react';
import {
  OverturningInputs,
  OverturningResults,
} from '../../../calculations/overturning';

interface EngineeringDiagramProps {
  inputs: OverturningInputs;
  results: OverturningResults;
}

export interface DiagramLayerToggles {
  dimensions: boolean;
  windLoads: boolean;
  gravityWeights: boolean;
  moments: boolean;
  bearingPressure: boolean;
}

export const EngineeringDiagram: React.FC<EngineeringDiagramProps> = ({ inputs, results }) => {
  const {
    footingWidth,
    footingDepth,
    wallHeight,
    wallThickness,
    wallCentroidX,
    windDirection,
    includeWallWeight,
    additionalLoads = [],
  } = inputs;

  const {
    horizontalForce,
    footingWeight,
    wallWeight,
    wallLeverArm,
    overturningMoment,
    bearing,
  } = results;

  const isLeftToRight = windDirection === 'left_to_right';

  // Diagram visibility layer toggles
  const [layers, setLayers] = useState<DiagramLayerToggles>({
    dimensions: true,
    windLoads: true,
    gravityWeights: true,
    moments: true,
    bearingPressure: true,
  });

  const toggleLayer = (layer: keyof DiagramLayerToggles) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const setAllLayers = (val: boolean) => {
    setLayers({
      dimensions: val,
      windLoads: val,
      gravityWeights: val,
      moments: val,
      bearingPressure: val,
    });
  };

  // Base canvas coordinate boundaries
  const svgWidth = 640;
  const svgHeight = layers.bearingPressure ? 490 : 430;

  // Ground level Y in SVG coordinates
  const groundY = 230;

  // Visual geometric proportions
  const normB = Math.max(0.2, Math.min(3.0, footingWidth));
  const normD = Math.max(0.2, Math.min(2.0, footingDepth));
  const normZ = Math.max(0.4, Math.min(4.0, wallHeight));
  const normT = Math.max(0.05, Math.min(footingWidth, wallThickness));

  // Compute visual scales
  const visualFootingWidth = Math.min(300, Math.max(160, 200 * (normB / 0.6)));
  const visualFootingDepth = Math.min(90, Math.max(45, 75 * (normD / 0.6)));
  const visualWallHeight = Math.min(160, Math.max(85, 135 * (normZ / 1.2)));

  // Wall thickness clamp
  const ratioT = Math.min(1, Math.max(0.05, normT / normB));
  const visualWallThickness = Math.max(16, Math.min(visualFootingWidth * 0.7, visualFootingWidth * ratioT));

  // Footing positions
  const footingCenterX = 320;
  const footingLeftX = footingCenterX - visualFootingWidth / 2;
  const footingRightX = footingCenterX + visualFootingWidth / 2;
  const footingTopY = groundY;
  const footingBottomY = groundY + visualFootingDepth;

  // Wall position
  const wallCentroidRatio = footingWidth > 0 ? Math.max(0, Math.min(1, wallCentroidX / footingWidth)) : 0.5;
  const visualWallCenterX = footingLeftX + wallCentroidRatio * visualFootingWidth;
  const visualWallLeftX = Math.max(footingLeftX, Math.min(footingRightX - visualWallThickness, visualWallCenterX - visualWallThickness / 2));
  const visualWallRightX = visualWallLeftX + visualWallThickness;
  const visualWallTopY = groundY - visualWallHeight;

  // Wind load resultant height
  const visualH_Y = groundY - visualWallHeight / 2;

  // Active toe coordinates
  const toeX = isLeftToRight ? footingRightX : footingLeftX;
  const toeY = footingBottomY;
  const heelX = isLeftToRight ? footingLeftX : footingRightX;
  const heelY = footingBottomY;

  // Bearing pressure visual coordinates
  const bearingDepthMax = 55; // maximum visual height of pressure bulb
  const qScale = Math.max(0.1, bearing.qMax);
  const visualQMax = bearing.qMax > 0 ? Math.min(bearingDepthMax, Math.max(15, (bearing.qMax / Math.max(50, bearing.allowableCapacity)) * 45)) : 0;
  const visualQMin = bearing.qMax > 0 ? (bearing.qMin / qScale) * visualQMax : 0;

  // Contact width coordinates
  const contactFraction = Math.min(1, Math.max(0, bearing.contactRatio / 100));
  const visualContactWidth = visualFootingWidth * contactFraction;

  let bearingPolyPoints = '';
  if (isLeftToRight) {
    // Left-to-right wind tips to right: toe is at footingRightX (q_max at right, q_min or 0 to left)
    const contactStartX = footingRightX - visualContactWidth;
    bearingPolyPoints = `${footingRightX},${footingBottomY} ${contactStartX},${footingBottomY} ${contactStartX},${footingBottomY + visualQMin} ${footingRightX},${footingBottomY + visualQMax}`;
  } else {
    // Right-to-left wind tips to left: toe is at footingLeftX (q_max at left)
    const contactEndX = footingLeftX + visualContactWidth;
    bearingPolyPoints = `${footingLeftX},${footingBottomY} ${contactEndX},${footingBottomY} ${contactEndX},${footingBottomY + visualQMin} ${footingLeftX},${footingBottomY + visualQMax}`;
  }

  return (
    <div className="w-full flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 p-3 shadow-inner select-none overflow-hidden">
      {/* Top Header & Layer Toggles */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-slate-300">
            ENGINEERING DIAGRAM
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            (1.0 m strip • {isLeftToRight ? 'Wind →' : '← Wind'})
          </span>
        </div>

        {/* Layer Toggle Chips */}
        <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => toggleLayer('dimensions')}
            className={`px-2 py-0.5 rounded border transition ${
              layers.dimensions
                ? 'bg-slate-800 border-slate-600 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
            title="Toggle geometry dimensions"
          >
            📐 Dims
          </button>
          <button
            type="button"
            onClick={() => toggleLayer('windLoads')}
            className={`px-2 py-0.5 rounded border transition ${
              layers.windLoads
                ? 'bg-slate-800 border-slate-600 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
            title="Toggle wind and lateral load vectors"
          >
            💨 Wind
          </button>
          <button
            type="button"
            onClick={() => toggleLayer('gravityWeights')}
            className={`px-2 py-0.5 rounded border transition ${
              layers.gravityWeights
                ? 'bg-slate-800 border-slate-600 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
            title="Toggle self-weights and vertical loads"
          >
            ⚖️ Weights
          </button>
          <button
            type="button"
            onClick={() => toggleLayer('moments')}
            className={`px-2 py-0.5 rounded border transition ${
              layers.moments
                ? 'bg-slate-800 border-slate-600 text-rose-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
            title="Toggle pivot toe and overturning moment"
          >
            🔄 Moments
          </button>
          <button
            type="button"
            onClick={() => toggleLayer('bearingPressure')}
            className={`px-2 py-0.5 rounded border transition ${
              layers.bearingPressure
                ? 'bg-slate-800 border-slate-600 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
            }`}
            title="Toggle soil bearing pressure distribution under base"
          >
            📊 Bearing
          </button>

          <button
            type="button"
            onClick={() => setAllLayers(!layers.dimensions)}
            className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition ml-1"
            title="Toggle all layers"
          >
            {layers.dimensions ? 'Clean' : 'All'}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-h-[440px] text-slate-100 font-sans"
      >
        <defs>
          {/* Soil hatching pattern */}
          <pattern
            id="groundPattern"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="12" stroke="#334155" strokeWidth="1.5" />
          </pattern>

          {/* Bearing pressure soil hatch */}
          <pattern
            id="bearingPattern"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6" />
          </pattern>

          {/* Wall gradient */}
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Footing concrete gradient */}
          <linearGradient id="footingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Markers */}
          <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="arrowCyanRev" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 Z" fill="#38bdf8" />
          </marker>
          <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
          </marker>
          <marker id="arrowRose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f43f5e" />
          </marker>
          <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Soil Backdrop */}
        <rect
          x="30"
          y={footingTopY}
          width={Math.max(0, footingLeftX - 30)}
          height={visualFootingDepth + 20}
          fill="url(#groundPattern)"
          opacity="0.25"
        />
        <rect
          x={footingRightX}
          y={footingTopY}
          width={Math.max(0, svgWidth - 30 - footingRightX)}
          height={visualFootingDepth + 20}
          fill="url(#groundPattern)"
          opacity="0.25"
        />

        {/* Ground Line */}
        <line
          x1="30"
          y1={groundY}
          x2={svgWidth - 30}
          y2={groundY}
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="6 3"
        />
        <text
          x={svgWidth - 35}
          y={groundY - 6}
          textAnchor="end"
          className="fill-slate-500 font-mono text-[9px]"
        >
          TOP OF FOOTING / GROUND
        </text>

        {/* Concrete Footing */}
        <rect
          x={footingLeftX}
          y={footingTopY}
          width={visualFootingWidth}
          height={visualFootingDepth}
          fill="url(#footingGradient)"
          stroke="#cbd5e1"
          strokeWidth="2"
          rx="2"
        />

        {/* Footing Centroid Line */}
        <line
          x1={footingCenterX}
          y1={footingTopY}
          x2={footingCenterX}
          y2={footingBottomY}
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Cantilever Wall */}
        <rect
          x={visualWallLeftX}
          y={visualWallTopY}
          width={visualWallThickness}
          height={visualWallHeight}
          fill="url(#wallGradient)"
          stroke="#e0f2fe"
          strokeWidth="2"
          rx="1"
        />

        {/* Wall Centroid Line */}
        <line
          x1={visualWallCenterX}
          y1={visualWallTopY}
          x2={visualWallCenterX}
          y2={footingBottomY}
          stroke="#0284c7"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* LAYER: WIND & LATERAL LOADS */}
        {layers.windLoads && (
          <g>
            {/* Distributed wind arrows */}
            {(() => {
              const arrowCount = 4;
              const arrows = [];
              const stepY = visualWallHeight / (arrowCount + 1);
              const arrowLen = 42;

              for (let i = 1; i <= arrowCount; i++) {
                const y = visualWallTopY + i * stepY;
                if (isLeftToRight) {
                  const xStart = visualWallLeftX - arrowLen - 6;
                  const xEnd = visualWallLeftX - 4;
                  arrows.push(
                    <line
                      key={`w-arr-${i}`}
                      x1={xStart}
                      y1={y}
                      x2={xEnd}
                      y2={y}
                      stroke="#38bdf8"
                      strokeWidth="1.75"
                      markerEnd="url(#arrowCyan)"
                    />
                  );
                } else {
                  const xStart = visualWallRightX + arrowLen + 6;
                  const xEnd = visualWallRightX + 4;
                  arrows.push(
                    <line
                      key={`w-arr-${i}`}
                      x1={xStart}
                      y1={y}
                      x2={xEnd}
                      y2={y}
                      stroke="#38bdf8"
                      strokeWidth="1.75"
                      markerEnd="url(#arrowCyanRev)"
                    />
                  );
                }
              }
              return arrows;
            })()}

            {/* w label */}
            <text
              x={isLeftToRight ? visualWallLeftX - 50 : visualWallRightX + 50}
              y={visualWallTopY + 16}
              textAnchor={isLeftToRight ? 'end' : 'start'}
              className="fill-cyan-400 font-mono text-[10px] font-bold"
            >
              w = {results.lineLoad.toFixed(2)} kN/m
            </text>

            {/* Resultant Wind Force H */}
            {isLeftToRight ? (
              <g>
                <line
                  x1={visualWallLeftX - 75}
                  y1={visualH_Y}
                  x2={visualWallLeftX - 4}
                  y2={visualH_Y}
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  markerEnd="url(#arrowCyan)"
                />
                <circle cx={visualWallLeftX - 4} cy={visualH_Y} r="3" fill="#0284c7" />
                <text
                  x={visualWallLeftX - 80}
                  y={visualH_Y - 6}
                  textAnchor="end"
                  className="fill-cyan-300 font-mono text-[11px] font-bold"
                >
                  H = {horizontalForce.toFixed(2)} kN
                </text>
              </g>
            ) : (
              <g>
                <line
                  x1={visualWallRightX + 75}
                  y1={visualH_Y}
                  x2={visualWallRightX + 4}
                  y2={visualH_Y}
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  markerEnd="url(#arrowCyanRev)"
                />
                <circle cx={visualWallRightX + 4} cy={visualH_Y} r="3" fill="#0284c7" />
                <text
                  x={visualWallRightX + 80}
                  y={visualH_Y - 6}
                  textAnchor="start"
                  className="fill-cyan-300 font-mono text-[11px] font-bold"
                >
                  H = {horizontalForce.toFixed(2)} kN
                </text>
              </g>
            )}

            {/* Additional point horizontal loads */}
            {additionalLoads
              .filter(l => l.type === 'point_horizontal')
              .map((load, idx) => {
                const yPos = visualWallTopY;
                return (
                  <g key={`add-h-${idx}`}>
                    <line
                      x1={isLeftToRight ? visualWallLeftX - 55 : visualWallRightX + 55}
                      y1={yPos}
                      x2={isLeftToRight ? visualWallLeftX - 4 : visualWallRightX + 4}
                      y2={yPos}
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      markerEnd={isLeftToRight ? 'url(#arrowRose)' : 'url(#arrowCyanRev)'}
                    />
                    <text
                      x={isLeftToRight ? visualWallLeftX - 60 : visualWallRightX + 60}
                      y={yPos - 4}
                      textAnchor={isLeftToRight ? 'end' : 'start'}
                      className="fill-rose-400 font-mono text-[10px] font-bold"
                    >
                      {load.name}: {load.value.toFixed(1)} kN/m
                    </text>
                  </g>
                );
              })}
          </g>
        )}

        {/* LAYER: GRAVITY WEIGHTS & SURCHARGES */}
        {layers.gravityWeights && (
          <g>
            {/* Footing Self-Weight W_f */}
            <g>
              <line
                x1={footingCenterX}
                y1={footingTopY + 8}
                x2={footingCenterX}
                y2={footingBottomY - 8}
                stroke="#22c55e"
                strokeWidth="2.5"
                markerEnd="url(#arrowGreen)"
              />
              <text
                x={footingCenterX + 6}
                y={footingTopY + visualFootingDepth / 2}
                className="fill-emerald-400 font-mono text-[10px] font-bold"
              >
                W_f = {footingWeight.toFixed(1)} kN
              </text>
            </g>

            {/* Wall Self-Weight W_wall */}
            {includeWallWeight && (
              <g>
                <line
                  x1={visualWallCenterX}
                  y1={visualWallTopY + visualWallHeight * 0.3}
                  x2={visualWallCenterX}
                  y2={visualWallTopY + visualWallHeight * 0.8}
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowGreen)"
                />
                <text
                  x={visualWallCenterX > footingCenterX ? visualWallLeftX - 6 : visualWallRightX + 6}
                  y={visualWallTopY + visualWallHeight * 0.6}
                  textAnchor={visualWallCenterX > footingCenterX ? 'end' : 'start'}
                  className="fill-emerald-400 font-mono text-[10px] font-bold"
                >
                  W_w = {wallWeight.toFixed(1)} kN
                </text>
              </g>
            )}

            {/* Additional point vertical loads */}
            {additionalLoads
              .filter(l => l.type === 'point_vertical')
              .map((load, idx) => {
                const posXRatio = (load.positionX ?? wallCentroidX) / footingWidth;
                const vX = footingLeftX + posXRatio * visualFootingWidth;
                return (
                  <g key={`add-v-${idx}`}>
                    <line
                      x1={vX}
                      y1={visualWallTopY - 26}
                      x2={vX}
                      y2={visualWallTopY - 4}
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      markerEnd="url(#arrowGreen)"
                    />
                    <text
                      x={vX}
                      y={visualWallTopY - 30}
                      textAnchor="middle"
                      className="fill-emerald-300 font-mono text-[9px] font-bold"
                    >
                      P = {load.value.toFixed(1)} kN/m
                    </text>
                  </g>
                );
              })}

            {/* Additional surcharge UDL on heel */}
            {additionalLoads
              .filter(l => l.type === 'surcharge_udl')
              .map((load, idx) => {
                const heelStartX = isLeftToRight ? footingLeftX : visualWallRightX;
                const heelEndX = isLeftToRight ? visualWallLeftX : footingRightX;
                const heelW = Math.max(10, heelEndX - heelStartX);
                return (
                  <g key={`surcharge-${idx}`}>
                    <rect
                      x={heelStartX}
                      y={groundY - 18}
                      width={heelW}
                      height={18}
                      fill="#f59e0b"
                      opacity="0.2"
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={heelStartX + heelW / 2}
                      y={groundY - 6}
                      textAnchor="middle"
                      className="fill-amber-400 font-mono text-[9px] font-bold"
                    >
                      q = {load.value.toFixed(1)} kPa
                    </text>
                  </g>
                );
              })}
          </g>
        )}

        {/* LAYER: MOMENTS & PIVOT TOE */}
        {layers.moments && (
          <g>
            {/* Active Toe Highlight */}
            <circle
              cx={toeX}
              cy={toeY}
              r="7"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="2"
              className="animate-pulse"
            />
            <text
              x={toeX + (isLeftToRight ? 10 : -10)}
              y={toeY + 4}
              textAnchor={isLeftToRight ? 'start' : 'end'}
              className="fill-rose-400 font-mono text-[11px] font-bold uppercase"
            >
              ▲ TOE (PIVOT)
            </text>

            {/* Overturning Moment Arc */}
            {isLeftToRight ? (
              <g>
                <path
                  d={`M ${toeX + 14} ${toeY - 26} A 30 30 0 0 1 ${toeX + 28} ${toeY + 12}`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#arrowRose)"
                />
                <text
                  x={toeX + 36}
                  y={toeY - 10}
                  className="fill-rose-400 font-mono text-[10px] font-bold"
                >
                  M_OT = {overturningMoment.toFixed(1)} kNm
                </text>
              </g>
            ) : (
              <g>
                <path
                  d={`M ${toeX - 14} ${toeY - 26} A 30 30 0 0 0 ${toeX - 28} ${toeY + 12}`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#arrowRose)"
                />
                <text
                  x={toeX - 36}
                  y={toeY - 10}
                  textAnchor="end"
                  className="fill-rose-400 font-mono text-[10px] font-bold"
                >
                  M_OT = {overturningMoment.toFixed(1)} kNm
                </text>
              </g>
            )}

            {/* Wall lever arm line */}
            {includeWallWeight && (
              <g>
                <line
                  x1={visualWallCenterX}
                  y1={footingBottomY + 10}
                  x2={toeX}
                  y2={footingBottomY + 10}
                  stroke="#22c55e"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={(visualWallCenterX + toeX) / 2}
                  y={footingBottomY + 8}
                  textAnchor="middle"
                  className="fill-emerald-400 font-mono text-[8px]"
                >
                  L_w = {wallLeverArm.toFixed(2)}m
                </text>
              </g>
            )}
          </g>
        )}

        {/* LAYER: DIMENSIONS */}
        {layers.dimensions && (
          <g>
            {/* Footing Width B */}
            <line
              x1={footingLeftX}
              y1={footingBottomY + (layers.bearingPressure ? visualQMax + 24 : 24)}
              x2={footingRightX}
              y2={footingBottomY + (layers.bearingPressure ? visualQMax + 24 : 24)}
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <line
              x1={footingLeftX}
              y1={footingBottomY + 4}
              x2={footingLeftX}
              y2={footingBottomY + (layers.bearingPressure ? visualQMax + 30 : 30)}
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1={footingRightX}
              y1={footingBottomY + 4}
              x2={footingRightX}
              y2={footingBottomY + (layers.bearingPressure ? visualQMax + 30 : 30)}
              stroke="#64748b"
              strokeWidth="1"
            />
            <text
              x={footingCenterX}
              y={footingBottomY + (layers.bearingPressure ? visualQMax + 36 : 36)}
              textAnchor="middle"
              className="fill-slate-300 font-mono text-[10px] font-semibold"
            >
              B = {footingWidth.toFixed(2)} m
            </text>

            {/* Footing Depth D */}
            <line
              x1={isLeftToRight ? footingLeftX - 18 : footingRightX + 18}
              y1={footingTopY}
              x2={isLeftToRight ? footingLeftX - 18 : footingRightX + 18}
              y2={footingBottomY}
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <text
              x={isLeftToRight ? footingLeftX - 24 : footingRightX + 24}
              y={footingTopY + visualFootingDepth / 2 + 4}
              textAnchor={isLeftToRight ? 'end' : 'start'}
              className="fill-slate-300 font-mono text-[10px]"
            >
              D = {footingDepth.toFixed(2)} m
            </text>

            {/* Wall Height z */}
            <line
              x1={isLeftToRight ? visualWallRightX + 24 : visualWallLeftX - 24}
              y1={visualWallTopY}
              x2={isLeftToRight ? visualWallRightX + 24 : visualWallLeftX - 24}
              y2={groundY}
              stroke="#94a3b8"
              strokeWidth="1.2"
            />
            <text
              x={isLeftToRight ? visualWallRightX + 30 : visualWallLeftX - 30}
              y={visualWallTopY + visualWallHeight / 2 + 4}
              textAnchor={isLeftToRight ? 'start' : 'end'}
              className="fill-cyan-300 font-mono text-[10px] font-semibold"
            >
              z = {wallHeight.toFixed(2)} m
            </text>

            {/* Wall Thickness t */}
            <text
              x={visualWallCenterX}
              y={visualWallTopY - 8}
              textAnchor="middle"
              className="fill-slate-300 font-mono text-[9px]"
            >
              t = {wallThickness.toFixed(2)} m
            </text>
          </g>
        )}

        {/* LAYER: BEARING PRESSURE DISTRIBUTION */}
        {layers.bearingPressure && (
          <g>
            {/* Pressure diagram under base */}
            <polygon
              points={bearingPolyPoints}
              fill="url(#bearingPattern)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />

            {/* Middle-Third Kern Markers */}
            {(() => {
              const kernW = visualFootingWidth / 3;
              const kernLeftX = footingCenterX - kernW / 2;
              const kernRightX = footingCenterX + kernW / 2;
              return (
                <g>
                  <line
                    x1={kernLeftX}
                    y1={footingBottomY}
                    x2={kernLeftX}
                    y2={footingBottomY + 12}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={kernRightX}
                    y1={footingBottomY}
                    x2={kernRightX}
                    y2={footingBottomY + 12}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </g>
              );
            })()}

            {/* Peak & Min Pressure Labels */}
            {isLeftToRight ? (
              <g>
                <text
                  x={footingRightX}
                  y={footingBottomY + visualQMax + 14}
                  textAnchor="end"
                  className="fill-amber-400 font-mono text-[10px] font-bold"
                >
                  q_max = {bearing.qMax.toFixed(1)} kPa
                </text>
                {bearing.contactStatus === 'full_contact' && (
                  <text
                    x={footingLeftX}
                    y={footingBottomY + visualQMin + 14}
                    textAnchor="start"
                    className="fill-slate-400 font-mono text-[9px]"
                  >
                    q_min = {bearing.qMin.toFixed(1)} kPa
                  </text>
                )}
                {bearing.contactStatus === 'tension_separation' && (
                  <text
                    x={footingLeftX + 5}
                    y={footingBottomY + 14}
                    className="fill-rose-400 font-mono text-[9px] font-semibold"
                  >
                    Uplift / Gap ({((1 - contactFraction) * footingWidth).toFixed(2)}m)
                  </text>
                )}
              </g>
            ) : (
              <g>
                <text
                  x={footingLeftX}
                  y={footingBottomY + visualQMax + 14}
                  textAnchor="start"
                  className="fill-amber-400 font-mono text-[10px] font-bold"
                >
                  q_max = {bearing.qMax.toFixed(1)} kPa
                </text>
                {bearing.contactStatus === 'full_contact' && (
                  <text
                    x={footingRightX}
                    y={footingBottomY + visualQMin + 14}
                    textAnchor="end"
                    className="fill-slate-400 font-mono text-[9px]"
                  >
                    q_min = {bearing.qMin.toFixed(1)} kPa
                  </text>
                )}
                {bearing.contactStatus === 'tension_separation' && (
                  <text
                    x={footingRightX - 5}
                    y={footingBottomY + 14}
                    textAnchor="end"
                    className="fill-rose-400 font-mono text-[9px] font-semibold"
                  >
                    Uplift / Gap ({((1 - contactFraction) * footingWidth).toFixed(2)}m)
                  </text>
                )}
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Diagram Bottom Legend */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-cyan-500" />
            <span>Wall ({wallHeight.toFixed(2)}×{wallThickness.toFixed(2)}m)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-slate-500" />
            <span>Footing ({footingWidth.toFixed(2)}×{footingDepth.toFixed(2)}m)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-500" />
            <span>Bearing ({bearing.qMax.toFixed(1)} kPa)</span>
          </span>
        </div>

        <span className="text-cyan-400 font-semibold">
          Active Pivot: {results.activeToe.toUpperCase()} Toe
        </span>
      </div>
    </div>
  );
};
