import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Upload,
  Heart,
  Sparkles,
  Camera,
  MessageSquareHeart,
  AlertCircle,
  ArrowLeft,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  type DatePlanSubmission,
  formatRomanticTimeLabel,
  validateDatePlan,
  calculateBlushMeter,
  getDressPhotos,
  getBlushPhotos,
  getPhotoCounts,
} from '../utils/dateLogic';
import { Tilt3DCard } from './FloatingDiyaParticles';
import { NoRainHopeCard } from './NoRainHopeCard';

interface LoveDatePlannerProps {
  submission: DatePlanSubmission;
  rainHopeCount: number;
  onIncrementRainHope: () => void;
  onChange: (updated: DatePlanSubmission) => void;
  onSubmitSuccess: () => void;
  onTryToGoBack: () => void;
}

const COUTURE_FALLBACK_IMAGE = '/src/assets/images/couture_dress_still_life_1794114710790.jpg';
const ROMANTIC_PORTRAIT_FALLBACK = '/src/assets/images/romantic_monday_date_1794114710315.jpg';

const PLAN_ACTIVITY_OPTIONS = [
  'Candlelight Table for Two',
  'Hand-in-Hand Evening Walk',
  'Sharing Dessert From One Spoon',
  'Polaroid Photo Booth Stop',
  'Long Drive With Our Favorite Songs',
  'Stargazing & Warm Chai',
];

const BLUSH_VIBE_OPTIONS = [
  {
    id: 'Secret Smile',
    title: 'The Secret Smile',
    note: 'That soft look that makes me forget what I was saying',
  },
  {
    id: 'Golden Hour Glow',
    title: 'Golden Hour Glow',
    note: 'Sunlit or diya-lit warmth that stops my heart',
  },
  {
    id: 'Just For Your Eyes',
    title: 'Just For Your Eyes',
    note: 'A candid selfie meant only for my phone screen',
  },
  {
    id: 'Festive Twirl',
    title: 'Festive Couture Twirl',
    note: 'Showing off your Diwali glow & earrings',
  },
];

