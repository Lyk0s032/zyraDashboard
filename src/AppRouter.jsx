import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './navigation';
import Login from './componentes/Login';
import Dashboard from './componentes/Dashboard';
import Complejos from './componentes/Complejos';
import DetalleComplejo from './componentes/DetalleComplejo';
import NotFound from './componentes/NotFound';
import ProtectedRoute from './componentes/ProtectedRoute';
import PublicRoute from './componentes/PublicRoute';

function AppLayout() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/canchas') ||
    location.pathname === '/members' ||
    location.pathname === '/finance' ||
    location.pathname === '/billing' ||
    location.pathname === '/web-config';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canchas"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canchas/:canchaSlug/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/web-config"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complejos"
          element={
            <ProtectedRoute>
              <Complejos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complejos/:id"
          element={
            <ProtectedRoute>
              <DetalleComplejo />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default AppRouter;
