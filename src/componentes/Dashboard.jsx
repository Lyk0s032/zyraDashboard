import { useState, useRef, useEffect } from 'react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { Sidebar } from '../navigation';

import Cancha from './canchas/cancha';
import PrincipalDashboard from './principal/principalDashboard';
import Members from './miembros/members';
import Finance from './finanzas/finance';
import Billing from './billing/billing';
import WebConfig from './webConfig/webConfig';
import AskZyraChat from './AskZyraChat';
import HotEdgeSidebar from './HotEdgeSidebar';
import RainEffect, { LUXURY_STORM_GLASS } from './RainEffect';
import { useRainMode } from '../estados/RainModeContext';
import { useAccessibility } from '../estados/AccessibilityContext';



function Dashboard() {

  const navigate = useNavigate();

  const location = useLocation();

  const { canchaSlug } = useParams();



  const [selectedNav, setSelectedNav] = useState('Panel');

  const [selectedFilter, setSelectedFilter] = useState('Hoy');

  const [sidebarWidth, setSidebarWidth] = useState(25);

  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef(null);

  const { isRainModeActive } = useRainMode();
  const { isLight } = useAccessibility();

  const isCanchasRoute = location.pathname.startsWith('/canchas');
  const isMembersRoute = location.pathname === '/members';
  const isFinanceRoute = location.pathname === '/finance';
  const isBillingRoute = location.pathname === '/billing';
  const isWebConfigRoute = location.pathname === '/web-config';

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

    <div

      className={`zyra-app-shell fixed inset-0 h-screen w-screen overflow-hidden transition-all duration-300 ${claseFondoShell}`}

      style={{ userSelect: isResizing ? 'none' : 'auto' }}

    >

      {isRainModeActive && <RainEffect />}

      {isRainModeActive && (
        <div className="pointer-events-none fixed inset-0 z-[1] luxury-thunder-overlay" aria-hidden="true" />
      )}

      <div className="relative z-10 grid h-full w-full min-h-0 grid-cols-[auto_1fr] overflow-hidden">

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

        className={`flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto px-3 pt-0 pb-3 sm:px-4 ${claseAreaPrincipal}`}

      >

        <div className={clasePanelPrincipal}>

          <div
            key={location.pathname}
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
            ) : isWebConfigRoute ? (
              <WebConfig />
            ) : (
              <PrincipalDashboard />
            )}
          </div>

        </div>

      </main>

      </div>



      <AskZyraChat />

      <HotEdgeSidebar />

    </div>

  );

}



export default Dashboard;

