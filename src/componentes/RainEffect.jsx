import { useEffect, useRef } from 'react';

const COLOR_GOTA = 'rgba(56, 189, 248, 0.18)';
const FACTOR_VELOCIDAD = 1.2;
const ANGULO_LLUVIA = (70 * Math.PI) / 180;
const COS_ANGULO = Math.cos(ANGULO_LLUVIA);
const SIN_ANGULO = Math.sin(ANGULO_LLUVIA);

export const LUXURY_STORM_GLASS =
  'bg-[#060a12]/60 backdrop-blur-md border border-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.05)] transition-all duration-1000';

function crearGota(ancho, alto, yAleatoria = false) {
  return {
    x: Math.random() * ancho,
    y: yAleatoria ? Math.random() * alto : -30 - Math.random() * 50,
    longitud: 15 + Math.random() * 10,
    grosor: 1 + Math.random() * 0.8,
    velocidad: (1.2 + Math.random() * 1.3) * FACTOR_VELOCIDAD,
  };
}

function RainEffect() {
  const canvasRef = useRef(null);
  const gotasRef = useRef([]);
  const animacionRef = useRef(null);
  const dimensionesRef = useRef({ ancho: 0, alto: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const redimensionar = () => {
      const dpr = window.devicePixelRatio || 1;
      const ancho = window.innerWidth;
      const alto = window.innerHeight;

      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimensionesRef.current = { ancho, alto };

      const cantidad = Math.floor((ancho * alto) / 9000);
      gotasRef.current = Array.from({ length: cantidad }, () =>
        crearGota(ancho, alto, true)
      );
    };

    const dibujarGota = (gota) => {
      const finX = gota.x + COS_ANGULO * gota.longitud;
      const finY = gota.y + SIN_ANGULO * gota.longitud;

      ctx.lineWidth = gota.grosor;
      ctx.beginPath();
      ctx.moveTo(gota.x, gota.y);
      ctx.lineTo(finX, finY);
      ctx.stroke();
    };

    const actualizar = () => {
      const { ancho, alto } = dimensionesRef.current;
      ctx.clearRect(0, 0, ancho, alto);
      ctx.strokeStyle = COLOR_GOTA;
      ctx.lineCap = 'round';

      gotasRef.current.forEach((gota) => {
        gota.x += COS_ANGULO * gota.velocidad;
        gota.y += SIN_ANGULO * gota.velocidad;

        if (gota.y > alto + 20 || gota.x > ancho + 20) {
          Object.assign(gota, crearGota(ancho, alto));
        }

        dibujarGota(gota);
      });

      animacionRef.current = requestAnimationFrame(actualizar);
    };

    redimensionar();
    window.addEventListener('resize', redimensionar);
    animacionRef.current = requestAnimationFrame(actualizar);

    return () => {
      window.removeEventListener('resize', redimensionar);
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default RainEffect;
