import CanchasSubmenu from './CanchasSubmenu';
import ExpandAddButton from './ExpandAddButton';
import { SIDEBAR_NAV_ITEMS } from './navData';
import { useAccessibility } from '../estados/AccessibilityContext';

const ICON_PROPS = { size: 14, strokeWidth: 1.5 };

function SidebarNav({
  selectedNav,
  onSelectNav,
  selectedCourt,
  onSelectCourt,
  onAddCourt,
  onCourtAction,
}) {
  const { isLight } = useAccessibility();

  return (
    <nav className="flex-1 space-y-1">
      {SIDEBAR_NAV_ITEMS.map(({ id, icon: Icon }) => {
        const isActive = selectedNav === id;
        const isCanchas = id === 'Canchas';

        return (
          <div key={id}>
            <button
              type="button"
              onClick={() => onSelectNav(id)}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-300 ${
                isActive
                  ? isLight
                    ? 'bg-slate-200/60 text-emerald-600 font-medium'
                    : 'bg-white/[0.04] text-white font-medium'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-[#6b6b7b] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                {...ICON_PROPS}
                className={`shrink-0 transition-colors duration-300 ${
                  isActive
                    ? isLight
                      ? 'text-emerald-600'
                      : 'text-white'
                    : isLight
                      ? 'text-slate-500 group-hover:text-slate-700'
                      : 'text-[#6b6b7b] group-hover:text-white'
                }`}
              />
              <span className="flex-1 text-left">{id}</span>

              {isCanchas && (
                <ExpandAddButton
                  expanded={isActive}
                  onAdd={() => onAddCourt?.()}
                  addLabel="Añadir nueva cancha"
                />
              )}
            </button>

            {isCanchas && isActive && (
              <CanchasSubmenu
                selectedCourt={selectedCourt}
                onSelectCourt={onSelectCourt}
                onAddCourt={onAddCourt}
                onCourtAction={onCourtAction}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
