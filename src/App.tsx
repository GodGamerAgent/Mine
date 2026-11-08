/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_DIYAS,
  lightSingleDiya,
  type DiyaItem,
  type DatePlanSubmission,
} from './utils/dateLogic';
import { PasswordGate } from './components/PasswordGate';
import { IntruderAlertPage } from './components/IntruderAlertPage';
import { DiwaliChapter } from './components/DiwaliChapter';
import { StubbornDateGate } from './components/StubbornDateGate';
import { LoveDatePlanner } from './components/LoveDatePlanner';
import { DateKeepsakeCard } from './components/DateKeepsakeCard';
import { CuteNoBackPage } from './components/CuteNoBackPage';
import { OwnerRecordsDashboard } from './components/OwnerRecordsDashboard';
import { logActivityEvent } from './utils/cardCanvasRenderer';

type ChapterView =
  | 'password'
  | 'intruder'
  | 'diwali'
  | 'proposal'
  | 'planner'
  | 'keepsake'
  | 'no-back'
  | 'owner';

const INITIAL_SUBMISSION: DatePlanSubmission = {
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

export default function App() {
  const [diyas, setDiyas] = useState<DiyaItem[]>(() =>
    INITIAL_DIYAS.map((d) => ({ ...d, lit: false }))
  );
  const [noCount, setNoCount] = useState<number>(0);
  const [wrongPasswordChoice, setWrongPasswordChoice] = useState<string>('');
  const [submission, setSubmission] = useState<DatePlanSubmission>(INITIAL_SUBMISSION);
  const [lastSurpriseStep, setLastSurpriseStep] = useState<'proposal' | 'planner' | 'keepsake'>('proposal');
  const [activeChapter, setActiveChapter] = useState<ChapterView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('owner') === '1') {
        return 'owner';
      }
      const step = params.get('step');
      if (
        step === 'password' ||
        step === 'intruder' ||
        step === 'diwali' ||
        step === 'proposal' ||
        step === 'planner' ||
        step === 'keepsake' ||
        step === 'no-back'
      ) {
        return step;
      }
      if (params.get('autostart') === '1') {
        return 'proposal';
      }
    }
    return 'password';
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChapter]);

  // Intercept browser Back button once she enters the Surprise Date flow
  useEffect(() => {
    if (
      activeChapter === 'password' ||
      activeChapter === 'intruder' ||
      activeChapter === 'diwali' ||
      activeChapter === 'owner'
    ) {
      return;
    }

    window.history.pushState({ surpriseLocked: true }, '');
    const handlePopState = () => {
      window.history.pushState({ surpriseLocked: true }, '');
      logActivityEvent('tried_to_go_back', 'Triggered browser Back button on surprise flow');
      setActiveChapter('no-back');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeChapter]);

  const handleEnterSurprise = () => {
    setLastSurpriseStep('proposal');
    setActiveChapter('proposal');
  };

  const handleAcceptYes = () => {
    logActivityEvent('proposal_yes_clicked', `Clicked YES after ${noCount} stubborn No attempt(s)`);
    setLastSurpriseStep('planner');
    setActiveChapter('planner');
  };

  const handleSealKeepsake = () => {
    logActivityEvent('date_plan_sealed', `Sealed Monday 9th Nov 2026 Date at ${submission.selectedTime}`);
    setLastSurpriseStep('keepsake');
    setActiveChapter('keepsake');
  };

  const handleTryToGoBack = () => {
    logActivityEvent('tried_to_go_back', `Clicked Go Back from ${activeChapter}`);
    setActiveChapter('no-back');
  };

  const isDiwaliTheme =
    activeChapter === 'password' ||
    activeChapter === 'intruder' ||
    activeChapter === 'diwali' ||
    activeChapter === 'owner';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content Area (Top Header Removed as Requested) */}
      <main className="flex-1">
        {activeChapter === 'password' && (
          <PasswordGate
            onSuccess={(chosen) => {
              logActivityEvent('password_gate_passed', `Selected correct password: ${chosen}`);
              setActiveChapter('diwali');
            }}
            onIntruder={(chosen) => {
              logActivityEvent('password_gate_failed', `Selected wrong password: ${chosen}`);
              setWrongPasswordChoice(chosen);
              setActiveChapter('intruder');
            }}
          />
        )}

        {activeChapter === 'intruder' && (
          <IntruderAlertPage
            wrongChoice={wrongPasswordChoice}
            onRetryGate={() => setActiveChapter('password')}
          />
        )}

        {activeChapter === 'diwali' && (
          <DiwaliChapter
            diyas={diyas}
            onLightDiya={(id) => setDiyas((prev) => lightSingleDiya(prev, id))}
            onOpenSurprise={handleEnterSurprise}
          />
        )}

        {activeChapter === 'proposal' && (
          <StubbornDateGate
            noCount={noCount}
            onAttemptNo={() => {
              const next = noCount + 1;
              setNoCount(next);
              logActivityEvent('proposal_no_attempted', `Clicked No button (attempt #${next})`);
            }}
            onAcceptYes={handleAcceptYes}
            onTryToGoBack={handleTryToGoBack}
          />
        )}

        {activeChapter === 'planner' && (
          <LoveDatePlanner
            submission={submission}
            onChange={setSubmission}
            onSubmitSuccess={handleSealKeepsake}
            onTryToGoBack={handleTryToGoBack}
          />
        )}

        {activeChapter === 'keepsake' && (
          <DateKeepsakeCard
            submission={submission}
            noAttemptsCount={noCount}
            onEditPlan={() => {
              setLastSurpriseStep('planner');
              setActiveChapter('planner');
            }}
            onTryToGoBack={handleTryToGoBack}
          />
        )}

        {activeChapter === 'no-back' && (
          <CuteNoBackPage
            onReturnToSurprise={() => setActiveChapter(lastSurpriseStep)}
          />
        )}

        {activeChapter === 'owner' && (
          <OwnerRecordsDashboard onBackToSite={() => setActiveChapter('diwali')} />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer
        className={`border-t px-6 py-6 text-xs transition-colors ${
          isDiwaliTheme
            ? 'bg-[#12090D] border-amber-500/15 text-[#A69080]'
            : 'bg-[#FFF8F6] border-rose-200 text-[#6B293B]'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 sm:flex-row">
          <span>For Mine · Handcrafted with all my heart · Happy Diwali 2026</span>
          <span>Our Next Chapter: Monday, 9th November 2026</span>
        </div>
      </footer>
    </div>
  );
}
