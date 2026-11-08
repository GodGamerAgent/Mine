import express from 'express';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
  : path.resolve(process.cwd(), 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

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
  totalPhotosCount: number;
  selectedTime: string;
  timeSlotTitle: string;
  dressName: string;
  dressColorNote: string;
  dressImageUrl: string;
  dressImageUrls: string[];
  datePlanText: string;
  selectedActivities: string[];
  loveMessage: string;
  blushVibe: string;
  blushCaption: string;
  blushPhotoUrl: string;
  blushPhotoUrls: string[];
  finalCardDataUrl?: string;
}

interface RecordsStore {
  events: ActivityEvent[];
  submissions: SavedSubmission[];
}

function readRecords(): RecordsStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(RECORDS_FILE)) {
      const initial: RecordsStore = { events: [], submissions: [] };
      fs.writeFileSync(RECORDS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(RECORDS_FILE, 'utf-8');
    return JSON.parse(raw) as RecordsStore;
  } catch {
    return { events: [], submissions: [] };
  }
}

function writeRecords(store: RecordsStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write records:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support multiple high-resolution photo uploads in a single submission
  app.use(express.json({ limit: '60mb' }));

  // Healthcheck endpoint for Railway / Render
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Log real-time interaction events (lighting diyas, clicking No, picking time, etc.)
  app.post('/api/event', (req, res) => {
    const { event, detail } = req.body || {};
    if (!event) {
      res.status(400).json({ error: 'Missing event name' });
      return;
    }
    const store = readRecords();
    const entry: ActivityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      event: String(event),
      detail: detail ? String(detail) : undefined,
      timestamp: new Date().toISOString(),
    };
    store.events.unshift(entry);
    store.events = store.events.slice(0, 250);
    writeRecords(store);
    res.json({ ok: true, entry });
  });

  // Save her complete Date Plan + Multiple Uploaded Photos + Rendered Final Card PNG
  app.post('/api/submission', (req, res) => {
    const body = req.body || {};
    const store = readRecords();
    const dressImageUrls = Array.isArray(body.dressImageUrls)
      ? body.dressImageUrls.map(String)
      : body.dressImageUrl
      ? [String(body.dressImageUrl)]
      : [];
    const blushPhotoUrls = Array.isArray(body.blushPhotoUrls)
      ? body.blushPhotoUrls.map(String)
      : body.blushPhotoUrl
      ? [String(body.blushPhotoUrl)]
      : [];

    const record: SavedSubmission = {
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      noAttemptsCount: Number(body.noAttemptsCount || 0),
      blushScore: Number(body.blushScore || 0),
      totalPhotosCount: Number(
        body.totalPhotosCount ?? dressImageUrls.length + blushPhotoUrls.length
      ),
      selectedTime: String(body.selectedTime || ''),
      timeSlotTitle: String(body.timeSlotTitle || ''),
      dressName: String(body.dressName || ''),
      dressColorNote: String(body.dressColorNote || ''),
      dressImageUrl: String(body.dressImageUrl || dressImageUrls[0] || ''),
      dressImageUrls,
      datePlanText: String(body.datePlanText || ''),
      selectedActivities: Array.isArray(body.selectedActivities) ? body.selectedActivities : [],
      loveMessage: String(body.loveMessage || ''),
      blushVibe: String(body.blushVibe || ''),
      blushCaption: String(body.blushCaption || ''),
      blushPhotoUrl: String(body.blushPhotoUrl || blushPhotoUrls[0] || ''),
      blushPhotoUrls,
      finalCardDataUrl: body.finalCardDataUrl ? String(body.finalCardDataUrl) : undefined,
    };
    store.submissions.unshift(record);
    store.submissions = store.submissions.slice(0, 50);
    writeRecords(store);
    res.json({ ok: true, id: record.id, submittedAt: record.submittedAt });
  });

  // Retrieve all records, logs, and the Final Card for the boyfriend
  app.get('/api/records', (_req, res) => {
    const store = readRecords();
    res.json(store);
  });

  // Serve generated static images in /src/assets both in dev and production
  const assetsPath = path.join(process.cwd(), 'src', 'assets');
  if (fs.existsSync(assetsPath)) {
    app.use('/src/assets', express.static(assetsPath));
  }

  const isProd =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')) && process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
