import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Download,
  Camera,
  Check,
  Sparkles,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import {
  type DatePlanSubmission,
  formatRomanticTimeLabel,
  calculateBlushMeter,
  getDressPhotos,
  getBlushPhotos,
  getPhotoCounts,
} from '../utils/dateLogic';
import {
  renderDateCardToDataUrl,
  saveFinalSubmissionToServer,
  logActivityEvent,
} from '../utils/cardCanvasRenderer';
import { Tilt3DCard } from './FloatingDiyaParticles';

interface DateKeepsakeCardProps {
  submission: DatePlanSubmission;
  noAttemptsCount: number;
  onEditPlan: () => void;
  onTryToGoBack: () => void;
}

export const DateKeepsakeCard: React.FC<DateKeepsakeCardProps> = ({
  submission,
  noAttemptsCount,
  onTryToGoBack,
}) => {
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [savedToServer, setSavedToServer] = useState(false);
  const [showSuggestionPopup, setShowSuggestionPopup] = useState<boolean>(true);

  const timeInfo = formatRomanticTimeLabel(submission.selectedTime);
  const blushStats = calculateBlushMeter(submission);
  const dressPhotos = getDressPhotos(submission);
  const blushPhotos = getBlushPhotos(submission);
  const photoCounts = getPhotoCounts(submission);

  // Automatically render the adaptive Date Card PNG and save everything to the backend server for him
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dataUrl = await renderDateCardToDataUrl(submission);
      if (cancelled) return;
      setCardDataUrl(dataUrl);
      const ok = await saveFinalSubmissionToServer(submission, noAttemptsCount, dataUrl);
      if (!cancelled && ok) {
        setSavedToServer(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submission, noAttemptsCount]);

  // Reliable Blob download that works across both PC browsers and Mobile (iOS Safari / Android Chrome)
  const triggerPngDownload = async (filename: string): Promise<string> => {
    const dataUrl = cardDataUrl || (await renderDateCardToDataUrl(submission));
    if (!cardDataUrl && dataUrl) setCardDataUrl(dataUrl);
    if (!dataUrl) return '';

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      return dataUrl;
    } catch {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return dataUrl;
    }
  };

  const handleDownloadCard = async () => {
    await triggerPngDownload('for-mine-monday-9th-nov-2026-card.png');
    logActivityEvent(
      'final_card_downloaded',
      `Downloaded adaptive Date Card PNG with ${photoCounts.totalCount} photos`
    );
    setShowSuggestionPopup(false);
    setStatusBanner(
      'Your Official 9th Nov 2026 Date Card PNG has been downloaded! Don’t forget to send it to him and put it on your Story!'
    );
  };

  return (
    <div className="perspective-stage min-h-screen bg-[#FFF8F6] text-[#2D0A16] selection:bg-rose-200 selection:text-rose-950">
      {/* POP-UP SUGGESTING HER TO SEND IT TO HIM & PUT IT ON HER STORY (ONLY BUTTON IS DOWNLOAD CARD) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showSuggestionPopup && (
              <motion.div
                data-testid="final-card-popup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSuggestionPopup(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A040C]/75 p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 16 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="popup-card-ready-title"
                  className="w-full max-w-lg rounded-3xl border-2 border-amber-300/75 bg-gradient-to-b from-[#2B0714] via-[#4C0519] to-[#1F040D] p-6 text-center text-[#FFF8F6] shadow-[0_28px_70px_rgba(0,0,0,0.65)] sm:p-10"
                >
                  <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-amber-300/40 bg-rose-500/20 text-amber-300 shadow-inner">
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-[#E11D48] text-[#E11D48] animate-heartbeat-fast" />
                  </div>

                  <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-amber-300/35 bg-white/10 px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {photoCounts.totalCount} Photo{photoCounts.totalCount === 1 ? '' : 's'} Sealed · Blush Rate {blushStats.score}%
                    </span>
                  </div>

                  <h2
                    id="popup-card-ready-title"
                    className="mt-3 font-serif-display text-2xl font-bold text-white sm:text-4xl"
                  >
                    Send This Card to Me &amp; Put It on Your Story!
                  </h2>

                  <p className="mt-3 text-xs leading-relaxed text-rose-100/90 sm:text-base">
                    Your official <strong>Monday, 9th Nov 2026 Date Card</strong> is ready with all your details and photos! Download your card below, <strong>send it to me</strong> so I can see what you planned, and <strong>put it on your Story</strong>!
                  </p>

                  {/* THE ONLY BUTTON IN THE POP-UP: DOWNLOAD CARD */}
                  <div className="mt-6 sm:mt-7 flex justify-center">
                    <button
                      type="button"
                      data-testid="popup-download-card-btn"
                      onClick={handleDownloadCard}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-[#E11D48] px-6 py-3.5 sm:px-8 sm:py-4 text-sm font-bold text-white shadow-[0_14px_34px_rgba(225,29,72,0.5)] transition-transform hover:scale-105 hover:bg-[#BE123C] cursor-pointer"
                    >
                      <Download className="h-5 w-5 shrink-0" />
                      <span>Download Card</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12 md:py-16">
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
            <span>For Mine · Final Keepsake Card</span>
            <span aria-hidden="true">·</span>
            <span>{savedToServer ? 'Saved & Sent to Him ✓' : 'Monday, 9th Nov 2026'}</span>
          </div>
        </div>

        {/* Header with Photo Counter & Download Card Action */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start justify-between gap-6 border-b border-rose-200 pb-8 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-rose-700">
              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
              <span>For Mine · All Details Sealed in One Adaptive Card</span>
              <span aria-hidden="true">·</span>
              <span
                data-testid="card-photos-counter"
                className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2.5 py-0.5 font-mono font-bold text-[#E11D48]"
              >
                <Camera className="h-3 w-3" />
                <span>
                  {photoCounts.totalCount} Photo{photoCounts.totalCount === 1 ? '' : 's'} Added ({photoCounts.dressCount} Dress · {photoCounts.blushCount} Blush)
                </span>
              </span>
            </div>
            <h1
              className="mt-2 font-serif-display text-4xl font-semibold tracking-tight text-[#330816] sm:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              Your Official Monday, 9th Nov 2026 Date Card
            </h1>
            <p className="mt-2 max-w-[65ch] text-sm text-[#6B293B]">
              Download your official Date Card below, send it to me, and put it on your Story! Every photo holder below adapts naturally to the exact size of your photos without stretching or cropping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="download-card-btn"
              onClick={handleDownloadCard}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-6 py-3.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(225,29,72,0.3)] transition-transform hover:scale-105 hover:bg-[#BE123C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Card</span>
            </button>
          </div>
        </motion.div>

        {/* Status Confirmation Banner */}
        {statusBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            aria-live="polite"
            className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-950"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[#E11D48]" />
              <span>{statusBanner}</span>
            </div>
          </motion.div>
        )}

        {/* THE ALL-IN-ONE 3D FLOATING ADAPTIVE MASTER DATE CARD */}
        <motion.section
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-10"
        >
          <Tilt3DCard
            intensity={5}
            data-testid="final-master-card"
            className="overflow-hidden rounded-3xl border-2 border-amber-300/70 bg-gradient-to-b from-[#2B0714] via-[#4C0519] to-[#1F040D] p-5 text-[#FFF8F6] shadow-[0_32px_70px_rgba(76,5,25,0.45)] card-3d-love sm:p-8 md:p-12"
          >
            {/* Card Top Header */}
            <div className="flex flex-col justify-between gap-5 border-b border-amber-400/30 pb-6 sm:pb-8 md:flex-row md:items-center">
              <div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300">
                  For Mine · Official Romantic Date Pass · {photoCounts.totalCount} Photo{photoCounts.totalCount === 1 ? '' : 's'} Added
                </div>
                <h2 className="mt-2 font-serif-display text-3xl font-bold text-white sm:text-5xl">
                  Monday, 9th November 2026
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-rose-200">
                  {submission.timeSlotTitle || timeInfo.atmosphereLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-2xl border border-amber-400/35 bg-white/10 px-4 py-3.5 sm:px-6 sm:py-4 backdrop-blur-sm">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-200">
                    Selected Time
                  </div>
                  <div className="mt-0.5 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {timeInfo.formatted12h}
                  </div>
                </div>
                <div className="hidden sm:block h-10 w-px bg-amber-300/30" />
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    His Blush Rate
                  </div>
                  <div className="mt-0.5 font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                    {blushStats.score}% OVERFLOW!
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row inside the Unified Card: Adaptive Multi-Photo Holders (Zero Stretching / Zero Cropping) */}
            <div className="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              {/* Dress Photo(s) Adaptive Holder */}
              <div className="overflow-hidden rounded-2xl border border-amber-300/30 bg-[#FFF8F6] p-4 text-[#2D0A16]">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-rose-700">
                  <span>HER DRESS SNEAK PEEK ({photoCounts.dressCount})</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> 09 Nov 2026
                  </span>
                </div>

                <div className="space-y-3">
                  {dressPhotos.map((photoUrl, idx) => (
                    <div
                      key={`card-dress-${idx}`}
                      className="flex items-center justify-center overflow-hidden rounded-xl border border-rose-200/70 bg-[#2D0A16]/5"
                    >
                      <img
                        src={photoUrl}
                        alt={`The dress she is going to wear on Monday 9th Nov 2026 (#${idx + 1})`}
                        referrerPolicy="no-referrer"
                        className="mx-auto block h-auto max-h-[540px] w-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/70">
                  <p className="font-serif-display text-2xl font-bold text-[#330816]">
                    {submission.dressName || 'Stunning Evening Couture'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B293B]">
                    Color Hint: <strong>{submission.dressColorNote || 'Surprise Couture'}</strong>
                  </p>
                </div>
              </div>

              {/* Blush Portrait(s) Adaptive Holder */}
              <div className="overflow-hidden rounded-2xl border border-amber-300/30 bg-[#FFF8F6] p-4 text-[#2D0A16]">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#E11D48]">
                  <span>
                    BLUSH PORTRAITS ({photoCounts.blushCount}) · {submission.blushVibe.toUpperCase()}
                  </span>
                  <span>Blush Rate: {blushStats.score}%</span>
                </div>

                <div className="space-y-3">
                  {blushPhotos.map((photoUrl, idx) => (
                    <div
                      key={`card-blush-${idx}`}
                      className="flex items-center justify-center overflow-hidden rounded-xl border border-rose-200/70 bg-[#2D0A16]/5"
                    >
                      <img
                        src={photoUrl}
                        alt={`Her uploaded photo #${idx + 1} to make him blush`}
                        referrerPolicy="no-referrer"
                        className="mx-auto block h-auto max-h-[540px] w-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/70">
                  <p className="font-serif-display text-2xl font-bold text-[#330816]">
                    {submission.blushCaption || 'The Smile That Makes My Heart Skip'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B293B]">
                    His Verdict: <strong>Please Don’t Kill Me With This Much Cuteness!</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row inside the Unified Card: Evening Plan + Personal Love Message */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-amber-300/30 bg-[#FFF8F6] p-6 text-[#2D0A16]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                  Our Evening Plan for Monday, 9th Nov 2026
                </div>
                <p className="mt-3 text-base leading-relaxed text-[#2D0A16] whitespace-pre-line">
                  {submission.datePlanText}
                </p>
                {submission.selectedActivities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-rose-200 text-xs text-[#6B293B]">
                    <strong className="text-rose-900">Highlights:</strong>{' '}
                    {submission.selectedActivities.join(' · ')}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-amber-300/30 bg-[#FFF8F6] p-6 text-[#2D0A16]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                  <Heart className="h-3.5 w-3.5 fill-[#E11D48]" />
                  <span>Her Personal Message to Me</span>
                </div>
                <blockquote className="mt-3 font-serif-display text-2xl italic leading-relaxed text-[#330816]">
                  “{submission.loveMessage}”
                </blockquote>
                <div className="mt-4 pt-3 border-t border-rose-200 text-xs text-rose-800">
                  My Reply: “Please don’t kill me—counting every second until Monday at {timeInfo.formatted12h}!”
                </div>
              </div>
            </div>

            {/* Footer inside the Unified Card */}
            <div className="mt-8 pt-6 border-t border-amber-400/25 flex flex-wrap items-center justify-center gap-4 text-xs text-amber-200/90">
              <span>Happy Diwali &amp; I Love You Forever · Sealed for Monday, 9th November 2026</span>
            </div>
          </Tilt3DCard>
        </motion.section>
      </div>
    </div>
  );
};
