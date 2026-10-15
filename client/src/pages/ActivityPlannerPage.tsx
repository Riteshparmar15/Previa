import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Sparkles,
  Save,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  X,
  Clock,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Target,
  Package,
  ListOrdered,
  Layers,
  Heart
} from 'lucide-react';
import { api } from '../api/apiClient';
import { ActivityPlanItem, SupportedLanguage, ActivityDay } from '../types';
import { LoadingSpinner, EmptyState, AlertBanner, Badge, PageHeader } from '../components/common/UIComponents';

export const ActivityPlannerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // 1-Click Early Childhood Curriculum Presets
  const presets = [
    {
      label: '🍂 Sensory Leaves & Textures',
      topic: 'Sensory Exploration with Autumn Leaves, Textures & Nature Trays',
      ageGroup: '3-4 years (Nursery)',
      numberOfDays: 3,
      objectives: 'Tactile sensory processing, vocabulary building, fine motor pincer grasp.',
      materials: 'Dried leaves, magnifying glasses, chart paper, non-toxic washable finger paints, textured sponges.',
      setting: 'Both'
    },
    {
      label: '🎨 Primary Colors & Fingerprint Art',
      topic: 'Colors Discovery: Mixing Red, Yellow & Blue with Fingerprints',
      ageGroup: '2-3 years (Playgroup)',
      numberOfDays: 3,
      objectives: 'Color recognition, cause-and-effect understanding, sensory tactile experience.',
      materials: 'Food-grade finger paint, large drawing sheets, wet wipes, aprons, paper plates.',
      setting: 'Indoor'
    },
    {
      label: '🐸 Animal Walks & Gross Motor',
      topic: 'Gross Motor Development: Jungle Animal Movements & Balance',
      ageGroup: '4-5 years (Junior KG)',
      numberOfDays: 3,
      objectives: 'Gross motor coordination, balance, spatial awareness, cooperative play.',
      materials: 'Floor tape, foam cones, soft beanbags, jungle rhythm music.',
      setting: 'Outdoor'
    },
    {
      label: '💧 Water Play & Floating/Sinking',
      topic: 'Early Science: What Floats and What Sinks in Water Trays?',
      ageGroup: '3-4 years (Nursery)',
      numberOfDays: 1,
      objectives: 'Scientific curiosity, prediction skills, observation of buoyancy.',
      materials: 'Water tubs, plastic toys, pebbles, wooden blocks, sponges, dry towels.',
      setting: 'Outdoor'
    }
  ];

  // Generator form
  const [formData, setFormData] = useState({
    ageGroup: '3-4 years (Nursery)',
    topic: 'Sensory Exploration with Autumn Leaves, Textures & Nature Trays',
    numberOfDays: 3,
    learningObjectives: 'Tactile sensory processing, vocabulary building, fine motor pincer grasp.',
    availableMaterials: 'Dried leaves, magnifying glasses, chart paper, non-toxic washable finger paints, textured sponges.',
    setting: 'Both',
    language: 1 as SupportedLanguage // English curriculum default
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<{
    topic: string;
    ageGroup: string;
    numberOfDays: number;
    days: ActivityDay[];
    modelUsed: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // List plans
  const [plans, setPlans] = useState<ActivityPlanItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPlan, setViewPlan] = useState<ActivityPlanItem | null>(null);

  const loadPlans = async () => {
    setLoadingList(true);
    try {
      const res = await api.activityPlans.list({ searchTerm: searchTerm || undefined });
      setPlans(res.items);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      loadPlans();
    }
  }, [activeTab, searchTerm]);

  const applyPreset = (p: typeof presets[0]) => {
    setFormData((prev) => ({
      ...prev,
      topic: p.topic,
      ageGroup: p.ageGroup,
      numberOfDays: p.numberOfDays,
      learningObjectives: p.objectives,
      availableMaterials: p.materials,
      setting: p.setting
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please provide a lesson topic.');
      return;
    }

    setError(null);
    setGenerating(true);
    setSaveSuccess(false);

    try {
      const res = await api.activityPlans.generateAi({
        ageGroup: formData.ageGroup,
        topic: formData.topic,
        numberOfDays: formData.numberOfDays,
        learningObjectives: formData.learningObjectives,
        availableMaterials: formData.availableMaterials,
        setting: formData.setting,
        language: formData.language
      });

      setGeneratedPlan(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate activity plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      await api.activityPlans.save({
        topic: generatedPlan.topic,
        ageGroup: generatedPlan.ageGroup,
        numberOfDays: generatedPlan.numberOfDays,
        learningObjectives: formData.learningObjectives,
        materials: formData.availableMaterials,
        setting: formData.setting,
        language: formData.language,
        days: generatedPlan.days
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save activity plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity plan?')) return;
    try {
      await api.activityPlans.delete(id);
      setPlans(plans.filter((p) => p.id !== id));
      if (viewPlan?.id === id) setViewPlan(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Weekly Activity & Lesson Planner"
        subtitle="Design developmentally appropriate, play-based multi-day lesson plans with safety rules for early learners (Playgroup to Sr KG)."
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
              Generate Lesson Plan
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curriculum Archive ({plans.length})
            </button>
          </div>
        }
      />

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1-Click Preschool Lesson Presets */}
            <div className="previa-card p-4 bg-teal-50/50 border-teal-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-2">
                ⚡ 1-Click Early Childhood Themes:
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

            <div className="previa-card p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-primary-700" />
                Lesson Planning Parameters
              </h3>

              {error && (
                <div className="mb-4">
                  <AlertBanner type="error" message={error} />
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Age Group *
                    </label>
                    <select
                      value={formData.ageGroup}
                      onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      className="previa-input"
                    >
                      <option value="2-3 years (Playgroup)">2-3 yrs (Playgroup)</option>
                      <option value="3-4 years (Nursery)">3-4 yrs (Nursery)</option>
                      <option value="4-5 years (Junior KG)">4-5 yrs (Junior KG)</option>
                      <option value="5-6 years (Senior KG)">5-6 yrs (Senior KG)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                      Plan Duration *
                    </label>
                    <select
                      value={formData.numberOfDays}
                      onChange={(e) => setFormData({ ...formData, numberOfDays: Number(e.target.value) })}
                      className="previa-input font-bold text-teal-800"
                    >
                      <option value={1}>1 Day Activity</option>
                      <option value={3}>3 Days Theme Plan</option>
                      <option value={5}>5 Days (Full Week)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Topic / Weekly Theme *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Monsoon Animals & Rain Splashes"
                    className="previa-input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Setting
                  </label>
                  <select
                    value={formData.setting}
                    onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                    className="previa-input"
                  >
                    <option value="Indoor">Indoor Classroom</option>
                    <option value="Outdoor">Outdoor / Play Lawn</option>
                    <option value="Both">Both Indoor & Outdoor</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Available Materials *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.availableMaterials}
                    onChange={(e) => setFormData({ ...formData, availableMaterials: e.target.value })}
                    placeholder="e.g. Washable paints, clay dough, chart paper, spoons"
                    className="previa-input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Target Developmental Milestones *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                    placeholder="e.g. Fine motor grasp, sensory discrimination, language expression"
                    className="previa-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-primary-700 hover:bg-primary-800 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Curriculum Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate {formData.numberOfDays}-Day Activity Plan</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-7 space-y-6">
            {generatedPlan ? (
              <div className="space-y-6">
                {saveSuccess && (
                  <AlertBanner type="success" message="Activity plan successfully saved to your curriculum archive!" />
                )}

                <div className="previa-card p-6 border-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {generatedPlan.ageGroup}
                        </span>
                        <Badge variant="primary">{generatedPlan.numberOfDays} Days Plan</Badge>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-2">{generatedPlan.topic}</h3>
                    </div>

                    <button
                      onClick={handleSavePlan}
                      disabled={saving}
                      className="previa-btn-primary text-xs self-start sm:self-center"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Saving...' : 'Save to Curriculum'}
                    </button>
                  </div>

                  {/* Daily Activity Cards */}
                  <div className="mt-6 space-y-5">
                    {generatedPlan.days.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3.5 shadow-2xs"
                      >
                        {/* Day Title bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-primary-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                              D{day.dayNumber}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-slate-900">{day.activityName}</h4>
                              <p className="text-xs text-primary-800 font-bold">{day.dayTheme}</p>
                            </div>
                          </div>
                          <Badge variant="neutral">
                            <Clock className="w-3 h-3 mr-1 inline" /> {day.durationMinutes}
                          </Badge>
                        </div>

                        {/* Objectives & Materials */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                              <Target className="w-3.5 h-3.5" />
                              <span>Learning Objective</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed font-medium">{day.objective}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-teal-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                              <Package className="w-3.5 h-3.5" />
                              <span>Materials Needed</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed font-medium">{day.materialsNeeded}</p>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                            <ListOrdered className="w-3.5 h-3.5" />
                            <span>Step-by-Step Instructions</span>
                          </div>
                          <p className="text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                            {day.stepByStepInstructions}
                          </p>
                        </div>

                        {/* Adaptations and Safety */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950">
                            <div className="flex items-center gap-1.5 text-purple-800 font-bold uppercase tracking-wider text-[10px] mb-1">
                              <Sliders className="w-3 h-3" />
                              <span>Toddler Adaptations</span>
                            </div>
                            <p className="leading-relaxed font-medium">{day.abilityAdaptations}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-300 text-rose-950">
                            <div className="flex items-center gap-1.5 text-rose-800 font-bold uppercase tracking-wider text-[10px] mb-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Mandatory Child Safety</span>
                            </div>
                            <p className="leading-relaxed font-medium">{day.safetyConsiderations}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Your lesson plan timeline will appear here"
                description="Pick one of the 1-click preschool themes on the left, or input your custom topic, and Previa will generate structured daily plans with safety guidelines."
                icon={<BookOpenCheck className="w-7 h-7 text-primary-700" />}
              />
            )}
          </div>
        </div>
      ) : (
        /* Saved Plans List Tab */
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search saved plans by topic, age group, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="previa-input pl-10 max-w-md font-medium"
            />
          </div>

          {loadingList ? (
            <LoadingSpinner text="Retrieving curriculum archive..." />
          ) : plans.length === 0 ? (
            <EmptyState
              title="No saved activity plans in archive"
              description="Generate your first weekly plan to build a structured, reusable curriculum database for your preschool teachers."
              actionText="Generate Plan Now"
              onAction={() => setActiveTab('create')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="previa-card p-5 flex flex-col justify-between border-slate-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary">{p.ageGroup}</Badge>
                      <span className="text-xs font-bold text-slate-500">{p.numberOfDays} Days Plan</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{p.topic}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {p.learningObjectives}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between mt-4">
                    <button
                      onClick={() => setViewPlan(p)}
                      className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Daily Steps ({p.days.length} Days)
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete plan"
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

      {/* Plan View Modal */}
      {viewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">{viewPlan.ageGroup}</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{viewPlan.topic}</h3>
              </div>
              <button onClick={() => setViewPlan(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {viewPlan.days.map((d) => (
                <div key={d.dayNumber} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Day {d.dayNumber}: {d.activityName} ({d.dayTheme})
                    </span>
                    <Badge variant="neutral">{d.durationMinutes}</Badge>
                  </div>
                  <p className="text-slate-800">
                    <strong className="text-slate-900">Objectives:</strong> {d.objective}
                  </p>
                  <p className="text-slate-800">
                    <strong className="text-slate-900">Materials:</strong> {d.materialsNeeded}
                  </p>
                  <p className="text-slate-800 leading-relaxed">
                    <strong className="text-slate-900">Instructions:</strong> {d.stepByStepInstructions}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <p className="p-2 rounded bg-purple-50 text-purple-900 border border-purple-200">
                      <strong>Adaptation:</strong> {d.abilityAdaptations}
                    </p>
                    <p className="p-2 rounded bg-rose-50 text-rose-900 border border-rose-200">
                      <strong>Safety:</strong> {d.safetyConsiderations}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewPlan(null)} className="previa-btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
