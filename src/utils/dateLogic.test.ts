import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_DIYAS,
  CORRECT_PASSWORD_OPTION,
  PASSWORD_OPTIONS,
  INTRUDER_REDIRECT_MESSAGE,
  ALL_DIYAS_LIT_POPUP_MESSAGE,
  NO_RAIN_BUTTON_LABEL,
  verifyAshwiPassword,
  rotateDeck,
  toggleDiyaState,
  lightSingleDiya,
  lightAllDiyas,
  getDiyaProgress,
  getStubbornState,
  getNoRainState,
  formatRomanticTimeLabel,
  validateDatePlan,
  calculateBlushMeter,
  getPhotoCounts,
  type DatePlanSubmission,
} from './dateLogic';

test('getNoRainState is capped at 30 clicks with 30 flirty motivating lines and exact headlines', () => {
  const zeroState = getNoRainState(0);
  assert.equal(zeroState.buttonLabel, 'Hope for No Rain Tomorrow');
  assert.equal(NO_RAIN_BUTTON_LABEL, 'Hope for No Rain Tomorrow');
  assert.equal(zeroState.targetCount, 30);
  assert.equal(zeroState.headline, "ma'am. What about the rain?");
  assert.ok(zeroState.promptText.includes('30'));
  assert.equal(zeroState.isPeak, false);

  const step1 = getNoRainState(1);
  assert.equal(step1.motivationLine, 'Keep going... your manifestation has power!');

  const trigger3 = getNoRainState(3);
  assert.equal(trigger3.headline, 'Do you like him so much');

  const trigger10 = getNoRainState(10);
  assert.equal(trigger10.headline, 'Is he that important');

  const trigger20 = getNoRainState(20);
  assert.equal(trigger20.headline, 'Are you that madly in love with him');
  assert.equal(trigger20.isPeak, false);

  // Verify every single step 1..30 has a non-empty motivationLine
  for (let i = 1; i <= 30; i++) {
    const s = getNoRainState(i);
    assert.ok(s.motivationLine.length > 10, `Step ${i} should have a flirty motivation line`);
  }

  const peak30 = getNoRainState(30);
  assert.equal(
    peak30.headline,
    'Okay...you guys love is at the peak. No rain can stop you guys seeing'
  );
  assert.equal(peak30.isPeak, true);
  assert.equal(peak30.count, 30);

  // Capped at 30 even if a higher number is passed
  const capped = getNoRainState(45);
  assert.equal(capped.count, 30);
  assert.equal(
    capped.headline,
    'Okay...you guys love is at the peak. No rain can stop you guys seeing'
  );
});

test('verifyAshwiPassword only accepts Oiee and rejects all other options', () => {
  assert.equal(CORRECT_PASSWORD_OPTION, 'Oiee');
  assert.ok(PASSWORD_OPTIONS.includes('Oiee'));
  assert.ok(PASSWORD_OPTIONS.length >= 6);
  assert.equal(verifyAshwiPassword('Oiee'), true);
  assert.equal(verifyAshwiPassword('Babe'), false);
  assert.equal(verifyAshwiPassword('Baby'), false);
  assert.equal(verifyAshwiPassword('Sweetheart'), false);
  assert.equal(INTRUDER_REDIRECT_MESSAGE, 'Get the fuck away from my man bitch');
  assert.equal(ALL_DIYAS_LIT_POPUP_MESSAGE, 'Love you, My Ashwi');
});

test('rotateDeck moves the top stanza card to the back of the deck', () => {
  const deck = ['stanza-1', 'stanza-2', 'stanza-3'];
  const afterOneTap = rotateDeck(deck);
  assert.deepEqual(afterOneTap, ['stanza-2', 'stanza-3', 'stanza-1']);
  const afterTwoTaps = rotateDeck(afterOneTap);
  assert.deepEqual(afterTwoTaps, ['stanza-3', 'stanza-1', 'stanza-2']);
});

