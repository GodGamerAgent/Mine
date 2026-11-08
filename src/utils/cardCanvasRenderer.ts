import {
  type DatePlanSubmission,
  formatRomanticTimeLabel,
  calculateBlushMeter,
  getDressPhotos,
  getBlushPhotos,
  getPhotoCounts,
} from './dateLogic';

export async function logActivityEvent(event: string, detail?: string): Promise<void> {
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, detail }),
    });
  } catch {
    // Non-blocking telemetry
  }
}

export async function saveFinalSubmissionToServer(
  submission: DatePlanSubmission,
  noAttemptsCount: number,
  finalCardDataUrl?: string
): Promise<boolean> {
  try {
    const blush = calculateBlushMeter(submission);
    const counts = getPhotoCounts(submission);
    const res = await fetch('/api/submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...submission,
        dressImageUrls: getDressPhotos(submission),
        blushPhotoUrls: getBlushPhotos(submission),
        totalPhotosCount: counts.totalCount,
        noAttemptsCount,
        blushScore: blush.score,
        finalCardDataUrl,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6
): number {
  const words = (text || '').split(/\s+/);
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/**
 * Computes the adaptive height of an image when rendered at `targetWidth`
 * preserving its exact natural aspect ratio (never stretching or cropping).
 */
function getNaturalScaledHeight(img: HTMLImageElement | null, targetWidth: number): number {
  if (!img || !img.naturalWidth || !img.naturalHeight) {
    return 260;
  }
  const ratio = img.naturalHeight / img.naturalWidth;
  // Clamp extreme aspect ratios gently while preserving full image inside frame
  return Math.max(180, Math.min(720, Math.round(targetWidth * ratio)));
}

/**
 * Draws an image inside `(x, y, boxWidth, boxHeight)` preserving 100% of its natural aspect ratio
 * (`object-contain` behavior — zero stretching and zero cropping).
 */
function drawAdaptiveImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number
) {
  const iw = img.naturalWidth || img.width || boxWidth;
  const ih = img.naturalHeight || img.height || boxHeight;
  const scale = Math.min(boxWidth / iw, boxHeight / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;
  const drawX = x + (boxWidth - drawW) / 2;
  const drawY = y + (boxHeight - drawH) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, boxWidth, boxHeight, 14);
  ctx.fillStyle = '#F7ECE8';
  ctx.fill();
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/**
 * Generates an adaptive PNG Data URL of her Monday, 9th Nov 2026 Date Card
 * that dynamically adjusts its height and photo holders to fit ALL uploaded Dress & Blush photos
 * without stretching or cropping any photo.
 */
export async function renderDateCardToDataUrl(
  submission: DatePlanSubmission
): Promise<string> {
  const dressUrls = getDressPhotos(submission);
  const blushUrls = getBlushPhotos(submission);
  const photoCounts = getPhotoCounts(submission);

  const [dressImgs, blushImgs] = await Promise.all([
    Promise.all(dressUrls.map((u) => loadImage(u))),
    Promise.all(blushUrls.map((u) => loadImage(u))),
  ]);

  const validDressImgs = dressImgs.filter((img): img is HTMLImageElement => img !== null);
  const validBlushImgs = blushImgs.filter((img): img is HTMLImageElement => img !== null);

  const innerPhotoWidth = 392;
  const photoGap = 20;

  // Calculate adaptive height for Left Column (Dress Photos) & Right Column (Blush Photos)
  const dressPhotosTotalH =
    validDressImgs.length === 0
      ? 260
      : validDressImgs.reduce(
          (sum, img) => sum + getNaturalScaledHeight(img, innerPhotoWidth) + photoGap,
          -photoGap
        );

  const blushPhotosTotalH =
    validBlushImgs.length === 0
      ? 260
      : validBlushImgs.reduce(
          (sum, img) => sum + getNaturalScaledHeight(img, innerPhotoWidth) + photoGap,
          -photoGap
        );

  const dressCardH = dressPhotosTotalH + 145;
  const blushCardH = blushPhotosTotalH + 145;
  const photoSectionH = Math.max(dressCardH, blushCardH);

  const planBoxY = 480 + photoSectionH + 36;
  const planBoxH = 330;
  const loveNoteY = planBoxY + planBoxH + 32;
  const loveNoteH = 290;
  const footerY = loveNoteY + loveNoteH + 75;
  const totalCanvasHeight = Math.max(1880, footerY + 85);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = totalCanvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const timeInfo = formatRomanticTimeLabel(submission.selectedTime);
  const blushStats = calculateBlushMeter(submission);

  // 1. Deep Romantic Velvet Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, totalCanvasHeight);
  bgGrad.addColorStop(0, '#2B0714');
  bgGrad.addColorStop(0.5, '#4C0519');
  bgGrad.addColorStop(1, '#1F040D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, totalCanvasHeight);

  // 2. Outer Gold & Rose Border Frame (Adapts to totalCanvasHeight)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 44, 992, totalCanvasHeight - 88);

  ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 960, totalCanvasHeight - 120);

  // 3. Top Kicker & Title ("FOR MINE")
  ctx.fillStyle = '#FBBF24';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `✨ FOR MINE · OFFICIAL ROMANTIC DATE PASS · ${photoCounts.totalCount} PHOTO${photoCounts.totalCount === 1 ? '' : 'S'} ADDED ✨`,
    540,
    130
  );

  ctx.fillStyle = '#FFF8F6';
  ctx.font = '700 70px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Monday, 9th Nov 2026', 540, 218);

  // 4. Time & Overflow Blush Badge Box
  ctx.fillStyle = 'rgba(255, 248, 246, 0.1)';
  ctx.beginPath();
  ctx.roundRect(96, 260, 888, 178, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FDA4AF';
  ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SELECTED TIME', 136, 310);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 48px "JetBrains Mono", monospace';
  ctx.fillText(timeInfo.formatted12h, 136, 372);

  ctx.fillStyle = '#FDE68A';
  ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(submission.timeSlotTitle || timeInfo.atmosphereLabel, 136, 412);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FBBF24';
  ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`HIS BLUSH RATE (${photoCounts.totalCount} PHOTOS)`, 944, 310);

  ctx.fillStyle = '#FB7185';
  ctx.font = '700 52px "JetBrains Mono", monospace';
  ctx.fillText(`${blushStats.score}%`, 944, 372);

  ctx.fillStyle = '#FEF08A';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OVERFLOW! Please Don’t Kill Me! ❤️‍🔥', 944, 412);

  // 5A. Left Adaptive Photo Holder: Dress Sneak Peek(s)
  ctx.fillStyle = '#FFF8F6';
  ctx.beginPath();
  ctx.roundRect(96, 480, 424, dressCardH, 20);
  ctx.fill();

  let currentDressY = 496;
  for (const img of validDressImgs) {
    const imgH = getNaturalScaledHeight(img, innerPhotoWidth);
    drawAdaptiveImage(ctx, img, 112, currentDressY, innerPhotoWidth, imgH);
    currentDressY += imgH + photoGap;
  }

  const dressCaptionBaseY = 496 + dressPhotosTotalH + 34;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9F1239';
  ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`DRESS SNEAK PEEK (${photoCounts.dressCount})`, 118, dressCaptionBaseY);
  ctx.fillStyle = '#330816';
  ctx.font = '600 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(
    (submission.dressName || 'Evening Couture').slice(0, 28),
    118,
    dressCaptionBaseY + 32
  );
  ctx.fillStyle = '#6B293B';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    (submission.dressColorNote || 'Surprise Color Palette').slice(0, 32),
    118,
    dressCaptionBaseY + 60
  );

  // 5B. Right Adaptive Photo Holder: Her Blush Portrait(s)
  ctx.fillStyle = '#FFF8F6';
  ctx.beginPath();
  ctx.roundRect(560, 480, 424, blushCardH, 20);
  ctx.fill();

  let currentBlushY = 496;
  for (const img of validBlushImgs) {
    const imgH = getNaturalScaledHeight(img, innerPhotoWidth);
    drawAdaptiveImage(ctx, img, 576, currentBlushY, innerPhotoWidth, imgH);
    currentBlushY += imgH + photoGap;
  }

  const blushCaptionBaseY = 496 + blushPhotosTotalH + 34;
  ctx.fillStyle = '#E11D48';
  ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `BLUSH PHOTOS (${photoCounts.blushCount}) · ${submission.blushVibe.toUpperCase()}`,
    582,
    blushCaptionBaseY
  );
  ctx.fillStyle = '#330816';
  ctx.font = '600 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(
    (submission.blushCaption || 'Guaranteed Heart-Stopper').slice(0, 30),
    582,
    blushCaptionBaseY + 32
  );
  ctx.fillStyle = '#6B293B';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Status: Speechless & Blushing Crimson', 582, blushCaptionBaseY + 60);

  // 6. Her Written Evening Plan Box
  ctx.fillStyle = 'rgba(255, 248, 246, 0.96)';
  ctx.beginPath();
  ctx.roundRect(96, planBoxY, 888, planBoxH, 24);
  ctx.fill();

  ctx.fillStyle = '#E11D48';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OUR EVENING PLAN FOR MONDAY, 9TH NOV 2026', 136, planBoxY + 52);

  ctx.fillStyle = '#2D0A16';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  wrapCanvasText(
    ctx,
    submission.datePlanText || 'Candlelight dinner, long walk hand-in-hand, and dessert.',
    136,
    planBoxY + 104,
    808,
    40,
    4
  );

  if (submission.selectedActivities.length > 0) {
    ctx.fillStyle = '#881337';
    ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Highlights: ${submission.selectedActivities.join(' · ').slice(0, 68)}`,
      136,
      planBoxY + 292
    );
  }

  // 7. Her Love Note Box
  ctx.fillStyle = 'rgba(255, 248, 246, 0.96)';
  ctx.beginPath();
  ctx.roundRect(96, loveNoteY, 888, loveNoteH, 24);
  ctx.fill();

  ctx.fillStyle = '#E11D48';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('HER PERSONAL LOVE MESSAGE TO ME', 136, loveNoteY + 52);

  ctx.fillStyle = '#330816';
  ctx.font = 'italic 600 34px "Cormorant Garamond", Georgia, serif';
  wrapCanvasText(
    ctx,
    `“${submission.loveMessage}”`,
    136,
    loveNoteY + 108,
    808,
    44,
    4
  );

  // 8. Footer Signature
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FDE68A';
  ctx.font = '600 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(
    'Happy Diwali & I Love You Forever · Sealed for Monday, 9th November 2026',
    540,
    footerY
  );

  return canvas.toDataURL('image/png');
}
