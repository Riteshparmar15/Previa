import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderArchive,
  PlusCircle,
  Copy,
  Eye,
  Archive,
  Sparkles,
  Check,
  Search,
  X,
  FileText,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/apiClient';
import { NoticeTemplate, NoticeCategory, SupportedLanguage } from '../types';
import { LoadingSpinner, EmptyState, Badge, PageHeader, WhatsAppPreviewBubble } from '../components/common/UIComponents';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<NoticeTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 1 as NoticeCategory,
    subjectTemplate: '',
    bodyTemplate: '',
    whatsAppTemplate: '',
    language: 1 as SupportedLanguage
  });

  const [copied, setCopied] = useState(false);

  const loadTemplates = async () => {
    try {
      const data = await api.templates.list(selectedCategory);
      setTemplates(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await api.templates.duplicate(id);
      setTemplates([...templates, dup]);
      alert('Template duplicated into your custom library!');
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate template.');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this custom template?')) return;
    try {
      await api.templates.archive(id);
      setTemplates(templates.filter((t) => t.id !== id));
      if (previewTemplate?.id === id) setPreviewTemplate(null);
    } catch (err: any) {
      alert(err.message || 'Failed to archive template.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.bodyTemplate.trim()) return;
    try {
      const created = await api.templates.create(newTemplate);
      setTemplates([created, ...templates]);
      setShowCreateModal(false);
      setNewTemplate({
        title: '',
        category: 1,
        subjectTemplate: '',
        bodyTemplate: '',
        whatsAppTemplate: '',
        language: 1
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create template.');
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bodyTemplate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Retrieving preschool template library..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Notice & Activity Template Library"
        subtitle="Standard pre-seeded Indian preschool circulars and your centre's custom communication formats."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="previa-btn-primary text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Create Custom Template
          </button>
        }
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search templates by keyword, rain, sports, PTM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="previa-input pl-10 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === undefined ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setSelectedCategory(4)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 4 ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌧️ Rain & Weather
          </button>
          <button
            onClick={() => setSelectedCategory(2)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 2 ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🪔 Festivals & Holidays
          </button>
          <button
            onClick={() => setSelectedCategory(1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 1 ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            👨‍👩‍👧 PTM & General
          </button>
          <button
            onClick={() => setSelectedCategory(3)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 3 ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🏅 Sports & Events
          </button>
          <button
            onClick={() => setSelectedCategory(5)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 5 ? 'bg-primary-700 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            📝 Fee Due
          </button>
        </div>
      </div>

      {/* Template Cards Grid */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          title="No templates match your search"
          description="Try selecting 'All Templates' or create a custom template for your preschool."
          icon={<FolderArchive className="w-7 h-7 text-primary-700" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="previa-card p-5 flex flex-col justify-between border-slate-300">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={template.isSystemTemplate ? 'primary' : 'neutral'}>
                    {template.isSystemTemplate ? 'Pre-built System' : 'Custom Centre'}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-500">
                    {template.language === 2 ? 'Gujarati' : template.language === 3 ? 'Hindi' : 'English'}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">{template.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line font-medium">
                  {template.bodyTemplate}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-5 flex items-center justify-between">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview & Use
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicate(template.id)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 text-xs font-bold transition-colors"
                    title="Duplicate into custom templates"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {!template.isSystemTemplate && (
                    <button
                      onClick={() => handleArchive(template.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Archive template"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-primary-800 uppercase tracking-wider">
                  {previewTemplate.isSystemTemplate ? 'Pre-built System Template' : 'Centre Custom Template'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{previewTemplate.title}</h3>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <strong className="block text-slate-700 uppercase tracking-wider text-[11px] mb-1">Subject Header</strong>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold">
                  {previewTemplate.subjectTemplate || 'N/A'}
                </p>
              </div>

              {previewTemplate.whatsAppTemplate && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                    WhatsApp Message Format
                  </span>
                  <WhatsAppPreviewBubble message={previewTemplate.whatsAppTemplate} />
                </div>
              )}

              <div>
                <strong className="block text-slate-700 uppercase tracking-wider text-[11px] mb-1">Formal Notice Body</strong>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 whitespace-pre-line leading-relaxed font-sans font-medium text-xs">
                  {previewTemplate.bodyTemplate}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  navigate('/app/notices');
                  setPreviewTemplate(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:underline"
              >
                <span>Draft New Notice with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewTemplate.whatsAppTemplate || previewTemplate.bodyTemplate);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="previa-btn-primary text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Template!' : 'Copy to Clipboard'}
                </button>
                <button onClick={() => setPreviewTemplate(null)} className="previa-btn-secondary text-xs">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Create Custom Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Template Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Field Trip to Kamati Baug Zoo"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="previa-input font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Category
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: Number(e.target.value) as NoticeCategory })}
                    className="previa-input font-medium"
                  >
                    <option value={1}>General Announcement</option>
                    <option value={2}>Holiday Notice</option>
                    <option value={3}>School Event</option>
                    <option value={4}>Emergency / Weather</option>
                    <option value={5}>Fee Reminder</option>
                    <option value={6}>Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Language
                  </label>
                  <select
                    value={newTemplate.language}
                    onChange={(e) => setNewTemplate({ ...newTemplate, language: Number(e.target.value) as SupportedLanguage })}
                    className="previa-input font-medium"
                  >
                    <option value={1}>English</option>
                    <option value={2}>Gujarati</option>
                    <option value={3}>Hindi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Subject Template
                </label>
                <input
                  type="text"
                  placeholder="e.g. Notice regarding upcoming field trip on {Date}"
                  value={newTemplate.subjectTemplate}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subjectTemplate: e.target.value })}
                  className="previa-input font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  Notice Body Template *
                </label>
                <textarea
                  rows={4}
                  placeholder="Dear Parents, we are organizing an educational field trip for our children on {Date}..."
                  value={newTemplate.bodyTemplate}
                  onChange={(e) => setNewTemplate({ ...newTemplate, bodyTemplate: e.target.value })}
                  className="previa-input font-medium"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                  WhatsApp Version Template (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="🎒 *Field Trip Alert* - Dear parents, please find details for {Date}..."
                  value={newTemplate.whatsAppTemplate}
                  onChange={(e) => setNewTemplate({ ...newTemplate, whatsAppTemplate: e.target.value })}
                  className="previa-input font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="previa-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="previa-btn-primary text-xs">
                  Save Custom Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
