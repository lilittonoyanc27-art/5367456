import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent server-side student data store
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'progress.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Error creating data directory:', e);
  }
}

let studentData: Record<string, any> = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    studentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    studentData = {};
  }
}

function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(studentData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist student data:', e);
  }
}

// Check backend status
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    storage: 'server-persistent',
    studentsCount: Object.keys(studentData).length,
    timestamp: new Date().toISOString()
  });
});

// Auto-save student progress immediately (without needing submit button)
app.post('/api/progress/save', (req, res) => {
  const { studentId, studentName, level, answers, writtenAnswers, gameProgress, stats, lastActiveAt } = req.body;
  if (!studentId) {
    res.status(400).json({ error: 'studentId is required' });
    return;
  }

  const existing = studentData[studentId] || {};
  studentData[studentId] = {
    ...existing,
    studentId,
    studentName: studentName || existing.studentName || 'Estudiante',
    level: level || existing.level || 'A2',
    answers: { ...(existing.answers || {}), ...(answers || {}) },
    writtenAnswers: { ...(existing.writtenAnswers || {}), ...(writtenAnswers || {}) },
    gameProgress: { ...(existing.gameProgress || {}), ...(gameProgress || {}) },
    stats: { ...(existing.stats || {}), ...(stats || {}) },
    lastActiveAt: lastActiveAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  persistData();
  res.json({ success: true, savedAt: studentData[studentId].updatedAt });
});

// Fetch progress for a single student
app.get('/api/progress/:studentId', (req, res) => {
  const { studentId } = req.params;
  const data = studentData[studentId] || null;
  res.json({ success: true, data });
});

// Teacher endpoint - authenticate with passcode and retrieve all students
app.post('/api/teacher/students', (req, res) => {
  const { passcode } = req.body;
  const validCodes = ['profesor', 'soler2025', 'maestro', 'espanol'];
  if (!validCodes.includes(passcode?.toLowerCase()?.trim())) {
    res.status(401).json({ error: 'Contraseña de profesor incorrecta. Prueba: profesor o soler2025' });
    return;
  }

  res.json({
    success: true,
    students: Object.values(studentData)
  });
});

// Teacher reset specific student progress
app.post('/api/teacher/reset-student', (req, res) => {
  const { passcode, studentId } = req.body;
  const validCodes = ['profesor', 'soler2025', 'maestro', 'espanol'];
  if (!validCodes.includes(passcode?.toLowerCase()?.trim())) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  if (studentId && studentData[studentId]) {
    delete studentData[studentId];
    persistData();
  }
  res.json({ success: true });
});

// Reset all students
app.post('/api/teacher/reset-all', (req, res) => {
  const { passcode } = req.body;
  const validCodes = ['profesor', 'soler2025', 'maestro', 'espanol'];
  if (!validCodes.includes(passcode?.toLowerCase()?.trim())) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  studentData = {};
  persistData();
  res.json({ success: true });
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
