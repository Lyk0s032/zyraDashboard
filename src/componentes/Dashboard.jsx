import { useState, useRef, useEffect } from 'react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { Sidebar, MobileBottomNav, MobileFab, MobileSettingsSheet } from '../navigation';
import { MobileLayoutProvider } from '../estados/MobileLayoutContext';

import Cancha from './canchas/cancha';
import PrincipalDashboard from './principal/principalDashboard';
import Members from './miembros/members';
import Finance from './finanzas/finance';
import Billing from './billing/billing';
import LandingPageDashboard from './siteWeb/landingPageDashboard';
import AskZyraChat from './AskZyraChat';
import HotEdgeSidebar from './HotEdgeSidebar';
import RainEffect, { LUXURY_STORM_GLASS } from './RainEffect';
import { useRainMode } from '../estados/RainModeContext';
import { useAccessibility } from '../estados/AccessibilityContext';
import { useAppContext } from '../estados/AppContext';
import { setCanchas } from '../estados/actions';
import { dashboardService } from '../api/services';
import { getStoredSession } from '../api/auth';



/** Clave estable para el panel principal: ignora sub-rutas de pestañas en /canchas */
function obtenerClaveContenido(pathname, canchaSlug) {
  if (pathname.startsWith('/canchas')) {
    return canchaSlug ? `/canchas/${canchaSlug}` : '/canchas';
  }
  return pathname;
}



