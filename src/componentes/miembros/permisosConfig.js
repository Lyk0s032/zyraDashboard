export const CATEGORIAS_PERMISOS = [
  {
    id: 'reservas',
    maestro: { id: 'module_reservations', nombre: 'Módulo de Reservas' },
    permisos: [
      {
        id: 'create_booking',
        nombre: 'Crear Reserva',
        descripcion: 'Permite agendar turnos en celdas vacías.',
      },
      {
        id: 'move_reschedule',
        nombre: 'Mover/Reprogramar Reservas',
        descripcion: 'Habilita el Drag & Drop para cambiar partidos.',
      },
      {
        id: 'view_daily_income',
        nombre: 'Ver Ingresos Estimados del Día',
        descripcion: 'Muestra el desglose financiero rápido de la grilla.',
      },
      {
        id: 'settle_balance',
        nombre: 'Liquidar Saldo',
        descripcion: 'Permite registrar el pago final de una reserva en counter.',
      },
      {
        id: 'free_bookings',
        nombre: 'Ingresar Reservas Gratuitas',
        descripcion: 'Permite agendar turnos con valor $0 COP (Cortesías/Amigos).',
      },
    ],
  },
  {
    id: 'finanzas',
    maestro: { id: 'module_finance', nombre: 'Módulo Financiero' },
    permisos: [
      {
        id: 'view_cash_panel',
        nombre: 'Ver Panel de Caja',
        descripcion: 'Acceso al histórico global de transacciones.',
      },
      {
        id: 'view_zyra_settlements',
        nombre: 'Ver Liquidaciones Zyra',
        descripcion: 'Permite ver las transferencias enviadas por la startup.',
      },
    ],
  },
  {
    id: 'staff',
    maestro: { id: 'module_staff', nombre: 'Módulo de Equipo' },
    permisos: [
      {
        id: 'manage_members',
        nombre: 'Gestionar Miembros',
        descripcion: 'Permite invitar, editar o suspender otros usuarios.',
      },
    ],
  },
  {
    id: 'canchas',
    maestro: { id: 'module_courts', nombre: 'Módulo de Canchas' },
    subgrupos: [
      {
        id: 'infraestructura',
        nombre: 'INFRAESTRUCTURA',
        permisos: [
          {
            id: 'add_court',
            nombre: 'Agregar Cancha',
            descripcion: 'Permite crear nuevos espacios de juego en el sistema.',
          },
          {
            id: 'modify_court_identity',
            nombre: 'Modificar Identidad',
            descripcion: 'Permite cambiar el nombre o detalles de las canchas.',
          },
        ],
      },
      {
        id: 'estado_operativo',
        nombre: 'ESTADO OPERATIVO',
        permisos: [
          {
            id: 'toggle_court_active',
            nombre: 'Activar / Desactivar Cancha',
            descripcion: 'Permite habilitar o deshabilitar canchas de la vista pública.',
          },
          {
            id: 'maintenance_mode',
            nombre: 'Modo Mantenimiento',
            descripcion: 'Permite bloquear canchas por reparaciones o imprevistos.',
          },
        ],
      },
      {
        id: 'comercial_web',
        nombre: 'COMERCIAL Y WEB',
        permisos: [
          {
            id: 'configure_pricing',
            nombre: 'Configurar Tarifas y Precios',
            descripcion: 'Permite modificar los precios por hora y horarios especiales.',
          },
          {
            id: 'configure_web_section',
            nombre: 'Configurar Sección Web',
            descripcion: 'Permite personalizar la landing page de reservas de Zyra.',
          },
        ],
      },
    ],
  },
  {
    id: 'analitica',
    maestro: { id: 'module_analytics', nombre: 'Módulo de Datos e Inteligencia' },
    permisos: [
      {
        id: 'view_analytics',
        nombre: 'Ver Análisis y Estadísticas',
        descripcion: 'Acceso a reportes de ocupación y rendimiento del complejo.',
      },
      {
        id: 'view_activity_log',
        nombre: 'Ver Registro de Actividad',
        descripcion: 'Auditoría en tiempo real de qué recepcionista hizo cada acción.',
      },
      {
        id: 'view_booking_history',
        nombre: 'Ver Historial de Reservas',
        descripcion: 'Acceso al histórico completo de partidos pasados y cancelados.',
      },
    ],
  },
];

