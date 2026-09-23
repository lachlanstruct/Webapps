import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { OfflineIndicator } from '../common/OfflineIndicator';

interface AppLayoutProps {
  children: React.ReactNode;
  activeCalculatorId: string;
  onSelectCalculator: (id: string) => void;
  activeTitle: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeCalculatorId,
  onSelectCalculator,
  activeTitle,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Desktop Layout Container */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeCalculatorId={activeCalculatorId}
            onSelectCalculator={onSelectCalculator}
          />
        </div>

        {/* Mobile Slide-in Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-slate-900 shadow-2xl z-10 border-r border-slate-800">
              <div className="absolute top-3 right-3 z-20">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                activeCalculatorId={activeCalculatorId}
                onSelectCalculator={onSelectCalculator}
                onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            onOpenMobileMenu={() => setMobileDrawerOpen(true)}
            activeTitle={activeTitle}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>

      {/* Offline connectivity banner */}
      <OfflineIndicator />
    </div>
  );
};
