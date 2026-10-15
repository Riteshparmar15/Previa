import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Info, Sparkles, X, MessageSquare, Copy, Check } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  text = 'Loading...',
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <div className="flex flex-col items-center justify-center p-10 gap-3 text-slate-600">
      <Loader2 className={`${iconSize} animate-spin text-primary-600`} />
      {text && <p className="text-sm font-semibold tracking-tight">{text}</p>}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 text-primary-700 flex items-center justify-center mb-4 shadow-xs">
      {icon || <Sparkles className="w-7 h-7" />}
    </div>
    <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button onClick={onAction} className="previa-btn-primary">
        {actionText}
      </button>
    )}
  </div>
);

export const AlertBanner: React.FC<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
}> = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    info: 'bg-sky-50 border-sky-300 text-sky-950',
    success: 'bg-emerald-50 border-emerald-300 text-emerald-950',
    warning: 'bg-amber-50 border-amber-300 text-amber-950',
    error: 'bg-rose-50 border-rose-300 text-rose-950'
  };

  const icons = {
    info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${styles[type]}`}>
      {icons[type]}
      <div className="text-sm flex-1">
        {title && <h5 className="font-bold mb-0.5 text-slate-900">{title}</h5>}
        <p className="leading-relaxed font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'neutral', size = 'md' }) => {
  const styles = {
    primary: 'bg-primary-50 text-primary-800 border-primary-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
    danger: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    purple: 'bg-purple-50 text-purple-800 border-purple-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md border tracking-tight ${sizeClasses} ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, badge, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
    <div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {badge}
      </div>
      {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
  </div>
);

export const WhatsAppPreviewBubble: React.FC<{
  message: string;
  senderName?: string;
  onCopy?: () => void;
  copied?: boolean;
}> = ({ message, senderName = 'Little Pearls Preschool Admin', onCopy, copied }) => (
  <div className="rounded-2xl border border-slate-300 bg-emerald-950/5 overflow-hidden shadow-xs">
    {/* WhatsApp header bar */}
    <div className="bg-[#075E54] px-4 py-2.5 text-white flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-white font-bold text-xs">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold leading-tight">{senderName}</p>
          <p className="text-[10px] text-emerald-200 font-medium">WhatsApp Broadcast Ready</p>
        </div>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 bg-[#25D366] text-[#075E54] hover:bg-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
      )}
    </div>

    {/* Chat Bubble Body */}
    <div className="p-4 bg-[#EFEAE2]">
      <div className="max-w-xl bg-white rounded-xl p-3.5 shadow-sm text-sm text-slate-900 whitespace-pre-line leading-relaxed font-sans border-l-4 border-l-[#25D366]">
        {message}
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[#34B7F1] font-bold">✓✓</span>
        </div>
      </div>
    </div>
  </div>
);
