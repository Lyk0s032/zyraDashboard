import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MoreVertical, Pencil, Plus, ShieldOff, UserPlus } from 'lucide-react';
import { useAppContext } from '../../estados/AppContext';
import { getStoredSession } from '../../api/auth';
import { miembrosService } from '../../api/services';
import {
  CATEGORIAS_PERMISOS,
  buildPermisosPayload,
  idsPermisosCategoria,
  mapMiembroFromApi,
  permisosDefectoPorRol,
  resolverRolBase,
} from './permisosConfig';

function obtenerComplejoId(state) {
  return state.user?.complejos?.[0]?.id ?? getStoredSession()?.user?.complejos?.[0]?.id ?? null;
}

function obtenerTokenSesion() {
  return getStoredSession()?.token ?? localStorage.getItem('token');
}

const FORMULARIO_INICIAL = {
  nombre: '',
  correo: '',
  rol: 'Recepcionista',
  permisosIds: [],
  notaInterna: '',
};

function crearFormularioInvitacion() {
  return {
    ...FORMULARIO_INICIAL,
    permisosIds: [...permisosDefectoPorRol('Recepcionista')],
  };
}

function crearFormularioDesdeMiembro(miembro) {
  return {
    nombre: miembro.nombre ?? '',
    correo: miembro.correo ?? '',
    rol: miembro.rol ?? 'Recepcionista',
    permisosIds: [...(miembro.permissions ?? [])],
    notaInterna: miembro.notaInterna ?? '',
  };
}

const COLUMNAS_TABLA =
  'grid grid-cols-[1.2fr_1.4fr_0.9fr_0.7fr_0.35fr] gap-4 px-4 items-center';

const CLASE_INPUT =
  'w-full px-3 py-2 rounded-lg bg-[#0f0f11] border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors';

const CLASE_AREA_SCROLL_MODAL =
  'min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[45vh] md:max-h-none';

const METADATOS_AUDITORIA_DEMO = {
  invitadoPor: 'Alejandro (Admin) - 12/05/2026',
  ultimoIngreso: 'Hoy, 02:15 AM',
  dispositivo: 'Chrome en MacOS',
};

const ACTIVIDAD_RECIENTE_DEMO = [
  {
    id: 1,
    emoji: '🟢',
    accion: 'Agendó reserva - Cancha Maracaná F5',
    detalle: 'Hace 10 min',
  },
  {
    id: 2,
    emoji: '💱',
    accion: 'Liquidó caja - Recibió $50,000 COP',
    detalle: 'Hace 2 horas',
  },
  {
    id: 3,
    emoji: '🔴',
    accion: 'Canceló reserva - Cancha Centenario F7',
    detalle: 'Ayer',
  },
];

const PESTANAS_EDICION = [
  { id: 'general', etiqueta: 'General' },
  { id: 'permisos', etiqueta: 'Permisos' },
  { id: 'notas', etiqueta: 'Notas' },
  { id: 'seguridad', etiqueta: 'Seguridad' },
];

const CLASE_CONTENIDO_SCROLL_EDICION =
  'min-h-0 w-full flex-1 overflow-y-auto pr-1 custom-scrollbar';

