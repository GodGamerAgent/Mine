import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Tilt3DCard } from './FloatingDiyaParticles';

interface CuteNoBackPageProps {
  onReturnToSurprise: () => void;
}

export const CuteNoBackPage: React.FC<CuteNoBackPageProps> = ({
  onReturnToSurprise,
}) => {
  return (
    <div className="perspective-stage min-h-screen flex items-center justify-center bg-[#FFF8F6] px-6 py-16 text-[#2D0A16] selection:bg-rose-200 selection:text-rose-950">
      <Tilt3DCard
        intensity={10}
        className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center card-3d-love sm:p-12"
      >
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-[#E11D48] shadow-inner"
        >
          <Lock className="h-7 w-7" />
        </motion.div>

        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cute Security Alert · Exit Door Locked With Kisses</span>
        </div>

        <h1
          className="mt-3 font-serif-display text-4xl font-semibold leading-tight text-[#330816] sm:text-5xl"
          style={{ textWrap: 'balance' }}
        >
          Hey Cutie, Where Do You Think You’re Going?
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[#6B293B]">
          Going back is strictly against the rules! You already opened your surprise, and my heart has locked the door behind us until we finish planning our <strong>Monday, 9th Nov 2026 Date</strong>.
        </p>

        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onReturnToSurprise}
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#E11D48] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(225,29,72,0.3)] transition-colors hover:bg-[#BE123C] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart className="h-4 w-4 fill-white text-white" />
            <span>Okay Fine, Take Me Back to the Surprise Page</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </Tilt3DCard>
    </div>
  );
};
