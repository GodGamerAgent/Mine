export interface DiyaItem {
  id: number;
  label: string;
  vowTitle: string;
  vowLine: string;
  lit: boolean;
}

export interface StubbornState {
  noCount: number;
  message: string;
  subtext: string;
  yesButtonLabel: string;
  noButtonLabel: string;
  yesScale: number;
  noOffset: { x: number; y: number };
  noConvertedToYes: boolean;
}

export interface DatePlanSubmission {
  dateDay: string; // Fixed to "Monday, 9th November 2026"
  selectedTime: string;
  timeSlotTitle: string;
  dressImageUrl: string;
  dressImageUrls?: string[];
  dressName: string;
  dressColorNote: string;
  datePlanText: string;
  selectedActivities: string[];
  loveMessage: string;
  blushPhotoUrl: string;
  blushPhotoUrls?: string[];
  blushVibe: string;
  blushCaption: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<'selectedTime' | 'dressImageUrl' | 'datePlanText' | 'loveMessage' | 'blushPhotoUrl', string>>;
}

export interface BlushMeterStats {
  score: number;
  isFull: boolean;
  isOverflowing: boolean;
  verdict: string;
  overflowWarning: string | null;
  missingSteps: string[];
}

export interface NoRainState {
  count: number;
  targetCount: number;
  buttonLabel: string;
  promptText: string;
  headline: string;
  subtext: string;
  motivationLine: string;
  isPeak: boolean;
  progressPercent: number;
}

export const NO_RAIN_BUTTON_LABEL = 'Hope for No Rain Tomorrow';

