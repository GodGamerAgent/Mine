import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { INTRUDER_REDIRECT_MESSAGE } from '../utils/dateLogic';
import { Tilt3DCard } from './FloatingDiyaParticles';

interface IntruderAlertPageProps {
  wrongChoice?: string;
  onRetryGate: () => void;
}

export const IntruderAlertPage: React.FC<IntruderAlertPageProps> = ({
  wrongChoice,
  onRetryGate,
}) => {
  return (
    <div
      data-testid="intruder-alert-page"
      className="perspective-stage flex min-h-screen items-center justify-center bg-[#0F0307] px-4 py-10 sm:px-6 sm:py-16 text-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-2xl"
      >
        <Tilt3DCard
          intensity={7}
          className="rounded-3xl border-2 border-[#E11D48] bg-gradient-to-b from-[#2D0512] via-[#1B030B] to-[#0F0206] p-6 text-center shadow-[0_0_70px_rgba(225,29,72,0.45)] sm:p-14"
        >
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-rose-500/50 bg-[#E11D48]/20 text-rose-400">
            <ShieldAlert className="h-7 w-7 sm:h-9 sm:w-9" />
          </div>

          {wrongChoice && (
            <div className="mt-4 inline-block rounded-full border border-rose-500/40 bg-rose-950/80 px-3.5 py-1 font-mono text-[11px] sm:text-xs font-bold text-rose-300">
              Wrong Password Selected: “{wrongChoice}”
            </div>
          )}

          <h1
            data-testid="intruder-message-heading"
            className="mt-5 sm:mt-6 font-serif-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            {INTRUDER_REDIRECT_MESSAGE}
          </h1>

          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-rose-500/20 flex justify-center">
            <button
              type="button"
              data-testid="intruder-retry-btn"
              onClick={onRetryGate}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-rose-400/35 bg-white/10 px-4 py-3 sm:px-5 sm:py-2.5 text-xs font-semibold text-rose-200 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Wait, I’m Ashwi! Let Me Pick Again</span>
            </button>
          </div>
        </Tilt3DCard>
      </motion.div>
    </div>
  );
};
