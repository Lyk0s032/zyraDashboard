import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Star, X, ChevronDown, Check, Copy, Trash2, Save, Loader2, Plus } from 'lucide-react';
import { BotonAyuda, TourGuiadoPrecios } from './ayuda';
import axiosInstance from '../../api/axiosConfig';
import { useAppContext } from '../../estados/AppContext';

const DIA_FESTIVOS = 7;

const extraerCanchaId = (canchaSlug) => {
  if (!canchaSlug) return null;
  if (/^\d+$/.test(canchaSlug)) return parseInt(canchaSlug, 10);
  return parseInt(canchaSlug.replace('cancha-', ''), 10);
};

const DIAS_SEMANA = [
  { valor: 1, corto: 'Lu', nombre: 'Lunes' },
  { valor: 2, corto: 'Ma', nombre: 'Martes' },
  { valor: 3, corto: 'Mi', nombre: 'Miércoles' },
  { valor: 4, corto: 'Ju', nombre: 'Jueves' },
  { valor: 5, corto: 'Vi', nombre: 'Viernes' },
  { valor: 6, corto: 'Sá', nombre: 'Sábado' },
  { valor: 0, corto: 'Do', nombre: 'Domingo' },
];

const DIA_FESTIVOS_META = { valor: DIA_FESTIVOS, corto: 'Fes', nombre: 'Festivos' };

const DIAS_SEMANA_COMPLETOS = [1, 2, 3, 4, 5, 6, 0];

const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0, DIA_FESTIVOS];

function ordenarDias(dias) {
  return [...dias].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
}

/** Índice de orden de un bloque según su día más temprano (Festivos al final). */
function indiceOrdenBloque(diasNumericos) {
  if (!diasNumericos?.length) return ORDEN_DIAS.length;
  return Math.min(...diasNumericos.map((d) => ORDEN_DIAS.indexOf(d)));
}

/** Ordena bloques: Lu → Do, Festivos al final. */
function ordenarBloquesPorDiaSemana(bloques) {
  return [...bloques].sort(
    (a, b) => indiceOrdenBloque(a.dias) - indiceOrdenBloque(b.dias)
  );
}

const FRANJA_HORARIO_BASE = {
  hora_inicio: '08:00',
  hora_fin: '22:00',
  precio_hora: 60000,
};

const BLOQUES_INICIALES = [
  {
    dias: [1, 2, 3, 4, 5],
    franjas: [
      { hora_inicio: '08:00', hora_fin: '18:00', precio_hora: 50000 },
      { hora_inicio: '18:00', hora_fin: '22:00', precio_hora: 80000 },
    ],
  },
  {
    dias: [6, 0],
    franjas: [{ hora_inicio: '09:00', hora_fin: '22:00', precio_hora: 90000 }],
  },
];

const PLANTILLAS = {
  estandar: {
    id: 'estandar',
    etiqueta: 'Plantilla Estándar Zyra (Fútbol)',
    icono: '🎯',
    bloques: [
      {
        dias: [1, 2, 3, 4, 5],
        franjas: [
          { hora_inicio: '08:00', hora_fin: '18:00', precio_hora: 50000 },
          { hora_inicio: '18:00', hora_fin: '22:00', precio_hora: 80000 },
        ],
      },
      {
        dias: [6, 0],
        franjas: [
          { hora_inicio: '09:00', hora_fin: '18:00', precio_hora: 65000 },
          { hora_inicio: '18:00', hora_fin: '22:00', precio_hora: 100000 },
        ],
      },
      {
        dias: [DIA_FESTIVOS],
        franjas: [{ hora_inicio: '08:00', hora_fin: '23:00', precio_hora: 120000 }],
      },
    ],
  },
};

const CLASE_INPUT_HORA =
  'w-full bg-zinc-950 border border-white/5 text-xs text-white rounded-lg p-2 outline-none focus:border-purple-500/50 transition-colors';

