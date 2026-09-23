import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            Engineering calculation aid only. Verify inputs, assumptions, load combinations and applicable design standards independently.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
          <span>1 m Strip Analysis</span>
          <span>•</span>
          <span>Client-side Only</span>
        </div>
      </div>
    </footer>
  );
};
