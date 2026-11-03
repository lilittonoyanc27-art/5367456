export type DifficultyLevel = 'A2' | 'B1';

export interface SubtitleItem {
  id: string;
  time: string;
  seconds: number;
  es: string;
  hy: string;
  note?: {
    es: string;
    hy: string;
  };
}

export interface VocabQuiz {
  questionEs: string;
  questionHy: string;
  options: { id: string; es: string; hy: string }[];
  correctId: string;
  explanationEs: string;
  explanationHy: string;
}

export interface VocabItem {
  id: string;
  word: string;
  hy: string;
  type: string;
  meaningEs: string;
  exampleEs: string;
  exampleHy: string;
  quiz: VocabQuiz;
}

export type GameId =
  | 'escucha_elige'
  | 'verdadero_falso'
  | 'completa_frase'
  | 'ordena_palabras'
  | 'que_significa'
  | 'quien_lo_dijo'
  | 'encuentra_error'
  | 'respuesta_natural'
  | 'memoria'
  | 'reconstruye_dialogo'
  | 'que_paso_primero'
  | 'gramatica'
  | 'que_harias_tu'
  | 'responde_palabras'
  | 'gran_reto'
  | 'reto_60_segundos';

export interface BaseGameQuestion {
  id: string;
  gameId: GameId;
  level: 'A2' | 'B1' | 'both';
  questionEs: string;
  questionHy: string;
  contextEs?: string;
  contextHy?: string;
  explanationEs: string;
  explanationHy: string;
  hintEs?: string;
  hintHy?: string;
}

export interface MultipleChoiceQuestion extends BaseGameQuestion {
  type: 'multiple_choice' | 'true_false' | 'who_said';
  options: { id: string; es: string; hy: string }[];
  correctOptionId: string;
}

export interface WordOrderQuestion extends BaseGameQuestion {
  type: 'word_order';
  words: string[];
  correctOrder: string[];
}

export interface DialogueOrderQuestion extends BaseGameQuestion {
  type: 'dialogue_order';
  steps: { id: string; speaker: string; es: string; hy: string; correctPos: number }[];
}

export interface ChronoQuestion extends BaseGameQuestion {
  type: 'chrono';
  items: { id: string; es: string; hy: string; correctOrder: number }[];
}

export interface SituationalQuestion extends BaseGameQuestion {
  type: 'situational';
  options: { id: string; es: string; hy: string; feedbackEs: string; feedbackHy: string }[];
}

export interface OpenAnswerQuestion extends BaseGameQuestion {
  type: 'open_text';
  suggestedAnswerEs: string;
  suggestedAnswerHy: string;
  keywords: string[];
}

export interface MemoryPair {
  id: string;
  es: string;
  hy: string;
  context?: string;
}

export interface MemoryRound {
  id: string;
  titleEs: string;
  titleHy: string;
  pairs: MemoryPair[];
}

export type GameQuestion =
  | MultipleChoiceQuestion
  | WordOrderQuestion
  | DialogueOrderQuestion
  | ChronoQuestion
  | SituationalQuestion
  | OpenAnswerQuestion;

export interface GameMetadata {
  id: GameId;
  number: number;
  titleEs: string;
  titleHy: string;
  descEs: string;
  descHy: string;
  iconName: string;
  badge: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  level: DifficultyLevel;
  answers: Record<string, {
    selectedOption: string | string[];
    isCorrect: boolean;
    attempts: number;
    timestamp: string;
  }>;
  writtenAnswers: Record<string, {
    text: string;
    lastSaved: string;
    isSubmitted?: boolean;
  }>;
  gameProgress: Record<string, {
    completed: boolean;
    score: number;
    total: number;
    stars: number;
    currentIndex: number;
  }>;
  stats: {
    totalQuestionsAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    totalStars: number;
    completedGamesCount: number;
    lastGameId?: GameId;
  };
  lastActiveAt: string;
  updatedAt: string;
}