const RAIN_CLICK_STEPS: Array<{
  headline: string;
  subtext: string;
  motivationLine: string;
}> = [
  // 0 clicks
  {
    headline: "ma'am. What about the rain?",
    subtext: 'Try clicking "Hope for No Rain Tomorrow" 30 times to manifest clear skies for our date!',
    motivationLine: 'Start tapping, pretty girl—your manifestation has power over tomorrow’s sky!',
  },
  // 1
  {
    headline: 'Ooh, first wish sent straight to the clouds!',
    subtext: 'One sweet tap from you and the sky is already paying attention.',
    motivationLine: 'Keep going... your manifestation has power!',
  },
  // 2
  {
    headline: "Wait, look how eagerly you're tapping already!",
    subtext: 'Two clicks in and I can already picture that cute smile on your face.',
    motivationLine: 'Don’t stop now—every tap from your fingers makes him fall harder.',
  },
  // 3
  {
    headline: 'Do you like him so much',
    subtext: 'Already bribing the weather gods just so nothing delays seeing him tomorrow?',
    motivationLine: 'Keep clicking, gorgeous—your crush on him is clearing the clouds!',
  },
  // 4
  {
    headline: 'Do you like him so much',
    subtext: 'Four taps! Someone really cannot wait to hold his hand on Monday.',
    motivationLine: 'Your manifestation is working... the rainclouds are starting to blush!',
  },
  // 5
  {
    headline: "Admit it, you're smiling at your screen right now!",
    subtext: 'Five clicks in and your eyes are already shining thinking about tomorrow.',
    motivationLine: 'Keep going, my Ashwi—5 down, 25 more to lock in pure sunshine!',
  },
  // 6
  {
    headline: 'The raindrops just heard your name and started backing away!',
    subtext: 'Even the weather knows better than to stand between you and your man.',
    motivationLine: 'Tap a little faster, baby—your love energy is unstoppable!',
  },
  // 7
  {
    headline: 'Wait... your finger is clicking so fast!',
    subtext: 'Is your heart beating this fast when you think about seeing him too?',
    motivationLine: 'Keep going... your manifestation has power and he’s all yours tomorrow!',
  },
  // 8
  {
    headline: 'Are you trying to break the speed record just to see his face?',
    subtext: 'Eight taps! He is going to tease you so much when he sees how hard you clicked.',
    motivationLine: 'Don’t slow down now, cutie—every click brings Monday closer!',
  },
  // 9
  {
    headline: 'Look at that dedication from the prettiest girl alive!',
    subtext: 'Nine clicks! The dark clouds are officially packing their bags.',
    motivationLine: 'Keep tapping, sweetheart—your wish is the sky’s command!',
  },
  // 10
  {
    headline: 'Is he that important',
    subtext: '10/30 clicks! Be honest—is seeing him tomorrow really your #1 priority?',
    motivationLine: 'One-third of the way there! Keep going... your manifestation has power!',
  },
  // 11
  {
    headline: 'Is he that important',
    subtext: 'Eleven clicks! You wouldn’t tap this hard for anyone else on earth.',
    motivationLine: 'Keep going, baby girl—he’s already dreaming about how stunning you’ll look!',
  },
  // 12
  {
    headline: 'Tell the truth... how many times did you think about him today?',
    subtext: 'Twelve taps! Every single click is a little confession that you miss him.',
    motivationLine: 'Your manifestation power is rising—keep those pretty fingers tapping!',
  },
  // 13
  {
    headline: 'Even the sky knows who rules your heart!',
    subtext: 'Thirteen clicks! Cloud coverage is dropping fast because of you.',
    motivationLine: 'Keep going, my love—no storm can compete with how much you want him!',
  },
  // 14
  {
    headline: 'Not even a single drizzle is allowed near you two tomorrow!',
    subtext: 'Fourteen taps! You are single-handedly rewriting tomorrow’s weather forecast.',
    motivationLine: 'Almost halfway to 30! Keep manifesting that perfect romantic evening!',
  },
  // 15
  {
    headline: 'Halfway to 30! Look at you fighting the clouds for your man!',
    subtext: '15/30 clicks! If kissing you burned calories, he’d still never get tired.',
    motivationLine: 'Halfway mark unlocked—keep going, your manifestation has real power!',
  },
  // 16
  {
    headline: 'Even the weather forecast is blushing right now!',
    subtext: 'Sixteen taps! The meteorologists have never seen love this stubborn.',
    motivationLine: 'Keep tapping, hottie—you’re making the sun come out early just for us!',
  },
  // 17
  {
    headline: 'You really want that uninterrupted Monday date with him, huh?',
    subtext: 'Seventeen clicks! No umbrella needed when your love is this warm.',
    motivationLine: 'Don’t stop now—every click guarantees an extra tight hug tomorrow!',
  },
  // 18
  {
    headline: 'Look how cute you are when you want something this badly!',
    subtext: 'Eighteen taps! He’s already planning how to make you blush tomorrow night.',
    motivationLine: 'Keep going... your manifestation has power and only 12 clicks left!',
  },
  // 19
  {
    headline: 'God forbid a single raindrop ruins your outfit tomorrow!',
    subtext: 'Nineteen clicks! The sky is officially on VIP duty for our date.',
    motivationLine: 'Tap away, my queen—you’re turning Monday into pure magic!',
  },
  // 20
  {
    headline: 'Are you that madly in love with him',
    subtext: '20/30 clicks! Only someone head-over-heels in love clicks this hard for no rain!',
    motivationLine: '20 down, 10 to go! Keep going... your manifestation is on fire!',
  },
  // 21
  {
    headline: 'Are you that madly in love with him',
    subtext: 'Twenty-one taps! Your heart has clearly made up its mind about him.',
    motivationLine: 'Keep clicking, my love—only 9 more taps to reach peak romance!',
  },
  // 22
  {
    headline: 'Wait... are you blushing while reading these lines?',
    subtext: 'Twenty-two clicks! I bet you’re biting your lip trying not to smile.',
    motivationLine: 'Your manifestation power is at 73%—keep tapping those sweet fingers!',
  },
  // 23
  {
    headline: 'He is the luckiest guy alive to have you clicking this hard for him!',
    subtext: 'Twenty-three taps! Every raincloud within 100 miles just surrendered.',
    motivationLine: 'Only 7 clicks left—keep going, baby, you’re almost at the peak!',
  },
  // 24
  {
    headline: 'Your love is literally bossing the entire atmosphere around!',
    subtext: 'Twenty-four clicks! The stars are already polishing themselves for Monday night.',
    motivationLine: 'Keep going... your manifestation has power—just 6 more taps!',
  },
  // 25
  {
    headline: '25 Clicks! You are officially obsessed with your man (and he loves it)!',
    subtext: 'Only 5 taps left! Can you feel how close tomorrow’s date is getting?',
    motivationLine: 'Final 5 clicks! Pour all your love into these last taps, my Ashwi!',
  },
  // 26
  {
    headline: 'Just 4 more clicks! The sun just signed an exclusive contract with you!',
    subtext: 'Twenty-six taps! Zero percent chance of rain, 1000% chance of romance.',
    motivationLine: 'Keep tapping, gorgeous—4 more clicks to seal our clear skies!',
  },
  // 27
  {
    headline: '3 more clicks! Can you already feel him looking into your eyes tomorrow?',
    subtext: 'Twenty-seven taps! My heart is racing just thinking about seeing you.',
    motivationLine: 'Almost there—your manifestation power is about to hit 100%!',
  },
  // 28
  {
    headline: 'Only 2 clicks left! Your fingers deserve a kiss for working this hard!',
    subtext: 'Twenty-eight taps! Every cloud has officially left the chat.',
    motivationLine: 'Two more taps, my love—show the sky who’s boss!',
  },
  // 29
  {
    headline: 'One last click to reach 30 and seal eternal sunshine for our date!',
    subtext: 'Twenty-nine taps! Tap one final time to unleash maximum love power!',
    motivationLine: 'One final tap, baby—make this 30th click count!',
  },
  // 30 (Capped Peak)
  {
    headline: 'Okay...you guys love is at the peak. No rain can stop you guys seeing',
    subtext: '30/30 Peak Love Weather Shield Activated: Not a single raindrop dares to get in the way tomorrow!',
    motivationLine: '30/30 Manifestation Complete! Your power worked—nothing can stop us tomorrow ❤️✨',
  },
];

