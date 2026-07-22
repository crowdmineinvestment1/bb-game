'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface CrashGraphProps {
  multiplier: number;
  crashed: boolean;
  history: number[];
  phase: 'waiting' | 'running' | 'crashed';
}

export default function CrashGraph({ multiplier, crashed, history, phase }: CrashGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 40, right: 30, bottom: 50, left: 60 };
    const graphW = w - padding.left - padding.right;
    const graphH = h - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = '#0a1118';
    ctx.fillRect(0, 0, w, h);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Determine scale
    const maxMult = Math.max(2, multiplier * 1.3, 3);
    const timeScale = Math.max(5, (multiplier - 1) * 3 + 5);

    // Horizontal grid lines
    const ySteps = Math.min(10, Math.ceil(maxMult));
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + graphH - (i / ySteps) * graphH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const label = (1 + (maxMult - 1) * (i / ySteps)).toFixed(1) + 'x';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(label, padding.left - 8, y + 4);
    }

    // Vertical grid lines
    const xSteps = 5;
    for (let i = 0; i <= xSteps; i++) {
      const x = padding.left + (i / xSteps) * graphW;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();

      // X-axis labels
      const seconds = ((i / xSteps) * timeScale).toFixed(0) + 's';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(seconds, x, h - padding.bottom + 20);
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    if (phase === 'waiting') {
      // Waiting phase - show pulsing "STARTING..." text
      const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0, 231, 1, ${pulse})`;
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('STARTING...', w / 2, h / 2);

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText('Place your bets', w / 2, h / 2 + 30);
      return;
    }

    // Draw the crash curve
    if (multiplier > 1) {
      const points: { x: number; y: number }[] = [];
      const numPoints = 200;

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const currentT = t * timeScale;
        // Exponential curve: mult = e^(0.06 * t)
        const mult = Math.min(
          multiplier,
          1 + (multiplier - 1) * Math.pow(t, 0.8)
        );

        const x = padding.left + (t * graphW);
        const y = padding.top + graphH - ((mult - 1) / (maxMult - 1)) * graphH;

        points.push({ x, y });
      }

      // Glow effect
      ctx.save();
      ctx.shadowColor = crashed ? '#ff4444' : '#00e701';
      ctx.shadowBlur = 20;

      // Draw gradient line
      const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + graphW, 0);
      if (crashed) {
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.7, '#ff4444');
        gradient.addColorStop(1, '#cc0000');
      } else {
        gradient.addColorStop(0, '#00e701');
        gradient.addColorStop(0.5, '#00ff88');
        gradient.addColorStop(1, '#00e701');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();

      // Fill area under curve
      const areaGradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
      if (crashed) {
        areaGradient.addColorStop(0, 'rgba(255, 68, 68, 0.15)');
        areaGradient.addColorStop(1, 'rgba(255, 68, 68, 0)');
      } else {
        areaGradient.addColorStop(0, 'rgba(0, 231, 1, 0.12)');
        areaGradient.addColorStop(1, 'rgba(0, 231, 1, 0)');
      }

      ctx.fillStyle = areaGradient;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
      ctx.lineTo(padding.left, h - padding.bottom);
      ctx.closePath();
      ctx.fill();

      // Current point indicator
      const lastPoint = points[points.length - 1];
      if (lastPoint && !crashed) {
        // Pulsing dot at the tip
        const pulseSize = Math.sin(Date.now() / 200) * 3 + 6;

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 231, 1, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00e701';
        ctx.fill();
      }

      // Crash explosion
      if (crashed && lastPoint) {
        // Generate explosion particles
        if (particlesRef.current.length === 0) {
          for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            particlesRef.current.push({
              x: lastPoint.x,
              y: lastPoint.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              color: ['#ff4444', '#ff6b6b', '#ff8888', '#ffaa00', '#ff6600'][Math.floor(Math.random() * 5)],
            });
          }
        }

        // Draw particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1; // gravity
          p.life -= 0.02;

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });

        // Flash at crash point
        const flashAlpha = Math.max(0, 1 - (Date.now() % 1000) / 500);
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 68, 68, ${flashAlpha * 0.5})`;
        ctx.fill();
      }
    }

    // Draw multiplier text (large, center)
    const multText = multiplier.toFixed(2) + 'x';
    ctx.font = `bold ${crashed ? 52 : 56}px Inter, sans-serif`;
    ctx.textAlign = 'center';

    if (crashed) {
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e701';
      ctx.shadowBlur = 15;
    }

    ctx.fillText(multText, w / 2, h / 2 - 20);
    ctx.shadowBlur = 0;

    // Status text
    if (crashed) {
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('CRASHED!', w / 2, h / 2 + 15);
    }

    // Draw previous crash points as dots in top right
    if (history.length > 0) {
      const dotSize = 6;
      const dotSpacing = 16;
      const startX = w - padding.right - 10;
      const startY = padding.top + 10;

      ctx.font = '10px monospace';
      ctx.textAlign = 'right';

      history.slice(0, 8).forEach((cp, i) => {
        const x = startX - i * (dotSpacing + 30);
        if (x < padding.left + 50) return;

        const color = cp < 2 ? '#ff4444' : cp < 10 ? '#00e701' : '#ffd700';
        ctx.beginPath();
        ctx.arc(x - 15, startY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = color;
        ctx.fillText(cp.toFixed(2) + 'x', x + 10, startY + 4);
      });
    }
  }, [multiplier, crashed, history, phase]);

  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  // Reset particles when a new round starts
  useEffect(() => {
    if (phase === 'waiting' || phase === 'running') {
      particlesRef.current = [];
      trailRef.current = [];
    }
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '300px' }}
    />
  );
}
