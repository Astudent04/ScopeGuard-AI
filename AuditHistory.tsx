import React, { useState } from 'react';
import { History, Trash2, ExternalLink, Search, ShieldCheck, ShieldAlert, AlertTriangle, Filter } from 'lucide-react';
import { AuditLog, VerdictType } from '../types';

interface AuditHistoryProps {
  logs: AuditLog[];
  onClearHistory: () => void;
  onReopenAnalysis: (log: AuditLog) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  logs,
  onClearHistory,
  onReopenAnalysis,
  addToast,
}) => {
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesVerdict = filterVerdict === 'ALL' || log.verdict === filterVerdict;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sow.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reasoningSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVerdict && matchesSearch;
  });

  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'IN_SCOPE':
        return {
          label: 'IN SCOPE',
          icon: ShieldCheck,
          color: 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50',
        };
      case 'GRAY_AREA':
        return {
          label: 'GRAY AREA',
          icon: AlertTriangle,
          color: 'bg-amber-950/90 text-amber-400 border-amber-500/50',
        };
      case 'OUT_OF_SCOPE':
      default:
        return {
          label: 'OUT OF SCOPE',
          icon: ShieldAlert,
          color: 'bg-rose-950/90 text-rose-400 border-rose-500/50',
        };
    }
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setShowClearConfirm(false);
    addToast('History Cleared', 'All audit logs have been removed.', 'info');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-100">Audit History & Past Scans</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review past client scope requests, verdicts, calculated fees, and AI responses.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/40 text-xs font-semibold transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Clear Audit History?</h3>
            <p className="text-xs text-slate-400">
              This action will permanently delete all saved scope scan records from browser storage.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-500 cursor-pointer"
              >
                Delete All Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past scans..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Verdict Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {['ALL', 'OUT_OF_SCOPE', 'GRAY_AREA', 'IN_SCOPE'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterVerdict(v)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filterVerdict === v
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 bg-slate-950 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {v === 'ALL' ? 'All Scans' : v.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Past Scans Found</h3>
          <p className="text-xs text-slate-500">Analyze client requests in Scope Analyzer to record history logs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const badge = getVerdictBadge(log.verdict);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={log.id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.color}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>

                    <span className="text-xs font-mono text-slate-500">{log.timestamp}</span>
                  </div>

                  {/* Client Snippet */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-xs text-slate-300 line-clamp-2 italic font-mono">
                      "{log.message}"
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    <span className="text-slate-500 font-medium">Reasoning:</span> {log.reasoningSummary}
                  </p>
                </div>

                {/* Right Metrics & Action */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80 shrink-0">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <span className="text-slate-500 block text-[10px]">Extra Effort</span>
                      <span className="font-bold text-slate-200">{log.estimatedExtraHours}h</span>
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <div className="text-center">
                      <span className="text-slate-500 block text-[10px]">Add-on Fee</span>
                      <span className="font-bold text-emerald-400">${log.suggestedAddOnFee}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onReopenAnalysis(log)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Re-open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

