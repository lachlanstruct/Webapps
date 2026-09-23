import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Layers,
  ArrowDown,
  ArrowRight,
  RotateCw,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  AdditionalLoad,
  LoadActionType,
  LoadType,
} from '../../../calculations/overturning';

interface AdditionalLoadsManagerProps {
  loads: AdditionalLoad[];
  onChange: (loads: AdditionalLoad[]) => void;
  footingWidth: number;
  wallHeight: number;
  footingDepth: number;
  wallCentroidX: number;
}

export const AdditionalLoadsManager: React.FC<AdditionalLoadsManagerProps> = ({
  loads,
  onChange,
  footingWidth,
  wallHeight,
  footingDepth,
  wallCentroidX,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<LoadType>('point_vertical');
  const [action, setAction] = useState<LoadActionType>('G');
  const [value, setValue] = useState<number>(2.0);
  const [positionX, setPositionX] = useState<number>(wallCentroidX);
  const [heightY, setHeightY] = useState<number>(footingDepth + wallHeight);
  const [surface, setSurface] = useState<'heel' | 'toe' | 'full'>('heel');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (value <= 0) return;

    const newLoad: AdditionalLoad = {
      id: `load-${Date.now()}`,
      name: name.trim() || `${type.replace('_', ' ')} (${action})`,
      type,
      action,
      value,
      positionX: type === 'point_vertical' ? positionX : undefined,
      heightY: type === 'point_horizontal' ? heightY : undefined,
      surface: type === 'surcharge_udl' ? surface : undefined,
    };

    onChange([...loads, newLoad]);
    setShowAddForm(false);
    setName('');
    setValue(2.0);
  };

  const handleRemove = (id: string) => {
    onChange(loads.filter(l => l.id !== id));
  };

  // Quick preset shortcuts
  const addQuickPreset = (presetType: 'capping' | 'heel_surcharge' | 'handrail' | 'moment') => {
    let load: AdditionalLoad;
    if (presetType === 'capping') {
      load = {
        id: `load-${Date.now()}`,
        name: 'Wall Top Parapet / Capping',
        type: 'point_vertical',
        action: 'G',
        value: 1.2,
        positionX: wallCentroidX,
      };
    } else if (presetType === 'heel_surcharge') {
      load = {
        id: `load-${Date.now()}`,
        name: 'Heel Soil Surcharge',
        type: 'surcharge_udl',
        action: 'G',
        value: 5.0,
        surface: 'heel',
      };
    } else if (presetType === 'handrail') {
      load = {
        id: `load-${Date.now()}`,
        name: 'Top Lateral Line Load (Handrail / Barrier)',
        type: 'point_horizontal',
        action: 'Q',
        value: 0.75,
        heightY: footingDepth + wallHeight,
      };
    } else {
      load = {
        id: `load-${Date.now()}`,
        name: 'Post / Fixing Torsion Moment',
        type: 'moment',
        action: 'Q',
        value: 1.0,
      };
    }
    onChange([...loads, load]);
  };

  return (
    <div className="space-y-3">
      {/* Quick Add Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Additional Applied Loads & Surcharges</span>
        </span>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-600/90 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Custom Load'}</span>
        </button>
      </div>

      {/* Quick Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-500 mr-1">Quick Presets:</span>
        <button
          type="button"
          onClick={() => addQuickPreset('capping')}
          className="px-2 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
        >
          + Top Capping (1.2 kN/m)
        </button>
        <button
          type="button"
          onClick={() => addQuickPreset('heel_surcharge')}
          className="px-2 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
        >
          + Heel Surcharge (5.0 kPa)
        </button>
        <button
          type="button"
          onClick={() => addQuickPreset('handrail')}
          className="px-2 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
        >
          + Lateral Top Force (0.75 kN/m)
        </button>
        <button
          type="button"
          onClick={() => addQuickPreset('moment')}
          className="px-2 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition"
        >
          + Applied Moment (1.0 kNm)
        </button>
      </div>

      {/* Add Custom Load Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-3.5 rounded-lg border border-cyan-800/60 bg-slate-950/80 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Load Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Parapet coping / barrier"
                className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Load Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as LoadType)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="point_vertical">Vertical Point Load (P_v)</option>
                <option value="point_horizontal">Lateral Horizontal Load (F_h)</option>
                <option value="moment">Applied Moment (M)</option>
                <option value="surcharge_udl">Footing Surcharge UDL (q)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Value ({type === 'surcharge_udl' ? 'kPa' : type === 'moment' ? 'kNm/m' : 'kN/m'})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={value}
                onChange={e => setValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Action Type</label>
              <select
                value={action}
                onChange={e => setAction(e.target.value as LoadActionType)}
                className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="G">Dead Load (G)</option>
                <option value="Q">Live / Imposed (Q)</option>
                <option value="W">Wind / Lateral (W)</option>
              </select>
            </div>

            {type === 'point_vertical' && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Position x (m from left)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max={footingWidth}
                  value={positionX}
                  onChange={e => setPositionX(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {type === 'point_horizontal' && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Height y (m from base)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={footingDepth + wallHeight + 2}
                  value={heightY}
                  onChange={e => setHeightY(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {type === 'surcharge_udl' && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Footing Zone</label>
                <select
                  value={surface}
                  onChange={e => setSurface(e.target.value as any)}
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="heel">Heel Zone (Backfill)</option>
                  <option value="toe">Toe Zone (Front)</option>
                  <option value="full">Full Footing Width</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded border border-slate-700 bg-slate-800 text-slate-400 text-xs font-mono hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold"
            >
              Confirm & Add
            </button>
          </div>
        </form>
      )}

      {/* List of active loads */}
      {loads.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {loads.map(load => (
            <div
              key={load.id}
              className="flex items-center justify-between p-2 rounded-lg border border-slate-800 bg-slate-850/80 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-800 text-cyan-400 shrink-0">
                  {load.type === 'point_vertical' ? (
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : load.type === 'point_horizontal' ? (
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                  ) : load.type === 'moment' ? (
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <span>{load.name}</span>
                    <span className="px-1 py-0.2 rounded text-[10px] bg-slate-800 border border-slate-700 text-cyan-300">
                      Action: {load.action}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {load.value.toFixed(2)}{' '}
                    {load.type === 'surcharge_udl'
                      ? 'kPa'
                      : load.type === 'moment'
                      ? 'kNm/m'
                      : 'kN/m'}
                    {load.positionX !== undefined && ` @ x=${load.positionX.toFixed(2)}m`}
                    {load.heightY !== undefined && ` @ y=${load.heightY.toFixed(2)}m`}
                    {load.surface && ` (${load.surface})`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(load.id)}
                className="p-1 text-slate-400 hover:text-rose-400 transition"
                title="Remove load"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] font-mono text-slate-500">
          No additional point loads or surcharges applied. (Self-weights and wind pressure only)
        </div>
      )}
    </div>
  );
};