export function getNoRainState(rawCount: number): NoRainState {
  const targetCount = 30;
  const count = Math.min(targetCount, Math.max(0, Math.floor(rawCount)));
  const isPeak = count >= targetCount;
  const progressPercent = Math.min(100, Math.round((count / targetCount) * 100));
  const promptText =
    count < targetCount
      ? `Try clicking "${NO_RAIN_BUTTON_LABEL}" 30 times! (${count}/${targetCount} clicks)`
      : `30/30 Clicks Complete! Peak Manifestation Reached ✨`;

  const step = RAIN_CLICK_STEPS[count] ?? RAIN_CLICK_STEPS[RAIN_CLICK_STEPS.length - 1];

  return {
    count,
    targetCount,
    buttonLabel: NO_RAIN_BUTTON_LABEL,
    promptText,
    headline: step.headline,
    subtext: step.subtext,
    motivationLine: step.motivationLine,
    isPeak,
    progressPercent,
  };
}

export const CORRECT_PASSWORD_OPTION = 'Oiee';

export const PASSWORD_OPTIONS: string[] = [
  'Babe',
  'Baby',
  'Sweetheart',
  'Oiee',
  'Jaan',
  'Honey',
  'Cutie',
  'My Love',
];

export const INTRUDER_REDIRECT_MESSAGE = 'Get the fuck away from my man bitch';

export const ALL_DIYAS_LIT_POPUP_MESSAGE = 'Love you, My Ashwi';

export function verifyAshwiPassword(selectedOption: string): boolean {
  return selectedOption.trim().toLowerCase() === CORRECT_PASSWORD_OPTION.toLowerCase();
}

