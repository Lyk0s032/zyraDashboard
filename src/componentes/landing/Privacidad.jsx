import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from './constants';

function Privacidad() {
  useEffect(() => {
    document.title = 'Política de Privacidad — Zyra';
  }, []);

  return (
    <div className="landing-zyra min-h-dvh bg-[#050505] text-white antialiased">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="landing-display text-xl font-bold tracking-tight text-white">
            Zyra
          </Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-white">
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="landing-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Última actualización: marzo 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Quiénes somos</h2>
            <p className="mt-2">
              Zyra es un ecosistema deportivo (aplicación móvil y panel web para complejos) que
              conecta torneos, clubes y canchas. Esta política describe qué datos tratamos y para qué.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Datos que recolectamos</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <span className="text-white">Datos de perfil:</span> nombre, teléfono, foto de perfil,
                rol (jugador, entrenador, administrador de complejo, etc.) y credenciales de acceso.
              </li>
              <li>
                <span className="text-white">Ubicación de canchas:</span> dirección o coordenadas de
                complejos y sedes que tú o tu organización publican, para mostrarlas en la app y en
                el dashboard. No rastreamos tu ubicación GPS en segundo plano de forma continua.
              </li>
              <li>
                <span className="text-white">Fotos y medios:</span> imágenes que subes (perfil, club,
                anuncios, publicaciones o capturas asociadas a eventos).
              </li>
              <li>
                <span className="text-white">Actividad deportiva:</span> partidos, marcadores,
                asistencias a entrenamientos, evaluaciones y contenido social que generas en la app.
              </li>
              <li>
                <span className="text-white">Datos técnicos:</span> tipo de dispositivo, sistema
                operativo, identificadores de sesión y registros de error necesarios para operar el
                servicio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Para qué los usamos</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Proveer las funciones de torneos, clubes y reservas de complejos.</li>
              <li>Autenticarte y proteger tu cuenta.</li>
              <li>Mostrar perfiles, sedes y contenido que eliges compartir con otros usuarios.</li>
              <li>Mejorar estabilidad, seguridad y experiencia del producto.</li>
              <li>Responder solicitudes de soporte o contacto comercial (p. ej. complejos).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Con quién compartimos datos</h2>
            <p className="mt-2">
              No vendemos tus datos personales. Podemos compartir información con proveedores que
              nos ayudan a operar (alojamiento, almacenamiento de archivos, notificaciones), bajo
              acuerdos de confidencialidad, o cuando la ley lo exija. Dentro de la app, otros
              usuarios pueden ver el perfil y el contenido que publiques según la configuración de
              cada club, torneo o complejo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Conservación y seguridad</h2>
            <p className="mt-2">
              Conservamos los datos mientras tu cuenta esté activa o sea necesario para el servicio
              y obligaciones legales. Aplicamos medidas técnicas y organizativas razonables para
              proteger la información; ningún sistema es 100 % seguro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Tus derechos</h2>
            <p className="mt-2">
              Puedes solicitar acceso, corrección o eliminación de tus datos de perfil, y retirar
              consentimientos cuando aplique, contactándonos en{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#00FF66] hover:underline">
                {CONTACT_EMAIL}
              </a>
              . También puedes dejar de usar la app y solicitar el cierre de cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Menores</h2>
            <p className="mt-2">
              Si un menor participa en un club o torneo a través de Zyra, el responsable del club o
              el tutor debe asegurarse de contar con la autorización correspondiente. Ante dudas,
              escríbenos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Cambios</h2>
            <p className="mt-2">
              Podemos actualizar esta política. La fecha de “última actualización” indica la versión
              vigente. El uso continuado del servicio tras un cambio relevante implica que tomaste
              conocimiento de la nueva versión.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">9. Contacto</h2>
            <p className="mt-2">
              Preguntas sobre privacidad:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#00FF66] hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-600">
        <Link to="/" className="hover:text-zinc-400">
          Volver a Zyra
        </Link>
      </footer>
    </div>
  );
}

export default Privacidad;
