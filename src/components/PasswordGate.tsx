import React from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, Heart } from 'lucide-react';
import {
  PASSWORD_OPTIONS,
  verifyAshwiPassword,
} from '../utils/dateLogic';
import { FloatingDiyaParticles, Tilt3DCard } from './FloatingDiyaParticles';

interface PasswordGateProps {
  onSuccess: (chosen: string) => void;
  onIntruder: (chosen: string) => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({
  onSuccess,
  onIntruder,
}) => {
  const handleSelectOption = (option: string) => {
    if (verifyAshwiPassword(option)) {
      onSuccess(option);
    } else {
      onIntruder(option);
    }
  };

  return (
    <div className="perspective-stage relative flex min-h-screen items-center justify-center overflow-hidden bg-[#12090D] px-6 py-16 text-[#FAF3EB]">
      <FloatingDiyaParticles />

      {/* Ambient warm glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.22), transparent 55%), radial-gradient(circle at 50% 80%, rgba(225, 29, 72, 0.18), transparent 55%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Tilt3DCard
          intensity={6}
          data-testid="password-gate-card"
          className="rounded-3xl border border-amber-400/40 bg-[#1B0D14]/90 p-8 text-center backdrop-blur-md card-3d-surface sm:p-12"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>For Mine · Secret Password Verification</span>
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <h1
            className="mt-3 font-serif-display text-4xl font-semibold text-[#FFFBF5] sm:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            Wait! Choose the Secret Password Before Entering
          </h1>

          <p className="mx-auto mt-3 max-w-[50ch] text-sm leading-relaxed text-[#E6D7C8] sm:text-base">
            This private space belongs exclusively to my girl. Pick the right word below to unlock your surprise—choose carefully!
          </p>

          {/* Password Option Buttons Grid */}
          <div
            data-testid="password-options-grid"
            className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4"
          >
            {PASSWORD_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                data-testid={`password-option-${option}`}
                onClick={() => handleSelectOption(option)}
                className="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-amber-400/30 bg-[#25121B] px-4 py-4 text-sm font-semibold text-[#FFFBF5] shadow-md transition-all hover:-translate-y-1 hover:border-amber-400 hover:bg-amber-400 hover:text-[#180B10] cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 text-amber-400 transition-colors group-hover:fill-[#180B10] group-hover:text-[#180B10]" />
                <span>{option}</span>
              </button>
            ))}
          </div>

          <p className="mt-7 text-xs text-[#A69080]">
            Hint: Only the real one knows the exact word we always say.
          </p>
        </Tilt3DCard>
      </motion.div>
    </div>
  );
};
