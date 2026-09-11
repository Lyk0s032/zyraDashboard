import { Plus } from 'lucide-react';
import { useMobileLayout } from '../estados/MobileLayoutContext';

function MobileFab() {
  const { triggerCreate, canCreate } = useMobileLayout();

  if (!canCreate) return null;

  return (
    <button
      type="button"
      onClick={triggerCreate}
      className="bottom-fab-mobile fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 md:hidden"
      aria-label="Crear reserva"
    >
      <Plus size={28} strokeWidth={2.25} />
    </button>
  );
}

export default MobileFab;