function ToggleMaestro({ activo, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onChange(!activo)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
        activo ? 'bg-emerald-600' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          activo ? 'translate-x-[16px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function ToggleSubPermiso({ activo, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onChange(!activo)}
      className={`relative w-6 h-3 rounded-full transition-colors duration-200 shrink-0 ${
        activo ? 'bg-emerald-500/60' : 'bg-slate-700/60'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-2 h-2 rounded-full bg-white/80 shadow-sm transition-transform duration-200 ${
          activo ? 'translate-x-[12px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function FilaSubPermiso({ permiso, activo, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-300">{permiso.nombre}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{permiso.descripcion}</p>
      </div>
      <ToggleSubPermiso activo={activo} onChange={onToggle} />
    </div>
  );
}

function BloqueCategoria({ categoria, permisos, onToggleMaestro, onTogglePermiso }) {
  const ids = idsPermisosCategoria(categoria);
  const maestroActivo = ids.length > 0 && ids.every((id) => permisos.has(id));
  const permisosPlanos = categoria.permisos ?? [];
  const subgrupos = categoria.subgrupos ?? [];

  return (
    <div className="bg-[#1e1e24]/40 border border-slate-800/50 p-3.5 rounded-xl mb-4 last:mb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-200 uppercase tracking-wide">
          {categoria.maestro.nombre}
        </p>
        <ToggleMaestro
          activo={maestroActivo}
          onChange={() => onToggleMaestro(categoria)}
        />
      </div>

      <div className="pl-3 mt-2.5 border-l border-slate-800/80">
        {subgrupos.length > 0 ? (
          subgrupos.map((subgrupo, indice) => (
            <div key={subgrupo.id} className={indice > 0 ? 'mt-3 pt-1' : ''}>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider mt-2 mb-1.5 first:mt-0">
                {subgrupo.nombre}
              </p>
              <div className="space-y-2.5">
                {subgrupo.permisos.map((permiso) => (
                  <FilaSubPermiso
                    key={permiso.id}
                    permiso={permiso}
                    activo={permisos.has(permiso.id)}
                    onToggle={() => onTogglePermiso(permiso.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-2.5">
            {permisosPlanos.map((permiso) => (
              <FilaSubPermiso
                key={permiso.id}
                permiso={permiso}
                activo={permisos.has(permiso.id)}
                onToggle={() => onTogglePermiso(permiso.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EncabezadoSeccionModal({ titulo, descripcion }) {
  return (
    <header className="mb-4 shrink-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 leading-4">
        {titulo}
      </h3>
      <p className="mt-1.5 min-h-[2.5rem] text-[10px] leading-snug text-slate-500">
        {descripcion}
      </p>
    </header>
  );
}

function CamposGeneralesMiembro({
  nombre,
  setNombre,
  correo,
  setCorreo,
  rol,
  onCambioRol,
  idPrefix = 'miembro',
}) {
  return (
    <div className="w-full space-y-4">
      <div>
        <label
          htmlFor={`${idPrefix}-nombre`}
          className="mb-1.5 block text-[11px] font-medium text-slate-400"
        >
          Nombre Completo
        </label>
        <input
          id={`${idPrefix}-nombre`}
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. María Fernanda López"
          className={CLASE_INPUT}
          required
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-correo`}
          className="mb-1.5 block text-[11px] font-medium text-slate-400"
        >
          Correo Electrónico
        </label>
        <input
          id={`${idPrefix}-correo`}
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="nombre@complejo.co"
          className={CLASE_INPUT}
          required
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-rol`}
          className="mb-1.5 block text-[11px] font-medium text-slate-400"
        >
          Rol en el Complejo
        </label>
        <select
          id={`${idPrefix}-rol`}
          value={rol}
          onChange={(e) => onCambioRol(e.target.value)}
          className={`${CLASE_INPUT} cursor-pointer`}
        >
          <option value="Administrador">Administrador</option>
          <option value="Recepcionista">Recepcionista</option>
        </select>
      </div>
    </div>
  );
}

function MenuPestanasEdicion({ activeTab, onCambiarTab }) {
  return (
    <nav
      className="flex w-[20%] min-w-[7.5rem] shrink-0 flex-col gap-0.5 border-r border-slate-800 pr-3"
      aria-label="Secciones del miembro"
    >
      {PESTANAS_EDICION.map((pestana) => {
        const activa = activeTab === pestana.id;
        return (
          <button
            key={pestana.id}
            type="button"
            onClick={() => onCambiarTab(pestana.id)}
            className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
              activa
                ? 'bg-slate-800/50 text-emerald-400'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
            }`}
          >
            {pestana.etiqueta}
          </button>
        );
      })}
    </nav>
  );
}

function PanelPermisosMiembro({ permisos, onToggleMaestro, onTogglePermiso }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <EncabezadoSeccionModal
        titulo="Permisos de Acceso"
        descripcion="Activa un módulo completo o personaliza cada permiso de forma individual."
      />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {CATEGORIAS_PERMISOS.map((categoria) => (
          <BloqueCategoria
            key={categoria.id}
            categoria={categoria}
            permisos={permisos}
            onToggleMaestro={onToggleMaestro}
            onTogglePermiso={onTogglePermiso}
          />
        ))}
      </div>
    </div>
  );
}

