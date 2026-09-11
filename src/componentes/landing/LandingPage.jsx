import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Download, MessageCircle, ArrowRight } from 'lucide-react';
import { APK_URL, WHATSAPP_URL, CONTACT_EMAIL } from './constants';
import { PhoneFrame } from './PhoneFrame';
import { ScreenMarcador, ScreenClub, ScreenRotacion, ScreenComplejos } from './screens';

/** Si colocas capturas reales en public/landing/, se usan automáticamente. */
const SHOTS = {
  marcador: '/landing/marcador.png',
  club: '/landing/club.png',
  rotacion: '/landing/rotacion.png',
  complejos: '/landing/complejos.png',
};

function useLandingShot(path) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSrc(path);
    };
    img.onerror = () => {
      if (!cancelled) setSrc(null);
    };
    img.src = path;
    return () => {
      cancelled = true;
    };
  }, [path]);
  return src;
}

function DownloadApkButton({ className = '', size = 'lg' }) {
  const pad = size === 'lg' ? 'px-7 py-4 text-base sm:text-lg' : 'px-5 py-3 text-sm';
  return (
    <a
      href={APK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#00FF66] font-semibold text-black transition hover:bg-[#33ff85] active:scale-[0.98] ${pad} ${className}`}
    >
      <Download className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2.5} />
      Descargar APK
    </a>
  );
}

function AndroidNote({ className = '' }) {
  return (
    <p className={`text-sm text-zinc-500 ${className}`}>
      Disponible por ahora solo para Android
    </p>
  );
}

function FadeIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const shotMarcador = useLandingShot(SHOTS.marcador);
  const shotClub = useLandingShot(SHOTS.club);
  const shotRotacion = useLandingShot(SHOTS.rotacion);
  const shotComplejos = useLandingShot(SHOTS.complejos);

  useEffect(() => {
    document.title = 'Zyra — Ecosistema deportivo';
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-zyra min-h-dvh bg-[#050505] text-white antialiased">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          scrolled ? 'border-b border-white/5 bg-black/80 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#inicio"
            className="landing-display text-xl font-bold tracking-tight"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Zyra
          </a>
          <nav className="flex items-center gap-4 text-sm text-zinc-400">
            <a
              href="#ecosistema"
              className="hidden hover:text-white sm:inline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('ecosistema')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Ecosistema
            </a>
            <a
              href="#rotacion"
              className="hidden hover:text-white sm:inline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('rotacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Rotación
            </a>
            <Link to="/signIn" className="hover:text-white">
              Complejos
            </Link>
          </nav>
        </div>
      </header>

      {/* 1. Hero */}
      <section
        id="inicio"
        className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-4 pb-10 pt-20 sm:px-6"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,102,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255,255,255,0.03), transparent), linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(180deg, black, transparent 85%)',
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <motion.h1
              className="landing-display text-[clamp(3.5rem,14vw,6.5rem)] font-bold leading-[0.9] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Zyra
            </motion.h1>
            <motion.p
              className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              El ecosistema deportivo que conecta canchas, torneos y clubes
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col items-center gap-3 lg:items-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
            >
              <DownloadApkButton className="w-full max-w-xs sm:w-auto" />
              <AndroidNote />
            </motion.div>
          </div>

          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PhoneFrame imageSrc={shotMarcador} imageAlt="Marcador en vivo Zyra">
                <ScreenMarcador />
              </PhoneFrame>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Ecosistema */}
      <section id="ecosistema" className="relative border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Ecosistema</p>
            <h2 className="landing-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Tres mundos. Una app.
            </h2>
          </FadeIn>
        </div>

        {/* Torneos */}
        <div className="border-t border-white/5 bg-[#070707]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <FadeIn className="order-2 lg:order-1">
              <PhoneFrame glow="rgba(0,255,102,0.22)" imageSrc={shotMarcador} imageAlt="Marcador y rotación Zyra">
                <ScreenMarcador />
              </PhoneFrame>
            </FadeIn>
            <FadeIn className="order-1 lg:order-2" delay={0.08}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00FF66]">Torneos</p>
              <h3 className="landing-display mt-3 text-2xl font-bold sm:text-3xl">
                Marcador en vivo con reglas reales de vóley
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
                Sigue el set, la rotación y el mapa de calor mientras juegas. Grupos y eliminatorias
                con el flujo que usa un torneo de verdad — no un marcador genérico.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <span className="text-[#00FF66]">▸</span> Rotación y posiciones en cancha
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FF66]">▸</span> Grupos + eliminatorias
                </li>
                <li className="flex gap-2">
                  <span className="text-[#00FF66]">▸</span> Eventos del partido en tiempo real
                </li>
              </ul>
            </FadeIn>
          </div>
        </div>

        {/* Clubes */}
        <div className="border-t border-white/5 bg-[#0c0c0c]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Clubes</p>
              <h3 className="landing-display mt-3 text-2xl font-bold sm:text-3xl">
                Perfil, entrenamientos y RSVP
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
                Organiza divisiones, confirma asistencia y evalúa rendimiento. El club deja de vivir
                en chats dispersos.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <span className="text-white">▸</span> Divisiones y plantel
                </li>
                <li className="flex gap-2">
                  <span className="text-white">▸</span> Entrenamientos con RSVP
                </li>
                <li className="flex gap-2">
                  <span className="text-white">▸</span> Evaluación de rendimiento
                </li>
              </ul>
            </FadeIn>
            <FadeIn delay={0.08} className="flex justify-center lg:justify-end">
              <PhoneFrame glow="rgba(255,255,255,0.08)" imageSrc={shotClub} imageAlt="Perfil de club Zyra">
                <ScreenClub />
              </PhoneFrame>
            </FadeIn>
          </div>
        </div>

        {/* Complejos */}
        <div className="border-t border-white/5 bg-[#0a1210]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <FadeIn className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <PhoneFrame glow="rgba(0,180,136,0.2)" imageSrc={shotComplejos} imageAlt="Dashboard de complejos Zyra">
                <ScreenComplejos />
              </PhoneFrame>
            </FadeIn>
            <FadeIn className="order-1 lg:order-2" delay={0.08}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00B488]">Complejos</p>
              <h3 className="landing-display mt-3 text-2xl font-bold sm:text-3xl">
                Dashboard de reservas para tu cancha
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
                El panel que ya usan complejos para gestionar horarios, precios y ocupación — ahora
                parte del mismo ecosistema Zyra.
              </p>
              <p className="mt-8 text-base font-medium text-white">
                ¿Tienes un complejo deportivo? Hablemos
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#00B488]/40 bg-[#00B488] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#00c896]"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                Contactar por WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs text-zinc-500">
                O escribe a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-zinc-300 underline-offset-2 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 3. Función destacada */}
      <section id="rotacion" className="border-t border-white/5 bg-black">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00FF66]">Función destacada</p>
            <h2 className="landing-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Mapa de calor y rotación en vivo
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
              Ves dónde cae el balón y cómo está rotado el equipo en el mismo instante. Poco común
              en apps deportivas: sirve para entrenar, scouting y entender el partido sin pausarlo.
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="flex justify-center">
            <PhoneFrame className="sm:w-[340px]" glow="rgba(0,255,102,0.28)" imageSrc={shotRotacion} imageAlt="Mapa de calor y rotación Zyra">
              <ScreenRotacion />
            </PhoneFrame>
          </FadeIn>
        </div>
      </section>

      {/* 4. CTA final */}
      <section className="border-t border-white/5">
        <div className="relative mx-auto max-w-3xl overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,255,102,0.1), transparent 65%)',
            }}
          />
          <FadeIn>
            <h2 className="landing-display text-3xl font-bold tracking-tight sm:text-4xl">
              Lleva Zyra a tu cancha
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-zinc-400">
              Descarga la app y empieza a marcar, organizar y competir en el mismo lugar.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <DownloadApkButton />
              <AndroidNote />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-white/5 bg-[#050505]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="landing-display text-lg font-bold">Zyra</p>
            <p className="mt-1 text-xs text-zinc-600">Ecosistema deportivo</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <Link to="/privacidad" className="hover:text-white">
              Política de Privacidad
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
              Contacto
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              WhatsApp
            </a>
            <Link to="/signIn" className="hover:text-white">
              Acceso complejos
            </Link>
          </div>
        </div>
        <div className="border-t border-white/5 px-4 py-4 text-center text-[11px] text-zinc-600">
          © {new Date().getFullYear()} Zyra. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
