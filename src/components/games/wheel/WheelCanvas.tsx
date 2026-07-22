'use client';

import React, { useEffect, useRef } from 'react';
import { getWheelSegments, PlinkoRisk } from '@/lib/provably-fair';

interface WheelCanvasProps {
  segmentCount: number;
  risk: PlinkoRisk;
  targetSegmentIndex: number | null;
  isSpinning: boolean;
  onFinish: () => void;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  segmentCount,
  risk,
  targetSegmentIndex,
  isSpinning,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Rotation tracking
  const angleRef = useRef(0);
  const isSpinningRef = useRef(isSpinning);
  const targetIndexRef = useRef(targetSegmentIndex);

  const segments = getWheelSegments(segmentCount, risk);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
    targetIndexRef.current = targetSegmentIndex;
  }, [isSpinning, targetSegmentIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = 360;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const cx = width / 2;
    const cy = height / 2;
    const radius = 150;

    let speed = 0;
    let deceleration = 0.002;
    let targetAngle = 0;
    let isLanding = false;

    const draw = () => {
      ctx.fillStyle = '#0f1923';
      ctx.fillRect(0, 0, width, height);

      // Save canvas state
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRef.current);

      const anglePerSegment = (Math.PI * 2) / segmentCount;

      // Draw segments
      segments.forEach((seg, idx) => {
        const startAngle = idx * anglePerSegment - Math.PI / 2 - anglePerSegment / 2;
        const endAngle = startAngle + anglePerSegment;

        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0f1923';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Labels
        ctx.save();
        ctx.rotate(idx * anglePerSegment);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(seg.label, radius - 15, 3);
        ctx.restore();
      });

      // Inner center hub
      ctx.restore();
      
      // Center dial cover
      ctx.fillStyle = '#213743';
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#00e701';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top indicator pointer (stationary)
      ctx.fillStyle = '#00e701';
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius - 12);
      ctx.lineTo(cx - 8, cy - radius);
      ctx.lineTo(cx + 8, cy - radius);
      ctx.closePath();
      ctx.fill();
    };

    const loop = () => {
      if (isSpinningRef.current) {
        if (!isLanding && targetIndexRef.current !== null) {
          // Trigger the deceleration landing phase
          isLanding = true;
          const anglePerSegment = (Math.PI * 2) / segmentCount;
          // Calculate angle so target segment lands at the top (-90 degrees)
          // Top pointer is at -Math.PI / 2
          const targetSegAngle = - (targetIndexRef.current * anglePerSegment);
          
          // Target angle is multiple spins + landing offset
          targetAngle = angleRef.current + (Math.PI * 2 * 3) + targetSegAngle - (angleRef.current % (Math.PI * 2));
          
          // Smooth deceleration solver
          const distance = targetAngle - angleRef.current;
          speed = Math.sqrt(2 * deceleration * distance);
        }

        if (isLanding) {
          // Slowly decelerate to target angle
          angleRef.current += speed;
          speed -= deceleration;

          if (speed <= 0.005) {
            angleRef.current = targetAngle;
            isSpinningRef.current = false;
            isLanding = false;
            onFinish();
          }
        } else {
          // Free spin at fast speed
          speed = 0.25;
          angleRef.current += speed;
        }
      }

      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [segmentCount, risk, segments, onFinish]);

  return (
    <div className="relative w-full max-w-[360px] mx-auto aspect-square bg-primary/20 border border-gray-850 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