function PanelNotasMiembro({ nota, onChangeNota }) {
  return (
    <div className="flex w-full flex-col items-start">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Bitácora interna
      </h3>
      <p className="mt-1.5 mb-4 text-[10px] leading-snug text-slate-500">
        Notas privadas visibles solo para administradores sobre el desempeño del staff.
        Se guardan junto con el resto de cambios al pulsar &quot;Guardar cambios&quot;.
      </p>
      <textarea
        value={nota}
        onChange={(e) => onChangeNota(e.target.value)}
        placeholder="Escribe observaciones sobre desempeño, incidencias o acuerdos internos..."
        className="h-[150px] w-full resize-none rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
      />
    </div>
  );
}

function MiniLogActividad({ actividades, titulo = 'Actividad Reciente' }) {
  return (
    <div className="mt-4 w-full border-t border-slate-800/50 pt-4">
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {titulo}
      </h4>
      <ul className="space-y-2.5">
        {actividades.map((item) => (
          <li key={item.id}>
            <p className="text-xs text-slate-300">
              {item.emoji} {item.accion}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{item.detalle}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelSeguridadMiembro({ metadatos, actividades, onCerrarSesiones, onSuspender }) {
  return (
    <div className="flex w-full flex-col items-start">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Seguridad y acceso
      </h3>
      <p className="mt-1.5 mb-4 text-[10px] leading-snug text-slate-500">
        Metadatos de sesión y acciones críticas recientes del miembro.
      </p>

      <div className="w-full rounded-lg border border-slate-800/60 bg-[#0f0f11]/60 px-3 py-2.5">
        <div className="space-y-1 font-mono text-[11px] text-slate-500">
          <p>Último ingreso: {metadatos.ultimoIngreso}</p>
          <p>Dispositivo: {metadatos.dispositivo}</p>
          <p>Invitado por: {metadatos.invitadoPor}</p>
        </div>
      </div>

      <MiniLogActividad actividades={actividades} titulo="Acciones críticas recientes" />

      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCerrarSesiones}
          className="flex-1 cursor-pointer rounded border border-amber-500/20 px-2 py-1.5 text-center text-[11px] text-amber-500/80 transition hover:bg-amber-500/10 hover:text-amber-400"
        >
          Cerrar sesiones activas
        </button>
        <button
          type="button"
          onClick={onSuspender}
          className="flex-1 cursor-pointer rounded border border-red-500/20 px-2 py-1.5 text-center text-[11px] text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300"
        >
          Suspender acceso
        </button>
      </div>
    </div>
  );
}

function BadgeRol({ rol }) {
  const esAdmin = rol === 'Administrador';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
        esAdmin
          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
          : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
      }`}
    >
      {rol}
    </span>
  );
}

function BadgeEstado({ estado, reciente }) {
  const suspendido = estado === 'Suspendido';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          suspendido
            ? 'bg-red-500'
            : reciente
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-emerald-500'
        }`}
      />
      {estado}
    </span>
  );
}

function MenuAccionesMiembro({ abierto, onToggle, onEditarRol, onSuspender }) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto, onToggle]);

  return (
    <div ref={contenedorRef} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Acciones del miembro"
        aria-expanded={abierto}
        onClick={onToggle}
        className="text-slate-500 hover:text-slate-300 cursor-pointer px-2 py-1 rounded transition-colors"
      >
        <MoreVertical size={16} strokeWidth={1.5} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#16161a] border border-slate-800 rounded-lg p-1 shadow-xl z-30">
          <button
            type="button"
            onClick={onEditarRol}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors text-left"
          >
            <Pencil size={13} strokeWidth={1.5} className="text-slate-500 shrink-0" />
            Editar Rol
          </button>
          <button
            type="button"
            onClick={onSuspender}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <ShieldOff size={13} strokeWidth={1.5} className="shrink-0" />
            Suspender Acceso
          </button>
        </div>
      )}
    </div>
  );
}