test('diya progress calculates lit count and lights diyas one by one accurately', () => {
  const unlitDiyas = INITIAL_DIYAS.map((d) => ({ ...d, lit: false }));
  assert.equal(getDiyaProgress(unlitDiyas).litCount, 0);

  const afterOneLit = lightSingleDiya(unlitDiyas, 1);
  assert.equal(getDiyaProgress(afterOneLit).litCount, 1);

  const afterToggle = toggleDiyaState(INITIAL_DIYAS, 3);
  assert.equal(getDiyaProgress(afterToggle).litCount, 3);

  const allLit = lightAllDiyas(INITIAL_DIYAS);
  const fullProgress = getDiyaProgress(allLit);
  assert.equal(fullProgress.litCount, 5);
  assert.equal(fullProgress.allLit, true);
  assert.equal(fullProgress.percentage, 100);
});

test('stubborn proposal state escalates playfully and converts No into Yes on final step', () => {
  const step0 = getStubbornState(0);
  assert.equal(step0.noConvertedToYes, false);
  assert.equal(step0.yesScale, 1);

  const step2 = getStubbornState(2);
  assert.ok(step2.yesScale > 1);
  assert.ok(step2.message.includes('9th Nov 2026'));

  const finalStep = getStubbornState(10);
  assert.equal(finalStep.noConvertedToYes, true);
  assert.ok(finalStep.noButtonLabel.toUpperCase().includes('YES'));
});

test('formatRomanticTimeLabel handles empty time and formats 24h time into 12h', () => {
  const emptyTime = formatRomanticTimeLabel('');
  assert.equal(emptyTime.formatted12h, 'Not Selected Yet');

  const evening = formatRomanticTimeLabel('19:30');
  assert.equal(evening.formatted12h, '7:30 PM');
  assert.equal(evening.atmosphereLabel, 'Intimate Candlelight Dinner');
});

test('blush meter starts low when empty, increases when time is selected, and overflows telling her not to kill him when full', () => {
  const emptySubmission: DatePlanSubmission = {
    dateDay: 'Monday, 9th November 2026',
    selectedTime: '',
    timeSlotTitle: '',
    dressImageUrl: '',
    dressName: '',
    dressColorNote: '',
    datePlanText: '',
    selectedActivities: [],
    loveMessage: '',
    blushPhotoUrl: '',
    blushVibe: 'Secret Smile',
    blushCaption: '',
  };

  const initialBlush = calculateBlushMeter(emptySubmission);
  assert.equal(initialBlush.score, 5);
  assert.equal(initialBlush.isFull, false);
  assert.equal(initialBlush.isOverflowing, false);
  assert.equal(initialBlush.missingSteps.length, 5);
  assert.deepEqual(getPhotoCounts(emptySubmission), { dressCount: 0, blushCount: 0, totalCount: 0 });

  // Selecting a time increases the blush rate from 5% to 27%
  const afterTimeSelected = calculateBlushMeter({
    ...emptySubmission,
    selectedTime: '19:30',
  });
  assert.ok(afterTimeSelected.score > initialBlush.score);
  assert.equal(afterTimeSelected.score, 27);
  assert.equal(afterTimeSelected.isFull, false);

  // Completing all items overflows the meter (> 100%) and warns her not to kill him
  const fullSubmission: DatePlanSubmission = {
    dateDay: 'Monday, 9th November 2026',
    selectedTime: '19:30',
    timeSlotTitle: 'Candlelight Rooftop Dinner',
    dressImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    dressImageUrls: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    ],
    dressName: 'Midnight Silk Anarkali',
    dressColorNote: 'Deep Emerald & Gold Zari',
    datePlanText: 'First we watch the remaining Diwali lanterns by the water, then rooftop candlelight dinner and dessert.',
    selectedActivities: ['Candlelight Table for Two', 'Sharing Dessert From One Spoon'],
    loveMessage: 'I love you endlessly and cannot wait to hold your hand this Monday night!',
    blushPhotoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    blushPhotoUrls: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    ],
    blushVibe: 'Just For Your Eyes',
    blushCaption: 'Saving this smile for Monday at 7:30 PM',
  };

  assert.deepEqual(getPhotoCounts(fullSubmission), { dressCount: 2, blushCount: 3, totalCount: 5 });
  assert.equal(validateDatePlan(fullSubmission).valid, true);

  const overflowBlush = calculateBlushMeter(fullSubmission);
  assert.ok(overflowBlush.score > 152);
  assert.equal(overflowBlush.isFull, true);
  assert.equal(overflowBlush.isOverflowing, true);
  assert.ok(overflowBlush.overflowWarning?.toLowerCase().includes("don't kill me"));
});

