import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

const DURACION_MS = 2400;

export default function MicroToast({ mensaje, onCerrar }) {
  useEffect(() => {
    const timer = window.setTimeout(onCerrar, DURACION_MS);
    return () => window.clearTimeout(timer);
  }, [onCerrar]);

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-700/80 bg-[#1e293b]/95 px-3.5 py-2 shadow-xl backdrop-blur-md animate-ios-pop-in"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
        <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
      </span>
      <span className="text-xs font-medium text-slate-200">{mensaje}</span>
    </div>,
    document.body,
  );
}
