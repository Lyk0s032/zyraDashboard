import { useLocation, useNavigate } from 'react-router-dom';
import { MOBILE_NAV_ITEMS, getActiveMobileNavId } from './mobileNavData';
import { useAccessibility } from '../estados/AccessibilityContext';

const ICON_PROPS = { size: 20, strokeWidth: 1.5 };

function MobileBottomNav({ settingsOpen = false, onSettingsOpen, onSettingsClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLight } = useAccessibility();
  const activeId = getActiveMobileNavId(location.pathname, settingsOpen);

  const handleTabClick = (item) => {
    if (item.action === 'settings') {
      onSettingsOpen?.();
      return;
    }
    onSettingsClose?.();
    const path = item.getPath?.();
    if (path) navigate(path);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 pb-nav-bar md:hidden border-t ${
        isLight
          ? 'border-slate-200 bg-white/95 backdrop-blur-md'
          : 'border-white/[0.06] bg-[#0b0b0b]/95 backdrop-blur-md'
      }`}
      aria-label="Navegación móvil"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-2 pt-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-1.5 transition-colors duration-200 ${
                isActive
                  ? 'text-emerald-500'
                  : isLight
                    ? 'text-slate-400 hover:text-slate-600'
                    : 'text-zinc-500 hover:text-zinc-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon {...ICON_PROPS} className="shrink-0" />
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
