import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Heart, Sparkles, ChevronDown, Gift, Layers, Move } from 'lucide-react';
import {
  type DiyaItem,
  rotateDeck,
  getDiyaProgress,
  ALL_DIYAS_LIT_POPUP_MESSAGE,
} from '../utils/dateLogic';
import { FloatingDiyaParticles, Tilt3DCard } from './FloatingDiyaParticles';
import { logActivityEvent } from '../utils/cardCanvasRenderer';

interface DiwaliChapterProps {
  diyas: DiyaItem[];
  onLightDiya: (id: number) => void;
  onOpenSurprise: () => void;
}

interface StanzaCard {
  id: string;
  numberLabel: string;
  title: string;
  lines: string[];
  closingWhisper: string;
}

const INITIAL_STANZA_DECK: StanzaCard[] = [
  {
    id: 'stanza-1',
    numberLabel: 'Card 01 of 03',
    title: 'Before the Clay Lamps Were Ever Lit',
    lines: [
      'The city dresses its balconies in rows of earthen gold,',
      'And marigold garlands sway against the velvet November cold.',
      'Yet long before the first brass wick caught fire in the night,',
      'You walked into my ordinary days and turned them into light.',
    ],
    closingWhisper: 'Happy Diwali, my love — tap this card to place it at the back of the deck.',
  },
  {
    id: 'stanza-2',
    numberLabel: 'Card 02 of 03',
    title: 'Every Sparkle Borrowed From Your Eyes',
    lines: [
      'They call this the festival of lights, my love, and yet I swear,',
      'No silver sparkler rivals how the lamplight finds your hair.',
      'In every quiet prayer I whisper while the diyas glow,',
      'Your name is both the gratitude and the only home I know.',
    ],
    closingWhisper: 'You are my favorite poetry — tap to draw the next card.',
  },
  {
    id: 'stanza-3',
    numberLabel: 'Card 03 of 03',
    title: 'Happy Diwali, My Heart — I Love You',
    lines: [
      'So here is my confession, written plain in flame and rhyme:',
      'I love you past the reach of seasons, past the edge of time.',
      'And when the festive lanterns fade into Monday’s gentle sky,',
      'There is one wish still waiting—just for you and I.',
    ],
    closingWhisper: 'I love you endlessly — tap to cycle the deck again.',
  },
];

// Circular angles (in degrees) to arrange the 5 diyas in a round order
const ROUND_ANGLES_DEG = [-90, -18, 54, 126, 198];