function ModalInvitarMiembro({
  abierto,
  miembroSeleccionado,
  onCerrar,
  onEnviar,
  onActualizar,
  onSuspender,
}) {
  const esEdicion = miembroSeleccionado != null;
  const [activeTab, setActiveTab] = useState('general');
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const permisos = new Set(formulario.permisosIds);
  const { nombre, correo, rol, notaInterna } = formulario;

  const actualizarFormulario = useCallback((cambios) => {
    setFormulario((prev) => ({ ...prev, ...cambios }));
  }, []);

  useEffect(() => {
    if (!abierto) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [abierto, onCerrar]);

  useEffect(() => {
    if (!abierto) return;

    setActiveTab('general');
    setEnviando(false);
    setErrorEnvio('');

    if (miembroSeleccionado) {
      setFormulario(crearFormularioDesdeMiembro(miembroSeleccionado));
      return;
    }

    setFormulario(crearFormularioInvitacion());
  }, [abierto, miembroSeleccionado]);

  const handleCambioRol = (nuevoRol) => {
    if (!esEdicion) {
      actualizarFormulario({
        rol: nuevoRol,
        permisosIds: [...permisosDefectoPorRol(nuevoRol)],
      });
      return;
    }

    actualizarFormulario({ rol: nuevoRol });
  };

  const handleCerrarSesiones = () => {
    console.log('[Miembros] Cerrar sesiones activas:', miembroSeleccionado?.correo);
  };

  const handleSuspenderDesdeModal = () => {
    if (!miembroSeleccionado) return;
    onSuspender(miembroSeleccionado.id);
  };

  const togglePermiso = (permisoId) => {
    setFormulario((prev) => {
      const next = new Set(prev.permisosIds);
      if (next.has(permisoId)) {
        next.delete(permisoId);
      } else {
        next.add(permisoId);
      }
      return { ...prev, permisosIds: [...next] };
    });
  };

  const toggleMaestro = (categoria) => {
    const ids = idsPermisosCategoria(categoria);
    const todosActivos = ids.every((id) => permisos.has(id));

    setFormulario((prev) => {
      const next = new Set(prev.permisosIds);
      if (todosActivos) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return { ...prev, permisosIds: [...next] };
    });
  };

  if (!abierto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim()) return;

    const permisosPayload = buildPermisosPayload(permisos);
    const rolBase = resolverRolBase(rol, permisos);

    setEnviando(true);
    setErrorEnvio('');

    try {
      if (esEdicion) {
        await onActualizar(miembroSeleccionado.id, {
          nombre: nombre.trim(),
          correo: correo.trim(),
          rolBase,
          permisos: permisosPayload,
          notaInterna: notaInterna.trim(),
        });
        return;
      }

      await onEnviar({
        nombre: nombre.trim(),
        correo: correo.trim(),
        rolBase,
        permisos: permisosPayload,
      });
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        (esEdicion ? 'No se pudieron guardar los cambios' : 'No se pudo enviar la invitación');
      setErrorEnvio(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const renderContenidoEdicion = () => {
    switch (activeTab) {
      case 'general':
        return (
          <CamposGeneralesMiembro
            nombre={nombre}
            setNombre={(value) => actualizarFormulario({ nombre: value })}
            correo={correo}
            setCorreo={(value) => actualizarFormulario({ correo: value })}
            rol={rol}
            onCambioRol={handleCambioRol}
            idPrefix="editar"
          />
        );
      case 'permisos':
        return (
          <PanelPermisosMiembro
            permisos={permisos}
            onToggleMaestro={toggleMaestro}
            onTogglePermiso={togglePermiso}
          />
        );
      case 'notas':
        return (
          <PanelNotasMiembro
            nota={notaInterna}
            onChangeNota={(value) => actualizarFormulario({ notaInterna: value })}
          />
        );
      case 'seguridad':
        return (
          <PanelSeguridadMiembro
            metadatos={METADATOS_AUDITORIA_DEMO}
            actividades={ACTIVIDAD_RECIENTE_DEMO}
            onCerrarSesiones={handleCerrarSesiones}
            onSuspender={handleSuspenderDesdeModal}
          />
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 py-8 md:py-10"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-invitar-titulo"
        className={`bg-[#16161a] border border-slate-800 p-6 rounded-xl w-full shadow-2xl animate-ios-pop-in overflow-hidden flex flex-col ${
          esEdicion ? 'max-w-4xl' : 'max-w-4xl max-h-[calc(100dvh-4rem)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0">
          <h2 id="modal-invitar-titulo" className="text-sm font-semibold tracking-wide text-white">
            {esEdicion ? 'Editar miembro' : 'Invitar miembro'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {esEdicion
              ? 'Gestiona perfil, permisos, notas y seguridad desde un solo panel'
              : 'Envía una invitación para unirse al panel del complejo'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col overflow-hidden mt-4 ${esEdicion ? '' : 'min-h-0 flex-1'}`}
        >
          {esEdicion ? (
            <div className="flex h-[min(28rem,calc(100dvh-12rem))] min-h-[18rem] overflow-hidden">
              <MenuPestanasEdicion activeTab={activeTab} onCambiarTab={setActiveTab} />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-4">
                <div
                  className={
                    activeTab === 'permisos'
                      ? 'flex min-h-0 w-full flex-1 flex-col overflow-hidden'
                      : CLASE_CONTENIDO_SCROLL_EDICION
                  }
                >
                  {renderContenidoEdicion()}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[minmax(0,2fr)_1px_minmax(0,3fr)] md:grid-rows-[minmax(0,1fr)] md:gap-x-6">
              <div className="flex min-w-0 flex-col min-h-0 overflow-hidden">
                <EncabezadoSeccionModal
                  titulo="Datos del Miembro"
                  descripcion="Completa la información básica para enviar la invitación."
                />
                <div className={CLASE_AREA_SCROLL_MODAL}>
                  <CamposGeneralesMiembro
                    nombre={nombre}
                    setNombre={(value) => actualizarFormulario({ nombre: value })}
                    correo={correo}
                    setCorreo={(value) => actualizarFormulario({ correo: value })}
                    rol={rol}
                    onCambioRol={handleCambioRol}
                    idPrefix="invitar"
                  />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="hidden md:block w-px self-stretch bg-slate-800"
              />

              <div className="flex min-w-0 flex-col min-h-0 overflow-hidden border-t border-slate-800 pt-6 mt-6 md:border-t-0 md:pt-0 md:mt-0">
                <EncabezadoSeccionModal
                  titulo="Permisos de Acceso"
                  descripcion="Activa un módulo completo o personaliza cada permiso de forma individual."
                />
                <div className={CLASE_AREA_SCROLL_MODAL}>
                  {CATEGORIAS_PERMISOS.map((categoria) => (
                    <BloqueCategoria
                      key={categoria.id}
                      categoria={categoria}
                      permisos={permisos}
                      onToggleMaestro={toggleMaestro}
                      onTogglePermiso={togglePermiso}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center justify-end gap-3 pt-5 mt-5 border-t border-white/5 w-full">
            {errorEnvio && (
              <p className="mr-auto text-[11px] text-red-400">{errorEnvio}</p>
            )}
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando && <Loader2 size={14} className="animate-spin" />}
              {esEdicion
                ? enviando
                  ? 'Guardando...'
                  : 'Guardar cambios'
                : enviando
                  ? 'Enviando...'
                  : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Members() {
  const { state } = useAppContext();
  const complejoId = obtenerComplejoId(state);
  const [miembros, setMiembros] = useState([]);
  const [cargandoMiembros, setCargandoMiembros] = useState(true);
  const [errorMiembros, setErrorMiembros] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const cargarMiembros = useCallback(async () => {
    const token = obtenerTokenSesion();

    if (!complejoId) {
      setMiembros([]);
      setErrorMiembros('No se encontró el complejo activo.');
      setCargandoMiembros(false);
      return;
    }

    if (!token) {
      setMiembros([]);
      setErrorMiembros('Sesión expirada. Vuelve a iniciar sesión.');
      setCargandoMiembros(false);
      return;
    }

    setCargandoMiembros(true);
    setErrorMiembros('');

    try {
      const response = await miembrosService.listar(complejoId, token);

      if (!response.success) {
        throw new Error(response.message || 'No se pudieron cargar los miembros');
      }

      setMiembros((response.data ?? []).map(mapMiembroFromApi));
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No se pudieron cargar los miembros';
      setErrorMiembros(mensaje);
      setMiembros([]);
    } finally {
      setCargandoMiembros(false);
    }
  }, [complejoId]);

  useEffect(() => {
    cargarMiembros();
  }, [cargarMiembros]);

  const abrirModalInvitar = useCallback(() => {
    setSelectedMember(null);
    setShowModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setShowModal(false);
    setSelectedMember(null);
  }, []);

  const toggleMenu = useCallback((id) => {
    setMenuAbiertoId((prev) => (prev === id ? null : id));
  }, []);

  const cerrarMenu = useCallback(() => {
    setMenuAbiertoId(null);
  }, []);

  const handleEditarMiembro = useCallback(
    (id) => {
      const miembro = miembros.find((m) => m.id === id);
      if (!miembro) return;

      setSelectedMember(miembro);
      setShowModal(true);
      cerrarMenu();
    },
    [miembros, cerrarMenu],
  );

  const handleEditarRol = useCallback(
    (id) => {
      handleEditarMiembro(id);
    },
    [handleEditarMiembro],
  );

  const handleSuspender = useCallback(
    (id) => {
      setMiembros((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: 'Suspendido', reciente: false } : m)),
      );
      cerrarMenu();
      cerrarModal();
    },
    [cerrarMenu, cerrarModal],
  );

  const handleEnviarInvitacion = useCallback(async ({ nombre, correo, rolBase, permisos }) => {
    const token = obtenerTokenSesion();

    if (!complejoId) {
      throw new Error('No se encontró el complejo activo');
    }

    if (!token) {
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }

    const response = await miembrosService.invitar(
      {
        complejoId,
        nombre,
        correo,
        rolBase,
        permisos,
      },
      token,
    );

    if (!response.success) {
      throw new Error(response.message || 'No se pudo enviar la invitación');
    }

    await cargarMiembros();
    cerrarModal();
  }, [complejoId, cargarMiembros, cerrarModal]);

  const handleActualizarMiembro = useCallback(async (id, { nombre, correo, rolBase, permisos, notaInterna }) => {
    const token = obtenerTokenSesion();

    if (!token) {
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }

    const response = await miembrosService.actualizar(
      id,
      { nombre, correo, rolBase, permisos },
      token,
    );

    if (!response.success) {
      throw new Error(response.message || 'No se pudieron guardar los cambios');
    }

    await cargarMiembros();
    cerrarModal();
  }, [cargarMiembros, cerrarModal]);

  const activos = miembros.filter((m) => m.estado === 'Activo').length;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-fade-in">
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-sm font-semibold text-white">
              Miembros del Staff
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Gestiona el equipo con acceso al panel del complejo
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalInvitar}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Plus size={14} strokeWidth={2} />
            Invitar miembro
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#121212]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-visible">
            <div className={`${COLUMNAS_TABLA} py-2.5 border-b border-white/5 bg-white/[0.02]`}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Nombre
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Correo
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Rol
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Estado
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
                Acciones
              </span>
            </div>

            {cargandoMiembros ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-zinc-500">
                <Loader2 size={16} className="animate-spin" />
                Cargando miembros...
              </div>
            ) : errorMiembros ? (
              <div className="py-10 px-4 text-center">
                <p className="text-xs text-red-400">{errorMiembros}</p>
                <button
                  type="button"
                  onClick={cargarMiembros}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : miembros.length === 0 ? (
              <div className="py-10 px-4 text-center text-xs text-zinc-500">
                Aún no hay miembros en el staff. Invita al primero.
              </div>
            ) : (
              miembros.map((miembro) => (
              <div
                key={miembro.id}
                className={`${COLUMNAS_TABLA} py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors duration-200`}
              >
                <button
                  type="button"
                  onClick={() => handleEditarMiembro(miembro.id)}
                  className="flex min-w-0 items-center gap-2.5 text-left transition-colors group"
                  aria-label={`Editar miembro ${miembro.nombre}`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-white/20 transition-colors">
                    <UserPlus size={12} className="text-zinc-500 group-hover:text-zinc-400" />
                  </div>
                  <span className="text-xs font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {miembro.nombre}
                  </span>
                </button>
                <span className="text-xs text-zinc-400 truncate">{miembro.correo}</span>
                <BadgeRol rol={miembro.rol} />
                <BadgeEstado estado={miembro.estado} reciente={miembro.reciente} />
                <MenuAccionesMiembro
                  abierto={menuAbiertoId === miembro.id}
                  onToggle={() => toggleMenu(miembro.id)}
                  onEditarRol={() => handleEditarRol(miembro.id)}
                  onSuspender={() => handleSuspender(miembro.id)}
                />
              </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-zinc-600 mt-4 text-center">
            {activos} miembros activos en el complejo
          </p>
        </div>
      </div>

      <ModalInvitarMiembro
        abierto={showModal}
        miembroSeleccionado={selectedMember}
        onCerrar={cerrarModal}
        onEnviar={handleEnviarInvitacion}
        onActualizar={handleActualizarMiembro}
        onSuspender={handleSuspender}
      />
    </div>
  );
}

export default Members;
