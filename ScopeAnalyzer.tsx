import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle, Clock, DollarSign, FileText, MessageSquare, ArrowRight, ShieldAlert, Copy, RefreshCw } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeScopeWithGemini } from '../services/geminiService';

interface ScopeAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult, sow: string, message: string) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  activeResult: AnalysisResult | null;
  setActiveResult: (result: AnalysisResult | null) => void;
}

export const ScopeAnalyzer: React.FC<ScopeAnalyzerProps> = ({
  onAnalysisComplete,
  addToast,
  activeResult,
  setActiveResult,
}) => {
  const [sowText, setSowText] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeEmailTab, setActiveEmailTab] = useState<'upsell' | 'alt' | 'phase2'>('upsell');

  const handleClear = () => {
    setSowText('');
    setClientMessage('');
    setActiveResult(null);
    addToast('Fields Cleared', 'Scope and message inputs have been reset.', 'info');
  };

  const handleRunAnalysis = async () => {
    if (!sowText.trim() || !clientMessage.trim()) {
      addToast('Missing Input', 'Please fill in both the SOW and Client Request fields.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeScopeWithGemini(sowText, clientMessage);
      setActiveResult(result);
      onAnalysisComplete(result, sowText, clientMessage);
      addToast('Analysis Complete', 'Scope boundary successfully evaluated.', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Analysis Failed', err?.message || 'Failed to analyze text.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to Clipboard', 'Email response copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOW Input Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <FileText className="w-4 h-4 text-emerald-400" />
                Agreed Scope of Work (SOW)
              </label>
            </div>
            <textarea
              value={sowText}
              onChange={(e) => setSowText(e.target.value)}
              placeholder="Paste original contract, email agreement, or scope boundaries here..."
              className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
            />
          </div>
        </div>

        {/* Client Request Input Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                New Client Request / Email
              </label>
            </div>
            <textarea
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              placeholder="Paste recent client message, new requirement, or Slack request here..."
              className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800/60 rounded-2xl">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Inputs
        </button>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Evaluating Boundaries...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Scope Creep
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {activeResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {activeResult.verdict === 'OUT_OF_SCOPE' && (
                <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> OUT OF SCOPE
                </div>
              )}
              {activeResult.verdict === 'GRAY_AREA' && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> GRAY AREA
                </div>
              )}
              {activeResult.verdict === 'IN_SCOPE' && (
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> IN SCOPE
                </div>
              )}
              <span className="text-xs text-slate-400 font-semibold">
                Confidence: <strong className="text-slate-200">{activeResult.confidenceScore}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" />
                +{activeResult.estimatedExtraHours} hrs
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                +${activeResult.suggestedAddOnFee}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            {activeResult.reasoningSummary}
          </p>

          {/* Smart Email Responses */}
          {activeResult.responses && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Negotiation Emails</h4>
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveEmailTab('upsell')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeEmailTab === 'upsell'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Polite Upsell
                </button>
                <button
                  onClick={() => setActiveEmailTab('alt')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeEmailTab === 'alt'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alternative Offer
                </button>
                <button
                  onClick={() => setActiveEmailTab('phase2')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeEmailTab === 'phase2'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Phase 2 Deferral
                </button>
              </div>

              {/* Active Response Body */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative space-y-2">
                {activeEmailTab === 'upsell' && (
                  <>
                    <p className="text-xs font-bold text-slate-300">Subject: {activeResult.responses.politeUpsell.subject}</p>
                    <p className="text-xs text-slate-400 whitespace-pre-line font-mono">{activeResult.responses.politeUpsell.body}</p>
                    <button
                      onClick={() => handleCopyEmail(`${activeResult.responses.politeUpsell.subject}\n\n${activeResult.responses.politeUpsell.body}`)}
                      className="absolute top-3 right-3 p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </>
                )}
                {activeEmailTab === 'alt' && (
                  <>
                    <p className="text-xs font-bold text-slate-300">Subject: {activeResult.responses.alternativeOffer.subject}</p>
                    <p className="text-xs text-slate-400 whitespace-pre-line font-mono">{activeResult.responses.alternativeOffer.body}</p>
                    <button
                      onClick={() => handleCopyEmail(`${activeResult.responses.alternativeOffer.subject}\n\n${activeResult.responses.alternativeOffer.body}`)}
                      className="absolute top-3 right-3 p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </>
                )}
                {activeEmailTab === 'phase2' && (
                  <>
                    <p className="text-xs font-bold text-slate-300">Subject: {activeResult.responses.phase2Deferral.subject}</p>
                    <p className="text-xs text-slate-400 whitespace-pre-line font-mono">{activeResult.responses.phase2Deferral.body}</p>
                    <button
                      onClick={() => handleCopyEmail(`${activeResult.responses.phase2Deferral.subject}\n\n${activeResult.responses.phase2Deferral.body}`)}
                      className="absolute top-3 right-3 p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