function generarId(prefijo) {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function crearFranjaHorario(datos = FRANJA_HORARIO_BASE) {
  return { id: generarId('franja'), ...datos };
}

function crearBloque(dias = [1], franjas = [FRANJA_HORARIO_BASE]) {
  return {
    id: generarId('bloque'),
    dias: [...dias],
    franjas: franjas.map((f) => crearFranjaHorario(f)),
  };
}

function clonarBloques(bloques) {
  return bloques.map((bloque) =>
    crearBloque(
      bloque.dias,
      bloque.franjas.map(({ hora_inicio, hora_fin, precio_hora }) => ({
        hora_inicio,
        hora_fin,
        precio_hora,
      }))
    )
  );
}

function bloquesAPlano(bloques) {
  return bloques.map(({ dias, franjas }) => ({
    dias: [...dias],
    franjas: franjas.map(({ hora_inicio, hora_fin, precio_hora }) => ({
      hora_inicio,
      hora_fin,
      precio_hora,
    })),
  }));
}

function formatearPrecio(valor) {
  if (valor === '' || Number.isNaN(Number(valor))) return '';
  return Number(valor).toLocaleString('es-CO');
}

// ============================================
// FUNCIONES DE CONVERSIÓN FRONTEND ↔ BACKEND
// ============================================

/**
 * Convierte etiquetas del frontend a números del backend
 */
const ETIQUETA_A_NUMERO = {
  'Lu': 1, 'Ma': 2, 'Mi': 3, 'Ju': 4, 'Vi': 5, 'Sá': 6, 'Do': 0, 'Fes': 7
};

/**
 * Convierte números del backend a etiquetas del frontend
 */
const NUMERO_A_ETIQUETA = {
  0: 'Do', 1: 'Lu', 2: 'Ma', 3: 'Mi', 4: 'Ju', 5: 'Vi', 6: 'Sá', 7: 'Fes'
};

/**
 * Convierte bloques del frontend (con IDs y valores numéricos) al formato del backend (etiquetas)
 */
function convertirFrontendABackend(bloquesFrontend) {
  return bloquesFrontend.map(bloque => ({
    dias: bloque.dias.map(diaNumero => NUMERO_A_ETIQUETA[diaNumero]),
    horarios: bloque.franjas.map(franja => ({
      hora_inicio: franja.hora_inicio,
      hora_fin: franja.hora_fin,
      precio_hora: franja.precio_hora
    }))
  }));
}

/**
 * Convierte bloques del backend (etiquetas) al formato del frontend (números con IDs)
 */
function convertirBackendAFrontend(bloquesBackend) {
  const bloques = bloquesBackend.map((bloque) => ({
    id: generarId('bloque'),
    dias: ordenarDias(bloque.dias.map((etiqueta) => ETIQUETA_A_NUMERO[etiqueta])),
    franjas: bloque.horarios.map((horario) => ({
      id: generarId('franja'),
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      precio_hora: horario.precio_hora,
    })),
  }));

  return ordenarBloquesPorDiaSemana(bloques);
}

// ============================================
// COMPONENTES DE UI COMPARTIDOS
// ============================================

function BarraAccionesPrecios({
  compacto = false,
  mensajeFavorito,
  mensajeGuardado,
  guardandoPrecios,
  datosModificados,
  onGuardarServidor,
  onGuardarFavoritos,
  onAgregarBloque,
  onAyuda,
  tourActivo,
  refGuardarFavoritos,
  refAnadirBloque,
  dropdownFavoritosAbierto,
  onToggleFavoritos,
  onCerrarFavoritos,
  favoritosGuardados,
  cargandoFavoritos,
  favoritoActivoId,
  onSeleccionarFavorito,
  canchaId,
}) {
  return (
    <div
      className={`flex items-center flex-shrink-0 whitespace-nowrap ${
        compacto ? 'gap-1.5' : 'gap-2'
      }`}
    >
      {!compacto && mensajeFavorito && (
        <span className="flex items-center gap-1 text-[11px] text-emerald-400/90 animate-pulse flex-shrink-0 whitespace-nowrap">
          <Check size={12} strokeWidth={2} />
          {mensajeFavorito}
        </span>
      )}
      {!compacto && mensajeGuardado && (
        <span
          className={`flex items-center gap-1 text-[11px] animate-pulse flex-shrink-0 whitespace-nowrap ${
            mensajeGuardado.includes('Error') || mensajeGuardado.includes('error')
              ? 'text-red-400/90'
              : 'text-emerald-400/90'
          }`}
        >
          <Check size={12} strokeWidth={2} />
          {mensajeGuardado}
        </span>
      )}

      <button
        type="button"
        onClick={onGuardarServidor}
        disabled={guardandoPrecios || !datosModificados}
        className={`flex items-center gap-1.5 text-xs rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${
          compacto ? 'px-2.5 py-1.5' : 'px-3 py-2'
        } ${
          datosModificados
            ? 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/30'
            : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
        } ${guardandoPrecios ? 'animate-pulse' : ''}`}
      >
        {guardandoPrecios ? (
          <>
            <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
            {compacto ? 'Guardando…' : 'Guardando...'}
          </>
        ) : (
          <>
            <Save size={12} strokeWidth={1.5} />
            {datosModificados ? (compacto ? 'Guardar' : 'Guardar Cambios') : 'Guardado'}
          </>
        )}
      </button>

      {!compacto && (
        <>
          <SelectorFavoritos
            refBoton={refGuardarFavoritos}
            abierto={dropdownFavoritosAbierto}
            onToggle={onToggleFavoritos}
            onCerrar={onCerrarFavoritos}
            favoritos={favoritosGuardados}
            cargando={cargandoFavoritos}
            favoritoActivoId={favoritoActivoId}
            canchaId={canchaId}
            onSeleccionar={onSeleccionarFavorito}
            onGuardarActual={onGuardarFavoritos}
          />

          <BotonAyuda onClick={onAyuda} activo={tourActivo} />
        </>
      )}

      <button
        ref={refAnadirBloque}
        type="button"
        onClick={onAgregarBloque}
        className={`flex items-center gap-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex-shrink-0 whitespace-nowrap ${
          compacto ? 'px-2.5 py-1.5' : 'px-3 py-2'
        }`}
      >
        <Plus size={12} strokeWidth={2} />
        Bloque
      </button>
    </div>
  );
}

function EncabezadoPrecios({
  nombreCancha,
  dropdownPlantillaAbierto,
  onTogglePlantilla,
  onCerrarPlantilla,
  onSeleccionarPlantilla,
  plantillaActiva,
  favoritosGuardados,
  cargandoFavoritos,
  favoritoActivoId,
  canchaId,
  accionesProps,
  sentinelRef,
}) {
  return (
    <>
      <div ref={sentinelRef} className="mb-6">
        <div className="flex justify-between items-center w-full flex-wrap gap-4">
          <div className="min-w-0 shrink">
            <h2 className="text-sm font-semibold text-white whitespace-nowrap">
              Configuración de Precios
            </h2>
            {nombreCancha && (
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{nombreCancha}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap ml-auto">
            <SelectorPlantillas
              abierto={dropdownPlantillaAbierto}
              onToggle={onTogglePlantilla}
              onCerrar={onCerrarPlantilla}
              onSeleccionar={onSeleccionarPlantilla}
              plantillaActiva={plantillaActiva}
              favoritosGuardados={favoritosGuardados}
              cargandoFavoritos={cargandoFavoritos}
              favoritoActivoId={favoritoActivoId}
              canchaId={canchaId}
            />
            <BarraAccionesPrecios {...accionesProps} />
          </div>
        </div>
      </div>
    </>
  );
}

function BarraStickyPrecios({ visible, anchor, accionesProps }) {
  return (
    <div
      className={`fixed z-30 box-border px-6 pointer-events-none transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
      aria-hidden={!visible}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`flex items-center justify-end sm:justify-between gap-3 py-1.5 px-3 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg shadow-black/40 ${
            visible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <p className="text-[11px] font-medium text-zinc-400 flex-shrink-0 whitespace-nowrap hidden sm:block">
            Configuración de Precios
            {accionesProps.datosModificados && (
              <span className="ml-2 text-amber-400/90">· Cambios sin guardar</span>
            )}
          </p>
          <BarraAccionesPrecios compacto {...accionesProps} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTES DE SKELETON Y CARGA
// ============================================

const SKELETON_PULSE = 'bg-zinc-800/80 rounded animate-pulse';

function SkeletonFranjaHorario() {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-end gap-3 py-2 border-b border-white/[0.03] last:border-0">
      <div className="flex-1 min-w-[90px]">
        <div className={`h-2.5 w-10 ${SKELETON_PULSE} mb-1`} />
        <div className={`h-8 w-full ${SKELETON_PULSE} rounded-lg`} />
      </div>
      <div className="flex-1 min-w-[90px]">
        <div className={`h-2.5 w-8 ${SKELETON_PULSE} mb-1`} />
        <div className={`h-8 w-full ${SKELETON_PULSE} rounded-lg`} />
      </div>
      <div className="flex-[1.2] min-w-[120px]">
        <div className={`h-2.5 w-14 ${SKELETON_PULSE} mb-1`} />
        <div className={`h-8 w-full ${SKELETON_PULSE} rounded-lg bg-emerald-950/40`} />
      </div>
      <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
        <div className={`h-7 w-7 ${SKELETON_PULSE} rounded-full`} />
        <div className={`h-7 w-7 ${SKELETON_PULSE} rounded-full`} />
      </div>
    </div>
  );
}

function SkeletonBloque({ numeroFranjas = 2 }) {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className={`h-3 w-14 ${SKELETON_PULSE}`} />
            <div className={`h-3 w-28 ${SKELETON_PULSE}`} />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((dia) => (
              <div
                key={dia}
                className={`h-7 w-10 rounded-lg border border-white/5 ${
                  dia <= 5 ? 'bg-purple-500/10' : 'bg-zinc-900/60'
                } ${SKELETON_PULSE}`}
              />
            ))}
          </div>
          <div className={`h-7 w-12 rounded-lg border border-white/5 bg-zinc-900/60 ${SKELETON_PULSE}`} />
        </div>
        <div className={`h-8 w-8 ${SKELETON_PULSE} rounded-lg shrink-0`} />
      </div>

      <div className="border-t border-white/5 pt-3">
        {Array.from({ length: numeroFranjas }).map((_, i) => (
          <SkeletonFranjaHorario key={i} />
        ))}
        <div className={`h-4 w-44 ${SKELETON_PULSE} mt-2`} />
      </div>
    </div>
  );
}

function SkeletonPrecios() {
  return (
    <div className="max-w-4xl">
      {/* Header — réplica exacta del layout real */}
      <div className="flex justify-between items-center w-full flex-wrap gap-4 mb-6">
        <div className="min-w-0">
          <div className={`h-4 w-44 ${SKELETON_PULSE} mb-1.5`} />
          <div className={`h-3 w-32 ${SKELETON_PULSE}`} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap ml-auto">
          <div className={`h-9 w-28 ${SKELETON_PULSE} rounded-lg`} />
          <div className={`h-9 w-28 ${SKELETON_PULSE} rounded-lg bg-purple-900/20`} />
          <div className={`h-9 w-24 ${SKELETON_PULSE} rounded-lg`} />
          <div className={`h-9 w-20 ${SKELETON_PULSE} rounded-lg bg-white/10`} />
          <div className={`h-9 w-9 ${SKELETON_PULSE} rounded-lg`} />
        </div>
      </div>

      {/* Bloque principal */}
      <SkeletonBloque numeroFranjas={2} />
    </div>
  );
}

function InputPrecioHora({ valor, onChange, compacto }) {
  return (
    <div className="relative w-full">
      {!compacto && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 pointer-events-none">
          $
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={formatearPrecio(valor)}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          onChange(raw === '' ? 0 : Number(raw));
        }}
        className={`w-full bg-zinc-950 text-right text-emerald-400 font-mono text-xs border border-white/5 rounded-lg outline-none focus:border-purple-500/50 transition-colors ${
          compacto ? 'p-2 pr-10' : 'py-2.5 pl-6 pr-11'
        }`}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 pointer-events-none">
        COP
      </span>
    </div>
  );
}

function FilaFranjaHorario({ franja, onActualizar, onEliminar, onDuplicar, puedeEliminar, innerRef }) {
  return (
    <div
      ref={innerRef}
      className="flex flex-wrap md:flex-nowrap items-end gap-3 py-2 border-b border-white/[0.03] last:border-0"
    >
      <div className="flex-1 min-w-[90px]">
        <label className="text-zinc-600 text-[9px] uppercase tracking-wider block mb-1">
          Inicio
        </label>
        <input
          type="time"
          value={franja.hora_inicio}
          onChange={(e) => onActualizar('hora_inicio', e.target.value)}
          className={CLASE_INPUT_HORA}
        />
      </div>

      <div className="flex-1 min-w-[90px]">
        <label className="text-zinc-600 text-[9px] uppercase tracking-wider block mb-1">
          Fin
        </label>
        <input
          type="time"
          value={franja.hora_fin}
          onChange={(e) => onActualizar('hora_fin', e.target.value)}
          className={CLASE_INPUT_HORA}
        />
      </div>

      <div className="flex-[1.2] min-w-[120px]">
        <label className="text-zinc-600 text-[9px] uppercase tracking-wider block mb-1">
          Precio/Hora
        </label>
        <InputPrecioHora
          compacto
          valor={franja.precio_hora}
          onChange={(v) => onActualizar('precio_hora', v)}
        />
      </div>

      <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
        <button
          type="button"
          aria-label="Duplicar horario"
          title="Duplicar horario"
          onClick={onDuplicar}
          className="text-zinc-500 hover:text-purple-300 hover:bg-purple-500/10 p-1.5 rounded-full transition-colors"
        >
          <Copy size={13} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Eliminar horario"
          disabled={!puedeEliminar}
          onClick={onEliminar}
          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-full transition-colors"
        >
          <X size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function TarjetaBloque({
  bloque,
  indiceBloque,
  numeroBloque,
  onToggleDia,
  onSeleccionarTodos,
  onActualizarFranja,
  onEliminarFranja,
  onDuplicarFranja,
  onAgregarFranja,
  onEliminarBloque,
  puedeEliminarBloque,
  refAgrupacionDias,
  refBotonFestivos,
  refFranjaHorario,
  refAgregarHorario,
}) {
  const festivosActivo = bloque.dias.includes(DIA_FESTIVOS);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 mb-4 transition-all hover:border-white/10">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div ref={refAgrupacionDias}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Bloque {numeroBloque}
              </p>
              <button
                type="button"
                onClick={() => onSeleccionarTodos(indiceBloque)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                [✓ Seleccionar todos]
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DIAS_SEMANA.map((dia) => {
                const activo = bloque.dias.includes(dia.valor);
                return (
                  <button
                    key={dia.valor}
                    type="button"
                    aria-pressed={activo}
                    title={dia.nombre}
                    onClick={() => onToggleDia(indiceBloque, dia.valor)}
                    className={`border rounded-lg text-xs px-3 py-1.5 font-medium transition-colors ${
                      activo
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'border-white/5 bg-zinc-950 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    {dia.corto}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              ref={refBotonFestivos}
              type="button"
              aria-pressed={festivosActivo}
              title={DIA_FESTIVOS_META.nombre}
              onClick={() => onToggleDia(indiceBloque, DIA_FESTIVOS)}
              className={`border rounded-lg text-xs px-3 py-1.5 font-medium transition-colors ${
                festivosActivo
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'border-white/5 bg-zinc-950 text-zinc-500 hover:border-white/10'
              }`}
            >
              {DIA_FESTIVOS_META.corto}
            </button>
          </div>
          {bloque.dias.length === 0 && (
            <p className="text-[10px] text-amber-400/70 mt-2">
              Seleccione al menos un día para este bloque.
            </p>
          )}
        </div>

        {puedeEliminarBloque && (
          <button
            type="button"
            aria-label="Eliminar bloque"
            onClick={() => onEliminarBloque(indiceBloque)}
            className="shrink-0 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="border-t border-white/5 pt-3">
        {bloque.franjas.map((franja, indiceFranja) => (
          <FilaFranjaHorario
            key={franja.id}
            franja={franja}
            puedeEliminar={bloque.franjas.length > 1}
            innerRef={indiceFranja === 0 ? refFranjaHorario : undefined}
            onActualizar={(campo, valor) =>
              onActualizarFranja(indiceBloque, indiceFranja, campo, valor)
            }
            onEliminar={() => onEliminarFranja(indiceBloque, indiceFranja)}
            onDuplicar={() => onDuplicarFranja(indiceBloque, indiceFranja)}
          />
        ))}

        <button
          ref={refAgregarHorario}
          type="button"
          onClick={() => onAgregarFranja(indiceBloque)}
          className="mt-2 text-purple-400 hover:text-purple-300 text-xs font-medium cursor-pointer transition-colors"
        >
          + Agregar horario a estos días
        </button>
      </div>

      {festivosActivo && (
        <p className="text-[10px] text-zinc-500 mt-3 pt-3 border-t border-white/5 leading-relaxed">
          ℹ️ Las franjas de este bloque se aplicarán automáticamente los días marcados como
          festivos en el calendario nacional, ignorando su precio de día de semana regular.
        </p>
      )}
    </div>
  );
}

function SelectorPlantillas({
  abierto,
  onToggle,
  onCerrar,
  onSeleccionar,
  plantillaActiva,
  favoritosGuardados = [],
  cargandoFavoritos = false,
  favoritoActivoId = null,
  canchaId = null,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCerrar();
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto, onCerrar]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 bg-zinc-900 border border-white/5 text-xs text-zinc-300 rounded-lg px-3 py-2 hover:border-white/10 hover:text-white transition-colors flex-shrink-0 whitespace-nowrap"
      >
        <span>🎯 Plantillas</span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`text-zinc-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-80 py-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            Plantillas del sistema
          </p>
          {Object.values(PLANTILLAS).map((plantilla) => (
            <button
              key={plantilla.id}
              type="button"
              onClick={() => onSeleccionar(plantilla.id)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                plantillaActiva === plantilla.id
                  ? 'text-white bg-white/5'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{plantilla.icono}</span>
              <span>{plantilla.etiqueta}</span>
            </button>
          ))}

          <div className="my-1 mx-2 border-t border-white/10" />
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            Favoritos guardados
          </p>

          {cargandoFavoritos ? (
            <p className="px-3 py-2 text-xs text-zinc-500 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Cargando favoritos...
            </p>
          ) : favoritosGuardados.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">
              No hay favoritos guardados.
            </p>
          ) : (
            favoritosGuardados.map((favorito) => {
              const esDeEstaCancha = Number(favorito.cancha_id) === Number(canchaId);
              const bloquesCount = favorito.configuracion?.bloques?.length ?? 0;
              return (
                <button
                  key={favorito.id}
                  type="button"
                  onClick={() => onSeleccionar(`favorito-${favorito.id}`)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-start gap-2 ${
                    favoritoActivoId === favorito.id
                      ? 'text-white bg-white/5'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Star
                    size={12}
                    strokeWidth={1.5}
                    className={`shrink-0 mt-0.5 ${esDeEstaCancha ? 'text-[#00FF66] fill-[#00FF66]' : 'text-zinc-500'}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{favorito.nombre_plantilla}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">
                      {bloquesCount} bloque{bloquesCount !== 1 ? 's' : ''}
                      {esDeEstaCancha ? ' · Esta cancha' : ''}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SelectorFavoritos({
  refBoton,
  abierto,
  onToggle,
  onCerrar,
  favoritos,
  cargando,
  favoritoActivoId,
  canchaId,
  onSeleccionar,
  onGuardarActual,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCerrar();
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto, onCerrar]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={refBoton}
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 bg-zinc-800 text-zinc-300 border text-xs px-3 py-2 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors flex-shrink-0 whitespace-nowrap ${
          abierto ? 'border-white/20 text-white' : 'border-white/5'
        }`}
      >
        <Star size={12} strokeWidth={1.5} className={favoritoActivoId ? 'text-[#00FF66] fill-[#00FF66]' : ''} />
        Favoritos
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`text-zinc-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-1.5 z-30 w-80 py-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-500">
            Aplicar configuración guardada
          </p>

          {cargando ? (
            <p className="px-3 py-2 text-xs text-zinc-500 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Cargando favoritos...
            </p>
          ) : favoritos.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">
              Aún no hay favoritos. Guarda la configuración actual con el botón de abajo.
            </p>
          ) : (
            favoritos.map((favorito) => {
              const esDeEstaCancha = Number(favorito.cancha_id) === Number(canchaId);
              const bloquesCount = favorito.configuracion?.bloques?.length ?? 0;
              return (
                <button
                  key={favorito.id}
                  type="button"
                  onClick={() => onSeleccionar(favorito)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-start gap-2 ${
                    favoritoActivoId === favorito.id
                      ? 'text-white bg-white/5'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Star
                    size={12}
                    strokeWidth={1.5}
                    className={`shrink-0 mt-0.5 ${esDeEstaCancha ? 'text-[#00FF66] fill-[#00FF66]' : 'text-zinc-500'}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate">{favorito.nombre_plantilla}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">
                      {bloquesCount} bloque{bloquesCount !== 1 ? 's' : ''}
                      {esDeEstaCancha ? ' · Esta cancha' : ''}
                    </span>
                  </span>
                </button>
              );
            })
          )}

          <div className="my-1 mx-2 border-t border-white/10" />
          <button
            type="button"
            onClick={() => {
              onGuardarActual();
              onCerrar();
            }}
            className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-white/5 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            <Save size={12} strokeWidth={1.5} />
            Guardar configuración actual
          </button>
        </div>
      )}
    </div>
  );
}

function SeccionPrecios({ nombreCancha }) {
  const { canchaSlug } = useParams();
  const canchaId = extraerCanchaId(canchaSlug);
  const { state } = useAppContext();
  const complejoId = state.user?.complejos?.[0]?.id ?? null;
  
  // Estados locales para la UI
  const [bloques, setBloques] = useState([]);
  const [plantillaActiva, setPlantillaActiva] = useState(null);
  const [dropdownPlantillaAbierto, setDropdownPlantillaAbierto] = useState(false);
  const [dropdownFavoritosAbierto, setDropdownFavoritosAbierto] = useState(false);
  const [favoritosGuardados, setFavoritosGuardados] = useState([]);
  const [favoritoCanchaActual, setFavoritoCanchaActual] = useState(null);
  const [favoritoActivoId, setFavoritoActivoId] = useState(null);
  const [favoritoActivoNombre, setFavoritoActivoNombre] = useState(null);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const [mensajeFavorito, setMensajeFavorito] = useState(null);
  const [tourActivo, setTourActivo] = useState(false);
  const [pasoTour, setPasoTour] = useState(0);
  
  // Estados para integración con backend
  const [cargandoPrecios, setCargandoPrecios] = useState(true);
  const [guardandoPrecios, setGuardandoPrecios] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [mensajeGuardado, setMensajeGuardado] = useState(null);
  const [datosModificados, setDatosModificados] = useState(false);
  const refHeaderSentinel = useRef(null);
  const [barraStickyVisible, setBarraStickyVisible] = useState(false);
  const [barraStickyAnchor, setBarraStickyAnchor] = useState({ top: 0, left: 0, width: 0 });
  const refAnadirBloque = useRef(null);

  /** Actualiza bloques y los mantiene ordenados Lu → Do, Festivos al final. */
  const aplicarBloques = useCallback((valor) => {
    setBloques((prev) => {
      const siguiente = typeof valor === 'function' ? valor(prev) : valor;
      return ordenarBloquesPorDiaSemana(siguiente);
    });
  }, []);

  const refAgrupacionDias = useRef(null);
  const refBotonFestivos = useRef(null);
  const refFranjaHorario = useRef(null);
  const refAgregarHorario = useRef(null);
  const refGuardarFavoritos = useRef(null);

  const refsTour = {
    anadirBloque: refAnadirBloque,
    agrupacionDias: refAgrupacionDias,
    botonFestivos: refBotonFestivos,
    franjaHorario: refFranjaHorario,
    agregarHorario: refAgregarHorario,
    guardarFavoritos: refGuardarFavoritos,
  };

  // ============================================
  // FUNCIONES DE BACKEND
  // ============================================

  /**
   * Cargar precios desde el servidor
   */
  const cargarPreciosDesdeServidor = useCallback(async () => {
    if (!canchaId) return;
    
    try {
      setCargandoPrecios(true);
      setErrorCarga(null);
      
      // Añadir un timeout prudente de 8 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await axiosInstance.get(`/api/canchas/${canchaId}/precios`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.data.success) {
        const bloquesBackend = response.data.data.bloques || [];
        
        if (bloquesBackend.length > 0) {
          // Convertir datos del backend al formato del frontend
          const bloquesFrontend = convertirBackendAFrontend(bloquesBackend);
          aplicarBloques(bloquesFrontend);
          setPlantillaActiva(null);
        } else {
          // Si no hay precios configurados, usar bloques iniciales
          aplicarBloques(clonarBloques(BLOQUES_INICIALES));
          setPlantillaActiva('estandar');
        }
        
        setDatosModificados(false);
      }
    } catch (error) {
      console.error('Error al cargar precios:', error);
      
      if (error.name === 'AbortError') {
        setErrorCarga('La carga se agotó por tiempo de espera. Verifica tu conexión a internet.');
      } else if (error.response?.status === 404) {
        setErrorCarga('La cancha no fue encontrada. Verifica que el ID de cancha sea correcto.');
      } else if (error.response?.status === 403) {
        setErrorCarga('No tienes permisos para ver los precios de esta cancha.');
      } else {
        setErrorCarga(
          error.response?.data?.message || 
          'Error de conexión. Verifica tu internet y vuelve a intentar.'
        );
      }
      
      // En caso de error, usar bloques iniciales
      aplicarBloques(clonarBloques(BLOQUES_INICIALES));
      setPlantillaActiva('estandar');
    } finally {
      setCargandoPrecios(false);
    }
  }, [canchaId]);

  /**
   * Guardar precios en el servidor
   */
  const guardarPreciosEnServidor = useCallback(async () => {
    if (!canchaId || guardandoPrecios || !datosModificados) return;
    
    try {
      setGuardandoPrecios(true);
      setMensajeGuardado(null);
      
      // Validar que hay al menos un bloque
      if (!bloques || bloques.length === 0) {
        setMensajeGuardado('Error: Debe haber al menos un bloque de precios configurado');
        setTimeout(() => setMensajeGuardado(null), 5000);
        return;
      }
      
      // Validar que cada bloque tiene días y franjas
      for (let i = 0; i < bloques.length; i++) {
        const bloque = bloques[i];
        if (!bloque.dias || bloque.dias.length === 0) {
          setMensajeGuardado(`Error: El bloque ${i + 1} debe tener al menos un día seleccionado`);
          setTimeout(() => setMensajeGuardado(null), 5000);
          return;
        }
        if (!bloque.franjas || bloque.franjas.length === 0) {
          setMensajeGuardado(`Error: El bloque ${i + 1} debe tener al menos una franja horaria`);
          setTimeout(() => setMensajeGuardado(null), 5000);
          return;
        }
      }
      
      // Convertir datos del frontend al formato del backend
      const bloquesBackend = convertirFrontendABackend(bloques);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axiosInstance.put(
        `/api/canchas/${canchaId}/precios`,
        { bloques: bloquesBackend },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.data.success) {
        setMensajeGuardado('✅ Precios guardados exitosamente');
        setDatosModificados(false);
        setTimeout(() => setMensajeGuardado(null), 3000);
      }
    } catch (error) {
      console.error('Error al guardar precios:', error);
      
      if (error.name === 'AbortError') {
        setMensajeGuardado('Error: El guardado se agotó por tiempo de espera');
      } else if (error.response?.status === 403) {
        setMensajeGuardado('Error: No tienes permisos para modificar los precios de esta cancha');
      } else if (error.response?.status === 404) {
        setMensajeGuardado('Error: La cancha no fue encontrada');
      } else {
        setMensajeGuardado(
          error.response?.data?.message || 'Error de conexión al guardar los precios'
        );
      }
      setTimeout(() => setMensajeGuardado(null), 5000);
    } finally {
      setGuardandoPrecios(false);
    }
  }, [canchaId, bloques, guardandoPrecios, datosModificados]);

  const limpiarPlantillaActiva = useCallback(() => {
    setPlantillaActiva(null);
    setFavoritoActivoId(null);
    setFavoritoActivoNombre(null);
  }, []);

  /**
   * Marcar datos como modificados cuando el usuario hace cambios
   */
  const marcarComoModificado = useCallback(() => {
    setDatosModificados(true);
    limpiarPlantillaActiva();
  }, [limpiarPlantillaActiva]);

  /**
   * Cargar favoritos guardados del complejo
   */
  const cargarFavoritosDesdeBackend = useCallback(async () => {
    if (!complejoId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setCargandoFavoritos(true);
      const response = await axiosInstance.get(
        `/api/precios/favoritos/complejo/${complejoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const lista = response.data.data || [];
        setFavoritosGuardados(lista);
        const deEstaCancha = lista.find((f) => Number(f.cancha_id) === Number(canchaId)) ?? null;
        setFavoritoCanchaActual(deEstaCancha);
      } else {
        setFavoritosGuardados([]);
        setFavoritoCanchaActual(null);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setFavoritosGuardados([]);
      setFavoritoCanchaActual(null);
    } finally {
      setCargandoFavoritos(false);
    }
  }, [complejoId, canchaId]);

  // Cargar precios y favoritos al montar el componente
  useEffect(() => {
    cargarPreciosDesdeServidor();
    cargarFavoritosDesdeBackend();
  }, [cargarPreciosDesdeServidor, cargarFavoritosDesdeBackend]);

  // Barra flotante: fixed al borde del scroll container (sin sticky → sin salto inicial)
  useEffect(() => {
    const headerEl = refHeaderSentinel.current;
    if (!headerEl || cargandoPrecios || errorCarga) return;

    const scrollRoot = headerEl.closest('.overflow-y-auto');
    let rafId = null;

    const evaluarBarraFlotante = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = scrollRoot?.getBoundingClientRect();
        const rootTop = rect?.top ?? 0;
        const { bottom } = headerEl.getBoundingClientRect();
        const mostrar = bottom <= rootTop;

        if (rect) {
          setBarraStickyAnchor((prev) => {
            if (prev.top === rect.top && prev.left === rect.left && prev.width === rect.width) {
              return prev;
            }
            return { top: rect.top, left: rect.left, width: rect.width };
          });
        }
        setBarraStickyVisible((prev) => (prev === mostrar ? prev : mostrar));
      });
    };

    evaluarBarraFlotante();

    const target = scrollRoot ?? window;
    target.addEventListener('scroll', evaluarBarraFlotante, { passive: true });
    window.addEventListener('resize', evaluarBarraFlotante, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      target.removeEventListener('scroll', evaluarBarraFlotante);
      window.removeEventListener('resize', evaluarBarraFlotante);
    };
  }, [cargandoPrecios, errorCarga]);

  const iniciarTour = useCallback(() => {
    setTourActivo(true);
    setPasoTour(1);
  }, []);

  const cerrarTour = useCallback(() => {
    setTourActivo(false);
    setPasoTour(0);
  }, []);

  const aplicarFavorito = useCallback(
    (favorito) => {
      if (!favorito?.configuracion?.bloques?.length) return;

      const bloquesFrontend = convertirBackendAFrontend(favorito.configuracion.bloques);
      aplicarBloques(bloquesFrontend);
      setPlantillaActiva(null);
      setFavoritoActivoId(favorito.id);
      setFavoritoActivoNombre(favorito.nombre_plantilla);
      setDropdownPlantillaAbierto(false);
      setDropdownFavoritosAbierto(false);
      setDatosModificados(true);
    },
    [aplicarBloques]
  );

  const cargarPlantilla = useCallback(
    (plantillaId) => {
      if (typeof plantillaId === 'string' && plantillaId.startsWith('favorito-')) {
        const favoritoId = parseInt(plantillaId.replace('favorito-', ''), 10);
        const favorito = favoritosGuardados.find((f) => f.id === favoritoId);
        if (favorito) {
          aplicarFavorito(favorito);
        }
        return;
      }

      const origen = PLANTILLAS[plantillaId]?.bloques;
      if (!origen?.length) return;
      aplicarBloques(clonarBloques(origen));
      setPlantillaActiva(plantillaId);
      setFavoritoActivoId(null);
      setFavoritoActivoNombre(null);
      setDropdownPlantillaAbierto(false);
      setDatosModificados(true);
    },
    [favoritosGuardados, aplicarFavorito, aplicarBloques]
  );

  const agregarBloque = useCallback(() => {
    aplicarBloques((prev) => [...prev, crearBloque([1], [FRANJA_HORARIO_BASE])]);
    marcarComoModificado();
  }, [marcarComoModificado, aplicarBloques]);

  const eliminarBloque = useCallback(
    (indiceBloque) => {
      aplicarBloques((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== indiceBloque)));
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const toggleDia = useCallback(
    (indiceBloque, diaValor) => {
      aplicarBloques((prev) =>
        prev.map((bloque, i) => {
          if (i !== indiceBloque) return bloque;
          const activo = bloque.dias.includes(diaValor);
          const dias = activo
            ? bloque.dias.filter((d) => d !== diaValor)
            : ordenarDias([...bloque.dias, diaValor]);
          return { ...bloque, dias };
        })
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const seleccionarTodosDias = useCallback(
    (indiceBloque) => {
      aplicarBloques((prev) =>
        prev.map((bloque, i) =>
          i !== indiceBloque
            ? bloque
            : { ...bloque, dias: [...DIAS_SEMANA_COMPLETOS] }
        )
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const actualizarFranja = useCallback(
    (indiceBloque, indiceFranja, campo, valor) => {
      aplicarBloques((prev) =>
        prev.map((bloque, bi) =>
          bi !== indiceBloque
            ? bloque
            : {
                ...bloque,
                franjas: bloque.franjas.map((franja, fi) =>
                  fi === indiceFranja ? { ...franja, [campo]: valor } : franja
                ),
              }
        )
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const eliminarFranja = useCallback(
    (indiceBloque, indiceFranja) => {
      aplicarBloques((prev) =>
        prev.map((bloque, bi) => {
          if (bi !== indiceBloque || bloque.franjas.length <= 1) return bloque;
          return {
            ...bloque,
            franjas: bloque.franjas.filter((_, fi) => fi !== indiceFranja),
          };
        })
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const duplicarFranja = useCallback(
    (indiceBloque, indiceFranja) => {
      aplicarBloques((prev) =>
        prev.map((bloque, bi) => {
          if (bi !== indiceBloque) return bloque;
          const origen = bloque.franjas[indiceFranja];
          if (!origen) return bloque;

          const copia = crearFranjaHorario({
            hora_inicio: origen.hora_inicio,
            hora_fin: origen.hora_fin,
            precio_hora: origen.precio_hora,
          });

          const franjas = [...bloque.franjas];
          franjas.splice(indiceFranja + 1, 0, copia);
          return { ...bloque, franjas };
        })
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const agregarFranja = useCallback(
    (indiceBloque) => {
      aplicarBloques((prev) =>
        prev.map((bloque, bi) =>
          bi !== indiceBloque
            ? bloque
            : { ...bloque, franjas: [...bloque.franjas, crearFranjaHorario()] }
        )
      );
      marcarComoModificado();
    },
    [marcarComoModificado, aplicarBloques]
  );

  const guardarEnFavoritos = useCallback(async () => {
    if (!canchaId) return;

    const token = localStorage.getItem('token');
    
    if (!complejoId || !token) {
      setMensajeFavorito('Error: No se pudo identificar el complejo');
      setTimeout(() => setMensajeFavorito(null), 2500);
      return;
    }
    
    try {
      const bloquesBackend = convertirFrontendABackend(bloques);
      
      if (favoritoCanchaActual?.id) {
        await axiosInstance.put(
          `/api/precios/favoritos/${favoritoCanchaActual.id}`,
          {
            configuracion: { bloques: bloquesBackend }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axiosInstance.post(
          '/api/precios/favoritos',
          {
            complejo_id: complejoId,
            cancha_id: canchaId,
            nombre_plantilla: nombreCancha ? `Config. ${nombreCancha}` : `Config. Cancha ${canchaId}`,
            configuracion: { bloques: bloquesBackend }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await cargarFavoritosDesdeBackend();
      
      setMensajeFavorito('Configuración guardada en favoritos');
      setTimeout(() => setMensajeFavorito(null), 2500);
    } catch (error) {
      console.error('Error al guardar en favoritos:', error);
      setMensajeFavorito('Error al guardar en favoritos');
      setTimeout(() => setMensajeFavorito(null), 2500);
    }
  }, [bloques, canchaId, nombreCancha, complejoId, favoritoCanchaActual, cargarFavoritosDesdeBackend]);

  const accionesProps = {
    mensajeFavorito,
    mensajeGuardado,
    guardandoPrecios,
    datosModificados,
    onGuardarServidor: guardarPreciosEnServidor,
    onGuardarFavoritos: guardarEnFavoritos,
    onAgregarBloque: agregarBloque,
    onAyuda: iniciarTour,
    tourActivo,
    refGuardarFavoritos,
    refAnadirBloque,
    dropdownFavoritosAbierto,
    onToggleFavoritos: () => setDropdownFavoritosAbierto((p) => !p),
    onCerrarFavoritos: () => setDropdownFavoritosAbierto(false),
    favoritosGuardados,
    cargandoFavoritos,
    favoritoActivoId,
    onSeleccionarFavorito: aplicarFavorito,
    canchaId,
  };

  // Mostrar skeleton mientras carga
  if (cargandoPrecios) {
    return <SkeletonPrecios />;
  }

  // Mostrar error si falló la carga
  if (errorCarga) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <h3 className="text-red-400 font-medium mb-2">Error al cargar precios</h3>
          <p className="text-red-300/80 text-sm mb-4">{errorCarga}</p>
          <button
            onClick={cargarPreciosDesdeServidor}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl relative">
      <EncabezadoPrecios
        nombreCancha={nombreCancha}
        dropdownPlantillaAbierto={dropdownPlantillaAbierto}
        onTogglePlantilla={() => setDropdownPlantillaAbierto((p) => !p)}
        onCerrarPlantilla={() => setDropdownPlantillaAbierto(false)}
        onSeleccionarPlantilla={cargarPlantilla}
        plantillaActiva={plantillaActiva}
        favoritosGuardados={favoritosGuardados}
        cargandoFavoritos={cargandoFavoritos}
        favoritoActivoId={favoritoActivoId}
        canchaId={canchaId}
        accionesProps={accionesProps}
        sentinelRef={refHeaderSentinel}
      />

      <BarraStickyPrecios
        visible={barraStickyVisible}
        anchor={barraStickyAnchor}
        accionesProps={accionesProps}
      />

      <TourGuiadoPrecios
        activo={tourActivo}
        paso={pasoTour}
        onCambiarPaso={setPasoTour}
        onCerrar={cerrarTour}
        refsTour={refsTour}
      />

      {/* Notificaciones */}
      {plantillaActiva && (
        <p className="text-[11px] text-purple-300/80 bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 mb-4">
          Plantilla &quot;{PLANTILLAS[plantillaActiva]?.etiqueta}&quot; cargada — edite libremente
          cada bloque y horario para esta cancha.
        </p>
      )}

      {favoritoActivoNombre && (
        <p className="text-[11px] text-emerald-300/80 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2 mb-4">
          Favorito &quot;{favoritoActivoNombre}&quot; aplicado — los bloques y horarios se adaptaron
          desde la configuración guardada. Guarde los cambios si desea conservarlos en esta cancha.
        </p>
      )}
      
      {datosModificados && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <p className="text-[11px] text-amber-300/90">
            Hay cambios sin guardar. Haz clic en "Guardar Cambios" para sincronizar con el servidor.
          </p>
        </div>
      )}

      {bloques.map((bloque, indice) => (
        <TarjetaBloque
          key={bloque.id}
          bloque={bloque}
          indiceBloque={indice}
          numeroBloque={indice + 1}
          onToggleDia={toggleDia}
          onSeleccionarTodos={seleccionarTodosDias}
          onActualizarFranja={actualizarFranja}
          onEliminarFranja={eliminarFranja}
          onDuplicarFranja={duplicarFranja}
          onAgregarFranja={agregarFranja}
          onEliminarBloque={eliminarBloque}
          puedeEliminarBloque={bloques.length > 1}
          refAgrupacionDias={indice === 0 ? refAgrupacionDias : undefined}
          refBotonFestivos={indice === 0 ? refBotonFestivos : undefined}
          refFranjaHorario={indice === 0 ? refFranjaHorario : undefined}
          refAgregarHorario={indice === 0 ? refAgregarHorario : undefined}
        />
      ))}

      {favoritosGuardados.length > 0 && (
        <p className="text-[10px] text-zinc-600 mt-2">
          {favoritosGuardados.length} favorito{favoritosGuardados.length !== 1 ? 's' : ''} disponible
          {favoritosGuardados.length !== 1 ? 's' : ''} en el complejo.
        </p>
      )}
    </div>
  );
}

export default SeccionPrecios;
