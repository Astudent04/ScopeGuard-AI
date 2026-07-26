import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Send,
  Zap,
  ChevronDown,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult, SowTemplate, VerdictType } from '../types';
import { DEMO_PRESET_WEB_DESIGN, DEMO_PRESET_LOGO_CREEP } from '../data/presetDemos';

interface ScopeAnalyzerProps {
  templates: SowTemplate[];
  onAnalysisComplete: (result: AnalysisResult, sow: string, message: string) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  activeResult: AnalysisResult | null;
  setActiveResult: (res: AnalysisResult | null) => void;
}

export const ScopeAnalyzer: React.FC<ScopeAnalyzerProps> = ({
  templates,
  onAnalysisComplete,
  addToast,
  activeResult,
  setActiveResult,
}) => {
  const [sowText, setSowText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(85);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState<'politeUpsell' | 'alternativeOffer' | 'phase2Deferral'>('politeUpsell');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Live fee adjustments
  const [customHours, setCustomHours] = useState<number | null>(null);

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    if (!tplId) return;

    const found = templates.find((t) => t.id === tplId);
    if (found) {
      setSowText(found.deliverables);
      addToast('Template Loaded', `Loaded "${found.name}" into SOW field.`, 'info');
    }
  };

  const loadPresetDemo = (type: 'web' | 'logo') => {
    if (type === 'web') {
      setSowText(DEMO_PRESET_WEB_DESIGN.sow);
      setMessageText(DEMO_PRESET_WEB_DESIGN.message);
      setSelectedTemplateId('');
      addToast('Preset Loaded', 'Web Design Creep demo loaded into inputs.', 'info');
    } else {
      setSowText(DEMO_PRESET_LOGO_CREEP.sow);
      setMessageText(DEMO_PRESET_LOGO_CREEP.message);
      setSelectedTemplateId('');
      addToast('Preset Loaded', 'Logo Revision Creep demo loaded into inputs.', 'info');
    }
  };

  const handleClearForm = () => {
    setSowText('');
    setMessageText('');
    setSelectedTemplateId('');
    setActiveResult(null);
    setCustomHours(null);
  };

  const handleAnalyze = async () => {
    if (!sowText.trim() || !messageText.trim()) {
      addToast('Missing Input', 'Please fill in both SOW and Client Message.', 'error');
      return;
    }

    setIsLoading(true);
    setCustomHours(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is missing in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert freelance scope creep analyzer. 
        Analyze the following Scope of Work (SOW) and client message:
        - SOW: ${sowText}
        - Client Message: ${messageText}
        - Hourly Rate: $${hourlyRate}

        Return a VALID JSON object (and NOTHING else) matching this exact JSON schema structure:
        {
          "verdict": "OUT_OF_SCOPE",
          "confidenceScore": 92,
          "reasoningSummary": "Short explanation of the scope status",
          "estimatedExtraHours": 5,
          "suggestedFee": 425,
          "deliverableMatch": {
            "explicitlyCovered": ["Item 1"],
            "outOfBounds": ["Item 2"]
          },
          "riskFactors": ["Risk 1", "Risk 2"],
          "responses": {
            "politeUpsell": {
              "subject": "Update regarding additional features",
              "body": "Friendly email text proposing add-on quote"
            },
            "alternativeOffer": {
              "subject": "Alternative solutions for requested feature",
              "body": "Email text offering alternative compromise"
            },
            "phase2Deferral": {
              "subject": "Project scope & Phase 2 roadmap",
              "body": "Email deferring requested features to Phase 2"
            }
          }
        }
        Note for verdict: MUST be one of "IN_SCOPE", "OUT_OF_SCOPE", or "GRAY_AREA". Do not include Markdown formatting or code blocks in output.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      const cleanedJson = responseText.replace(/```json|```/g, '').trim();
      const data: AnalysisResult = JSON.parse(cleanedJson);

      data.sowSnippet = sowText;
      data.messageSnippet = messageText;

      setActiveResult(data);
      onAnalysisComplete(data, sowText, messageText);
      addToast('Analysis Complete', `Verdict: ${data.verdict.replace('_', ' ')}`, 'success');

      // Scroll smoothly to result
      setTimeout(() => {
        document.getElementById('analysis-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Error analyzing scope:', err);
      addToast('Analysis Error', 'Could not complete scan. Please verify VITE_GEMINI_API_KEY.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    addToast('Copied to Clipboard', 'Email negotiation template is ready to paste!', 'success');
    setTimeout(() => setCopiedTab(null), 2500);
  };

  // Verdict badge styling
  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'IN_SCOPE':
        return {
          label: 'IN SCOPE',
          subLabel: 'Request fits squarely within agreed SOW boundaries',
          icon: ShieldCheck,
          badgeColor: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-500/30',
          accentBg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
        };
      case 'GRAY_AREA':
        return {
          label: 'GRAY AREA',
          subLabel: 'Ambiguous boundary / Extended revision loop',
          icon: AlertTriangle,
          badgeColor: 'bg-amber-950/90 border-amber-500/50 text-amber-400',
          dotColor: 'bg-amber-400',
          borderColor: 'border-amber-500/30',
          accentBg: 'from-amber-500/10 via-yellow-500/5 to-transparent',
        };
      case 'OUT_OF_SCOPE':
      default:
        return {
          label: 'OUT OF SCOPE',
          subLabel: 'Scope Creep Detected! Additional Fee Required',
          icon: ShieldAlert,
          badgeColor: 'bg-rose-950/90 border-rose-500/50 text-rose-400',
          dotColor: 'bg-rose-500',
          borderColor: 'border-rose-500/30',
          accentBg: 'from-rose-500/10 via-pink-500/5 to-transparent',
        };
    }
  };

  const displayHours = customHours !== null ? customHours : activeResult?.estimatedExtraHours ?? 0;
  const calculatedFee = Math.round(displayHours * hourlyRate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Quick Start Presets Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 tracking-wide uppercase">Quick Start Presets</h2>
            <p className="text-[11px] text-slate-400">Load sample contracts & client messages to test AI scoring</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadPresetDemo('web')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Web Design Creep</span>
          </button>

          <button
            onClick={() => loadPresetDemo('logo')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Logo Revision Creep</span>
          </button>

          {(sowText || messageText || activeResult) && (
            <button
              onClick={handleClearForm}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/40 transition-all cursor-pointer"
              title="Reset fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: SOW */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <span>Agreed Scope of Work (SOW)</span>
              </label>

              {templates.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedTemplateId}
                    onChange={handleSelectTemplate}
                    className="appearance-none bg-slate-950 text-slate-300 text-xs font-medium px-3 py-1.5 pr-8 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Load SOW Template --</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        📁 {tpl.name} ({tpl.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Paste deliverables, revision caps, or exclusions directly from your signed contract.
            </p>

            <textarea
              value={sowText}
              onChange={(e) => setSowText(e.target.value)}
              placeholder="e.g., 5-page responsive website in React. Excludes e-commerce payment gateways and custom user portals..."
              className="w-full h-52 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
            <span>{sowText.length} characters</span>
            <span>Tip: Detail exclusions for highest accuracy</span>
          </div>
        </div>

        {/* Card B: Client Request */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-extrabold">
                  2
                </span>
                <span>Client Request / Message</span>
              </label>

              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                Email / Slack / Chat
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Paste the client's email or message asking for additions, changes, or revisions.
            </p>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="e.g., Hi! Could we also add a Stripe online store checkout and user login portal before Friday?..."
              className="w-full h-52 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 resize-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
            <span>{messageText.length} characters</span>
            <span>Tip: Paste complete message context</span>
          </div>
        </div>
      </div>

      {/* Hourly Rate & Action CTA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block">Your Base Hourly Rate ($/hr)</label>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-slate-300">$</span>
              <input
                type="number"
                min="10"
                max="500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value) || 85)}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500">Base rate for change order calculation</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !sowText.trim() || !messageText.trim()}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg transition-all duration-200 cursor-pointer ${
            isLoading || !sowText.trim() || !messageText.trim()
              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Contract Scope...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Analyze Scope Risk</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl space-y-6 animate-pulse text-center">
          <div className="flex items-center justify-center gap-3 text-emerald-400">
            <Cpu className="w-8 h-8 animate-bounce" />
            <span className="text-lg font-extrabold tracking-wide">AI Guard Analysis in Progress...</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cross-referencing requested deliverables against agreed SOW exclusions, estimating additional effort hours, and generating negotiation responses.
          </p>
        </div>
      )}

      {/* Output Section */}
      {!isLoading && activeResult && (
        <div id="analysis-result-section" className="space-y-6 animate-fade-in pt-2">
          {(() => {
            const badge = getVerdictBadge(activeResult.verdict);
            const BadgeIcon = badge.icon;
            return (
              <div className={`rounded-2xl p-6 border ${badge.borderColor} bg-slate-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                      <BadgeIcon className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-2xl tracking-wide text-slate-100">{badge.label}</span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.badgeColor}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                          <span>AI Confidence: {activeResult.confidenceScore}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-300">{badge.subLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Scope Status</span>
                      <span className="text-lg font-bold text-slate-100 mt-1 block">{badge.label}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${badge.badgeColor}`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Estimated Extra Effort</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-lg font-bold text-slate-100">{displayHours} Hours</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Suggested Add-On Fee</span>
                      <span className="text-xl font-extrabold text-emerald-400 mt-1 block">${calculatedFee}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Reasoning & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Scope Reasoning</span>
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                  {activeResult.reasoningSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Covered in SOW</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeResult.deliverableMatch.explicitlyCovered.length > 0 ? (
                      activeResult.deliverableMatch.explicitlyCovered.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">No direct matches found in SOW</li>
                    )}
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Out of Bounds (Creep)</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeResult.deliverableMatch.outOfBounds.length > 0 ? (
                      activeResult.deliverableMatch.outOfBounds.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">No scope violations detected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Fee Adjuster */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Fee Adjuster & Risk Profile</span>
                </h3>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Estimated Extra Hours</span>
                    <span className="font-bold text-emerald-400">{displayHours} Hours</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={displayHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Total Add-on Quote:</span>
                    <span className="font-black text-base text-emerald-400">${calculatedFee}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Key Risk Factors
                  </span>
                  <div className="space-y-2">
                    {activeResult.riskFactors.map((risk, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-lg"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Templates Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>AI Negotiation Email Templates</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a strategy tailored to your client relationship and copy directly to your inbox or Slack.
                </p>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveResponseTab('politeUpsell')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeResponseTab === 'politeUpsell'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💰 Polite Upsell
                </button>

                <button
                  onClick={() => setActiveResponseTab('alternativeOffer')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeResponseTab === 'alternativeOffer'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚖️ Alternative Offer
                </button>

                <button
                  onClick={() => setActiveResponseTab('phase2Deferral')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeResponseTab === 'phase2Deferral'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🚀 Phase 2 Deferral
                </button>
              </div>
            </div>

            {(() => {
              const currentOption = activeResult.responses[activeResponseTab];
              const isCopied = copiedTab === activeResponseTab;

              return (
                <div className="bg-slate-950/90 rounded-xl p-5 border border-slate-800 space-y-4 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-xs font-mono text-slate-400">Subject:</span>
                      <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{currentOption?.subject}</h4>
                    </div>

                    <button
                      onClick={() =>
                        handleCopyResponse(
                          `Subject: ${currentOption?.subject}\n\n${currentOption?.body}`,
                          activeResponseTab
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                    <pre className="font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {currentOption?.body}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