function Dashboard() {

  const navigate = useNavigate();

  const location = useLocation();

  const { canchaSlug } = useParams();

  const { state, dispatch } = useAppContext();

  const [selectedNav, setSelectedNav] = useState('Panel');

  const [selectedFilter, setSelectedFilter] = useState('Hoy');

  const [sidebarWidth, setSidebarWidth] = useState(25);

  const [isResizing, setIsResizing] = useState(false);

  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const sidebarRef = useRef(null);

  const { isRainModeActive } = useRainMode();
  const { isLight } = useAccessibility();

  const isCanchasRoute = location.pathname.startsWith('/canchas');
  const isMembersRoute = location.pathname === '/members';
  const isFinanceRoute = location.pathname === '/finance';
  const isBillingRoute = location.pathname === '/billing';
  const isWebConfigRoute = location.pathname === '/web-config';

  const claveContenido = obtenerClaveContenido(location.pathname, canchaSlug);

  const claseFondoShell = isRainModeActive
    ? 'bg-[#050810]'
    : isLight
      ? 'bg-[#f8fafc]'
      : 'bg-[#111111]';

  const claseAreaPrincipal = isRainModeActive
    ? 'bg-[#050810]'
    : isLight
      ? 'bg-[#f8fafc]'
      : 'bg-[#111111]';

  const clasePanelPrincipal = isRainModeActive
    ? `min-h-0 min-w-0 w-full flex-1 rounded-2xl flex flex-col overflow-hidden ${LUXURY_STORM_GLASS}`
    : isLight
      ? 'min-h-0 min-w-0 w-full flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300'
      : 'min-h-0 min-w-0 w-full flex-1 bg-[#111111] rounded-2xl border border-[#1f1f23] flex flex-col overflow-hidden transition-all duration-300';



  // Cargar canchas del complejo desde la API al montar (una sola vez por sesión)
  useEffect(() => {
    if (!state.isAuthenticated) return;
    if (state.canchas && state.canchas.length > 0) return;

    const complejos = state.user?.complejos;
    if (!complejos || complejos.length === 0) return;

    const complejoId = complejos[0].id;
    const session = getStoredSession();
    if (!session?.token) return;

    dashboardService.init(complejoId, session.token)
      .then(data => {
        if (data.success && Array.isArray(data.canchas)) {
          dispatch(setCanchas(data.canchas));
        }
      })
      .catch(err => console.error('[Dashboard] Error cargando canchas:', err));
  }, [state.isAuthenticated, state.user, state.canchas, dispatch]);

  useEffect(() => {
    setMobileSettingsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const { pathname } = location;

    if (pathname.startsWith('/canchas')) {
      setSelectedNav('Canchas');
    } else if (pathname === '/members') {
      setSelectedNav('Miembros');
    } else if (pathname === '/finance') {
      setSelectedNav('Finanzas');
    } else if (pathname === '/billing') {
      setSelectedNav('Liquidaciones');
    } else if (pathname === '/web-config') {
      setSelectedNav('Configuración Web');
    } else if (pathname === '/dashboard') {
      setSelectedNav('Panel');
    }
  }, [location.pathname]);



  const handleMouseDown = (e) => {

    e.preventDefault();

    setIsResizing(true);

  };



  const handleSelectNav = (nav) => {
    setSelectedNav(nav);

    const rutas = {
      Panel: '/dashboard',
      Canchas: '/canchas',
      Miembros: '/members',
      Finanzas: '/finance',
      Liquidaciones: '/billing',
      'Configuración Web': '/web-config',
    };

    if (rutas[nav]) {
      navigate(rutas[nav]);
    }
  };



  const handleSelectCourt = (courtId) => {
    // Navegar usando solo el ID numérico
    navigate(`/canchas/${courtId}`);
  };



  const handleAddCourt = (sportId) => {

    console.log('Añadir cancha', sportId ? `deporte: ${sportId}` : 'sin deporte');

  };



  const handleCourtAction = (action, courtId, meta = {}) => {

    console.log('Acción cancha:', action, courtId, meta);

  };



  useEffect(() => {

    const handleMouseMove = (e) => {

      if (!isResizing) return;



      const newWidth = (e.clientX / window.innerWidth) * 100;



      if (newWidth >= 20 && newWidth <= 30) {

        setSidebarWidth(newWidth);

      }

    };



    const handleMouseUp = () => {

      setIsResizing(false);

    };



    if (isResizing) {

      document.addEventListener('mousemove', handleMouseMove);

      document.addEventListener('mouseup', handleMouseUp);

    }



    return () => {

      document.removeEventListener('mousemove', handleMouseMove);

      document.removeEventListener('mouseup', handleMouseUp);

    };

  }, [isResizing]);



  return (

    <MobileLayoutProvider>

    <div

      className={`zyra-app-shell fixed inset-0 w-full overflow-hidden transition-all duration-300 ${claseFondoShell}`}

      style={{ userSelect: isResizing ? 'none' : 'auto' }}

    >

      {isRainModeActive && <RainEffect />}

      {isRainModeActive && (
        <div className="pointer-events-none fixed inset-0 z-[1] luxury-thunder-overlay" aria-hidden="true" />
      )}

      {isWebConfigRoute ? (
        <div className="relative z-10 h-full w-full min-h-0 overflow-hidden">
          <LandingPageDashboard />
        </div>
      ) : (
      <div className="relative z-10 grid h-full w-full min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[auto_1fr]">

      <Sidebar

        sidebarRef={sidebarRef}

        sidebarWidth={sidebarWidth}

        isResizing={isResizing}

        onResizeStart={handleMouseDown}

        selectedNav={selectedNav}

        onSelectNav={handleSelectNav}

        selectedCourt={canchaSlug ?? null}

        onSelectCourt={handleSelectCourt}

        onAddCourt={handleAddCourt}

        onCourtAction={handleCourtAction}

      />



      <main

        className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto px-2 pt-1 pb-content-mobile-nav md:px-4 md:pb-3 md:pt-0 ${claseAreaPrincipal}`}

      >

        <div className={clasePanelPrincipal}>

          <div
            key={claveContenido}
            className="flex flex-1 min-h-0 flex-col overflow-hidden animate-fade-in"
          >
            {isCanchasRoute ? (
              <Cancha
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />
            ) : isMembersRoute ? (
              <Members />
            ) : isFinanceRoute ? (
              <Finance />
            ) : isBillingRoute ? (
              <Billing />
            ) : (
              <PrincipalDashboard />
            )}
          </div>

        </div>

      </main>

      </div>
      )}



      {!isWebConfigRoute && <AskZyraChat />}

      {!isWebConfigRoute && <HotEdgeSidebar />}

      {!isWebConfigRoute && (
        <>
          <MobileBottomNav
            settingsOpen={mobileSettingsOpen}
            onSettingsOpen={() => setMobileSettingsOpen(true)}
            onSettingsClose={() => setMobileSettingsOpen(false)}
          />
          <MobileFab />
          <MobileSettingsSheet
            open={mobileSettingsOpen}
            onClose={() => setMobileSettingsOpen(false)}
          />
        </>
      )}

    </div>

    </MobileLayoutProvider>

  );

}



export default Dashboard;

