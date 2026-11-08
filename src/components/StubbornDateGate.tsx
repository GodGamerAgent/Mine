import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, CalendarHeart, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getStubbornState } from '../utils/dateLogic';
import { Tilt3DCard } from './FloatingDiyaParticles';
import { NoRainHopeCard } from './NoRainHopeCard';

interface StubbornDateGateProps {
  noCount: number;
  rainHopeCount: number;
  onIncrementRainHope: () => void;
  onAttemptNo: () => void;
  onAcceptYes: () => void;
  onTryToGoBack: () => void;
}

const ROMANTIC_DATE_IMAGE = '/src/assets/images/romantic_monday_date_1794114710315.jpg';

export const StubbornDateGate: React.FC<StubbornDateGateProps> = ({
  noCount,
  rainHopeCount,
  onIncrementRainHope,
  onAttemptNo,
  onAcceptYes,
  onTryToGoBack,
}) => {
  const [imgError, setImgError] = useState(false);
  const stubborn = getStubbornState(noCount);

  const handleNoInteraction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (stubborn.noConvertedToYes) {
      onAcceptYes();
    } else {
      onAttemptNo();
    }
  };

  return (
    <div className="perspective-stage min-h-screen overflow-x-hidden bg-[#FFF8F6] text-[#2D0A16] selection:bg-rose-200 selection:text-rose-950">
      <div className="mx-auto max-w-[1140px] px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {/* Top bar inside Surprise Page: Trying to go back triggers the Cute No-Back Intercept Page */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onTryToGoBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-rose-800/80 hover:text-rose-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-rose-800/80">
            <span>For Mine · Your Surprise</span>
            <span aria-hidden="true">·</span>
            <span>Monday, 9th November 2026</span>
          </div>
        </div>

        {/* Split-Screen 3D Floating Romantic Proposal Layout */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 pt-2 sm:pt-4 lg:grid-cols-12"
        >
          {/* Left Column: Stubborn Proposal Card */}
          <div
            onMouseDown={(e) => {
              if (e.detail > 1) e.preventDefault();
            }}
            className="select-none flex flex-col justify-between rounded-2xl border border-rose-200 bg-white p-5 sm:p-8 shadow-[0_22px_44px_-16px_rgba(136,19,55,0.16)] lg:col-span-7"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-rose-700">
                <CalendarHeart className="h-4 w-4 shrink-0 text-rose-600" />
                <span>For Mine · Official Romantic Summons · 9th Nov 2026 · Monday</span>
              </div>

              <h1
                data-testid="stubborn-heading"
                className="mt-3 sm:mt-4 font-serif-display text-3xl font-semibold leading-[1.12] tracking-tight text-[#330816] sm:text-5xl lg:text-[3.35rem]"
                style={{ textWrap: 'balance' }}
              >
                {stubborn.message}
              </h1>

              <p className="mt-4 sm:mt-5 max-w-[58ch] text-sm sm:text-base leading-relaxed text-[#6B293B]">
                {stubborn.subtext}
              </p>

              {/* Hope for No Rain Tomorrow Interactive Counter Card */}
              <div className="mt-6">
                <NoRainHopeCard
                  rainHopeCount={rainHopeCount}
                  onIncrementRainHope={onIncrementRainHope}
                />
              </div>

              {/* Playful Stubborn Attempt Counter */}
              {noCount > 0 && (
                <motion.div
                  key={noCount}
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  role="status"
                  aria-live="polite"
                  className="mt-5 sm:mt-6 rounded-xl border border-rose-300 bg-rose-50 p-3.5 sm:p-4 text-xs sm:text-sm text-rose-900 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-semibold">
                      {stubborn.noConvertedToYes
                        ? 'Stubbornness Complete: Both Buttons Are Now YES!'
                        : `Stubborn Love Shield Activated (Attempt #${noCount})`}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-rose-700">
                      Chance of Saying No: 0.00%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-rose-800/90">
                    {stubborn.noConvertedToYes
                      ? 'Go ahead and pick either button—our Monday date on 9th Nov 2026 is officially sealed!'
                      : 'Notice how the "Yes" button keeps growing warmer while "No" refuses to cooperate?'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Interactive Yes / Stubborn No Action Zone */}
            <div className="mt-6 sm:mt-8 pt-6 border-t border-rose-200/80">
              <div className="text-xs text-rose-700/90 mb-4 sm:mb-5">
                Please select your answer below to unlock our Monday Date Planner:
              </div>

              <div className="relative flex min-h-[110px] flex-wrap items-center justify-start gap-4 sm:gap-8">
                {/* Primary 3D YES Button */}
                <motion.button
                  type="button"
                  data-testid="proposal-yes-btn"
                  onClick={onAcceptYes}
                  animate={{ scale: stubborn.yesScale }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ transformOrigin: 'left center' }}
                  className="relative z-20 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-3.5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_24px_rgba(225,29,72,0.35)] hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 text-center cursor-pointer"
                >
                  <Heart className="h-4 w-4 shrink-0 fill-white text-white" />
                  <span>{stubborn.yesButtonLabel}</span>
                </motion.button>

                {/* Stubborn NO Button (Dodges smoothly on every click and eventually becomes YES) */}
                <motion.button
                  type="button"
                  data-testid="proposal-no-btn"
                  onClick={handleNoInteraction}
                  animate={{
                    x: stubborn.noOffset.x,
                    y: stubborn.noOffset.y,
                  }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className={`relative z-30 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 sm:px-5 text-xs sm:text-sm font-medium text-center cursor-pointer ${
                    stubborn.noConvertedToYes
                      ? 'bg-rose-900 text-white hover:bg-rose-800 font-semibold shadow-md'
                      : 'border-2 border-rose-300 bg-white text-rose-800 shadow-sm hover:border-rose-400 hover:bg-rose-50'
                  }`}
                >
                  {stubborn.noConvertedToYes && <CheckCircle2 className="h-4 w-4 shrink-0 text-rose-200" />}
                  <span>{stubborn.noButtonLabel}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Floating Romantic Candlelight Preview */}
          <Tilt3DCard
            intensity={9}
            floatDelay={0.35}
            className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-950 card-3d-love lg:col-span-5"
          >
            {!imgError ? (
              <img
                src={ROMANTIC_DATE_IMAGE}
                alt="Intimate candlelight table for two with velvet red roses and a handwritten love letter"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full min-h-[340px] w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[340px] w-full flex-col items-center justify-center bg-gradient-to-br from-rose-900 via-rose-950 to-[#2D0A16] p-8 text-center text-rose-100">
                <Heart className="h-12 w-12 fill-rose-400 text-rose-400" />
                <p className="mt-4 font-serif-display text-2xl">
                  Table Reserved for Two
                </p>
                <p className="mt-1 text-xs text-rose-200/80">
                  Monday, 9th November 2026
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#240610]/90 via-[#240610]/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 text-white">
              <div className="flex items-center gap-2 text-xs text-rose-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>What Happens Once You Click Yes</span>
              </div>
              <p className="mt-1.5 font-serif-display text-2xl font-semibold">
                You Pick the Time, Show Me Your Dress, Write Our Plan &amp; Make Me Blush.
              </p>
              <p className="mt-1 text-xs text-rose-100/85">
                Date locked for Monday, 9th November 2026 · Dress code: Anything that makes you smile.
              </p>
            </div>
          </Tilt3DCard>
        </motion.div>
      </div>
    </div>
  );
};
