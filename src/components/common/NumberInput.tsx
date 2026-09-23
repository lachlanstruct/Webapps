import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NumberInputProps {
  id: string;
  label: string;
  symbol?: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  step?: number | string;
  min?: number;
  max?: number;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  symbol,
  value,
  onChange,
  unit,
  step = '0.01',
  min,
  max,
  error,
  helperText,
  disabled = false,
}) => {
  // Use local string state for smooth typing including decimal point or minus
  const [localStr, setLocalStr] = React.useState<string>(value.toString());
  const isFocusedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalStr(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalStr(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const parsed = parseFloat(localStr);
    if (isNaN(parsed)) {
      setLocalStr(value.toString());
    } else {
      setLocalStr(parsed.toString());
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700"
        >
          {symbol && (
            <span className="inline-flex items-center justify-center font-mono font-bold text-cyan-400 bg-cyan-950/60 dark:bg-cyan-950/70 border border-cyan-800/50 rounded px-1.5 py-0.5 text-[11px]">
              {symbol}
            </span>
          )}
          <span>{label}</span>
        </label>
        {unit && (
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="relative rounded-md shadow-xs">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          value={localStr}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`block w-full rounded-md border text-sm font-mono px-3 py-1.5 transition-colors focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-500 bg-rose-950/20 text-rose-200 focus:border-rose-500 focus:ring-rose-500'
              : disabled
              ? 'border-slate-800 bg-slate-800/40 text-slate-500 cursor-not-allowed'
              : 'border-slate-700/80 bg-slate-800/90 text-slate-100 hover:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
          <span className="text-xs font-mono text-slate-400 select-none">
            {unit}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mt-1 flex items-start gap-1 text-[11px] text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div className="mt-0.5 text-[11px] text-slate-400">{helperText}</div>
      ) : null}
    </div>
  );
};