export const LoveDatePlanner: React.FC<LoveDatePlannerProps> = ({
  submission,
  rainHopeCount,
  onIncrementRainHope,
  onChange,
  onSubmitSuccess,
  onTryToGoBack,
}) => {
  const [errors, setErrors] = useState<
    Partial<Record<'selectedTime' | 'dressImageUrl' | 'datePlanText' | 'loveMessage' | 'blushPhotoUrl', string>>
  >({});
  const [showNotFullPrompt, setShowNotFullPrompt] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeartOverlay(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const timeFormatted = formatRomanticTimeLabel(submission.selectedTime);
  const blushStats = calculateBlushMeter(submission);
  const dressPhotos = getDressPhotos(submission);
  const blushPhotos = getBlushPhotos(submission);
  const photoCounts = getPhotoCounts(submission);

  // Parse current 24h time into 12h parts for the interactive time picker controls
  const hasSelectedTime = Boolean(submission.selectedTime.trim());
  const parseTimeParts = (time24: string) => {
    if (!time24 || !time24.includes(':')) {
      return { hour12: 7, min: 30, period: 'PM' as const };
    }
    const [hStr = '19', mStr = '30'] = time24.split(':');
    const h24 = parseInt(hStr, 10) || 19;
    const min = parseInt(mStr, 10) || 0;
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { hour12, min, period };
  };

  const { hour12, min, period } = parseTimeParts(submission.selectedTime);

  const updateTimeFromParts = (newHour12: number, newMin: number, newPeriod: 'AM' | 'PM') => {
    let h24 = newHour12 % 12;
    if (newPeriod === 'PM') h24 += 12;
    const formatted24 = `${String(h24).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
    onChange({
      ...submission,
      selectedTime: formatted24,
      timeSlotTitle: formatRomanticTimeLabel(formatted24).atmosphereLabel,
    });
    setErrors((prev) => ({ ...prev, selectedTime: undefined }));
  };

  const appendPhotos = (
    field: 'dressImageUrl' | 'blushPhotoUrl',
    newUrls: string[],
    extraUpdates?: Partial<DatePlanSubmission>
  ) => {
    if (newUrls.length === 0) return;
    if (field === 'dressImageUrl') {
      const updatedList = [...dressPhotos, ...newUrls];
      onChange({
        ...submission,
        ...extraUpdates,
        dressImageUrl: updatedList[0] || '',
        dressImageUrls: updatedList,
      });
      setErrors((prev) => ({ ...prev, dressImageUrl: undefined }));
    } else {
      const updatedList = [...blushPhotos, ...newUrls];
      onChange({
        ...submission,
        ...extraUpdates,
        blushPhotoUrl: updatedList[0] || '',
        blushPhotoUrls: updatedList,
      });
      setErrors((prev) => ({ ...prev, blushPhotoUrl: undefined }));
    }
  };

  const removePhotoAt = (field: 'dressImageUrl' | 'blushPhotoUrl', indexToRemove: number) => {
    if (field === 'dressImageUrl') {
      const updatedList = dressPhotos.filter((_, idx) => idx !== indexToRemove);
      onChange({
        ...submission,
        dressImageUrl: updatedList[0] || '',
        dressImageUrls: updatedList,
      });
    } else {
      const updatedList = blushPhotos.filter((_, idx) => idx !== indexToRemove);
      onChange({
        ...submission,
        blushPhotoUrl: updatedList[0] || '',
        blushPhotoUrls: updatedList,
      });
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'dressImageUrl' | 'blushPhotoUrl'
  ) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    Promise.all(
      fileList.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => {
      const validUrls = results.filter(Boolean);
      appendPhotos(field, validUrls);
      e.target.value = '';
    });
  };

  const handleToggleActivity = (activity: string) => {
    const exists = submission.selectedActivities.includes(activity);
    const updatedActivities = exists
      ? submission.selectedActivities.filter((a) => a !== activity)
      : [...submission.selectedActivities, activity];

    const currentPlan = submission.datePlanText.trim();
    const shouldAppend = !exists && !currentPlan.includes(activity);
    const updatedPlanText = shouldAppend
      ? currentPlan
        ? `${currentPlan} • ${activity}`
        : `Let us start with ${activity}, then take our time enjoying every moment together.`
      : submission.datePlanText;

    onChange({
      ...submission,
      selectedActivities: updatedActivities,
      datePlanText: updatedPlanText,
    });
    setErrors((prev) => ({ ...prev, datePlanText: undefined }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If the Blush Meter is not full yet, intercept and ask her "Are you sure?" to convince her to fill it!
    if (!blushStats.isFull) {
      setShowNotFullPrompt(true);
      const validation = validateDatePlan(submission);
      setErrors(validation.errors);
      return;
    }

    const validation = validateDatePlan(submission);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setShowNotFullPrompt(false);
    onSubmitSuccess();
  };

  const heartbeatClass = blushStats.isOverflowing
    ? 'animate-heartbeat-fast'
    : 'animate-heartbeat-slow';

  return (
    <div className="perspective-stage min-h-screen bg-[#FFF8F6] text-[#2D0A16] selection:bg-rose-200 selection:text-rose-950">
      {/* FLOATING HEART-SHAPED BLUSH METER OVERLAY (Revealed When Scrolled Down & Portaled to Viewport) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showHeartOverlay && (
              <motion.div
                data-testid="heart-blush-overlay"
                initial={{ opacity: 0, scale: 0.6, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 30 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Click to scroll to main Blush Meter"
                className="fixed right-3 bottom-3 z-[9999] cursor-pointer select-none sm:right-8 sm:bottom-8"
              >
                <div className={`relative flex flex-col items-center justify-center ${heartbeatClass}`}>
                  {/* Overflow Shockwave Rings & Bursting Mini Hearts when overflowing */}
                  {blushStats.isOverflowing && (
                    <>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#E11D48] animate-overflow-wave"
                      />
                      <span
                        aria-hidden="true"
                        style={{ animationDelay: '0.55s' }}
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400 animate-overflow-wave"
                      />
                      {/* Floating burst hearts */}
                      {[-28, 0, 28].map((offsetX, i) => (
                        <motion.span
                          key={i}
                          aria-hidden="true"
                          initial={{ opacity: 0, y: 0, x: offsetX * 0.4, scale: 0.6 }}
                          animate={{
                            opacity: [0, 1, 0],
                            y: [-8, -48 - i * 10],
                            x: [offsetX * 0.4, offsetX],
                            scale: [0.6, 1.15, 0.8],
                          }}
                          transition={{
                            duration: 1.3,
                            repeat: Infinity,
                            delay: i * 0.35,
                            ease: 'easeOut',
                          }}
                          className="pointer-events-none absolute -top-2 text-rose-600 drop-shadow-sm"
                        >
                          <Heart className="h-4 w-4 fill-[#E11D48] text-[#E11D48]" />
                        </motion.span>
                      ))}
                    </>
                  )}

                  {/* Sculpted 3D Heart Shape SVG with Dynamic Liquid Fill */}
                  <div className="relative h-24 w-28 drop-shadow-[0_14px_28px_rgba(225,29,72,0.42)] sm:h-32 sm:w-36">
                    <svg
                      viewBox="0 0 120 110"
                      className="h-full w-full overflow-visible"
                      aria-hidden="true"
                    >
                      <defs>
                        <clipPath id="heart-overlay-clip">
                          <path d="M60 100 C60 100 10 68 10 34 C10 16 25 6 41 6 C51 6 57 12 60 18 C63 12 69 6 79 6 C95 6 110 16 110 34 C110 68 60 100 60 100 Z" />
                        </clipPath>
                        <linearGradient id="heart-liquid-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#881337" />
                          <stop offset="55%" stopColor="#E11D48" />
                          <stop
                            offset="100%"
                            stopColor={blushStats.isOverflowing ? '#FBBF24' : '#FB7185'}
                          />
                        </linearGradient>
                      </defs>

                      {/* Base dark ruby heart backdrop */}
                      <path
                        d="M60 100 C60 100 10 68 10 34 C10 16 25 6 41 6 C51 6 57 12 60 18 C63 12 69 6 79 6 C95 6 110 16 110 34 C110 68 60 100 60 100 Z"
                        fill="#330816"
                        stroke={blushStats.isOverflowing ? '#FBBF24' : '#FDA4AF'}
                        strokeWidth="3.5"
                      />

                      {/* Rising liquid inside the heart shape */}
                      <g clipPath="url(#heart-overlay-clip)">
                        <rect
                          x="0"
                          y={105 - Math.min(100, blushStats.score)}
                          width="120"
                          height="110"
                          fill="url(#heart-liquid-grad)"
                          className="transition-all duration-500"
                        />
                      </g>

                      {/* 3D specular highlight on the upper heart lobe */}
                      <path
                        d="M24 28 C24 20 32 14 40 14"
                        fill="none"
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Score & Status centered inside the Heart */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pb-2 text-center text-white">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-rose-100/90">
                        {blushStats.isOverflowing ? 'OVERFLOW!' : 'Blush Rate'}
                      </span>
                      <span
                        data-testid="heart-overlay-score"
                        className={`font-mono text-xl font-extrabold leading-none tabular-nums sm:text-2xl ${
                          blushStats.isOverflowing ? 'text-amber-200' : 'text-white'
                        }`}
                      >
                        {blushStats.score}%
                      </span>
                      {blushStats.isOverflowing && (
                        <span className="mt-0.5 rounded-full bg-black/45 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300">
                          Don’t Kill Me!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <div className="mx-auto max-w-[1160px] px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        {/* Top bar with Back Intercept */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onTryToGoBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-rose-800/80 hover:text-rose-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-rose-800/80">
            <span>For Mine</span>
            <span aria-hidden="true">·</span>
            <span>Monday, 9th November 2026</span>
          </div>
        </div>

        {/* Love Theme Header Banner with OVERSIZED 3D Floating Blush Rate Display */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border-b border-rose-200 pb-10"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-700">
                <span>She Said YES!</span>
                <span aria-hidden="true">·</span>
                <span>Monday, 9th November 2026</span>
              </div>

              <h1
                className="mt-3 font-serif-display text-4xl font-semibold tracking-tight text-[#330816] sm:text-5xl"
                style={{ textWrap: 'balance' }}
              >
                For Mine — Design Our Monday, 9th Nov 2026 Date
              </h1>
              <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#6B293B]">
                Watch my Blush Rate on the right start low and climb higher with every single thing you choose—from picking our time for Monday, 9th November 2026 to showing me your dress, our plan, your love note, and your photo!
              </p>

              {/* Synced Hope for No Rain Tomorrow Counter */}
              <div className="mt-6">
                <NoRainHopeCard
                  rainHopeCount={rainHopeCount}
                  onIncrementRainHope={onIncrementRainHope}
                />
              </div>
            </div>

            {/* OVERSIZED 3D FLOATING CURRENT BLUSH RATE DISPLAY (Beats Slower by Default, Beats Faster with Overflow Animation on Overflow) */}
            <div className="relative lg:col-span-5">
              {blushStats.isOverflowing && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-2xl border-2 border-[#E11D48] animate-overflow-wave"
                  />
                  <span
                    aria-hidden="true"
                    style={{ animationDelay: '0.6s' }}
                    className="pointer-events-none absolute -inset-2 rounded-2xl border-2 border-amber-400 animate-overflow-wave"
                  />
                </>
              )}
              <Tilt3DCard
                intensity={9}
                className={`relative overflow-hidden rounded-2xl border p-6 card-3d-love ${heartbeatClass} ${
                  blushStats.isOverflowing
                    ? 'border-[#E11D48] bg-gradient-to-br from-rose-950 via-[#4C0519] to-rose-900 text-white shadow-[0_0_45px_rgba(225,29,72,0.55)]'
                    : 'border-rose-200 bg-white text-[#2D0A16]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      blushStats.isOverflowing ? 'text-amber-300' : 'text-rose-700'
                    }`}
                  >
                    {blushStats.isOverflowing
                      ? '⚠️ BLUSH METER OVERFLOWING!'
                      : 'His Current Blush Rate'}
                  </span>
                  <Heart
                    className={`h-6 w-6 ${heartbeatClass} ${
                      blushStats.isOverflowing
                        ? 'fill-amber-300 text-amber-300 scale-125'
                        : 'fill-[#E11D48] text-[#E11D48]'
                    }`}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span
                    data-testid="blush-rate-score"
                    className={`font-mono text-5xl font-bold tracking-tight tabular-nums sm:text-6xl ${
                      blushStats.isOverflowing ? 'text-amber-300' : 'text-[#E11D48]'
                    }`}
                  >
                    {blushStats.score}%
                  </span>
                  <span
                    className={`font-serif-display text-2xl font-semibold italic ${
                      blushStats.isOverflowing ? 'text-rose-100' : 'text-[#330816]'
                    }`}
                  >
                    {blushStats.verdict}
                  </span>
                </div>

                {/* Progress / Overflow Bar */}
                <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-rose-200/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, blushStats.score)}%` }}
                    transition={{ duration: 0.45 }}
                    className={`h-full rounded-full ${
                      blushStats.isOverflowing
                        ? 'bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300'
                        : 'bg-[#E11D48]'
                    }`}
                  />
                </div>

                {/* Live Total Photos Added Counter */}
                <div
                  data-testid="total-photos-counter"
                  className={`mt-3 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                    blushStats.isOverflowing
                      ? 'border-amber-300/35 bg-black/25 text-amber-200'
                      : 'border-rose-200 bg-rose-50/70 text-rose-900'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 shrink-0" />
                    <span>Total Photos Added:</span>
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {photoCounts.totalCount} Photo{photoCounts.totalCount === 1 ? '' : 's'} ({photoCounts.dressCount} Dress · {photoCounts.blushCount} Blush)
                  </span>
                </div>

                {/* Overflow message telling her not to kill him */}
                {blushStats.isOverflowing && blushStats.overflowWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    aria-live="polite"
                    className="mt-4 rounded-xl border border-amber-300/50 bg-black/30 p-3 text-xs font-medium leading-relaxed text-amber-100"
                  >
                    {blushStats.overflowWarning}
                  </motion.div>
                )}
              </Tilt3DCard>
            </div>
          </div>
        </motion.header>

        <form onSubmit={handleFormSubmit} noValidate className="mt-12 space-y-12">
          {/* SECTION 01: Dedicated 3D Floating Time Picker (Starts Empty, Selecting Time Increases Blush Rate) */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Tilt3DCard
              intensity={5}
              className="rounded-2xl border border-rose-200 bg-white p-7 card-3d-love md:p-9"
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <div className="text-xs font-medium text-rose-700">
                    01. Date &amp; Time Picker · Monday, 9th November 2026 (+22% Blush)
                  </div>
                  <h2 className="mt-1 font-serif-display text-3xl font-semibold text-[#330816] sm:text-4xl">
                    Pick a Time for Our 9th Nov 2026 Monday Date
                  </h2>
                  <p className="mt-2 text-sm text-[#6B293B]">
                    The clock starts empty! Dial in the hour and minute you want for Monday, 9th November 2026 to start boosting my Blush Rate.
                  </p>

                  <div className="mt-6 rounded-xl border border-rose-100 bg-[#FFF9F7] p-4">
                    <div className="text-xs text-rose-700">Selected Rendezvous Time</div>
                    <div className="mt-1 font-mono text-2xl font-bold text-[#E11D48] tabular-nums sm:text-3xl">
                      {timeFormatted.formatted12h}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-[#6B293B]">
                      Monday, 9th November 2026 · {timeFormatted.atmosphereLabel}
                    </div>
                  </div>
                </div>

                {/* Interactive Custom Time Picker Studio */}
                <div className="rounded-2xl border border-rose-200 bg-[#FFFDFC] p-6 lg:col-span-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
                    <label
                      htmlFor="monday-date-time-input"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#330816]"
                    >
                      <Clock className="h-4 w-4 text-[#E11D48]" />
                      <span>Set Exact Clock Time:</span>
                    </label>
                    <input
                      id="monday-date-time-input"
                      type="time"
                      value={submission.selectedTime}
                      onChange={(e) => {
                        onChange({
                          ...submission,
                          selectedTime: e.target.value,
                          timeSlotTitle: formatRomanticTimeLabel(e.target.value).atmosphereLabel,
                        });
                        setErrors((prev) => ({ ...prev, selectedTime: undefined }));
                      }}
                      className="rounded-xl border border-rose-300 bg-rose-50/70 px-4 py-2.5 font-mono text-lg font-bold text-rose-950 tabular-nums focus:border-[#E11D48] focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Hour / Minute / AM-PM Interactive Dial Selectors */}
                  <div className="mt-5 grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="picker-hour-select"
                        className="block text-xs font-medium text-rose-800"
                      >
                        Hour
                      </label>
                      <select
                        id="picker-hour-select"
                        value={hasSelectedTime ? hour12 : ''}
                        onChange={(e) =>
                          updateTimeFromParts(Number(e.target.value), min, period)
                        }
                        className="mt-1.5 w-full rounded-lg border border-rose-200 bg-white px-3 py-2.5 font-mono text-base font-semibold text-[#330816] focus:border-[#E11D48] focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          --
                        </option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="picker-minute-select"
                        className="block text-xs font-medium text-rose-800"
                      >
                        Minute
                      </label>
                      <select
                        id="picker-minute-select"
                        value={hasSelectedTime ? min : ''}
                        onChange={(e) =>
                          updateTimeFromParts(hour12, Number(e.target.value), period)
                        }
                        className="mt-1.5 w-full rounded-lg border border-rose-200 bg-white px-3 py-2.5 font-mono text-base font-semibold text-[#330816] focus:border-[#E11D48] focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          --
                        </option>
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                          <option key={m} value={m}>
                            {String(m).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-rose-800">
                        AM / PM
                      </span>
                      <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-rose-100/70 p-1">
                        {(['AM', 'PM'] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateTimeFromParts(hour12, min, p)}
                            className={`rounded-md py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                              hasSelectedTime && period === p
                                ? 'bg-[#E11D48] text-white shadow-xs'
                                : 'text-rose-900 hover:bg-rose-200/50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errors.selectedTime && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.selectedTime}</span>
                </p>
              )}
            </Tilt3DCard>
          </motion.section>

          {/* SECTION 02 & 03 Split Grid: 3D Floating Dress Upload + Blush Photo Upload (Multiple Photos + Adaptive Holders) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* SECTION 02: Upload the Image(s) of the Dress She Is Going to Wear */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <Tilt3DCard
                intensity={6}
                floatDelay={0.15}
                className="flex h-full flex-col justify-between rounded-2xl border border-rose-200 bg-white p-7 card-3d-love md:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-rose-700">
                      02. Your Outfit Sneak Peek (+25% Blush + Bonus Per Extra Photo)
                    </span>
                    <span
                      data-testid="dress-photos-counter"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 font-mono text-xs font-bold text-[#E11D48] tabular-nums"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Dress Photos Added: {photoCounts.dressCount}</span>
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif-display text-2xl font-semibold text-[#330816] sm:text-3xl">
                    Upload the Dress You Are Going to Wear
                  </h2>
                  <p className="mt-2 text-sm text-[#6B293B]">
                    Upload one or multiple photos of the dress, heels, or jewelry you are planning to wear on Monday! Every photo frame adapts naturally to your photo’s full size without stretching or cropping.
                  </p>

                  {/* Dress Multi-File Upload Control */}
                  <div className="mt-5">
                    <label
                      htmlFor="dress-upload-input"
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-300 bg-rose-50/40 p-6 text-center transition-colors hover:bg-rose-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <Upload className="h-6 w-6" />
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="mt-2 text-sm font-semibold text-[#330816]">
                        {photoCounts.dressCount > 0
                          ? 'Add More Dress / Outfit Photos'
                          : 'Upload Photo(s) of Your Dress'}
                      </span>
                      <span className="mt-1 text-xs text-[#6B293B]">
                        Select single or multiple photos from your gallery (full uncropped size)
                      </span>
                      <input
                        id="dress-upload-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'dressImageUrl')}
                        className="sr-only"
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-[#6B293B]">
                        Keeping it a partial surprise?
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          appendPhotos('dressImageUrl', [COUTURE_FALLBACK_IMAGE], {
                            dressName: submission.dressName || 'Champagne Silk Evening Couture',
                            dressColorNote:
                              submission.dressColorNote || 'Champagne & Rose Gold Silk',
                          })
                        }
                        className="text-xs font-semibold text-rose-700 underline underline-offset-4 hover:text-rose-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Use Silk Couture Preview Card
                      </button>
                    </div>
                  </div>

                  {/* Adaptive Multi-Photo Gallery for Dress Photos (Zero Stretching / Zero Cropping) */}
                  {dressPhotos.length > 0 && (
                    <div className="mt-5 space-y-4">
                      {dressPhotos.map((photoUrl, idx) => (
                        <div
                          key={`dress-${idx}`}
                          className="overflow-hidden rounded-xl border border-rose-200 bg-[#FFF9F7] p-3"
                        >
                          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-[#2D0A16]/5">
                            <img
                              src={photoUrl}
                              alt={`Uploaded dress preview #${idx + 1} for our Monday date`}
                              referrerPolicy="no-referrer"
                              className="mx-auto block h-auto max-h-[460px] w-full object-contain"
                            />
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-xs text-rose-900">
                            <span className="font-mono font-semibold">
                              Dress Photo #{idx + 1} of {dressPhotos.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePhotoAt('dressImageUrl', idx)}
                              className="inline-flex items-center gap-1 font-medium text-rose-700 hover:text-rose-950 hover:underline cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="dress-name-input" className="block text-xs font-medium text-rose-900">
                        Dress Style / Outfit Name
                      </label>
                      <input
                        id="dress-name-input"
                        type="text"
                        placeholder="e.g. Emerald Silk Saree or Black Midi Dress"
                        value={submission.dressName}
                        onChange={(e) => onChange({ ...submission, dressName: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-rose-200 bg-[#FFFDFC] px-3.5 py-2 text-sm text-[#2D0A16] focus:border-rose-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="dress-color-input" className="block text-xs font-medium text-rose-900">
                        Color Hint for Me to Match
                      </label>
                      <input
                        id="dress-color-input"
                        type="text"
                        placeholder="e.g. Wine Red & Gold"
                        value={submission.dressColorNote}
                        onChange={(e) => onChange({ ...submission, dressColorNote: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-rose-200 bg-[#FFFDFC] px-3.5 py-2 text-sm text-[#2D0A16] focus:border-rose-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {errors.dressImageUrl && (
                  <p role="alert" className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.dressImageUrl}</span>
                  </p>
                )}
              </Tilt3DCard>
            </motion.section>

            {/* SECTION 03: Add Her Photo(s) to Make Me Blush */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Tilt3DCard
                intensity={6}
                floatDelay={0.3}
                className="flex h-full flex-col justify-between rounded-2xl border border-rose-200 bg-white p-7 card-3d-love md:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-rose-700">
                      03. Make Me Blush Portraits (+30% Blush + Bonus Per Extra Photo)
                    </span>
                    <span
                      data-testid="blush-photos-counter"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 font-mono text-xs font-bold text-[#E11D48] tabular-nums"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Blush Photos Added: {photoCounts.blushCount}</span>
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif-display text-2xl font-semibold text-[#330816] sm:text-3xl">
                    Add Your Photos to Make Me Blush
                  </h2>
                  <p className="mt-2 text-sm text-[#6B293B]">
                    Pick a vibe below and upload as many photos of yourself as you want! Each photo increases my Blush Rate and is framed at its true natural size without stretching or cropping.
                  </p>

                  {/* Blush Vibe Options */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {BLUSH_VIBE_OPTIONS.map((vibe) => {
                      const active = submission.blushVibe === vibe.id;
                      return (
                        <button
                          key={vibe.id}
                          type="button"
                          onClick={() => onChange({ ...submission, blushVibe: vibe.id })}
                          className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#E11D48] bg-rose-50/90'
                              : 'border-rose-100 bg-[#FFFDFC] hover:border-rose-300'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#330816]">{vibe.title}</div>
                          <div className="mt-0.5 text-[11px] leading-snug text-[#6B293B]">
                            {vibe.note}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Blush Photo Multi-File Input */}
                  <div className="mt-4">
                    <label
                      htmlFor="blush-photo-input"
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-300 bg-rose-50/40 p-5 text-center transition-colors hover:bg-rose-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <Camera className="h-6 w-6" />
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="mt-2 text-sm font-semibold text-[#330816]">
                        {photoCounts.blushCount > 0
                          ? 'Add More Photos to Make Me Blush'
                          : 'Upload Your Photo(s) to Make Me Blush'}
                      </span>
                      <span className="mt-1 text-xs text-[#6B293B]">
                        Select one or multiple selfies, mirror shots, or Diwali portraits
                      </span>
                      <input
                        id="blush-photo-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'blushPhotoUrl')}
                        className="sr-only"
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-[#6B293B]">
                        Want to set a romantic mood card right now?
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          appendPhotos('blushPhotoUrl', [ROMANTIC_PORTRAIT_FALLBACK], {
                            blushCaption:
                              submission.blushCaption ||
                              'Wait until you see me in person on Monday night.',
                          })
                        }
                        className="text-xs font-semibold text-rose-700 underline underline-offset-4 hover:text-rose-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Use Candlelight Portrait Card
                      </button>
                    </div>
                  </div>

                  {/* Adaptive Multi-Photo Gallery for Blush Portraits (Zero Stretching / Zero Cropping) */}
                  {blushPhotos.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {blushPhotos.map((photoUrl, idx) => (
                        <div
                          key={`blush-${idx}`}
                          className="overflow-hidden rounded-xl border border-rose-200 bg-[#FFF9F7] p-3"
                        >
                          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-[#2D0A16]/5">
                            <img
                              src={photoUrl}
                              alt={`Her portrait #${idx + 1} uploaded to make him blush`}
                              referrerPolicy="no-referrer"
                              className="mx-auto block h-auto max-h-[460px] w-full object-contain"
                            />
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-xs text-rose-900">
                            <span className="font-mono font-semibold">
                              Blush Photo #{idx + 1} of {blushPhotos.length} · {submission.blushVibe}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePhotoAt('blushPhotoUrl', idx)}
                              className="inline-flex items-center gap-1 font-medium text-rose-700 hover:text-rose-950 hover:underline cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <label htmlFor="blush-caption-input" className="block text-xs font-medium text-rose-900">
                      Cheeky Caption Under Your Photo(s)
                    </label>
                    <input
                      id="blush-caption-input"
                      type="text"
                      placeholder="e.g. Try not to stare too much on Monday..."
                      value={submission.blushCaption}
                      onChange={(e) => onChange({ ...submission, blushCaption: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-rose-200 bg-[#FFFDFC] px-3.5 py-2 text-sm text-[#2D0A16] focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                {errors.blushPhotoUrl && (
                  <p role="alert" className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.blushPhotoUrl}</span>
                  </p>
                )}
              </Tilt3DCard>
            </motion.section>
          </div>

          {/* SECTION 04: Write Down the Plan */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Tilt3DCard
              intensity={5}
              floatDelay={0.2}
              className="rounded-2xl border border-rose-200 bg-white p-7 card-3d-love md:p-9"
            >
              <div className="text-xs font-medium text-rose-700">
                04. Our Evening Blueprint · Monday, 9th Nov 2026 (+34% Blush)
              </div>
              <h2 className="mt-1 font-serif-display text-2xl font-semibold text-[#330816] sm:text-3xl">
                Write Down the Plan for Our Date
              </h2>
              <p className="mt-2 max-w-[65ch] text-sm text-[#6B293B]">
                Tell me everything you want us to do on Monday, 9th November 2026. Tap any romantic ideas below to boost my Blush Rate and build our dream itinerary.
              </p>

              {/* Interactive Plan Activity Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {PLAN_ACTIVITY_OPTIONS.map((activity) => {
                  const isSelected = submission.selectedActivities.includes(activity);
                  return (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => handleToggleActivity(activity)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#E11D48] bg-[#E11D48] text-white'
                          : 'border-rose-200 bg-rose-50/50 text-rose-900 hover:bg-rose-100/70'
                      }`}
                    >
                      {isSelected ? `✓ ${activity}` : `+ ${activity}`}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <label htmlFor="date-plan-textarea" className="block text-xs font-medium text-rose-900">
                  Your Written Plan for Monday, 9th November 2026
                </label>
                <textarea
                  id="date-plan-textarea"
                  rows={4}
                  placeholder="Write down where you want to go, what you are craving to eat, and how we should spend every hour of our Monday date..."
                  value={submission.datePlanText}
                  onChange={(e) => {
                    onChange({ ...submission, datePlanText: e.target.value });
                    setErrors((prev) => ({ ...prev, datePlanText: undefined }));
                  }}
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-[#FFFDFC] p-4 text-sm leading-relaxed text-[#2D0A16] focus:border-rose-600 focus:outline-none"
                />
              </div>

              {errors.datePlanText && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.datePlanText}</span>
                </p>
              )}
            </Tilt3DCard>
          </motion.section>

          {/* SECTION 05: Write a Message That She Wants to Send Me */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Tilt3DCard
              intensity={5}
              floatDelay={0.35}
              className="rounded-2xl border border-rose-200 bg-white p-7 card-3d-love md:p-9"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-rose-700">
                    05. Your Love Note to Me (+26% Blush)
                  </div>
                  <h2 className="mt-1 font-serif-display text-2xl font-semibold text-[#330816] sm:text-3xl">
                    Write a Message You Want to Send Me
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...submission,
                      loveMessage:
                        'Happy Diwali my love! I love you so much, and I cannot wait to dress up for you and spend Monday, 9th Nov 2026 wrapped in your arms.',
                    });
                    setErrors((prev) => ({ ...prev, loveMessage: undefined }));
                  }}
                  className="text-xs font-medium text-rose-700 underline underline-offset-4 hover:text-rose-950 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Insert Sweet Poetic Starter
                </button>
              </div>

              <div className="mt-4">
                <label htmlFor="love-message-textarea" className="sr-only">
                  Message you want to send me
                </label>
                <textarea
                  id="love-message-textarea"
                  rows={4}
                  placeholder="Write a personal note, a secret wish, or tell me how much you love me..."
                  value={submission.loveMessage}
                  onChange={(e) => {
                    onChange({ ...submission, loveMessage: e.target.value });
                    setErrors((prev) => ({ ...prev, loveMessage: undefined }));
                  }}
                  className="w-full rounded-xl border border-rose-200 bg-[#FFFDFC] p-4 font-serif-display text-xl italic leading-relaxed text-[#2D0A16] focus:border-rose-600 focus:outline-none"
                />
              </div>

              {errors.loveMessage && (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.loveMessage}</span>
                </p>
              )}
            </Tilt3DCard>
          </motion.section>

          {/* Persuasive "Are You Sure? The Blush Meter Isn't Full Yet!" Modal / Alert Card */}
          <AnimatePresence>
            {showNotFullPrompt && !blushStats.isFull && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                role="dialog"
                aria-labelledby="blush-not-full-heading"
                className="rounded-2xl border-2 border-[#E11D48] bg-white p-8 shadow-2xl card-3d-love"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                  <Flame className="h-4 w-4 fill-[#E11D48]" />
                  <span>Wait a Second! Blush Meter Is Only at {blushStats.score}%!</span>
                </div>

                <h3
                  id="blush-not-full-heading"
                  className="mt-2 font-serif-display text-3xl font-semibold text-[#330816] sm:text-4xl"
                >
                  Are You Sure?! My Blush Meter Isn’t Full Yet!
                </h3>

                <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-[#6B293B]">
                  You cannot let me off the hook with only <strong>{blushStats.score}% Blush</strong>! Come on, fill up the rest of the meter so my heart overflows past 100% before we lock in Monday, 9th Nov 2026:
                </p>

                <ul className="mt-4 space-y-2 rounded-xl bg-rose-50/80 p-4 text-xs font-medium text-rose-950">
                  {blushStats.missingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Heart className="h-3.5 w-3.5 shrink-0 fill-[#E11D48] text-[#E11D48]" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowNotFullPrompt(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-6 py-3.5 text-xs font-semibold text-white shadow-md hover:bg-[#BE123C] cursor-pointer"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                    <span>Okay! Let Me Fill the Blush Meter to Overflow!</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Bar with Overflow Status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Tilt3DCard
              intensity={6}
              className="flex flex-col items-stretch justify-between gap-6 rounded-2xl border border-rose-200 bg-rose-950 p-6 sm:p-8 text-white card-3d-love sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-rose-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-rose-300" />
                  <span>
                    {blushStats.isOverflowing
                      ? `BLUSH METER OVERFLOWING AT ${blushStats.score}% — PLEASE DON'T KILL ME!`
                      : `Current Blush Rate: ${blushStats.score}% (Fill all steps to overflow past 100%!)`}
                  </span>
                </div>
                <p className="mt-1 font-serif-display text-xl sm:text-2xl font-semibold">
                  {blushStats.isOverflowing
                    ? 'You Did Everything! Please Don’t Kill Me With This Much Cuteness!'
                    : 'Create Our Official Date Pass & Send Me Your Blush Card'}
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#E11D48] px-5 py-3.5 sm:px-7 sm:py-4 text-xs sm:text-sm font-semibold text-white shadow-[0_12px_28px_rgba(225,29,72,0.45)] transition-transform hover:scale-105 hover:bg-[#BE123C] text-center cursor-pointer"
              >
                <MessageSquareHeart className="h-4 w-4 shrink-0" />
                <span>Seal Our 9th Nov Date &amp; Send to Him</span>
              </button>
            </Tilt3DCard>
          </motion.div>
        </form>
      </div>
    </div>
  );
};
