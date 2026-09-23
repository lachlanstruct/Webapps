import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkPlus,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  Sparkles,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import {
  BUILT_IN_PRESETS,
  OverturningInputs,
  WallPresetItem,
} from '../../../calculations/overturning';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: OverturningInputs;
  onLoadPreset: (inputs: OverturningInputs, presetName: string) => void;
}

const USER_PRESETS_STORAGE_KEY = 'structural_tools_custom_presets_v1';

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  currentInputs,
  onLoadPreset,
}) => {
  const [customPresets, setCustomPresets] = useState<WallPresetItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(USER_PRESETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(USER_PRESETS_STORAGE_KEY, JSON.stringify(customPresets));
    } catch {
      // ignore quota error
    }
  }, [customPresets]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: WallPresetItem = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      category: 'User Custom',
      description: newPresetDesc.trim() || 'Custom saved cantilever wall configuration',
      inputs: { ...currentInputs },
    };

    setCustomPresets(prev => [newPreset, ...prev]);
    setNewPresetName('');
    setNewPresetDesc('');
    setSavedSuccessMsg('Preset saved successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 2500);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        customPresets,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structural_wall_presets_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed.customPresets)) {
          setCustomPresets(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = parsed.customPresets.filter((p: WallPresetItem) => !existingIds.has(p.id));
            return [...newItems, ...prev];
          });
          setSavedSuccessMsg(`Imported ${parsed.customPresets.length} presets!`);
          setTimeout(() => setSavedSuccessMsg(''), 2500);
        }
      } catch {
        alert('Invalid preset JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                CALCULATION PRESETS & TEMPLATES
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Load Australian Standards or engineering templates, or save your current design
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-200 text-xs">
          {/* Section: Save Current Setup */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <BookmarkPlus className="w-4 h-4" />
                <span>Save Current Calculation Setup</span>
              </div>
              {savedSuccessMsg && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>{savedSuccessMsg}</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCurrent} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Preset Name (e.g. 2.0m Boundary Wall Zone B)"
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Notes / Project reference (optional)"
                  value={newPresetDesc}
                  onChange={e => setNewPresetDesc(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold transition"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Current Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section: Built-in Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Built-In Engineering Presets</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {BUILT_IN_PRESETS.length} templates
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {BUILT_IN_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-850/60 hover:bg-slate-800/80 transition"
                >
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{preset.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {preset.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onLoadPreset(preset.inputs, preset.name);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/90 hover:bg-cyan-500 text-white font-mono text-xs transition"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Custom User Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>Your Custom Presets</span>
              </span>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-mono text-[11px]">
                  <Upload className="w-3 h-3 text-cyan-400" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                {customPresets.length > 0 && (
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white font-mono text-[11px]"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Export</span>
                  </button>
                )}
              </div>
            </div>

            {customPresets.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 font-mono text-xs">
                No custom presets saved yet. Configure wall inputs and save above.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {customPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-850/60 hover:bg-slate-800/80 transition"
                  >
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="font-bold text-white block">{preset.name}</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadPreset(preset.inputs, preset.name);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/90 hover:bg-cyan-500 text-white font-mono text-xs transition"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCustom(preset.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Delete preset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-5 py-3 bg-slate-850 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
