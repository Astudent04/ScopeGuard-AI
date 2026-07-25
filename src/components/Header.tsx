import React from 'react';
import { ShieldCheck, Search, FolderKanban, History } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyzer' | 'vault' | 'history';
  setActiveTab: (tab: 'analyzer' | 'vault' | 'history') => void;
  auditCount: number;
  templateCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  auditCount,
  templateCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo & Sleek Status Pill */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('analyzer')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-100 font-sans">
                  ScopeGuard <span className="text-emerald-400">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block font-medium">
                Scope Creep Detection & Negotiation System
              </p>
            </div>
          </div>

          {/* Sleek Status Pill: glowing green dot with "System Ready" */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wide">System Ready</span>
          </div>
        </div>

        {/* Tab Navigation - Segmented Control */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto justify-center sm:justify-start shadow-inner">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Scope Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>SOW Vault</span>
            {templateCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {templateCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History</span>
            {auditCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {auditCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

