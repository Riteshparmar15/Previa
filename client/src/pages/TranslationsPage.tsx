import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Send
} from 'lucide-react';
import { api } from '../api/apiClient';
import { SupportedLanguage } from '../types';
import { AlertBanner } from '../components/common/UIComponents';

export const TranslationsPage: React.FC = () => {
  const [sourceText, setSourceText] = useState(
    'Dear Parents, please ensure your child brings a raincoat, a labeled water bottle, and an extra pair of socks tomorrow due to the forecasted monsoon showers.'
  );
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>(2); // Gujarati default
  const [translatedText, setTranslatedText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setError(null);
    setTranslating(true);
    try {
      const res = await api.translations.translateAi({
        sourceText,
        targetLanguage,
        context: 'Preschool parent communication'
      });
      setTranslatedText(res.translatedText);
    } catch (err: any) {
      setError(err.message || 'Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trilingual Translation Assistant</h1>
        <p className="text-sm text-slate-500 mt-1">
          Translate parent announcements and messages seamlessly between English, Gujarati, and Hindi with respectful early childhood terminology.
        </p>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleTranslate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Text */}
        <div className="previa-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Message</span>
            <span className="text-xs text-slate-400">English / Regional</span>
          </div>

          <textarea
            rows={8}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste school message to translate..."
            className="previa-input resize-none"
            required
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Translate into:</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(Number(e.target.value) as SupportedLanguage)}
                className="previa-input py-1.5 px-3 text-xs font-semibold text-primary-800"
              >
                <option value={2}>Gujarati (ગુજરાતી)</option>
                <option value={3}>Hindi (हिन्दी)</option>
                <option value={1}>English</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={translating}
              className="previa-btn-primary text-xs"
            >
              {translating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Translate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Output */}
        <div className="previa-card p-5 space-y-3 bg-primary-50/20 border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
              {targetLanguage === 2 ? 'Gujarati Translation' : targetLanguage === 3 ? 'Hindi Translation' : 'English Translation'}
            </span>

            {translatedText && (
              <button
                type="button"
                onClick={copyResult}
                className="text-xs text-primary-700 font-semibold hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Translation'}
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-primary-200/80 min-h-[200px] text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
            {translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400 italic text-xs">
                Click "Translate" on the left to synthesize the translated announcement...
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic pt-1">
            Translations preserve respectful Indian preschool salutations (e.g., 'સાદર વાલીશ્રીઓ' / 'आदरणीय अभिभावक गण').
          </p>
        </div>
      </form>
    </div>
  );
};
