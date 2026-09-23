import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-md bg-cyan-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 active:bg-cyan-700 transition"
        title="Install Structural Tools app for offline access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Add to Home Screen on iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Offline Structural Calculations</p>
                </div>
              </div>
              <ol className="mt-4 space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <li>Tap the <strong className="text-cyan-400">Share</strong> button in the Safari bottom bar.</li>
                <li>Scroll down the share sheet and tap <strong className="text-cyan-400">Add to Home Screen</strong>.</li>
                <li>Tap <strong className="text-cyan-400">Add</strong> in the top right.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