export const INITIAL_DIYAS: DiyaItem[] = [
  {
    id: 1,
    label: 'First Flame · Warmth',
    vowTitle: 'For Your Laughter',
    vowLine: 'May every shadow of this year bow before the golden sound of your laugh.',
    lit: true,
  },
  {
    id: 2,
    label: 'Second Flame · Devotion',
    vowTitle: 'For Your Quiet Grace',
    vowLine: 'Even a thousand earthen lamps envy the way your eyes hold the evening light.',
    lit: true,
  },
  {
    id: 3,
    label: 'Third Flame · Promise',
    vowTitle: 'For Our Tomorrows',
    vowLine: 'In every festival of light that follows, my favorite home will always be beside you.',
    lit: false,
  },
  {
    id: 4,
    label: 'Fourth Flame · Forever',
    vowTitle: 'For Our Monday Date',
    vowLine: 'After the fireworks fade into velvet night, Monday belongs entirely to us.',
    lit: false,
  },
  {
    id: 5,
    label: 'Fifth Flame · Eternity',
    vowTitle: 'For Saying I Love You',
    vowLine: 'I love you more than poetry knows how to measure, today and every Diwali to come.',
    lit: false,
  },
];

const STUBBORN_RESPONSES: Array<{
  message: string;
  subtext: string;
  yesLabel: string;
  noLabel: string;
  offset: { x: number; y: number };
}> = [
  {
    message: 'Are you completely ready for our Monday, 9th Nov 2026 Date?',
    subtext: 'Fair warning: My heart has already booked the calendar and refuses to take no for an answer.',
    yesLabel: 'Yes, I am ready!',
    noLabel: 'No, not yet',
    offset: { x: 0, y: 0 },
  },
  {
    message: 'Wait a second... did your finger slip toward "No"?',
    subtext: 'The Diwali lights are still glowing and the universe strictly forbids declining a Monday date with me.',
    yesLabel: 'Yes, take me on our Monday date!',
    noLabel: 'Still thinking...',
    offset: { x: 18, y: -10 },
  },
  {
    message: 'Nice try, my love! "No" is officially out of stock for 9th Nov 2026.',
    subtext: 'I already practiced how I am going to look at you across the table without blinking.',
    yesLabel: 'Okay YES, let us plan Monday!',
    noLabel: 'Are you sure?',
    offset: { x: -18, y: 12 },
  },
  {
    message: 'Stubbornness level: Maximum Romantic Override.',
    subtext: 'Look how warm and inviting that "Yes" button looks. It was practically tailor-made for you.',
    yesLabel: 'Yes! I love you, let us go!',
    noLabel: 'Wait really?',
    offset: { x: 22, y: -12 },
  },
  {
    message: 'Even the marigolds and candlelight voted 100-to-0 in favor of YES.',
    subtext: 'Every time you resist, I only fall a little deeper in love with how playful you are.',
    yesLabel: 'YES, 9th Nov 2026 is ours!',
    noLabel: 'You are so stubborn!',
    offset: { x: -16, y: 10 },
  },
  {
    message: 'Alright, I have rewritten the laws of physics: both buttons now mean YES.',
    subtext: 'Resistance is adorable, but our Monday, 9th November 2026 date is officially happening!',
    yesLabel: 'Yes, I surrender with love!',
    noLabel: 'Fine, YES (Stubborn Edition)!',
    offset: { x: 0, y: 0 },
  },
];

export function rotateDeck<T>(items: T[]): T[] {
  if (items.length <= 1) return items;
  return [...items.slice(1), items[0]];
}

export function toggleDiyaState(diyas: DiyaItem[], id: number): DiyaItem[] {
  return diyas.map((d) => (d.id === id ? { ...d, lit: !d.lit } : d));
}

export function lightSingleDiya(diyas: DiyaItem[], id: number): DiyaItem[] {
  return diyas.map((d) => (d.id === id ? { ...d, lit: true } : d));
}

export function lightAllDiyas(diyas: DiyaItem[]): DiyaItem[] {
  return diyas.map((d) => ({ ...d, lit: true }));
}