export const DiwaliChapter: React.FC<DiwaliChapterProps> = ({
  diyas,
  onLightDiya,
  onOpenSurprise,
}) => {
  const [stanzaDeck, setStanzaDeck] = useState<StanzaCard[]>(INITIAL_STANZA_DECK);
  const [deckTapCount, setDeckTapCount] = useState(0);

  // Floating Draggable 3D Side Candle & Pop-up-to-side diya card state
  const [isDraggingCandle, setIsDraggingCandle] = useState(false);
  const [activePopupDiya, setActivePopupDiya] = useState<DiyaItem | null>(null);
  const [tuckedDiyaIds, setTuckedDiyaIds] = useState<number[]>([]);
  const [expandedSideId, setExpandedSideId] = useState<number | null>(null);
  const [showAshwiPopup, setShowAshwiPopup] = useState(false);
  const hasTriggeredAshwiPopup = useRef(false);

  const candleRef = useRef<HTMLDivElement | null>(null);
  const diyaRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const progress = getDiyaProgress(diyas);

  // Trigger the "Love you, My Ashwi" Pop-Up as soon as all 5 candles/diyas have been lit
  useEffect(() => {
    if (progress.allLit && !hasTriggeredAshwiPopup.current) {
      hasTriggeredAshwiPopup.current = true;
      setShowAshwiPopup(true);
      logActivityEvent('all_diyas_lit_ashwi_popup', 'All 5 diyas lit — showed Love you, My Ashwi pop-up');
    }
  }, [progress.allLit]);

  // Automatically tuck the popped-up card to the side after 2.6 seconds
  useEffect(() => {
    if (!activePopupDiya) return;
    const timer = setTimeout(() => {
      setTuckedDiyaIds((prev) =>
        prev.includes(activePopupDiya.id) ? prev : [...prev, activePopupDiya.id]
      );
      setActivePopupDiya(null);
    }, 2600);
    return () => clearTimeout(timer);
  }, [activePopupDiya]);

  const handleTapStanzaDeck = () => {
    setStanzaDeck((prev) => rotateDeck(prev));
    setDeckTapCount((prev) => prev + 1);
    logActivityEvent('stanza_card_flipped', `Flipped stanza deck (${deckTapCount + 1})`);
  };

  const triggerDiyaIgnition = (diya: DiyaItem) => {
    if (!diya.lit) {
      onLightDiya(diya.id);
      logActivityEvent('diya_lit', `Lit ${diya.label} (${diya.vowTitle})`);
    }
    if (activePopupDiya && activePopupDiya.id !== diya.id) {
      setTuckedDiyaIds((prev) =>
        prev.includes(activePopupDiya.id) ? prev : [...prev, activePopupDiya.id]
      );
    }
    setActivePopupDiya({ ...diya, lit: true });
  };

  // Check proximity between the dragged side candle flame and each diya in the circle
  const handleCandleDrag = () => {
    const candleEl = candleRef.current;
    if (!candleEl) return;
    const candleRect = candleEl.getBoundingClientRect();
    // Flame is near the top-center of the candle element
    const flameX = candleRect.left + candleRect.width / 2;
    const flameY = candleRect.top + 28;

    for (const diya of diyas) {
      if (diya.lit) continue;
      const diyaEl = diyaRefs.current[diya.id];
      if (!diyaEl) continue;
      const diyaRect = diyaEl.getBoundingClientRect();
      const diyaCenterX = diyaRect.left + diyaRect.width / 2;
      const diyaCenterY = diyaRect.top + diyaRect.height / 2;
      const distance = Math.hypot(flameX - diyaCenterX, flameY - diyaCenterY);
      if (distance < 95) {
        triggerDiyaIgnition(diya);
        break;
      }
    }
  };

  const handleDismissPopupToSide = () => {
    if (!activePopupDiya) return;
    setTuckedDiyaIds((prev) =>
      prev.includes(activePopupDiya.id) ? prev : [...prev, activePopupDiya.id]
    );
    setActivePopupDiya(null);
  };

  const tuckedDiyas = diyas.filter((d) => tuckedDiyaIds.includes(d.id));

  return (
    <div className="perspective-stage relative min-h-screen overflow-x-hidden bg-[#12090D] text-[#FAF3EB] selection:bg-amber-500/30 selection:text-amber-100">
      {/* POP-UP ONCE ALL 5 CANDLES / DIYAS HAVE BEEN LIT: "Love you, My Ashwi" */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showAshwiPopup && (
              <motion.div
                data-testid="all-diyas-ashwi-popup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAshwiPopup(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#12090D]/80 p-4 backdrop-blur-md"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 16 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ashwi-popup-heading"
                  className="w-full max-w-lg rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-[#2B101B] via-[#1E0B13] to-[#14070C] p-6 text-center text-[#FFFBF5] shadow-[0_0_70px_rgba(245,158,11,0.45)] sm:p-12"
                >
                  <div className="mx-auto flex items-center justify-center gap-3">
                    <Flame className="h-7 w-7 sm:h-8 sm:w-8 animate-flame fill-amber-300 text-amber-400" />
                    <Heart className="h-9 w-9 sm:h-10 sm:w-10 animate-heartbeat-fast fill-[#E11D48] text-[#E11D48]" />
                    <Flame className="h-7 w-7 sm:h-8 sm:w-8 animate-flame fill-amber-300 text-amber-400" />
                  </div>

                  <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>All 5 Diwali Flames Lit</span>
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  </div>

                  <h2
                    id="ashwi-popup-heading"
                    data-testid="ashwi-popup-heading"
                    className="mt-4 sm:mt-5 font-serif-display text-4xl font-bold tracking-tight text-amber-200 drop-shadow-[0_4px_20px_rgba(251,191,36,0.4)] sm:text-6xl"
                  >
                    {ALL_DIYAS_LIT_POPUP_MESSAGE}
                  </h2>

                  <p className="mt-3 sm:mt-4 text-xs leading-relaxed text-[#E6D7C8] sm:text-base">
                    Every single flame in our circle is glowing just for you. Scroll down a little further—something special is waiting for you below!
                  </p>

                  <div className="mt-6 sm:mt-8 flex justify-center">
                    <button
                      type="button"
                      data-testid="close-ashwi-popup-btn"
                      onClick={() => setShowAshwiPopup(false)}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 sm:px-8 text-xs sm:text-sm font-bold text-[#180B10] shadow-[0_12px_30px_rgba(245,158,11,0.45)] transition-transform hover:scale-105 hover:bg-amber-300 cursor-pointer"
                    >
                      <Heart className="h-4 w-4 shrink-0 fill-[#180B10]" />
                      <span>Continue to Your Surprise</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Particle Effect of Glowing Floating Diyas Drifting Across the Background */}
      <FloatingDiyaParticles />

      {/* Ambient Diwali warm glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-45"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(245, 158, 11, 0.2), transparent 45%), radial-gradient(circle at 80% 70%, rgba(225, 29, 72, 0.16), transparent 50%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1160px] px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12 md:pt-20">
        {/* SECTION 1: 3D FLOATING HERO ("For Mine" + Cute Scroll Down Sign) */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-[75vh] sm:min-h-[82vh] flex flex-col justify-between"
        >
          <div className="mx-auto w-full max-w-3xl">
            {/* Centered 3D Floating 'For Mine' Poetic Opening (Photo Removed) */}
            <Tilt3DCard
              intensity={6}
              floatDelay={0.1}
              className="flex flex-col justify-center rounded-3xl border border-amber-500/30 bg-[#180C12]/85 p-6 text-center backdrop-blur-md card-3d-surface sm:p-12"
            >
              <div className="mx-auto mb-3 sm:mb-4 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>Happy Diwali 2026 · Exclusive For You</span>
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              </div>

              <h1
                className="font-serif-display text-4xl font-semibold leading-[1.05] tracking-tight text-[#FFFBF5] drop-shadow-[0_6px_18px_rgba(245,158,11,0.25)] sm:text-6xl lg:text-7xl"
                style={{ textWrap: 'balance' }}
              >
                For Mine
              </h1>

              <p className="mt-3 sm:mt-4 font-serif-display text-xl italic text-amber-300 sm:text-3xl">
                Happy Diwali, My Love — I Love You More Than All the Lights in the Sky.
              </p>

              <p className="mx-auto mt-4 sm:mt-6 max-w-[58ch] text-sm leading-relaxed text-[#E6D7C8] sm:text-lg">
                Tonight, a million earthen diyas flicker and float across the night, yet none of them illuminate my life the way your smile does. Every flame tonight is a quiet thank-you to the universe for making you mine.
              </p>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-amber-500/20">
                <blockquote className="font-serif-display text-xl italic leading-snug text-amber-200 sm:text-3xl">
                  “I love you—not only for the light you bring into my brightest days, but for being the warm flame that makes every night feel like home.”
                </blockquote>
              </div>
            </Tilt3DCard>
          </div>

          {/* Small Cute 3D Floating Sign Saying to Scroll Down */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-col items-center justify-center text-center"
          >
            <a
              href="#stanza-deck-section"
              aria-label="Scroll down to read your poem"
              className="animate-float-3d group inline-flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl border border-amber-400/40 bg-[#1E0F16]/95 px-5 py-3 sm:px-6 sm:py-3.5 text-amber-200 shadow-[0_16px_32px_rgba(0,0,0,0.5)] transition-all hover:scale-105 hover:border-amber-400"
            >
              <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
                <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-400 text-rose-400 animate-bounce" />
                <span>Psst... scroll down slowly, my love</span>
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              </div>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-4 w-4 text-amber-300" />
              </motion.div>
            </a>
          </motion.div>
        </motion.section>

        {/* SECTION 2: 3D FLOATING STANZA DECK OF CARDS (Revealed on Scroll) */}
        <motion.section
          id="stanza-deck-section"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 sm:mt-28 flex flex-col items-center justify-center py-8 sm:py-12"
        >
          <Tilt3DCard intensity={9} className="relative h-[430px] w-full max-w-[650px] sm:h-[380px]">
            <AnimatePresence mode="popLayout">
              {stanzaDeck.map((card, index) => {
                const isTopCard = index === 0;
                const yOffset = index * 14;
                const zOffset = -index * 30;
                const scale = 1 - index * 0.045;
                const rotate = index === 0 ? 0 : index === 1 ? -2.5 : 2.8;
                const zIndex = 30 - index * 10;

                return (
                  <motion.article
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{
                      opacity: 1 - index * 0.16,
                      scale,
                      y: yOffset,
                      z: zOffset,
                      rotate,
                      zIndex,
                    }}
                    exit={{
                      opacity: 0,
                      x: 180,
                      rotate: 10,
                      scale: 0.88,
                      transition: { duration: 0.35 },
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 26,
                    }}
                    onClick={isTopCard ? handleTapStanzaDeck : undefined}
                    role={isTopCard ? 'button' : undefined}
                    tabIndex={isTopCard ? 0 : -1}
                    aria-label={
                      isTopCard
                        ? `${card.title}. Tap card to put it at the back of the deck and reveal the next stanza.`
                        : card.title
                    }
                    onKeyDown={(e) => {
                      if (isTopCard && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleTapStanzaDeck();
                      }
                    }}
                    className={`absolute inset-x-0 top-0 rounded-2xl border p-5 sm:p-8 md:p-10 transition-shadow select-none ${
                      isTopCard
                        ? 'border-amber-400/80 bg-gradient-to-b from-[#2A141F] to-[#190B12] shadow-[0_26px_50px_rgba(0,0,0,0.65)] cursor-pointer'
                        : 'border-amber-500/25 bg-[#180C12] pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-amber-300/90">
                      <span>{card.numberLabel}</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-300">
                        <Layers className="h-3.5 w-3.5 shrink-0" />
                        <span>Tap card for next stanza</span>
                      </span>
                    </div>

                    <h2 className="mt-2.5 sm:mt-3 font-serif-display text-2xl font-semibold text-[#FFFBF5] sm:text-4xl">
                      {card.title}
                    </h2>

                    <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-2.5 font-serif-display text-base italic leading-relaxed text-[#F5E6D8] sm:text-2xl">
                      {card.lines.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-amber-200/80">
                      <span>{card.closingWhisper}</span>
                      <span className="font-mono tabular-nums">
                        Flips: {deckTapCount}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </Tilt3DCard>
        </motion.section>

        {/* SECTION 3: FLOATING DRAGGABLE 3D CANDLE + DIYAS ARRANGED IN A ROUND CIRCULAR ORDER (RESPONSIVE FOR MOBILE & DESKTOP) */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 sm:mt-28 pt-12 sm:pt-16 border-t border-amber-500/15"
        >
          <div className="flex flex-col items-center text-center px-2">
            <div className="text-xs tracking-wide text-amber-300/90">
              3D Draggable Side Candle &amp; Diya Circle · {progress.litCount} of {progress.totalCount} Diyas Lit
            </div>
            <h2
              className="mt-2 font-serif-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FFFBF5]"
              style={{ textWrap: 'balance' }}
            >
              Drag the Floating 3D Candle to Light Each Diya
            </h2>
            <p className="mt-3 max-w-[64ch] text-xs sm:text-sm text-[#D6C3B3]">
              Drag the glowing 3D candle flame over the circle of diyas to light them one by one (or tap any diya directly). Watch each secret vow card pop up!
            </p>
          </div>

          {/* STAGE: CANDLE & ROUND DIYA CIRCLE */}
          <div className="relative mx-auto mt-8 sm:mt-12 flex flex-col items-center gap-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8">
            {/* FLOATING DRAGGABLE 3D CANDLE (CENTERED ON MOBILE, LEFT ON DESKTOP) */}
            <div className="relative z-50 flex flex-col items-center justify-center lg:col-span-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300/90 mb-1 sm:mb-2">
                <Move className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Drag Candle to Diyas →</span>
                <span className="sm:hidden">Drag Candle onto Any Diya ↓</span>
              </div>

              {/* DRAGGABLE COMPACT 3D WAX CANDLE */}
              <motion.div
                ref={candleRef}
                data-testid="floating-side-candle"
                drag
                dragSnapToOrigin
                dragElastic={0.9}
                dragMomentum={false}
                onDragStart={() => setIsDraggingCandle(true)}
                onDrag={handleCandleDrag}
                onDragEnd={() => setIsDraggingCandle(false)}
                whileHover={{ scale: 1.08 }}
                whileDrag={{ scale: 1.14, rotateZ: 6 }}
                style={{ zIndex: 90 }}
                className="relative z-50 flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing select-none touch-none"
              >
                {/* 3D Multi-Layered Candle Flame */}
                <div className="relative flex flex-col items-center">
                  <div className="pointer-events-none absolute -top-3 h-12 w-12 rounded-full bg-amber-400/55 blur-lg" />
                  <svg
                    width="26"
                    height="38"
                    viewBox="0 0 36 52"
                    fill="none"
                    className="animate-flame drop-shadow-[0_0_16px_rgba(251,191,36,1)]"
                  >
                    <path
                      d="M18 2C18 2 33 17 33 31.5C33 41.2 26.3 48 18 48C9.7 48 3 41.2 3 31.5C3 17 18 2 18 2Z"
                      fill="url(#sideCandleFlameOuter)"
                    />
                    <path
                      d="M18 14C18 14 26.5 23.5 26.5 32.5C26.5 38.2 22.7 42.5 18 42.5C13.3 42.5 9.5 38.2 9.5 32.5C9.5 23.5 18 14 18 14Z"
                      fill="#FEF08A"
                    />
                    <ellipse cx="18" cy="38" rx="3.5" ry="5" fill="#FFFFFF" />
                    <defs>
                      <linearGradient
                        id="sideCandleFlameOuter"
                        x1="18"
                        y1="2"
                        x2="18"
                        y2="48"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FDE047" />
                        <stop offset="0.6" stopColor="#F59E0B" />
                        <stop offset="1" stopColor="#EA580C" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="-mt-1 h-2 w-0.5 rounded-full bg-amber-950" />
                </div>

                {/* Compact 3D Cylindrical Wax Pillar Body */}
                <div className="relative flex flex-col items-center">
                  <div className="z-10 h-2.5 w-10 rounded-full border border-amber-200/70 bg-gradient-to-r from-amber-200 via-amber-50 to-amber-300 shadow-inner" />
                  <div className="-mt-1.5 relative h-12 w-9 sm:h-14 sm:w-10 rounded-b-xl border-x border-b border-amber-300/40 bg-gradient-to-r from-[#D97706] via-[#FEF3C7] to-[#B45309] shadow-[inset_-5px_-4px_12px_rgba(120,53,15,0.55),0_12px_24px_rgba(0,0,0,0.75)]">
                    <div className="absolute left-1.5 top-0.5 h-5 w-1 rounded-full bg-amber-100/90" />
                    <div className="absolute left-4 top-0.5 h-7 sm:h-8 w-1.5 rounded-full bg-amber-50/90" />
                    <div className="absolute right-2 top-0.5 h-5 sm:h-6 w-1 rounded-full bg-amber-200/85" />
                  </div>
                  <div className="-mt-0.5 h-2.5 w-12 sm:w-14 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-800 shadow-md" />
                </div>

                <span className="mt-1.5 text-[11px] font-semibold text-amber-200 drop-shadow">
                  {isDraggingCandle ? 'Touch Any Diya!' : 'Drag 3D Candle'}
                </span>
              </motion.div>
            </div>

            {/* CIRCULAR / ROUND ORDER OF 3D DIYAS (SCALED FOR ALL MOBILE & DESKTOP SCREEN WIDTHS) */}
            <div className="relative z-20 w-full overflow-hidden py-2 sm:py-4 lg:col-span-9">
              <div
                data-testid="round-diya-circle"
                className="relative mx-auto h-[350px] min-[380px]:h-[380px] w-full max-w-[340px] sm:h-[500px] sm:max-w-[500px] lg:h-[580px] lg:max-w-[620px] flex items-center justify-center"
              >
                {/* Glowing Decorative Circular Orbit Rings */}
                <div className="pointer-events-none absolute h-[236px] w-[236px] min-[380px]:h-[270px] min-[380px]:w-[270px] sm:h-[390px] sm:w-[390px] lg:h-[460px] lg:w-[460px] rounded-full border border-dashed border-amber-400/35 shadow-[0_0_70px_rgba(245,158,11,0.14)_inset]" />
                <div className="pointer-events-none absolute h-[116px] w-[116px] min-[380px]:h-[130px] min-[380px]:w-[130px] sm:h-[180px] sm:w-[180px] lg:h-[210px] lg:w-[210px] rounded-full border border-amber-500/20 bg-amber-500/[0.03] flex flex-col items-center justify-center p-2 sm:p-6 text-center">
                  <Sparkles className="h-3.5 w-3.5 sm:h-6 sm:w-6 text-amber-300/80" />
                  <span className="mt-0.5 font-serif-display text-sm min-[380px]:text-base sm:text-2xl font-semibold text-amber-200">
                    {progress.litCount} / {progress.totalCount} Lit
                  </span>
                  <span className="text-[8px] sm:text-[11px] text-amber-100/70">
                    Touch flame or tap
                  </span>
                </div>

                {/* 5 FLOATING 3D DIYAS ARRANGED IN A RESPONSIVE ROUND CIRCLE */}
                {diyas.map((diya, index) => {
                  const angleDeg = ROUND_ANGLES_DEG[index % ROUND_ANGLES_DEG.length];
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const cosVal = Math.cos(angleRad);
                  const sinVal = Math.sin(angleRad);

                  return (
                    <motion.button
                      key={diya.id}
                      ref={(el) => {
                        diyaRefs.current[diya.id] = el;
                      }}
                      type="button"
                      style={{
                        left: `calc(50% + var(--circle-radius, 118px) * ${cosVal})`,
                        top: `calc(50% + var(--circle-radius, 118px) * ${sinVal})`,
                      }}
                      initial={{ opacity: 0, scale: 0.7 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false, amount: 0.2 }}
                      whileHover={{ scale: 1.07 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                      onClick={() => triggerDiyaIgnition(diya)}
                      aria-pressed={diya.lit}
                      aria-label={`Light ${diya.label} with 3D candle`}
                      className={`[--circle-radius:102px] min-[380px]:[--circle-radius:118px] sm:[--circle-radius:180px] lg:[--circle-radius:220px] -translate-x-1/2 -translate-y-1/2 absolute z-20 flex w-[84px] min-[380px]:w-24 sm:w-36 lg:w-44 flex-col items-center rounded-xl sm:rounded-2xl border p-1.5 sm:p-3 lg:p-4 text-center transition-shadow cursor-pointer card-3d-surface ${
                        diya.lit
                          ? 'border-amber-300 bg-gradient-to-b from-[#331722] to-[#1A0B11] shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                          : 'border-amber-500/35 bg-[#180C12]/95 hover:border-amber-400/75'
                      }`}
                    >
                      <span className="text-[8px] sm:text-[10px] lg:text-[11px] font-medium text-amber-300/90 truncate max-w-full">
                        {diya.label}
                      </span>

                      {/* 3D Clay Diya with Flame */}
                      <div className="my-1 sm:my-2 lg:my-2.5 flex flex-col items-center">
                        <div className="h-5 sm:h-8 lg:h-9 flex items-end justify-center">
                          {diya.lit ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 340, damping: 16 }}
                            >
                              <Flame className="h-5 w-5 sm:h-8 sm:w-8 lg:h-9 lg:w-9 animate-flame text-amber-400 fill-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.98)]" />
                            </motion.div>
                          ) : (
                            <div className="h-2 w-1 sm:h-3 sm:w-1.5 rounded-full bg-amber-200/40" />
                          )}
                        </div>
                        {/* 3D Sculpted Terracotta Bowl */}
                        <div
                          className={`h-4 w-11 min-[380px]:w-12 sm:h-7 sm:w-20 lg:h-8 lg:w-24 rounded-b-full border-t-2 shadow-inner transition-colors ${
                            diya.lit
                              ? 'border-amber-300 bg-gradient-to-r from-[#9A3412] via-[#D97706] to-[#7C2D12]'
                              : 'border-amber-500/40 bg-gradient-to-r from-[#4B221B] via-[#6D3227] to-[#2B110E]'
                          }`}
                        />
                      </div>

                      <span className="text-[9px] sm:text-xs font-semibold text-amber-100">
                        {diya.lit ? 'Lit!' : 'Light'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pop-Up 3D Center Card (Reveals when lighting a diya, then tucks to the side) */}
          <div className="mt-6 sm:mt-8 min-h-[140px] sm:min-h-[160px] flex items-center justify-center px-2">
            <AnimatePresence mode="wait">
              {activePopupDiya ? (
                <motion.div
                  key={activePopupDiya.id}
                  initial={{ opacity: 0, scale: 0.85, y: 24, rotateX: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                  exit={{
                    opacity: 0,
                    x: 340,
                    scale: 0.72,
                    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                  }}
                  role="status"
                  aria-live="polite"
                  className="w-full max-w-xl rounded-2xl border border-amber-300/75 bg-gradient-to-r from-[#2D151F] via-[#241019] to-[#2D151F] p-5 sm:p-7 shadow-2xl card-3d-surface"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Flame className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                      <span>{activePopupDiya.label} — Revealed!</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDismissPopupToSide}
                      className="text-amber-200/80 underline underline-offset-4 hover:text-white cursor-pointer"
                    >
                      Tuck to Side Now →
                    </button>
                  </div>
                  <h3 className="mt-2 font-serif-display text-2xl sm:text-3xl font-semibold text-[#FFFBF5]">
                    {activePopupDiya.vowTitle}
                  </h3>
                  <p className="mt-2 font-serif-display text-lg sm:text-xl italic text-amber-100">
                    “{activePopupDiya.vowLine}”
                  </p>
                </motion.div>
              ) : (
                <div className="text-center text-xs text-[#A69080]">
                  {tuckedDiyas.length > 0
                    ? `${tuckedDiyas.length} lit vow card(s) tucked safely on the right edge of your screen.`
                    : 'Drag the floating 3D candle onto any diya in the circle to pop up its love note.'}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Tucked Vow Cards Docked on the Right Side of the Viewport */}
        {tuckedDiyas.length > 0 && (
          <aside
            aria-label="Lit diya vow cards tucked to the side"
            className="fixed right-0 top-1/3 z-30 flex flex-col items-end gap-2 pr-0"
          >
            {tuckedDiyas.map((tucked) => {
              const isExpanded = expandedSideId === tucked.id;
              return (
                <motion.div
                  key={tucked.id}
                  initial={{ x: 120, opacity: 0 }}
                  animate={{ x: isExpanded ? 0 : 'calc(100% - 46px)', opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  className="flex items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSideId((prev) => (prev === tucked.id ? null : tucked.id))
                    }
                    aria-expanded={isExpanded}
                    aria-label={`Peek at tucked vow card: ${tucked.vowTitle}`}
                    className="flex items-center gap-3 rounded-l-xl border border-r-0 border-amber-400/50 bg-[#26121B]/95 px-3.5 py-2.5 sm:px-4 sm:py-3 text-left shadow-xl backdrop-blur-md cursor-pointer"
                  >
                    <Flame className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    <div className="w-48 sm:w-56">
                      <div className="text-[11px] font-semibold text-amber-300">
                        {tucked.vowTitle}
                      </div>
                      <div className="mt-0.5 text-xs text-amber-100/90 line-clamp-2">
                        {tucked.vowLine}
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </aside>
        )}

        {/* SECTION 4: FURTHER SCROLLING 3D SURPRISE INVITATION WITH PULSING SURPRISE BUTTON */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 sm:mt-32"
        >
          <Tilt3DCard
            intensity={7}
            className="rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#251119] to-[#180B10] p-6 sm:p-10 text-center card-3d-surface md:p-14"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 animate-float-slow">
              <Gift className="h-6 w-6" />
            </div>

            <h2
              className="mt-4 sm:mt-5 font-serif-display text-3xl font-semibold text-[#FFFBF5] sm:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              You Scrolled All the Way Down... Ready to see something?
            </h2>

            <p className="mx-auto mt-3 max-w-[54ch] text-sm sm:text-base text-[#E6D7C8]">
              Now that you got your diwali wishes, I have one waiting for you on the next page. Once you step inside, there is no turning back!
            </p>

            <div className="mt-7 sm:mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  logActivityEvent('surprise_button_clicked', 'Entered the Surprise Date page');
                  onOpenSurprise();
                }}
                className="animate-surprise-pulse relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-amber-400 px-5 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-[#180B10] transition-colors hover:bg-amber-300 text-center cursor-pointer"
              >
                <Sparkles className="h-5 w-5 shrink-0" />
                <span>Oiee, Click Here</span>
              </button>
            </div>
          </Tilt3DCard>
        </motion.section>
      </div>
    </div>
  );
};
