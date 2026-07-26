import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScopeAnalyzer } from './components/ScopeAnalyzer';
import { SowVault } from './components/SowVault';
import { AuditHistory } from './components/AuditHistory';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AnalysisResult, AuditLog, SowTemplate } from './types';
import { DEFAULT_SOW_TEMPLATES } from './data/presetDemos';

const STORAGE_KEY_TEMPLATES = 'scopeguard_templates_v1';
const STORAGE_KEY_LOGS = 'scopeguard_audit_logs_v1';
const [selectedTemplateText, setSelectedTemplateText] = useState<string>('');

// Sample initial audit logs if local storage is empty
const INITIAL_SAMPLE_LOGS: AuditLog[] = [
  {
    id: 'log-demo-1',
    timestamp: '2026-07-21 14:22',
    sow: '5-Page Corporate Website Design (React + Tailwind). Excludes custom backend database and e-commerce portal.',
    message: 'Can we add a full Shopify store with dynamic cart drawer and user login portal before Tuesday?',
    verdict: 'OUT_OF_SCOPE',
    confidenceScore: 95,
    reasoningSummary: 'Request introduces e-commerce payment infrastructure and custom backend portal, both explicitly excluded in the agreed SOW.',
    estimatedExtraHours: 16,
    suggestedAddOnFee: 1360,
    result: {
      verdict: 'OUT_OF_SCOPE',
      confidenceScore: 95,
      reasoningSummary: 'Request introduces e-commerce payment infrastructure and custom backend portal, both explicitly excluded in the agreed SOW.',
      deliverableMatch: {
        explicitlyCovered: ['Frontend UI layout and page styling'],
        outOfBounds: ['Shopify store integration', 'User login portal', 'Dynamic cart drawer'],
      },
      estimatedExtraHours: 16,
      suggestedAddOnFee: 1360,
      riskFactors: ['Timeline extension (+2 weeks)', 'Unplanned backend architectural work'],
      responses: {
        politeUpsell: {
          subject: 'Re: Update on Shopify Store & Portal request',
          body: 'Hi there,\n\nThanks for reaching out! E-commerce integration sounds like a valuable addition.\n\nSince payment processing and login portals fall outside our agreed 5-page static SOW, I can add this as a Phase 1 change order for $1,360 (16 hours).\n\nLet me know if you would like me to prepare the change order!',
        },
        alternativeOffer: {
          subject: 'Re: E-commerce options for launch',
          body: 'Hi there,\n\nTo stay strictly within our current budget and timeline, we could embed a simple third-party buy button link instead of a full custom store.\n\nWould you prefer that approach, or should we approve the change order?',
        },
        phase2Deferral: {
          subject: 'Re: Great idea for Phase 2 post-launch!',
          body: 'Hi there,\n\nLove this idea! To ensure we launch our core 5 pages on schedule, I recommend adding the online store to our Phase 2 roadmap immediately following launch.\n\nDoes that sound good?',
        },
      },
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'vault' | 'history'>('analyzer');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);

  // Load Templates from localStorage
  const [templates, setTemplates] = useState<SowTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load templates from localStorage:', e);
    }
    return DEFAULT_SOW_TEMPLATES;
  });

  // Load Audit Logs from localStorage
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load audit logs from localStorage:', e);
    }
    return INITIAL_SAMPLE_LOGS;
  });

  // Save Templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save templates:', e);
    }
  }, [templates]);

  // Save Audit Logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save audit logs:', e);
    }
  }, [auditLogs]);

  // Toast Handler
  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add new template to SOW Vault
 // Use template in Scope Analyzer
  const handleUseTemplate = (template: SowTemplate) => {
    setSelectedTemplateText(template.content); 
    setActiveTab('analyzer');
    addToast('Template Transferred', `Loaded "${template.name}" into Scope Analyzer.`, 'success');
  };
    setTemplates((prev) => [created, ...prev]);
  };

  // Delete template from SOW Vault
  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addToast('Template Deleted', 'Removed from SOW Vault.', 'info');
  };

  // Use template in Scope Analyzer
  const handleUseTemplate = (template: SowTemplate) => {
    setActiveTab('analyzer');
    addToast('Template Transferred', `Loaded "${template.name}" into Scope Analyzer.`, 'success');
  };

  // On Analysis Complete (Auto-log to Audit History)
  const handleAnalysisComplete = (result: AnalysisResult, sow: string, message: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      sow,
      message,
      verdict: result.verdict,
      confidenceScore: result.confidenceScore,
      reasoningSummary: result.reasoningSummary,
      estimatedExtraHours: result.estimatedExtraHours,
      suggestedAddOnFee: result.suggestedAddOnFee,
      result,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Re-open past analysis from Audit History
  const handleReopenAnalysis = (log: AuditLog) => {
    setActiveResult(log.result);
    setActiveTab('analyzer');
    addToast('Analysis Re-opened', 'Loaded past audit scan details.', 'info');
  };

  // Clear Audit History
  const handleClearHistory = () => {
    setAuditLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auditCount={auditLogs.length}
        templateCount={templates.length}
      />

      {/* Main Content Area */}
      {activeTab === 'analyzer' && (
          <ScopeAnalyzer
            templates={templates}
            onAnalysisComplete={handleAnalysisComplete}
            addToast={addToast}
            activeResult={activeResult}
            setActiveResult={setActiveResult}
            initialSowText={selectedTemplateText} // 👈 Naya prop pass karein
          />
        )}
      

        {activeTab === 'vault' && (
          <SowVault
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onUseTemplate={handleUseTemplate}
            addToast={addToast}
          />
        )}

        {activeTab === 'history' && (
          <AuditHistory
            logs={auditLogs}
            onClearHistory={handleClearHistory}
            onReopenAnalysis={handleReopenAnalysis}
            addToast={addToast}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>ScopeGuard AI — Empowering freelancers to detect & negotiate scope creep with confidence.</p>
      </footer>
    </div>
  );
}