export function getDiyaProgress(diyas: DiyaItem[]): {
  litCount: number;
  totalCount: number;
  allLit: boolean;
  percentage: number;
} {
  const totalCount = diyas.length;
  const litCount = diyas.filter((d) => d.lit).length;
  const percentage = totalCount === 0 ? 0 : Math.round((litCount / totalCount) * 100);
  return {
    litCount,
    totalCount,
    allLit: litCount === totalCount && totalCount > 0,
    percentage,
  };
}

export function getStubbornState(noCount: number): StubbornState {
  const clampedIndex = Math.min(Math.max(0, noCount), STUBBORN_RESPONSES.length - 1);
  const entry = STUBBORN_RESPONSES[clampedIndex];
  const noConvertedToYes = clampedIndex === STUBBORN_RESPONSES.length - 1;
  const yesScale = Number(Math.min(1 + clampedIndex * 0.04, 1.16).toFixed(2));

  return {
    noCount,
    message: entry.message,
    subtext: entry.subtext,
    yesButtonLabel: entry.yesLabel,
    noButtonLabel: entry.noLabel,
    yesScale,
    noOffset: entry.offset,
    noConvertedToYes,
  };
}

export function formatRomanticTimeLabel(time24: string): {
  formatted12h: string;
  atmosphereLabel: string;
} {
  if (!time24 || !time24.includes(':')) {
    return { formatted12h: 'Not Selected Yet', atmosphereLabel: 'Pick a Time Above to Start Increasing His Blush Rate' };
  }
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return { formatted12h: time24, atmosphereLabel: 'Romantic Rendezvous' };
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const paddedMin = String(minute).padStart(2, '0');
  const formatted12h = `${hour12}:${paddedMin} ${period}`;

  let atmosphereLabel = 'Starlit Night';
  if (hour >= 6 && hour < 12) {
    atmosphereLabel = 'Sunlit Morning Coffee & Stroll';
  } else if (hour >= 12 && hour < 16) {
    atmosphereLabel = 'Golden Afternoon Escape';
  } else if (hour >= 16 && hour < 19) {
    atmosphereLabel = 'Sunset & Twilight Glow';
  } else if (hour >= 19 && hour < 22) {
    atmosphereLabel = 'Intimate Candlelight Dinner';
  }

  return { formatted12h, atmosphereLabel };
}

export function getDressPhotos(submission: DatePlanSubmission): string[] {
  if (Array.isArray(submission.dressImageUrls) && submission.dressImageUrls.length > 0) {
    return submission.dressImageUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
  }
  if (submission.dressImageUrl && submission.dressImageUrl.trim().length > 0) {
    return [submission.dressImageUrl.trim()];
  }
  return [];
}

export function getBlushPhotos(submission: DatePlanSubmission): string[] {
  if (Array.isArray(submission.blushPhotoUrls) && submission.blushPhotoUrls.length > 0) {
    return submission.blushPhotoUrls.filter((u) => typeof u === 'string' && u.trim().length > 0);
  }
  if (submission.blushPhotoUrl && submission.blushPhotoUrl.trim().length > 0) {
    return [submission.blushPhotoUrl.trim()];
  }
  return [];
}

export function getPhotoCounts(submission: DatePlanSubmission): {
  dressCount: number;
  blushCount: number;
  totalCount: number;
} {
  const dressCount = getDressPhotos(submission).length;
  const blushCount = getBlushPhotos(submission).length;
  return {
    dressCount,
    blushCount,
    totalCount: dressCount + blushCount,
  };
}

