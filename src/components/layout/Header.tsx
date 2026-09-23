import React from 'react';
import { Menu, Shield } from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  activeTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, activeTitle }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile Menu Trigger & Active Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>STRUCTURAL TOOLS</span>
            <span className="text-slate-600">/</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
            {activeTitle}
          </span>
        </div>
      </div>

      {/* Right: Quick actions (PWA Install, Theme toggle) */}
      <div className="flex items-center gap-2">
        <PWAInstallButton />
        <ThemeToggle />
      </div>
    </header>
  );
};
