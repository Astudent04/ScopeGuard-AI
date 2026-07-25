import React, { useState } from 'react';
import { FolderKanban, Plus, Trash2, ArrowUpRight, FileText, Sparkles, Search } from 'lucide-react';
import { SowTemplate } from '../types';

interface SowVaultProps {
  templates: SowTemplate[];
  onAddTemplate: (template: Omit<SowTemplate, 'id' | 'createdAt'>) => void;
  onDeleteTemplate: (id: string) => void;
  onUseTemplate: (template: SowTemplate) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SowVault: React.FC<SowVaultProps> = ({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onUseTemplate,
  addToast,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SowTemplate['category']>('Web Design');
  const [deliverables, setDeliverables] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !deliverables.trim()) {
      addToast('Validation Error', 'Please fill in both Template Name and Deliverables.', 'error');
      return;
    }

    onAddTemplate({
      name: name.trim(),
      category,
      deliverables: deliverables.trim(),
    });

    setName('');
    setDeliverables('');
    setIsFormOpen(false);
    addToast('Template Saved', `"${name}" added to SOW Vault.`, 'success');
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.deliverables.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Web Design', 'Branding', 'Software Dev', 'Marketing & SEO', 'Copywriting', 'Other'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header & Create Template Action */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-100">SOW Vault & Template Library</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store reusable scope templates to quickly auto-fill the Scope Analyzer during client requests.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isFormOpen ? 'Close Form' : 'New Scope Template'}</span>
        </button>
      </div>

      {/* New Template Creation Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Create Reusable SOW Template</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., E-Commerce Shopify Site SOW"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Web Design">Web Design</option>
                <option value="Branding">Branding</option>
                <option value="Software Dev">Software Dev</option>
                <option value="Marketing & SEO">Marketing & SEO</option>
                <option value="Copywriting">Copywriting</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deliverables, Boundaries & Exclusions
            </label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="List deliverables, revision caps (e.g. max 2 rounds), and explicit exclusions..."
              className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs hover:bg-emerald-300 shadow-md cursor-pointer"
            >
              Save Template
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 bg-slate-950 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Scope Templates Found</h3>
          <p className="text-xs text-slate-500">Create a new template or reset your filter query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors">
                      {tpl.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tpl.category}
                    </span>
                    {tpl.isDefault && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                        Preset Default
                      </span>
                    )}
                  </div>
                </div>

                {/* Deliverables snippet */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
                  <pre className="whitespace-pre-wrap">{tpl.deliverables}</pre>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono">Created: {tpl.createdAt}</span>

                <div className="flex items-center gap-2">
                  {!tpl.isDefault && (
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition-all cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onUseTemplate(tpl)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Load in Analyzer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

