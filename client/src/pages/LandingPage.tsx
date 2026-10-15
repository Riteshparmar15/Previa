import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Languages,
  CalendarCheck2,
  BookOpenCheck,
  ReceiptIndianRupee,
  FolderArchive,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Copy,
  Check,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

export const LandingPage: React.FC = () => {
  const [activeSampleTab, setActiveSampleTab] = useState<'ptm' | 'rain' | 'activity'>('ptm');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleNotices = {
    ptm: {
      title: 'Parent-Teacher Meeting (PTM) Invitation',
      language: 'Gujarati + English Format',
      body: `સાદર વાલીશ્રીઓ,\n\nઆપણી પ્રિસ્કૂલ તરફથી પ્રથમ સત્રની વાલી-શિક્ષક મિટિંગ (PTM) નું આયોજન તારીખ 24 ઓક્ટોબર, સવારે 9:30 કલાકે કરવામાં આવેલ છે. આપના બાળકના સર્વાંગી વિકાસ, પ્રવૃત્તિઓ અને વર્ગખંડમાં રસ અંગે ચર્ચા કરવા આપ સર્વેને હાર્દિક આમંત્રણ છે.\n\nકૃપા કરીને આપેલા સમયપત્રક મુજબ પધારવા વિનંતી.\n\nસ્નેહપૂર્વક,\nસેન્ટર સંચાલક તથા શિક્ષકગણ`,
      whatsapp: `🌸 *વાલી-શિક્ષક મિટિંગ (PTM) આમંત્રણ*\n\nવાલીશ્રીઓ, આપના બાળકની શૈક્ષણિક પ્રગતિ અંગે ચર્ચા કરવા *24 ઓક્ટોબર, સવારે 9:30* વાગ્યે સ્કૂલ કેમ્પસમાં પધારવા નમ્ર વિનંતી.\n📍 સ્થળ: સ્કૂલ કેમ્પસ\n- પ્રિસ્કૂલ વહીવટી વિભાગ`
    },
    rain: {
      title: 'Monsoon Heavy Rain Advisory & Holiday',
      language: 'English + WhatsApp Format',
      body: `Dear Parents,\n\nIn light of the heavy rainfall advisory issued by Vadodara municipal authorities and for the safety and convenience of our young toddlers, the preschool campus will remain closed on Tuesday, 18th July.\n\nClasses will resume regularly once weather conditions normalize. Please keep your children warm and safe indoors!\n\nWarm regards,\nPrincipal & Administration`,
      whatsapp: `🌧️ *Previa Rain Holiday Notice*\n\nDear Parents, due to continuous heavy rain in Vadodara, the preschool will remain *CLOSED today (18th July)* for child safety.\nStay safe indoors!\n- Preschool Management`
    },
    activity: {
      title: '3-Day Sensory & Fine Motor Plan (Age 3-4 Years)',
      language: 'Curriculum Outline',
      body: `Day 1: Rainbow Rice & Texture Exploration\n• Objective: Enhance tactile discrimination and color recognition.\n• Materials: Food-grade dyed rice, measuring cups, scoopers, trays.\n• Instructions: Guided circle-time demo, followed by sensory bin exploration in pairs (25 mins).\n• Safety: Non-toxic natural dye; adult eye-level supervision.\n\nDay 2: Clay Dough Sculpting & Animal Prints\n• Objective: Develop pincer grasp and thumb resistance.\n• Materials: Soft child-safe playdough, wooden stamps.\n\nDay 3: Rhythm & Nature Scavenger Walk\n• Objective: Gross motor balance and auditory coordination.\n• Adaptations: Hand-over-hand guidance for shy children.`,
      whatsapp: `🎨 *Weekly Playplan Highlights*\n\nTopic: *Color & Sensory Discovery*\nDays: 3 Days Hands-on Engagement\nSafety: Adult-supervised, non-toxic materials\n- Early Childhood Educator Team`
    }
  };

  const faqs = [
    {
      q: 'Does Previa automatically send WhatsApp messages without staff approval?',
      a: 'No. Previa generates clean, professional WhatsApp-formatted drafts with emojis and highlights for you to review, copy, or edit. No messages are sent automatically without your explicit control.'
    },
    {
      q: 'Which languages are supported for parent communications?',
      a: 'Previa natively generates notices and lesson plans in English, Gujarati, and Hindi, specifically tailored for preschools in Gujarat and across India.'
    },
    {
      q: 'How does Previa protect children’s privacy?',
      a: 'We adhere to strict data minimization. Previa does not collect children’s photos, biometric information, or invasive medical records. We maintain strict tenant isolation so your centre’s records are never visible to other schools.'
    },
    {
      q: 'Can multiple teachers use the platform?',
      a: 'Yes. Previa includes role-based access control (Owner, Administrator, Teacher, and Staff) allowing centre owners to collaborate with their teaching staff under appropriate permissions.'
    },
    {
      q: 'What happens when my 14-day trial concludes?',
      a: 'You can select from our transparent plans starting at ₹499/month. We never charge hidden setup fees or tie you into annual lock-ins.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-800">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200/80 text-primary-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Designed specifically for independent Indian preschools & daycares
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Less paperwork. Better parent communication.{' '}
            <span className="text-primary-700 underline decoration-primary-200 decoration-wavy decoration-2">
              More time for children.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            The AI-powered preschool administrative assistant that writes WhatsApp notices in Gujarati, Hindi & English, generates weekly activity plans, tracks attendance, and drafts gentle fee reminders.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto previa-btn-primary px-7 py-3 text-base shadow-md">
              Start 14-Day Free Trial
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <a href="#samples" className="w-full sm:w-auto previa-btn-secondary px-7 py-3 text-base">
              See Example Outputs
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready for Vadodara & Gujarat schools
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">Comprehensive Operations</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your preschool administrator needs daily
            </p>
            <p className="mt-4 text-base text-slate-600">
              Built specifically to relieve centre owners and teachers from repetitive drafting and administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">WhatsApp-Ready Notices</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generate both formal school notices and compact WhatsApp messages complete with emojis and bullet points for immediate copy-pasting.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                PTM, Events, Rain Holidays, Celebrations →
              </div>
            </div>

            {/* Feature 2 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <Languages className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gujarati, Hindi & English</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bridge parent communication effortlessly. Output natural, culturally respectful notices in regional languages with proper formal terminology.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                Trilingual Translation & Output →
              </div>
            </div>

            {/* Feature 3 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Weekly Activity Planner</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Create age-appropriate lesson plans (Playgroup to Sr KG) with learning objectives, available materials, ability adaptations, and child safety notes.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                Early Childhood Curriculum Builder →
              </div>
            </div>

            {/* Feature 4 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Daily Attendance Recording</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Clean class rosters with one-click Present, Absent, and Late recording. Built-in duplicate prevention and authorized CSV export.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                Daily summaries & CSV records →
              </div>
            </div>

            {/* Feature 5 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <ReceiptIndianRupee className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gentle Fee Reminder Assistant</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Prepare polite, respectful reminders in INR based on your verified fee records. No robotic automated debits or awkward phone calls.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                Respectful parent fee notices →
              </div>
            </div>

            {/* Feature 6 */}
            <div className="previa-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Preschool Template Library</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pre-stocked with standard Indian preschool templates for Monsoon Alerts, Sports Days, Field Trips, Navratri/Diwali vacations, and PTMs.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-primary-700">
                Pre-built & custom school templates →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Example Outputs */}
      <section id="samples" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">Tested Early Childhood Content</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Real outputs you can use immediately</p>
            <p className="mt-3 text-slate-600 text-sm">Review actual outputs synthesized by our preschool engine</p>

            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setActiveSampleTab('ptm')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeSampleTab === 'ptm' ? 'bg-primary-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                PTM Notice (Gujarati)
              </button>
              <button
                onClick={() => setActiveSampleTab('rain')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeSampleTab === 'rain' ? 'bg-primary-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                Rain Holiday Notice (English)
              </button>
              <button
                onClick={() => setActiveSampleTab('activity')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeSampleTab === 'activity' ? 'bg-primary-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                Weekly Activity Plan (Toddlers)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
                  {sampleNotices[activeSampleTab].language}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-2">{sampleNotices[activeSampleTab].title}</h4>
              </div>
              <button
                onClick={() => copyToClipboard(sampleNotices[activeSampleTab].whatsapp)}
                className="previa-btn-secondary text-xs self-start sm:self-center"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Format'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">School Official Notice</h5>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                  {sampleNotices[activeSampleTab].body}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">WhatsApp Short Message</h5>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                  {sampleNotices[activeSampleTab].whatsapp}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Plans */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">Affordable Subscriptions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Transparent pricing for independent preschools
            </p>
            <p className="mt-4 text-base text-slate-600">
              No hidden platform fees. Pay month-to-month. Every plan starts with a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="previa-card p-8 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Starter</div>
                <p className="text-xs text-slate-500 mt-1">Best for small daycares & home preschools</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹499</span>
                  <span className="text-sm font-medium text-slate-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 30 AI Notices / month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> 10 Weekly Activity Plans
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 30 Students & 2 Classes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> WhatsApp format generation
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Daily attendance & CSV export
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 previa-btn-secondary w-full">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Standard Plan (Recommended) */}
            <div className="previa-card p-8 flex flex-col justify-between border-2 border-primary-600 relative shadow-md">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase">
                Most Popular
              </div>
              <div>
                <div className="text-sm font-bold text-primary-800 uppercase tracking-wider">Standard</div>
                <p className="text-xs text-slate-500 mt-1">Ideal for established independent preschools</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                  <span className="text-sm font-medium text-slate-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 150 AI Notices / month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> 50 Weekly Activity Plans
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 100 Students & 8 Classes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Gujarati, Hindi & English translations
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Gentle fee reminder assistant
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Custom template creator
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 previa-btn-primary w-full shadow-sm">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="previa-card p-8 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Premium</div>
                <p className="text-xs text-slate-500 mt-1">For multi-branch or high-capacity institutes</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹1,999</span>
                  <span className="text-sm font-medium text-slate-500">/ month</span>
                </div>
                <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 1,000 AI Notices / month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> 500 Activity Plans
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Up to 500 Students & 30 Classes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Unlimited CSV attendance reports
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" /> Priority support & team training
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 previa-btn-secondary w-full">
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Child Privacy Section */}
      <section id="security" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Responsible Data & Child Privacy Commitment</h3>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
            We treat young children’s privacy with utmost care. Previa enforces strict data minimization: we never collect children’s photos, facial geometry, biometric identifiers, or sensitive medical dossiers. Every organisation operates inside an isolated, encrypted tenant boundary.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-700">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200">🔒 Tenant-Isolated SQL Storage</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200">🛡️ Server-Side Authorization</span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200">👨‍🏫 Staff Approval Before Dispatch</span>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">Answers to Common Questions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-bold text-lg">Previa</span>
            <span className="text-xs text-slate-500 ml-2">© 2026 Previa EdTech Solutions. Vadodara, Gujarat.</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register Centre</Link>
            <a href="#security" className="hover:text-white transition-colors">Child Privacy Policy</a>
            <a href="#pricing" className="hover:text-white transition-colors">Subscription Tiers</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
