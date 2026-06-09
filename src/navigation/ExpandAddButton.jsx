import { ChevronRight, Plus } from 'lucide-react';

function ExpandAddButton({ expanded, onAdd, size = 12, addLabel = 'Añadir' }) {
  return (
    <span className="relative flex items-center justify-center w-3.5 h-3.5 shrink-0">
      <ChevronRight
        size={size}
        strokeWidth={1.5}
        className={`absolute transition-all duration-150 text-zinc-600 group-hover:opacity-0 group-hover:scale-75 ${
          expanded ? 'rotate-90 text-white' : ''
        }`}
      />
      <button
        type="button"
        aria-label={addLabel}
        onClick={(e) => {
          e.stopPropagation();
          onAdd?.();
        }}
        className="absolute flex items-center justify-center w-full h-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 text-zinc-600 hover:text-white transition-all duration-150"
      >
        <Plus size={size} strokeWidth={1.5} />
      </button>
    </span>
  );
}

export default ExpandAddButton;
