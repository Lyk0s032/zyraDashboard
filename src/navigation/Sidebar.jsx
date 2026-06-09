import { ChevronDown } from 'lucide-react';
import SidebarNav from './SidebarNav';
import { useAccessibility } from '../estados/AccessibilityContext';

function Sidebar({
  sidebarRef,
  sidebarWidth,
  isResizing,
  onResizeStart,
  selectedNav,
  onSelectNav,
  selectedCourt,
  onSelectCourt,
  onAddCourt,
  onCourtAction,
}) {
  const { isLight } = useAccessibility();

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}vw` }}
      className={`relative flex h-full min-h-0 flex-col overflow-hidden px-4 py-5 transition-all duration-300 ${
        isLight ? 'border-r border-slate-200 bg-[#f8fafc]' : 'bg-[#0b0b0b]'
      }`}
    >
      <div className="mb-8 flex-shrink-0">
        <button
          type="button"
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
            isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#00FF66] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-black">ZR</span>
          </div>
          <span
            className={`text-xs font-medium transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            ZYRA
          </span>
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            className={`ml-auto transition-colors duration-300 ${
              isLight
                ? 'text-slate-400 group-hover:text-slate-600'
                : 'text-[#6b6b7b] group-hover:text-white'
            }`}
          />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
        <SidebarNav
          selectedNav={selectedNav}
          onSelectNav={onSelectNav}
          selectedCourt={selectedCourt}
          onSelectCourt={onSelectCourt}
          onAddCourt={onAddCourt}
          onCourtAction={onCourtAction}
        />
      </div>

      <div className="mt-auto pt-4 flex-shrink-0">
        <button
          type="button"
          className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              : 'bg-white/[0.04] text-[#6b6b7b] hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <span className="text-lg font-medium">?</span>
        </button>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onResizeStart}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#00FF66]/50 transition-colors ${
          isResizing ? 'bg-[#00FF66]' : 'bg-transparent'
        }`}
        style={{ zIndex: 10 }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-12 bg-white/10 rounded-full" />
      </div>
    </aside>
  );
}

export default Sidebar;
