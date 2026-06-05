// components/Confetti.jsx
// Celebration confetti animation for perfect scores
import { useEffect, useRef } from 'react';

const COLORS = ['#FBBF24', '#F97316', '#10B981', '#60A5FA', '#C084FC', '#F43F5E', '#34D399'];
const SHAPES = ['circle', 'rect', 'triangle'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(canvas) {
  return {
    x: randomBetween(0, canvas.width),
    y: randomBetween(-20, -canvas.height * 0.3),
    vx: randomBetween(-2.5, 2.5),
    vy: randomBetween(2, 6),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-4, 4),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: randomBetween(6, 14),
    opacity: 1,
    gravity: randomBetween(0.1, 0.25),
  };
}

export default function Confetti({ active, count = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = Array.from({ length: count }, () => createParticle(canvas));

    function drawParticle(p) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.03;
        }
        drawParticle(p);
        return p.opacity > 0 && p.y < canvas.height + 20;
      });

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [active, count]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
