import React from 'react';

export type DimensionUnit = 'm' | 'mm';

interface UnitToggleProps {
  unit: DimensionUnit;
  onChange: (unit: DimensionUnit) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unit, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-md border border-slate-700/80 bg-slate-850 p-0.5 text-xs font-mono shadow-xs">
      <button
        type="button"
        onClick={() => onChange('m')}
        className={`px-2 py-1 rounded transition-colors ${
          unit === 'm'
            ? 'bg-cyan-600 text-white font-semibold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Metres (m)
      </button>
      <button
        type="button"
        onClick={() => onChange('mm')}
        className={`px-2 py-1 rounded transition-colors ${
          unit === 'mm'
            ? 'bg-cyan-600 text-white font-semibold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Millimetres (mm)
      </button>
    </div>
  );
};
