'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { getPlinkoMultipliers, PlinkoRisk } from '@/lib/provably-fair';

interface PlinkoBoardProps {
  rows: number;
  risk: PlinkoRisk;
  onFinish: (bucketIndex: number, multiplier: number) => void;
}

export interface PlinkoBoardRef {
  dropBall: (path: number[]) => void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  path: number[];
  step: number;
  progress: number; // progress between pegs
  isFinished: boolean;
}

export const PlinkoBoard = forwardRef<PlinkoBoardRef, PlinkoBoardProps>(({
  rows,
  risk,
  onFinish,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  
  // Peg positions cache
  const pegsRef = useRef<{ x: number; y: number; active: number }[][]>([]);

  const multipliers = getPlinkoMultipliers(rows, risk);

  // Setup/calculate peg coordinates
  const setupPegs = (width: number, height: number) => {
    const pegs: { x: number; y: number; active: number }[][] = [];
    const startY = 40;
    const endY = height - 60;
    const rowHeight = (endY - startY) / rows;
    
    for (let r = 0; r < rows; r++) {
      const rowPegs: { x: number; y: number; active: number }[] = [];
      const cols = r + 3; // rows start with 3 pegs, adding 1 each row
      const rowWidth = cols * 24;
      const startX = (width - rowWidth) / 2 + 12;

      for (let c = 0; c < cols; c++) {
        rowPegs.push({
          x: startX + c * 24,
          y: startY + r * rowHeight,
          active: 0,
        });
      }
      pegs.push(rowPegs);
    }
    pegsRef.current = pegs;
  };

  // Expose dropBall to parent
  useImperativeHandle(ref, () => ({
    dropBall(path: number[]) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const newBall: Ball = {
        x: canvas.width / 2,
        y: 15,
        vx: 0,
        vy: 0,
        row: -1,
        path,
        step: 0,
        progress: 0,
        isFinished: false,
      };

      ballsRef.current.push(newBall);
    }
  }));

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const width = 600;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    setupPegs(width, height);

    const updatePhysics = () => {
      const activeBalls = ballsRef.current;
      const pegs = pegsRef.current;
      
      const startY = 40;
      const endY = height - 60;
      const rowHeight = (endY - startY) / rows;

      for (let i = activeBalls.length - 1; i >= 0; i--) {
        const ball = activeBalls[i];

        if (ball.row === -1) {
          // Ball starts falling from top towards first row
          ball.y += 2.5;
          if (ball.y >= pegs[0][0].y - 12) {
            ball.row = 0;
            // Determine starting peg (center of row 0 has 3 pegs: left, center, right)
            // Start at center peg
            ball.x = width / 2;
          }
        } else if (ball.row < rows) {
          const targetRow = ball.row + 1;
          const leftOrRight = ball.path[ball.row] || 0; // 0 = Left, 1 = Right

          // Bouncing transition interpolation
          ball.progress += 0.08;
          if (ball.progress >= 1) {
            // Arrived at next row peg
            ball.row = targetRow;
            ball.progress = 0;
            
            // Activate peg collision glow
            if (ball.row < rows) {
              const cols = pegs[ball.row];
              // Map index based on left/right path history
              const pathSum = ball.path.slice(0, ball.row).reduce((s, x) => s + x, 0);
              const pegIndex = pathSum + leftOrRight;
              
              if (cols && cols[pegIndex]) {
                cols[pegIndex].active = 10; // set glow ticks
              }
            }
          } else {
            // Interpolate position between rows
            const prevRowY = startY + ball.row * rowHeight;
            const nextRowY = startY + targetRow * rowHeight;
            
            const prevPathSum = ball.path.slice(0, ball.row).reduce((s, x) => s + x, 0);
            
            const colsPrev = pegs[ball.row];
            const colsNext = pegs[targetRow];
            
            if (colsPrev && colsNext) {
              const prevPegX = colsPrev[prevPathSum].x;
              // Target peg is index + 0 (left) or index + 1 (right)
              const nextPegIndex = prevPathSum + leftOrRight;
              const nextPegX = colsNext[nextPegIndex]?.x || width / 2;

              // Quadratic curve for bounce animation
              ball.y = prevRowY + (nextRowY - prevRowY) * ball.progress;
              
              // Add a bit of horizontal bounce curvature
              const t = ball.progress;
              ball.x = prevPegX + (nextPegX - prevPegX) * t;
              
              // Bounce arc peak
              if (t < 0.5) {
                ball.y -= Math.sin(t * Math.PI) * 4;
              }
            }
          }
        } else {
          // Ball lands in bucket
          ball.isFinished = true;
          const bucketIndex = ball.path.reduce((s, x) => s + x, 0);
          onFinish(bucketIndex, multipliers[bucketIndex]);
          activeBalls.splice(i, 1);
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = '#0f1923';
      ctx.fillRect(0, 0, width, height);

      const pegs = pegsRef.current;

      // Draw Pegs
      for (let r = 0; r < pegs.length; r++) {
        for (let c = 0; c < pegs[r].length; c++) {
          const peg = pegs[r][c];
          
          if (peg.active > 0) {
            ctx.fillStyle = '#00e701';
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
            peg.active--;
          } else {
            ctx.fillStyle = '#4a5568';
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Buckets
      const bucketWidth = width / (rows + 1);
      const startBucketY = height - 40;
      
      multipliers.forEach((mult, idx) => {
        const x = idx * bucketWidth + 2;
        const w = bucketWidth - 4;
        const h = 28;

        // Bucket color based on multiplier value
        let color = '#2b4756';
        if (mult >= 10) color = '#ef4444'; // Red
        else if (mult >= 2) color = '#f59e0b'; // Gold
        else if (mult >= 1) color = '#10b981'; // Green

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, startBucketY, w, h, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${mult}x`, x + w / 2, startBucketY + 17);
      });

      // Draw Balls
      ballsRef.current.forEach((ball) => {
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });
    };

    const loop = () => {
      updatePhysics();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [rows, risk, multipliers, onFinish]);

  return (
    <div className="relative w-full max-w-[600px] mx-auto aspect-[6/5] bg-primary border border-gray-800 rounded-2xl overflow-hidden shadow-inner p-2">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
});

PlinkoBoard.displayName = 'PlinkoBoard';
