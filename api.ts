import { StudentProgress, DifficultyLevel, GameId } from './types';

const STORAGE_KEY = 'alvaro_soler_student_progress_v1';
const STUDENT_ID_KEY = 'alvaro_soler_student_id';
const STUDENT_NAME_KEY = 'alvaro_soler_student_name';

// Generate or get stable student ID
export function getOrCreateStudentId(): string {
  let id = localStorage.getItem(STUDENT_ID_KEY);
  if (!id) {
    id = 'alum_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STUDENT_ID_KEY, id);
  }
  return id;
}

export function getSavedStudentName(): string {
  return localStorage.getItem(STUDENT_NAME_KEY) || 'Lilit';
}

export function saveStudentName(name: string): void {
  localStorage.setItem(STUDENT_NAME_KEY, name);
}

// Initial default progress state
export function getInitialProgress(studentId: string, studentName: string): StudentProgress {
  return {
    studentId,
    studentName,
    level: 'A2',
    answers: {},
    writtenAnswers: {},
    gameProgress: {},
    stats: {
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalStars: 0,
      completedGamesCount: 0,
      lastGameId: 'escucha_elige',
    },
    lastActiveAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Load progress from localStorage
export function loadLocalProgress(): StudentProgress {
  const id = getOrCreateStudentId();
  const name = getSavedStudentName();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.studentId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading local progress', e);
  }
  return getInitialProgress(id, name);
}

// Save progress to local storage
export function saveLocalProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving local progress', e);
  }
}

// Save progress to server backend (Express + file store)
export async function syncProgressToServer(progress: StudentProgress): Promise<boolean> {
  saveLocalProgress(progress);
  try {
    const res = await fetch('/api/progress/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Backend sync failed, saved locally in browser:', err);
  }
  return false;
}

// Check backend connection status
export async function checkServerStatus(): Promise<{ online: boolean; studentsCount: number }> {
  try {
    const res = await fetch('/api/status', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, studentsCount: data.studentsCount || 0 };
    }
  } catch (e) {
    // Offline or server not yet reachable
  }
  return { online: false, studentsCount: 0 };
}

// Teacher API calls
export async function fetchTeacherData(passcode: string): Promise<{ success: boolean; students?: StudentProgress[]; error?: string }> {
  try {
    const res = await fetch('/api/teacher/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, students: data.students };
    }
    return { success: false, error: data.error || 'Código incorrecto' };
  } catch (e) {
    return { success: false, error: 'No se pudo conectar al servidor. Revisa tu conexión.' };
  }
}

export async function teacherResetStudent(passcode: string, studentId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/teacher/reset-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, studentId }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Helper to record an answer
export function recordAnswerInState(
  prev: StudentProgress,
  questionId: string,
  selectedOption: string | string[],
  isCorrect: boolean,
  gameId: GameId,
  totalInGame: number,
  isGameFinished: boolean
): StudentProgress {
  const existing = prev.answers[questionId];
  const attempts = (existing?.attempts || 0) + 1;
  const isFirstAttempt = !existing;

  const nextAnswers = {
    ...prev.answers,
    [questionId]: {
      selectedOption,
      isCorrect,
      attempts,
      timestamp: new Date().toISOString(),
    },
  };

  const wasCorrectBefore = existing?.isCorrect;
  let correctDiff = 0;
  let incorrectDiff = 0;

  if (isFirstAttempt) {
    if (isCorrect) correctDiff = 1;
    else incorrectDiff = 1;
  } else if (!wasCorrectBefore && isCorrect) {
    correctDiff = 1;
  }

  // Calculate current score for game
  const gameAnswers = Object.entries(nextAnswers).filter(([k]) => k.startsWith(questionId.split('_')[0]));
  const score = gameAnswers.filter(([_, v]) => v.isCorrect).length;

  const currentGProg = prev.gameProgress[gameId] || {
    completed: false,
    score: 0,
    total: totalInGame,
    stars: 0,
    currentIndex: 0,
  };

  const starsEarned = score >= Math.ceil(totalInGame * 0.8) ? 3 : score >= Math.ceil(totalInGame * 0.5) ? 2 : score > 0 ? 1 : 0;

  const nextGameProgress = {
    ...prev.gameProgress,
    [gameId]: {
      ...currentGProg,
      score,
      total: totalInGame,
      stars: Math.max(currentGProg.stars, starsEarned),
      completed: isGameFinished || currentGProg.completed,
    },
  };

  const completedGamesCount = Object.values(nextGameProgress).filter((g) => g.completed).length;

  return {
    ...prev,
    answers: nextAnswers,
    gameProgress: nextGameProgress,
    stats: {
      ...prev.stats,
      totalQuestionsAnswered: Object.keys(nextAnswers).length,
      correctAnswers: prev.stats.correctAnswers + correctDiff,
      incorrectAnswers: prev.stats.incorrectAnswers + incorrectDiff,
      totalStars: Object.values(nextGameProgress).reduce((acc, curr) => acc + curr.stars, 0),
      completedGamesCount,
      lastGameId: gameId,
    },
    lastActiveAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper to record written text with live debounce
export function recordWrittenTextInState(
  prev: StudentProgress,
  questionId: string,
  text: string,
  isSubmitted: boolean = false
): StudentProgress {
  return {
    ...prev,
    writtenAnswers: {
      ...prev.writtenAnswers,
      [questionId]: {
        text,
        lastSaved: new Date().toISOString(),
        isSubmitted,
      },
    },
    lastActiveAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
