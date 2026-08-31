import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const TONE_STYLES = {
  success: 'border-emerald-500/60 bg-emerald-950/90 text-emerald-100',
  error: 'border-red-500/60 bg-red-950/90 text-red-100',
};

/** Notifikasi singkat, menggantikan alert() yang memblokir. */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const Icon = toast.tone === 'error' ? AlertTriangle : CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`screen-only fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-2xl ${
        TONE_STYLES[toast.tone] ?? TONE_STYLES.success
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {toast.message}
    </div>
  );
}