export function validateDatePlan(submission: DatePlanSubmission): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const dressPhotos = getDressPhotos(submission);
  const blushPhotos = getBlushPhotos(submission);

  if (!submission.selectedTime.trim()) {
    errors.selectedTime = 'Please pick a time for our Monday, 9th Nov 2026 date.';
  }
  if (dressPhotos.length === 0) {
    errors.dressImageUrl = 'Please upload at least one photo of the dress you will wear (or select a couture preview).';
  }
  if (!submission.datePlanText.trim() || submission.datePlanText.trim().length < 8) {
    errors.datePlanText = 'Please write down your dream plan for our Monday evening (at least a short sentence).';
  }
  if (!submission.loveMessage.trim() || submission.loveMessage.trim().length < 5) {
    errors.loveMessage = 'Please write a sweet message you want to send me.';
  }
  if (blushPhotos.length === 0) {
    errors.blushPhotoUrl = 'Please add at least one photo (or select a portrait mood) to make me blush!';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Starts low (5%) when everything is empty.
 * Increases as she picks a time, uploads dress photo(s), selects activities / writes plan, writes message, and adds blush photo(s).
 * Extra photos add bonus Blush Rate!
 * When she completes all 5 core parts, the meter overflows (> 100%, up to 152%+) and warns her "Please don't kill me!"
 */
export function calculateBlushMeter(submission: DatePlanSubmission): BlushMeterStats {
  let score = 5;
  const missingSteps: string[] = [];
  const dressPhotos = getDressPhotos(submission);
  const blushPhotos = getBlushPhotos(submission);

  // 1. Time selection (+22%)
  if (submission.selectedTime.trim()) {
    score += 22;
  } else {
    missingSteps.push('Pick a time for our Monday, 9th Nov 2026 date (+22% Blush)');
  }

  // 2. Dress upload & notes (+25% first photo, +8% per extra dress photo, +8% style/color details)
  if (dressPhotos.length > 0) {
    score += 25 + Math.max(0, dressPhotos.length - 1) * 8;
  } else {
    missingSteps.push('Upload or preview the dress you are going to wear (+25% Blush)');
  }
  if (submission.dressName.trim() || submission.dressColorNote.trim()) {
    score += 8;
  }

  // 3. Blush photo(s) & cheeky caption (+30% first photo, +10% per extra blush photo, +10% caption)
  if (blushPhotos.length > 0) {
    score += 30 + Math.max(0, blushPhotos.length - 1) * 10;
  } else {
    missingSteps.push('Add your photo to make me blush (+30% Blush)');
  }
  if (submission.blushCaption.trim().length > 2) {
    score += 10;
  }

  // 4. Evening plan & activities (+22% plan text, +8% activity chips)
  if (submission.datePlanText.trim().length >= 8) {
    score += 22;
  } else {
    missingSteps.push('Write down our evening date plan (+22% Blush)');
  }
  if (submission.selectedActivities.length > 0) {
    score += Math.min(12, submission.selectedActivities.length * 4);
  }

  // 5. Love message to him (+26%)
  if (submission.loveMessage.trim().length >= 5) {
    score += 26;
  } else {
    missingSteps.push('Write a sweet message you want to send me (+26% Blush)');
  }

  const allCoreDone = missingSteps.length === 0;
  // Guarantee overflow (>= 130%) when all 5 core actions are done
  if (allCoreDone && score < 130) {
    score = 130;
  }

  const isFull = allCoreDone && score >= 100;
  const isOverflowing = score > 100;

  let verdict = 'Shy & Waiting for Your First Move...';
  if (score > 100) {
    verdict = 'OVERFLOWING! Please Don’t Kill Me! 💀❤️‍🔥';
  } else if (score >= 80) {
    verdict = 'Face Turning Deep Crimson!';
  } else if (score >= 50) {
    verdict = 'Heart Racing Faster & Faster';
  } else if (score >= 25) {
    verdict = 'Warm Smile Forming Already';
  }

  const overflowWarning = isOverflowing
    ? `BLUSH METER OVERFLOW (${score}%): Are you trying to kill me?! My heart is officially combusting—please don't kill me before Monday, 9th Nov 2026 arrives!`
    : null;

  return {
    score,
    isFull,
    isOverflowing,
    verdict,
    overflowWarning,
    missingSteps,
  };
}