export function obtenerPermisosCategoria(categoria) {
  if (categoria.subgrupos) {
    return categoria.subgrupos.flatMap((sg) => sg.permisos);
  }
  return categoria.permisos ?? [];
}

export const TODOS_LOS_PERMISOS = CATEGORIAS_PERMISOS.flatMap(obtenerPermisosCategoria);

const PERMISOS_POR_ROL = {
  Administrador: TODOS_LOS_PERMISOS.map((p) => p.id),
  Recepcionista: ['create_booking'],
};

export function permisosDefectoPorRol(rol) {
  return new Set(PERMISOS_POR_ROL[rol] ?? PERMISOS_POR_ROL.Recepcionista);
}

export function idsPermisosCategoria(categoria) {
  return obtenerPermisosCategoria(categoria).map((p) => p.id);
}

export function buildPermisosPayload(permisosSet) {
  const result = {};

  for (const categoria of CATEGORIAS_PERMISOS) {
    const childIds = idsPermisosCategoria(categoria);
    result[categoria.id] = {
      [categoria.maestro.id]:
        childIds.length > 0 && childIds.every((id) => permisosSet.has(id)),
    };

    for (const id of childIds) {
      result[categoria.id][id] = permisosSet.has(id);
    }
  }

  return result;
}

function setsIguales(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function resolverRolBase(rolUi, permisosSet) {
  const presetAdmin = permisosDefectoPorRol('Administrador');
  const presetRecep = permisosDefectoPorRol('Recepcionista');

  if (setsIguales(permisosSet, presetAdmin)) return 'ADMINISTRADOR';
  if (setsIguales(permisosSet, presetRecep)) return 'RECEPCIONISTA';
  return 'PERSONALIZADO';
}

export function mapRolBaseToUi(rolBase) {
  if (rolBase === 'ADMINISTRADOR') return 'Administrador';
  if (rolBase === 'RECEPCIONISTA') return 'Recepcionista';
  return 'Personalizado';
}

export function mapStatusToUi(status) {
  if (status === 'ACEPTADO') return 'Activo';
  if (status === 'SUSPENDIDO') return 'Suspendido';
  return 'Pendiente';
}

export function permisosJsonToArray(permisosJson) {
  if (!permisosJson || typeof permisosJson !== 'object') return [];

  const ids = [];

  for (const categoria of CATEGORIAS_PERMISOS) {
    const modulo = permisosJson[categoria.id] ?? {};

    for (const permiso of obtenerPermisosCategoria(categoria)) {
      if (modulo[permiso.id]) {
        ids.push(permiso.id);
      }
    }
  }

  return ids;
}

export function mapMiembroFromApi(registro) {
  const rolBase = registro.rolBase ?? registro.rol_base;
  const status = registro.status;
  const permisosJson = registro.permisos ?? {};
  const usuario = registro.usuario ?? null;

  return {
    id: registro.id,
    nombre:
      registro.nombreInvitacion
      ?? registro.nombre_invitacion
      ?? usuario?.name
      ?? 'Sin nombre',
    correo:
      registro.correoInvitacion
      ?? registro.correo_invitacion
      ?? usuario?.email
      ?? '',
    rol: mapRolBaseToUi(rolBase),
    rolBase,
    estado: mapStatusToUi(status),
    status,
    reciente: status === 'PENDIENTE',
    permissions: permisosJsonToArray(permisosJson),
    permisos: permisosJson,
  };
}
