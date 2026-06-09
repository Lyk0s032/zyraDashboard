import { Link } from 'react-router-dom';
import { useAppContext } from '../estados/AppContext';
import { setUser, setDashboardData } from '../estados/actions';

function Home() {
  const { state, dispatch } = useAppContext();

  const handleLogin = () => {
    // Ejemplo de cómo usar el estado global
    dispatch(setUser({
      id: 1,
      name: 'Usuario Demo',
      email: 'usuario@demo.com'
    }));

    dispatch(setDashboardData({
      stats: {
        users: 150,
        sales: 2500,
        revenue: 45000
      }
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Home - Dashboard Zyra</h1>
      <p>Bienvenido al Dashboard de Zyra</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Estado actual:</h3>
        <p>Usuario autenticado: {state.isAuthenticated ? 'Sí' : 'No'}</p>
        {state.user && (
          <div>
            <p>Nombre: {state.user.name}</p>
            <p>Email: {state.user.email}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLogin} style={{ marginRight: '10px' }}>
          Simular Login
        </button>
        <Link to="/dashboard">
          <button>Ir al Dashboard</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
