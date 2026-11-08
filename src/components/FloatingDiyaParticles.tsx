import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FloatingDiyaParticle {
  id: number;
  leftPercent: number;
  startYPercent: number;
  driftX: number;
  duration: number;
  delay: number;
  scale: number;
  opacity: number;
}

const DIYA_PARTICLES: FloatingDiyaParticle[] = [
  { id: 1, leftPercent: 6, startYPercent: 95, driftX: 45, duration: 15, delay: 0, scale: 0.78, opacity: 0.75 },
  { id: 2, leftPercent: 18, startYPercent: 85, driftX: -35, duration: 18, delay: 2.2, scale: 0.9, opacity: 0.85 },
  { id: 3, leftPercent: 31, startYPercent: 98, driftX: 50, duration: 16, delay: 1.1, scale: 0.68, opacity: 0.65 },
  { id: 4, leftPercent: 46, startYPercent: 90, driftX: -40, duration: 20, delay: 3.4, scale: 0.85, opacity: 0.8 },
  { id: 5, leftPercent: 59, startYPercent: 96, driftX: 38, duration: 17, delay: 0.6, scale: 0.95, opacity: 0.88 },
  { id: 6, leftPercent: 72, startYPercent: 88, driftX: -48, duration: 19, delay: 2.8, scale: 0.74, opacity: 0.72 },
  { id: 7, leftPercent: 84, startYPercent: 94, driftX: 30, duration: 16.5, delay: 1.7, scale: 0.88, opacity: 0.82 },
  { id: 8, leftPercent: 92, startYPercent: 82, driftX: -32, duration: 15.5, delay: 4.0, scale: 0.7, opacity: 0.68 },
  { id: 9, leftPercent: 12, startYPercent: 60, driftX: 40, duration: 14.5, delay: 1.5, scale: 0.75, opacity: 0.74 },
  { id: 10, leftPercent: 66, startYPercent: 55, driftX: -36, duration: 17.5, delay: 0.9, scale: 0.82, opacity: 0.78 },
  { id: 11, leftPercent: 39, startYPercent: 72, driftX: 34, duration: 16.2, delay: 3.1, scale: 0.72, opacity: 0.7 },
  { id: 12, leftPercent: 81, startYPercent: 65, driftX: -42, duration: 18.8, delay: 2.0, scale: 0.8, opacity: 0.76 },
];

export const FloatingDiyaParticles: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      data-testid="floating-diya-particles"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {DIYA_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            left: `${particle.leftPercent}%`,
            top: `${particle.startYPercent}%`,
          }}
          initial={{ y: 0, x: 0, opacity: 0, scale: particle.scale }}
          animate={{
            y: [0, -280, -580, -880],
            x: [0, particle.driftX, -particle.driftX * 0.6, particle.driftX * 0.4],
            opacity: [0, particle.opacity, particle.opacity, 0],
            rotateZ: [-4, 5, -3, 4],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute flex flex-col items-center"
        >
          {/* Glowing Golden Flame Halo */}
          <div className="relative flex flex-col items-center">
            <div className="h-5 w-5 rounded-full bg-amber-400/35 blur-md" />
            {/* Flame SVG */}
            <svg
              width="14"
              height="18"
              viewBox="0 0 14 18"
              fill="none"
              className="-mt-4 animate-flame drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"
            >
              <path
                d="M7 0C7 0 13 6.2 13 11.2C13 14.9 10.3 17.5 7 17.5C3.7 17.5 1 14.9 1 11.2C1 6.2 7 0 7 0Z"
                fill="#FBBF24"
              />
              <path
                d="M7 5C7 5 10.2 8.6 10.2 11.6C10.2 13.7 8.8 15.2 7 15.2C5.2 15.2 3.8 13.7 3.8 11.6C3.8 8.6 7 5 7 5Z"
                fill="#FEF08A"
              />
            </svg>
            {/* Floating Mini Terracotta Clay Diya Base */}
            <svg
              width="28"
              height="12"
              viewBox="0 0 28 12"
              fill="none"
              className="-mt-1 drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]"
            >
              <path
                d="M1 2C5 4.2 23 4.2 27 2C25.5 8.5 20.5 11.5 14 11.5C7.5 11.5 2.5 8.5 1 2Z"
                fill="#B45309"
                stroke="#FBBF24"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  floatDelay?: number;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  intensity = 8,
  floatDelay = 0,
}) => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-y * intensity).toFixed(2)),
      rotateY: Number((x * intensity).toFixed(2)),
      translateZ: 14,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, translateZ: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1100px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.translateZ}px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
