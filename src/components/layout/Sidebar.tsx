import React from 'react';
import {
  Layers,
  Box,
  Building,
  Wind,
  Wrench,
  ChevronRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { NAVIGATION_CATEGORIES, NavItem } from '../../types/navigation';

interface SidebarProps {
  activeCalculatorId: string;
  onSelectCalculator: (id: string) => void;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCalculatorId,
  onSelectCalculator,
  onCloseMobileDrawer,
}) => {
  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'foundations':
        return <Box className="w-4 h-4 text-cyan-400" />;
      case 'beams':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'loads':
        return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'roof-trusses':
        return <Building className="w-4 h-4 text-purple-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleItemClick = (item: NavItem) => {
    if (item.status === 'active') {
      onSelectCalculator(item.id);
      if (onCloseMobileDrawer) onCloseMobileDrawer();
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-md shadow-cyan-900/30">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="16" width="18" height="5" rx="1" />
            <path d="M12 3v13" />
            <path d="M7 7l5-4 5 4" />
          </svg>
        </div>
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-widest uppercase block">
            STRUCTURAL TOOLS
          </span>
          <span className="text-[11px] text-slate-400">Engineering Suite</span>
        </div>
      </div>

      {/* Nav List grouped by category */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAVIGATION_CATEGORIES.map(category => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {getCategoryIcon(category.id)}
              <span>{category.title}</span>
            </div>

            <div className="space-y-0.5 pl-2">
              {category.items.map(item => {
                const isActive = item.id === activeCalculatorId;
                const isComingSoon = item.status === 'coming_soon';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={isComingSoon}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/60 shadow-xs'
                        : isComingSoon
                        ? 'text-slate-500 hover:bg-transparent cursor-not-allowed opacity-60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-2 shrink-0" />
                    ) : item.badge ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 ml-2 shrink-0">
                        {item.badge}
                      </span>
                    ) : isComingSoon ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700/40 ml-2 shrink-0">
                        Soon
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Version 1.0.0</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-semibold text-[10px]">
            Offline PWA Ready
          </span>
        </div>
      </div>
    </aside>
  );
};
