import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudSun, Sun, CloudRain, Heart, Sparkles } from 'lucide-react';
import { getNoRainState } from '../utils/dateLogic';

interface NoRainHopeCardProps {
  rainHopeCount: number;
  onIncrementRainHope: () => void;
}

export const NoRainHopeCard: React.FC<NoRainHopeCardProps> = ({
  rainHopeCount,
  onIncrementRainHope,
}) => {
  const rainState = getNoRainState(rainHopeCount);

  return (
    <div
      data-testid="no-rain-hope-card"
      onMouseDown={(e) => {
        if (e.detail > 1) e.preventDefault();
      }}
      className={`select-none rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${
        rainState.isPeak
          ? 'border-amber-400 bg-gradient-to-br from-rose-950 via-[#4C0519] to-rose-900 text-white shadow-[0_18px_38px_-12px_rgba(225,29,72,0.45)]'
          : 'border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-amber-50/50 text-[#2D0A16] shadow-sm'
      }`}
    >
      {/* Top Row: Weather Status Label + Live Counter (Capped at 30) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            rainState.isPeak ? 'text-amber-300' : 'text-rose-700'
          }`}
        >
          {rainState.isPeak ? (
            <Sun
              className="h-4 w-4 shrink-0 text-amber-300 animate-spin"
              style={{ animationDuration: '10s' }}
            />
          ) : rainState.count === 0 ? (
            <CloudRain className="h-4 w-4 shrink-0 text-rose-600" />
          ) : (
            <CloudSun className="h-4 w-4 shrink-0 text-amber-600" />
          )}
          <span>{rainState.promptText}</span>
        </div>

        <div
          data-testid="no-rain-counter-badge"
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
            rainState.isPeak
              ? 'border-amber-300/50 bg-amber-400/20 text-amber-200'
              : 'border-rose-200 bg-white text-rose-900'
          }`}
        >
          <span>Clicks:</span>
          <span data-testid="no-rain-count-value">{rainState.count}</span>
          <span className="opacity-70">/ {rainState.targetCount}</span>
        </div>
      </div>

      {/* Main Reactive Message Box */}
      <div className="mt-3 sm:mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${rainState.count}-${rainState.headline}`}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div
              data-testid="no-rain-message"
              className={`font-serif-display text-xl sm:text-2xl font-semibold leading-snug ${
                rainState.isPeak ? 'text-amber-200' : 'text-[#330816]'
              }`}
            >
              “{rainState.headline}”
            </div>
            <p
              className={`mt-1 text-xs sm:text-sm leading-relaxed ${
                rainState.isPeak ? 'text-rose-100/90' : 'text-[#6B293B]'
              }`}
            >
              {rainState.subtext}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar Toward 30 Clicks */}
      <div className="mt-3.5">
        <div
          className={`h-2 w-full overflow-hidden rounded-full ${
            rainState.isPeak ? 'bg-rose-950/80 border border-amber-400/40' : 'bg-rose-100'
          }`}
        >
          <motion.div
            animate={{ width: `${rainState.progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`h-full rounded-full ${
              rainState.isPeak
                ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400'
                : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Flirty & Motivating Manifestation Power Line (Replaces Unlock Chips) */}
      <div
        data-testid="no-rain-motivation"
        className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
          rainState.isPeak
            ? 'border-amber-300/45 bg-amber-400/15 text-amber-200'
            : 'border-rose-200/90 bg-rose-100/70 text-rose-900'
        }`}
      >
        <Heart
          className={`h-3.5 w-3.5 shrink-0 ${
            rainState.isPeak
              ? 'fill-amber-300 text-amber-300'
              : 'fill-rose-600 text-rose-600'
          }`}
        />
        <span>{rainState.motivationLine}</span>
      </div>

      {/* Interactive 'Hope for No Rain Tomorrow' Button */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <motion.button
          type="button"
          data-testid="hope-no-rain-btn"
          whileTap={{ scale: 0.95 }}
          onClick={onIncrementRainHope}
          className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-3 sm:px-5 text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
            rainState.isPeak
              ? 'bg-amber-400 text-[#180B10] shadow-[0_10px_24px_rgba(251,191,36,0.35)] hover:bg-amber-300'
              : 'bg-rose-900 text-white shadow-[0_10px_22px_rgba(136,19,55,0.25)] hover:bg-rose-800'
          }`}
        >
          {rainState.isPeak ? (
            <Sparkles className="h-4 w-4 shrink-0" />
          ) : (
            <CloudSun className="h-4 w-4 shrink-0 text-amber-300" />
          )}
          <span>{rainState.buttonLabel}</span>
          <span
            className={`ml-1 rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums ${
              rainState.isPeak
                ? 'bg-[#180B10]/15 text-[#180B10]'
                : 'bg-white/20 text-amber-200'
            }`}
          >
            +{rainState.count}
          </span>
        </motion.button>

        <span
          className={`text-[11px] text-center sm:text-right ${
            rainState.isPeak ? 'text-amber-200/90 font-medium' : 'text-rose-700/80'
          }`}
        >
          {rainState.isPeak
            ? '30/30 Peak Love Reached! Rain Officially Cancelled ☀️'
            : `Tap ${Math.max(0, rainState.targetCount - rainState.count)} more time(s) to hit ${rainState.targetCount}!`}
        </span>
      </div>
    </div>
  );
};
