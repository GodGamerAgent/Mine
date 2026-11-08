import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Clock, Heart, Sparkles, ArrowLeft } from 'lucide-react';

interface ActivityEvent {
  id: string;
  event: string;
  detail?: string;
  timestamp: string;
}

interface SavedSubmission {
  id: string;
  submittedAt: string;
  noAttemptsCount: number;
  blushScore: number;
  totalPhotosCount?: number;
  selectedTime: string;
  timeSlotTitle: string;
  dressName: string;
  dressColorNote: string;
  dressImageUrl: string;
  dressImageUrls?: string[];
  datePlanText: string;
  selectedActivities: string[];
  loveMessage: string;
  blushVibe: string;
  blushCaption: string;
  blushPhotoUrl: string;
  blushPhotoUrls?: string[];
  finalCardDataUrl?: string;
}

interface RecordsStore {
  events: ActivityEvent[];
  submissions: SavedSubmission[];
}

interface OwnerRecordsDashboardProps {
  onBackToSite: () => void;
}

export const OwnerRecordsDashboard: React.FC<OwnerRecordsDashboardProps> = ({
  onBackToSite,
}) => {
  const [records, setRecords] = useState<RecordsStore>({ events: [], submissions: [] });
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = (await res.json()) as RecordsStore;
        setRecords(data);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#12090D] px-6 py-12 text-[#FAF3EB]">
      <div className="mx-auto max-w-[1140px]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Main Website</span>
            </button>
            <h1 className="mt-2 font-serif-display text-4xl font-semibold text-white">
              Her Saved Final Cards &amp; Activity Logs
            </h1>
            <p className="mt-1 text-xs text-[#D6C3B3]">
              Secret Owner Vault (?owner=1) · All submissions, uploaded dress/blush photos, and interaction logs from server storage (data/records.json).
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRecords}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-[#180B10] hover:bg-amber-300 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>

        {/* Saved Final Cards Section */}
        <section className="mt-10">
          <h2 className="font-serif-display text-2xl font-semibold text-amber-300">
            1. Her Submitted Date Cards ({records.submissions.length})
          </h2>

          {records.submissions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-[#1B0D14] p-8 text-sm text-[#D6C3B3]">
              No final card submitted yet. As soon as she seals her Monday, 9th Nov 2026 Date Plan, her complete Final Card PNG, Dress Photo(s), and Blush Photo(s) will appear right here!
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {records.submissions.map((sub) => {
                const dressList =
                  Array.isArray(sub.dressImageUrls) && sub.dressImageUrls.length > 0
                    ? sub.dressImageUrls
                    : sub.dressImageUrl
                    ? [sub.dressImageUrl]
                    : [];
                const blushList =
                  Array.isArray(sub.blushPhotoUrls) && sub.blushPhotoUrls.length > 0
                    ? sub.blushPhotoUrls
                    : sub.blushPhotoUrl
                    ? [sub.blushPhotoUrl]
                    : [];
                const totalPhotos = dressList.length + blushList.length;

                return (
                  <article
                    key={sub.id}
                    className="rounded-2xl border border-amber-400/35 bg-[#1B0D14] p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                      <div>
                        <span className="text-xs text-amber-300">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                        <h3 className="font-serif-display text-2xl font-bold text-white">
                          Monday, 9th Nov 2026 · Time: {sub.selectedTime} · Blush Score: {sub.blushScore}% · Photos Added: {totalPhotos}
                        </h3>
                        <p className="text-xs text-[#D6C3B3]">
                          Stubborn “No” Attempts Before Clicking Yes: {sub.noAttemptsCount}
                        </p>
                      </div>

                      {sub.finalCardDataUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadDataUrl(
                              sub.finalCardDataUrl!,
                              `her-final-card-${sub.id}.png`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#BE123C] cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download Her Final Card PNG</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 items-start gap-6 md:grid-cols-3">
                      <div>
                        <div className="text-xs font-semibold text-amber-300">
                          Written Plan &amp; Love Message
                        </div>
                        <p className="mt-2 text-sm text-white">
                          <strong>Plan:</strong> {sub.datePlanText}
                        </p>
                        <p className="mt-2 text-sm italic text-amber-100">
                          <strong>Message:</strong> “{sub.loveMessage}”
                        </p>
                        <p className="mt-2 text-xs text-[#D6C3B3]">
                          <strong>Dress:</strong> {sub.dressName} ({sub.dressColorNote})
                        </p>
                        <p className="mt-1 text-xs text-[#D6C3B3]">
                          <strong>Blush Vibe:</strong> {sub.blushVibe} — “{sub.blushCaption}”
                        </p>
                      </div>

                      {dressList.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs text-amber-300">
                            Uploaded Dress Photo(s) ({dressList.length})
                          </div>
                          {dressList.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Her uploaded dress #${idx + 1}`}
                              className="mx-auto block h-auto max-h-64 w-full rounded-xl border border-amber-500/25 object-contain bg-black/25"
                            />
                          ))}
                        </div>
                      )}

                      {blushList.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs text-amber-300">
                            Uploaded Blush Photo(s) ({blushList.length})
                          </div>
                          {blushList.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Her uploaded blush portrait #${idx + 1}`}
                              className="mx-auto block h-auto max-h-64 w-full rounded-xl border border-amber-500/25 object-contain bg-black/25"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Live Interaction Logs Section */}
        <section className="mt-12">
          <h2 className="font-serif-display text-2xl font-semibold text-amber-300">
            2. Real-Time Interaction Logs ({records.events.length})
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-amber-500/20 bg-[#1B0D14]">
            {records.events.length === 0 ? (
              <p className="p-6 text-xs text-[#D6C3B3]">No interaction events logged yet.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y divide-amber-500/15">
                {records.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-mono font-semibold text-amber-200">{evt.event}</span>
                      {evt.detail && <span className="text-[#E6D7C8]">— {evt.detail}</span>}
                    </div>
                    <span className="font-mono text-[#A69080] tabular-nums">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
