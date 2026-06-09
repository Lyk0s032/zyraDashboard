import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, X, ChevronDown, Check, Copy, Trash2 } from 'lucide-react';
import { BotonAyuda, TourGuiadoPrecios } from './ayuda';

const DIA_FESTIVOS = 7;

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
  favoritos: {
    id: 'favoritos',
    etiqueta: 'Mis Favoritos: Estructura F5 Noche',
    icono: '⭐',
    bloques: [
      {
        dias: [1, 2, 3, 4],
        franjas: [{ hora_inicio: '18:00', hora_fin: '23:00', precio_hora: 85000 }],
      },
      {
        dias: [5],
        franjas: [{ hora_inicio: '17:00', hora_fin: '23:00', precio_hora: 95000 }],
      },
      {
        dias: [6, 0],
        franjas: [{ hora_inicio: '16:00', hora_fin: '23:00', precio_hora: 110000 }],
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

function SelectorPlantillas({ abierto, onToggle, onCerrar, onSeleccionar, plantillaActiva }) {
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
        className="flex items-center gap-2 bg-zinc-900 border border-white/5 text-xs text-zinc-300 rounded-lg px-3 py-2 hover:border-white/10 hover:text-white transition-colors"
      >
        <span>🎯 Cargar desde una plantilla...</span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={`text-zinc-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-72 py-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl">
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
        </div>
      )}
    </div>
  );
}

function SeccionPrecios({ nombreCancha }) {
  const [bloques, setBloques] = useState(() => clonarBloques(BLOQUES_INICIALES));
  const [plantillaActiva, setPlantillaActiva] = useState(null);
  const [dropdownPlantillaAbierto, setDropdownPlantillaAbierto] = useState(false);
  const [favoritoGuardado, setFavoritoGuardado] = useState(() =>
    bloquesAPlano(clonarBloques(PLANTILLAS.favoritos.bloques))
  );
  const [mensajeFavorito, setMensajeFavorito] = useState(null);
  const [tourActivo, setTourActivo] = useState(false);
  const [pasoTour, setPasoTour] = useState(0);
  const refAnadirBloque = useRef(null);
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

  const iniciarTour = useCallback(() => {
    setTourActivo(true);
    setPasoTour(1);
  }, []);

  const cerrarTour = useCallback(() => {
    setTourActivo(false);
    setPasoTour(0);
  }, []);

  const limpiarPlantillaActiva = useCallback(() => setPlantillaActiva(null), []);

  const cargarPlantilla = useCallback(
    (plantillaId) => {
      const origen =
        plantillaId === 'favoritos'
          ? favoritoGuardado
          : PLANTILLAS[plantillaId]?.bloques;
      if (!origen?.length) return;
      setBloques(clonarBloques(origen));
      setPlantillaActiva(plantillaId);
      setDropdownPlantillaAbierto(false);
    },
    [favoritoGuardado]
  );

  const agregarBloque = useCallback(() => {
    setBloques((prev) => [...prev, crearBloque([1], [FRANJA_HORARIO_BASE])]);
    limpiarPlantillaActiva();
  }, [limpiarPlantillaActiva]);

  const eliminarBloque = useCallback(
    (indiceBloque) => {
      setBloques((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== indiceBloque)));
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const toggleDia = useCallback(
    (indiceBloque, diaValor) => {
      setBloques((prev) =>
        prev.map((bloque, i) => {
          if (i !== indiceBloque) return bloque;
          const activo = bloque.dias.includes(diaValor);
          const dias = activo
            ? bloque.dias.filter((d) => d !== diaValor)
            : ordenarDias([...bloque.dias, diaValor]);
          return { ...bloque, dias };
        })
      );
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const seleccionarTodosDias = useCallback(
    (indiceBloque) => {
      setBloques((prev) =>
        prev.map((bloque, i) =>
          i !== indiceBloque
            ? bloque
            : { ...bloque, dias: [...DIAS_SEMANA_COMPLETOS] }
        )
      );
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const actualizarFranja = useCallback(
    (indiceBloque, indiceFranja, campo, valor) => {
      setBloques((prev) =>
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
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const eliminarFranja = useCallback(
    (indiceBloque, indiceFranja) => {
      setBloques((prev) =>
        prev.map((bloque, bi) => {
          if (bi !== indiceBloque || bloque.franjas.length <= 1) return bloque;
          return {
            ...bloque,
            franjas: bloque.franjas.filter((_, fi) => fi !== indiceFranja),
          };
        })
      );
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const duplicarFranja = useCallback(
    (indiceBloque, indiceFranja) => {
      setBloques((prev) =>
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
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const agregarFranja = useCallback(
    (indiceBloque) => {
      setBloques((prev) =>
        prev.map((bloque, bi) =>
          bi !== indiceBloque
            ? bloque
            : { ...bloque, franjas: [...bloque.franjas, crearFranjaHorario()] }
        )
      );
      limpiarPlantillaActiva();
    },
    [limpiarPlantillaActiva]
  );

  const guardarEnFavoritos = useCallback(() => {
    setFavoritoGuardado(bloquesAPlano(bloques));
    setMensajeFavorito('Estructura guardada en favoritos');
    setTimeout(() => setMensajeFavorito(null), 2500);
  }, [bloques]);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Configuración de Precios</h2>
            {nombreCancha && (
              <p className="text-[11px] text-zinc-500 mt-0.5">{nombreCancha}</p>
            )}
          </div>
          <SelectorPlantillas
            abierto={dropdownPlantillaAbierto}
            onToggle={() => setDropdownPlantillaAbierto((p) => !p)}
            onCerrar={() => setDropdownPlantillaAbierto(false)}
            onSeleccionar={cargarPlantilla}
            plantillaActiva={plantillaActiva}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mensajeFavorito && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400/90 animate-pulse">
              <Check size={12} strokeWidth={2} />
              {mensajeFavorito}
            </span>
          )}
          <button
            ref={refGuardarFavoritos}
            type="button"
            onClick={guardarEnFavoritos}
            className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 border border-white/5 text-xs px-3 py-2 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <Star size={12} strokeWidth={1.5} />
            Guardar en Favoritos
          </button>
          <button
            ref={refAnadirBloque}
            type="button"
            onClick={agregarBloque}
            className="bg-white text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            + Añadir Bloque de Días
          </button>
          <BotonAyuda onClick={iniciarTour} activo={tourActivo} />
        </div>
      </div>

      <TourGuiadoPrecios
        activo={tourActivo}
        paso={pasoTour}
        onCambiarPaso={setPasoTour}
        onCerrar={cerrarTour}
        refsTour={refsTour}
      />

      {plantillaActiva && (
        <p className="text-[11px] text-purple-300/80 bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 mb-4">
          Plantilla &quot;{PLANTILLAS[plantillaActiva]?.etiqueta}&quot; cargada — edite libremente
          cada bloque y horario para esta cancha.
        </p>
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

      {favoritoGuardado.length > 0 && (
        <p className="text-[10px] text-zinc-600 mt-2">
          Favorito personal guardado con {favoritoGuardado.length} bloque
          {favoritoGuardado.length !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}

export default SeccionPrecios;
