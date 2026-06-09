import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Dashboard Zyra</h2>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/complejos">Complejos</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
