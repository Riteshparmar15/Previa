import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Save,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Eye,
  X,
  AlertCircle,
  Share2,
  CheckCircle2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { api } from '../api/apiClient';
import { NoticeItem, SupportedLanguage, NoticeCategory, NoticeAudience, ToneStyle, ClassRoom } from '../types';
import { LoadingSpinner, EmptyState, AlertBanner, Badge, PageHeader, WhatsAppPreviewBubble } from '../components/common/UIComponents';

export const NoticesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  // 1-Click Preschool Presets for quick generation
  const presets = [
    {
      label: '🌧️ Heavy Rain Holiday',
      subject: 'School Holiday Notice due to Heavy Rain & Waterlogging Advisory',
      category: '4', // Emergency
      audience: '1',
      tone: 1, // Warm
      instructions: 'Mention heavy rains in Vadodara, closure for toddler safety, and keep children safe indoors.'
    },
    {
      label: '🪔 Navratri Garba Celebration',
      subject: 'Navratri Traditional Dress & Garba Celebration Schedule',
      category: '6', // Celebration
      audience: '1',
      tone: 4, // Friendly
      instructions: 'Children to wear comfortable Chaniya Choli or Kurta with flat shoes. Timings 9:30 AM to 11:30 AM.'
    },
    {
      label: '👨‍👩‍👧 Parent-Teacher Meeting (PTM)',
      subject: 'Term 1 Developmental Milestones & Parent-Teacher Meeting',
      category: '1', // General
      audience: '1',
      tone: 1,
      instructions: 'Inviting parents to discuss language development, fine motor skills and classroom social habits.'
    },
    {
      label: '🩺 Health & Fever Advisory',
      subject: 'Health Advisory: Flu & Hand-Foot-Mouth Caution for Toddlers',
      category: '4', // Emergency
      audience: '1',
      tone: 1,
      instructions: 'Request parents not to send children with fever or rashes to ensure campus well-being.'
    },
    {
      label: '📝 Monthly Fee Reminder',
      subject: 'Gentle Reminder: Term Fee Payment for Next Quarter',
      category: '5', // FeeReminder
      audience: '1',
      tone: 1,
      instructions: 'Polite reminder with due date, digital transfer instructions, and gratitude for prompt support.'
    }
  ];

  // Generator form state
  const [formData, setFormData] = useState({
    category: '6', // Festival Celebration
    targetAudience: '1', // AllParents
    classRoomId: '',
    subject: 'Navratri Traditional Dress & Garba Celebration Schedule',
    eventDate: 'This Friday, 9:30 AM - 11:30 AM',
    requiredItems: 'Traditional dress (Kurta/Chaniya Choli), labeled water bottle',
    tone: 4 as ToneStyle, // Friendly
    language: 2 as SupportedLanguage, // Gujarati default
    outputLength: 'Standard',
    additionalInstructions: 'Children must wear flat footwear for safety during dancing.'
  });

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<{
    title: string;
    messageBody: string;
    whatsAppVersion: string;
    modelUsed: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  // List state
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | undefined>(undefined);
  const [viewNotice, setViewNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    // Load classrooms for audience dropdown
    api.attendance.getClasses().then(setClasses).catch(() => {});
  }, []);

  const loadNotices = async () => {
    setLoadingList(true);
    try {
      const res = await api.notices.list({
        searchTerm: searchTerm || undefined,
        category: selectedCategory
      });
      setNotices(res.items);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      loadNotices();
    }
  }, [activeTab, selectedCategory, searchTerm]);

  const applyPreset = (p: typeof presets[0]) => {
    setFormData((prev) => ({
      ...prev,
      subject: p.subject,
      category: p.category,
      targetAudience: p.audience,
      tone: p.tone as ToneStyle,
      additionalInstructions: p.instructions
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      setGenError('Please provide a notice subject or event title.');
      return;
    }

    setGenError(null);
    setGenerating(true);
    setSaveSuccess(false);

    const categoryNames: Record<string, string> = {
      '1': 'General Announcement',
      '2': 'Holiday Notice',
      '3': 'Event Announcement',
      '4': 'Emergency & Weather Alert',
      '5': 'Fee Reminder',
      '6': 'Festival Celebration'
    };

    const audienceNames: Record<string, string> = {
      '1': 'All Parents',
      '2': 'Specific Classroom',
      '3': 'Staff Only'
    };

    try {
      const res = await api.notices.generateAi({
        category: categoryNames[formData.category] || 'General Announcement',
        targetAudience: audienceNames[formData.targetAudience] || 'All Parents',
        subject: formData.subject,
        eventDate: formData.eventDate || undefined,
        requiredItems: formData.requiredItems || undefined,
        tone: formData.tone,
        language: formData.language,
        outputLength: formData.outputLength,
        additionalInstructions: formData.additionalInstructions || undefined
      });

      setGeneratedOutput({
        title: res.title,
        messageBody: res.messageBody,
        whatsAppVersion: res.whatsAppVersion,
        modelUsed: res.modelUsed
      });
    } catch (err: any) {
      setGenError(err.message || 'AI notice generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveNotice = async (isDraft: boolean) => {
    if (!generatedOutput) return;
    setSaving(true);
    try {
      await api.notices.create({
        title: generatedOutput.title,
        messageBody: generatedOutput.messageBody,
        whatsAppVersion: generatedOutput.whatsAppVersion,
        category: Number(formData.category) as NoticeCategory,
        targetAudience: Number(formData.targetAudience) as NoticeAudience,
        classRoomId: formData.classRoomId || undefined,
        language: formData.language,
        tone: formData.tone,
        isDraft,
        additionalInstructions: formData.additionalInstructions
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.notices.delete(id);
      setNotices(notices.filter((n) => n.id !== id));
      if (viewNotice?.id === id) setViewNotice(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice.');
    }
  };

  const copyText = (text: string, isWa: boolean) => {
    navigator.clipboard.writeText(text);
    if (isWa) {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Parent Notices & WhatsApp Assistant"
        subtitle="Generate culturally respectful school circulars and ready-to-broadcast WhatsApp messages in Gujarati, Hindi & English."
        actions={
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draft & Generate
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved Archive ({notices.length > 0 ? notices.length : 'Records'})
            </button>
          </div>
        }
      />

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1-Click Quick Fill Chips */}
            <div className="previa-card p-4 bg-teal-50/50 border-teal-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-2">
                ⚡ 1-Click Preschool Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11px] font-semibold bg-white hover:bg-teal-100/70 text-slate-800 border border-teal-200 px-2.5 py-1 rounded-lg transition-all shadow-2xs hover:border-teal-400"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generator Form Card */}
            <div className="previa-card p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-700" />
                Notice Generator Parameters
              </h3>

              {genError && (
                <div className="mb-4">
                  <AlertBanner type="error" message={genError} />
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Language Switcher */}
                <div>
                  <label className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Output Language (ભાષા / भाषा) *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 2, label: 'ગુજરાતી', flag: '🇮🇳' },
                      { id: 1, label: 'English', flag: '🇬🇧' },
                      { id: 3, label: 'हिन्दी', flag: '🇮🇳' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, language: lang.id as SupportedLanguage })}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.language === lang.id
                            ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Tone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="previa-input"
                    >
                      <option value="6">Festival Celebration</option>
                      <option value="4">Emergency / Weather</option>
                      <option value="1">General Announcement</option>
                      <option value="2">Holiday Notice</option>
                      <option value="3">School Event / Sports</option>
                      <option value="5">Fee Reminder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Tone
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: Number(e.target.value) as ToneStyle })}
                      className="previa-input"
                    >
                      <option value={4}>Friendly & Cheerful</option>
                      <option value={1}>Warm & Nurturing</option>
                      <option value={2}>Formal & Respectful</option>
                      <option value={3}>Urgent / Action Required</option>
                    </select>
                  </div>
                </div>

                {/* Audience */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="previa-input"
                    >
                      <option value="1">All Parents</option>
                      <option value="2">Specific Classroom</option>
                      <option value="3">Staff Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Output Length
                    </label>
                    <select
                      value={formData.outputLength}
                      onChange={(e) => setFormData({ ...formData, outputLength: e.target.value })}
                      className="previa-input"
                    >
                      <option value="Standard">Standard Notice</option>
                      <option value="Short">Short & Crisp</option>
                      <option value="Detailed">Detailed Circular</option>
                    </select>
                  </div>
                </div>

                {formData.targetAudience === '2' && (
                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Select Classroom *
                    </label>
                    <select
                      value={formData.classRoomId}
                      onChange={(e) => setFormData({ ...formData, classRoomId: e.target.value })}
                      className="previa-input"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.academicYear})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Subject / Event Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Navratri Garba Celebration & Traditional Attire"
                    className="previa-input"
                    required
                  />
                </div>

                {/* Date & Timings, Required Items */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Date & Timings
                    </label>
                    <input
                      type="text"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      placeholder="e.g. This Friday, 9:30 AM"
                      className="previa-input"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Required Items
                    </label>
                    <input
                      type="text"
                      value={formData.requiredItems}
                      onChange={(e) => setFormData({ ...formData, requiredItems: e.target.value })}
                      placeholder="e.g. Traditional attire, water bottle"
                      className="previa-input"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additionalInstructions}
                    onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                    placeholder="e.g. Please ensure toddlers wear flat comfortable shoes for dancing..."
                    className="previa-input"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-primary-700 hover:bg-primary-800 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Regional Notice...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Notice & WhatsApp Draft</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Generated Result Display */}
          <div className="lg:col-span-7 space-y-6">
            {generatedOutput ? (
              <div className="space-y-6">
                {saveSuccess && (
                  <AlertBanner type="success" message="Notice saved successfully! You can view it anytime in the Saved Archive." />
                )}

                {/* Main Card */}
                <div className="previa-card p-6 border-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                          {generatedOutput.modelUsed}
                        </span>
                        <Badge variant="primary">
                          {formData.language === 2 ? 'ગુજરાતી (Gujarati)' : formData.language === 3 ? 'हिन्दी (Hindi)' : 'English'}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-900 mt-2">{generatedOutput.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveNotice(false)}
                        disabled={saving}
                        className="previa-btn-primary text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? 'Saving...' : 'Save Notice'}
                      </button>
                      <button
                        onClick={() => handleSaveNotice(true)}
                        disabled={saving}
                        className="previa-btn-secondary text-xs"
                      >
                        Save as Draft
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Real WhatsApp Phone Bubble */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Ready for WhatsApp Broadcast
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">1-Click Broadcast Ready</span>
                      </div>
                      <WhatsAppPreviewBubble
                        message={generatedOutput.whatsAppVersion}
                        onCopy={() => copyText(generatedOutput.whatsAppVersion, true)}
                        copied={copiedWa}
                      />
                    </div>

                    {/* Official Circular / Print Format */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-500" />
                          Formal School Circular (Print / Email)
                        </span>
                        <button
                          onClick={() => copyText(generatedOutput.messageBody, false)}
                          className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1"
                        >
                          {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedBody ? 'Copied Circular' : 'Copy Text'}
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 whitespace-pre-line leading-relaxed font-sans">
                        {generatedOutput.messageBody}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Your AI Notice & WhatsApp Preview will appear here"
                description="Pick a 1-click preschool preset above, or customize your announcement subject, language (English, Gujarati, or Hindi), and click Generate."
                icon={<Sparkles className="w-7 h-7 text-primary-600" />}
              />
            )}
          </div>
        </div>
      ) : (
        /* Saved Notices Archive Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search notices by title, festival, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="previa-input pl-10"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? (Number(e.target.value) as NoticeCategory) : undefined)}
              className="previa-input sm:w-56 font-medium"
            >
              <option value="">All Categories</option>
              <option value="6">Festival Celebration</option>
              <option value="4">Emergency / Weather</option>
              <option value="1">General</option>
              <option value="2">Holiday</option>
              <option value="3">Event</option>
              <option value="5">Fee Reminder</option>
            </select>
          </div>

          {loadingList ? (
            <LoadingSpinner text="Retrieving archived notices..." />
          ) : notices.length === 0 ? (
            <EmptyState
              title="No notices found in archive"
              description="You have not created any notices matching this filter yet. Start by generating a new announcement."
              actionText="Generate First Notice"
              onAction={() => setActiveTab('create')}
            />
          ) : (
            <div className="previa-card divide-y divide-slate-200 overflow-hidden">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900 truncate">{n.title}</h4>
                      <Badge variant={n.isDraft ? 'warning' : 'success'}>
                        {n.isDraft ? 'Draft' : 'Active'}
                      </Badge>
                      <Badge variant="neutral">
                        {n.language === 2 ? 'ગુજરાતી' : n.language === 3 ? 'हिन्दी' : 'English'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.messageBody}</p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Target: {n.classRoomName ? `Class: ${n.classRoomName}` : 'All Parents'} • Created on {new Date(n.createdAtUtc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setViewNotice(n)}
                      className="previa-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Copy</span>
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notice View Modal */}
      {viewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">{viewNotice.title}</h3>
                <Badge variant={viewNotice.isDraft ? 'warning' : 'success'}>
                  {viewNotice.isDraft ? 'Draft' : 'Active'}
                </Badge>
              </div>
              <button
                onClick={() => setViewNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {viewNotice.whatsAppVersion && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                    WhatsApp Message Format
                  </span>
                  <WhatsAppPreviewBubble message={viewNotice.whatsAppVersion} />
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Official Circular Body
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm whitespace-pre-line leading-relaxed text-slate-900 font-sans">
                  {viewNotice.messageBody}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewNotice.whatsAppVersion || viewNotice.messageBody);
                  alert('WhatsApp notice copied to clipboard!');
                }}
                className="previa-btn-whatsapp text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Copy WhatsApp Text
              </button>
              <button onClick={() => setViewNotice(null)} className="previa-btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
