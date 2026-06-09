# Dashboard Zyra

## Estructura del Proyecto

```
src/
├── componentes/          # Componentes de React
│   ├── Home.jsx         # Página principal
│   ├── Dashboard.jsx    # Panel de control
│   ├── NotFound.jsx     # Página 404
│   ├── Navbar.jsx       # Barra de navegación
│   ├── Navbar.css       # Estilos del Navbar
│   └── index.js         # Exportaciones de componentes
├── estados/             # Gestión de estado global
│   ├── types.js        # Constantes de tipos de acciones
│   ├── actions.js      # Creadores de acciones
│   ├── reducer.js      # Reducer principal
│   ├── AppContext.jsx  # Context Provider
│   └── index.js        # Exportaciones de estados
├── App.jsx             # Componente principal
├── AppRouter.jsx       # Configuración de rutas
└── main.jsx           # Punto de entrada
```

## Tecnologías

- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **JavaScript** - Lenguaje de programación

## Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## Gestión de Estado

El proyecto utiliza el patrón **Reducer + Context API** para manejar el estado global:

### Estructura de Estados

- **user**: Información del usuario actual
- **isAuthenticated**: Estado de autenticación
- **loading**: Estado de carga
- **error**: Mensajes de error
- **dashboardData**: Datos del dashboard

### Uso del Estado

```javascript
import { useAppContext } from './estados/AppContext';
import { setUser, logout } from './estados/actions';

function MiComponente() {
  const { state, dispatch } = useAppContext();
  
  // Despachar una acción
  dispatch(setUser({ name: 'Juan', email: 'juan@ejemplo.com' }));
  
  // Acceder al estado
  console.log(state.user);
}
```

## Rutas Principales

- `/` - Página principal (Home)
- `/dashboard` - Panel de control
- `*` - Página 404 (rutas no encontradas)

## Agregar Nuevos Componentes

Para agregar un nuevo componente:

1. Crear el archivo en `src/componentes/NombreComponente.jsx`
2. Agregar la ruta en `src/AppRouter.jsx` si es necesario
3. Importar y usar el componente donde lo necesites

## Agregar Nuevas Acciones

Para agregar nuevas acciones al estado:

1. Definir el tipo en `src/estados/types.js`
2. Crear el action creator en `src/estados/actions.js`
3. Agregar el caso en el reducer `src/estados/reducer.js`

## Desarrollo

El proyecto está configurado con Hot Module Replacement (HMR) para desarrollo rápido.
Los cambios en los archivos se reflejarán automáticamente en el navegador.
