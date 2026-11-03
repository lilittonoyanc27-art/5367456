import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Languages,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Clock,
  Send,
  Eye,
  Zap,
  Smile,
  Shuffle,
  Volume2,
} from 'lucide-react';
import {
  GAMES_LIST,
  QUESTIONS_DATABASE,
  MEMORY_ROUNDS,
} from './data';
import {
  GameId,
  GameQuestion,
  StudentProgress,
  DifficultyLevel,
} from './types';
import {
  recordAnswerInState,
  recordWrittenTextInState,
  syncProgressToServer,
} from './api';

interface GamesSectionProps {
  progress: StudentProgress;
  setProgress: React.Dispatch<React.SetStateAction<StudentProgress>>;
  onOpenReset: () => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  progress,
  setProgress,
  onOpenReset,
}) => {
  const [activeGameId, setActiveGameId] = useState<GameId>(
    progress.stats.lastGameId || 'escucha_elige'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Translation toggles for question, options, hints, explanations
  const [showQuestionTrans, setShowQuestionTrans] = useState(false);
  const [showOptionTrans, setShowOptionTrans] = useState<Record<string, boolean>>({});
  const [showExplanationTrans, setShowExplanationTrans] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showHintTrans, setShowHintTrans] = useState(false);

  // Interactive Word Order state
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Interactive Dialogue Steps / Chrono state
  const [chronoItems, setChronoItems] = useState<{ id: string; es: string; hy: string; correctOrder: number }[]>([]);

  // Open text writing answer & status
  const [currentTextAnswer, setCurrentTextAnswer] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memory Game state
  const [memoryRoundIndex, setMemoryRoundIndex] = useState(0);
  const [memoryCards, setMemoryCards] = useState<{ id: string; key: string; text: string; lang: 'es' | 'hy'; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMatchesCount, setMemoryMatchesCount] = useState(0);
  const [memoryMovesCount, setMemoryMovesCount] = useState(0);

  // Timed 60 seconds game state
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Questions for current game
  const rawQuestions = QUESTIONS_DATABASE[activeGameId] || [];
  // Filter questions according to student's level if applicable
  const currentQuestions = rawQuestions.filter((q) => {
    if (q.level === 'both') return true;
    if (progress.level === 'A2') return q.level === 'A2';
    return true; // B1 sees all questions
  });

  const totalQuestions = currentQuestions.length;
  const currentQ: GameQuestion | undefined = currentQuestions[currentQuestionIndex];

  // Reset toggles when moving question or game
  useEffect(() => {
    setShowQuestionTrans(false);
    setShowOptionTrans({});
    setShowExplanationTrans(false);
    setShowHint(false);
    setShowHintTrans(false);

    if (currentQ) {
      if (currentQ.type === 'word_order') {
        const words = [...currentQ.words].sort(() => Math.random() - 0.5);
        setAvailableWords(words);
        setOrderedWords([]);
      } else if (currentQ.type === 'chrono' || currentQ.type === 'dialogue_order') {
        if ('items' in currentQ && currentQ.items) {
          const shuffled = [...currentQ.items].sort(() => Math.random() - 0.5);
          setChronoItems(shuffled);
        }
      } else if (currentQ.type === 'open_text') {
        const saved = progress.writtenAnswers[currentQ.id]?.text || '';
        setCurrentTextAnswer(saved);
      }
    }
  }, [activeGameId, currentQuestionIndex, currentQ?.id]);

  // Memory cards initializer
  useEffect(() => {
    if (activeGameId === 'memoria') {
      const round = MEMORY_ROUNDS[memoryRoundIndex] || MEMORY_ROUNDS[0];
      const cards: { id: string; key: string; text: string; lang: 'es' | 'hy'; matched: boolean }[] = [];
      round.pairs.forEach((pair) => {
        cards.push({ id: `${pair.id}_es`, key: pair.id, text: pair.es, lang: 'es', matched: false });
        cards.push({ id: `${pair.id}_hy`, key: pair.id, text: pair.hy, lang: 'hy', matched: false });
      });
      // Shuffle cards
      setMemoryCards(cards.sort(() => Math.random() - 0.5));
      setFlippedCards([]);
      setMemoryMatchesCount(0);
      setMemoryMovesCount(0);
    }
  }, [activeGameId, memoryRoundIndex]);

  // Timed 60s countdown
  useEffect(() => {
    if (activeGameId === 'reto_60_segundos' && isTimerRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeGameId, isTimerRunning, timeLeft]);

  // Helper: toggle option translation
  const toggleOptionTranslation = (e: React.MouseEvent, optId: string) => {
    e.stopPropagation(); // DO NOT SELECT ANSWER!
    setShowOptionTrans((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  // Helper: record multiple choice answer
  const handleSelectOption = (optId: string) => {
    if (!currentQ || !('correctOptionId' in currentQ)) return;

    const isCorrect = optId === currentQ.correctOptionId;
    const isGameFinished = currentQuestionIndex === totalQuestions - 1;

    const nextProgress = recordAnswerInState(
      progress,
      currentQ.id,
      optId,
      isCorrect,
      activeGameId,
      totalQuestions,
      isGameFinished
    );

    setProgress(nextProgress);
    syncProgressToServer(nextProgress);
  };

  // Helper: word order click
  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (!currentQ || currentQ.type !== 'word_order') return;

    let nextAvailable = [...availableWords];
    let nextOrdered = [...orderedWords];

    if (fromAvailable) {
      const idx = nextAvailable.indexOf(word);
      if (idx !== -1) {
        nextAvailable.splice(idx, 1);
        nextOrdered.push(word);
      }
    } else {
      const idx = nextOrdered.indexOf(word);
      if (idx !== -1) {
        nextOrdered.splice(idx, 1);
        nextAvailable.push(word);
      }
    }

    setAvailableWords(nextAvailable);
    setOrderedWords(nextOrdered);

    if (nextAvailable.length === 0) {
      // Check if correct
      const isCorrect =
        nextOrdered.join(' ').trim().toLowerCase() ===
        currentQ.correctOrder.join(' ').trim().toLowerCase();
      const isGameFinished = currentQuestionIndex === totalQuestions - 1;

      const nextProgress = recordAnswerInState(
        progress,
        currentQ.id,
        nextOrdered,
        isCorrect,
        activeGameId,
        totalQuestions,
        isGameFinished
      );
      setProgress(nextProgress);
      syncProgressToServer(nextProgress);
    }
  };

  // Helper: handle open text typing with debounce auto-save
  const handleTextChange = (text: string) => {
    setCurrentTextAnswer(text);
    if (!currentQ) return;

    setIsSavingText(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const nextProgress = recordWrittenTextInState(progress, currentQ.id, text, false);
      setProgress(nextProgress);
      syncProgressToServer(nextProgress);
      setIsSavingText(false);
    }, 600);
  };

  const handleBlurText = () => {
    if (!currentQ) return;
    const nextProgress = recordWrittenTextInState(progress, currentQ.id, currentTextAnswer, false);
    setProgress(nextProgress);
    syncProgressToServer(nextProgress);
    setIsSavingText(false);
  };

  // Memory card click
  const handleMemoryCardClick = (idx: number) => {
    if (flippedCards.length >= 2 || memoryCards[idx].matched || flippedCards.includes(idx)) {
      return;
    }

    const nextFlipped = [...flippedCards, idx];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMovesCount((prev) => prev + 1);
      const card1 = memoryCards[nextFlipped[0]];
      const card2 = memoryCards[nextFlipped[1]];

      if (card1.key === card2.key && card1.lang !== card2.lang) {
        // MATCH!
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c, i) =>
              i === nextFlipped[0] || i === nextFlipped[1] ? { ...c, matched: true } : c
            )
          );
          setFlippedCards([]);
          const newMatches = memoryMatchesCount + 1;
          setMemoryMatchesCount(newMatches);

          if (newMatches >= memoryCards.length / 2) {
            // Round finished
            const nextProgress = recordAnswerInState(
              progress,
              `memoria_${memoryRoundIndex}`,
              'completado',
              true,
              'memoria',
              MEMORY_ROUNDS.length,
              memoryRoundIndex === MEMORY_ROUNDS.length - 1
            );
            setProgress(nextProgress);
            syncProgressToServer(nextProgress);
          }
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  // Current answer state for question
  const currentAnswer = currentQ ? progress.answers[currentQ.id] : undefined;
  const isAnswered = !!currentAnswer;
  const isCorrect = currentAnswer?.isCorrect;

  // Active game metadata
  const gameMeta = GAMES_LIST.find((g) => g.id === activeGameId) || GAMES_LIST[0];

  return (
    <div className="space-y-6">
      {/* Game Selector Carousel / Grid */}
      <div className="bg-[#480923]/90 border border-[#C62828]/50 rounded-3xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFD43B]" />
            <h3 className="text-base sm:text-lg font-black text-white">
              SELECCIONA TU MODO DE JUEGO (16 MODOS)
            </h3>
          </div>
          <span className="text-xs text-[#FFD43B] font-bold font-armenian">
            Ընտրի՛ր խաղը
          </span>
        </div>

        {/* Scrollable list of 16 games */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {GAMES_LIST.map((g) => {
            const isSelected = activeGameId === g.id;
            const gProg = progress.gameProgress[g.id];
            const isCompleted = gProg?.completed;
            const stars = gProg?.stars || 0;

            return (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGameId(g.id);
                  setCurrentQuestionIndex(0);
                  if (g.id === 'reto_60_segundos') {
                    setTimeLeft(60);
                    setIsTimerRunning(true);
                  }
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#FF8A00] to-[#E57800] text-black border-[#FFD43B] shadow-xl shadow-[#FF8A00]/20 scale-105 z-10'
                    : 'bg-[#650D32]/80 hover:bg-[#650D32] text-white border-[#C62828]/50 hover:border-[#FF8A00]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-black text-[#FFD43B]'
                          : 'bg-black/40 text-zinc-300'
                      }`}
                    >
                      #{g.number}
                    </span>
                    {isCompleted && (
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-black' : 'text-emerald-400'
                        }`}
                      />
                    )}
                  </div>
                  <h4 className="text-xs font-black line-clamp-1 leading-tight">
                    {g.titleEs}
                  </h4>
                  <p
                    className={`text-[10px] font-armenian line-clamp-1 mt-0.5 ${
                      isSelected ? 'text-black/80 font-bold' : 'text-amber-200/80'
                    }`}
                  >
                    {g.titleHy}
                  </p>
                </div>

                {/* Stars indication */}
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= stars
                          ? isSelected
                            ? 'fill-black text-black'
                            : 'fill-[#FFD43B] text-[#FFD43B]'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Game Stage Card */}
      <div className="bg-gradient-to-b from-[#650D32] to-[#480923] border border-[#C62828]/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
        {/* Game Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C62828]/40 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF8A00] text-black uppercase tracking-wider">
                Juego {gameMeta.number} de 16
              </span>
              <span className="text-xs font-bold text-[#FFD43B]">
                {gameMeta.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {gameMeta.titleEs}{' '}
              <span className="text-[#FFD43B] font-armenian font-bold">
                — {gameMeta.titleHy}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              {gameMeta.descEs}
            </p>
          </div>

          {/* Question Counter / Navigation */}
          {activeGameId !== 'memoria' && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-amber-300 px-3 py-1 rounded-xl bg-black/40 border border-white/10">
                Pregunta {currentQuestionIndex + 1} / {totalQuestions}
              </span>

              {activeGameId === 'reto_60_segundos' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/50 text-[#FFD43B] font-mono font-bold text-sm">
                  <Clock className="w-4 h-4 text-[#FF8A00]" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* GAME MODE 9: MEMORIA DE PALABRAS                     */}
        {/* ==================================================== */}
        {activeGameId === 'memoria' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-300">
                  {MEMORY_ROUNDS[memoryRoundIndex]?.titleEs}
                </span>
                <span className="font-armenian text-xs text-amber-300">
                  ({MEMORY_ROUNDS[memoryRoundIndex]?.titleHy})
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-[#FFD43B]">
                  Parejas: {memoryMatchesCount} / {memoryCards.length / 2}
                </span>
                <span className="text-zinc-400">
                  Intentos: {memoryMovesCount}
                </span>

                <button
                  onClick={() =>
                    setMemoryRoundIndex((prev) => (prev + 1) % MEMORY_ROUNDS.length)
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#FF8A00] text-black font-bold text-xs hover:bg-[#FFD43B] transition-colors"
                >
                  Siguiente Ronda ({memoryRoundIndex + 1}/{MEMORY_ROUNDS.length})
                </button>
              </div>
            </div>

            {/* Memory Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {memoryCards.map((card, idx) => {
                const isFlipped = flippedCards.includes(idx) || card.matched;

                return (
                  <div
                    key={card.id}
                    onClick={() => handleMemoryCardClick(idx)}
                    className={`h-24 sm:h-28 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center p-3 text-center transition-all duration-300 select-none ${
                      card.matched
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 opacity-90 scale-95 shadow-md shadow-emerald-900/30'
                        : isFlipped
                        ? 'bg-gradient-to-tr from-[#FF8A00] to-[#FFD43B] border-amber-300 text-black font-black shadow-lg scale-100'
                        : 'bg-[#480923] hover:bg-[#650D32] border-[#C62828] text-white hover:scale-105'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                          {card.lang === 'es' ? '🇪🇸 Español' : '🇦🇲 Հայերեն'}
                        </span>
                        <span
                          className={`text-xs sm:text-sm leading-snug font-bold ${
                            card.lang === 'hy' ? 'font-armenian' : ''
                          }`}
                        >
                          {card.text}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-60">
                        <Sparkles className="w-6 h-6 text-[#FF8A00]" />
                        <span className="text-[11px] font-bold text-zinc-400">
                          Voltear
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {memoryMatchesCount >= memoryCards.length / 2 && memoryCards.length > 0 && (
              <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-5 text-center text-white space-y-3 animate-in zoom-in-95">
                <Trophy className="w-10 h-10 text-[#FFD43B] mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-emerald-300">
                  ¡Ronda completada con éxito!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-200">
                  Has emparejado todas las expresiones del vocabulario en {memoryMovesCount} movimientos.
                </p>
                <button
                  onClick={() =>
                    setMemoryRoundIndex((prev) => (prev + 1) % MEMORY_ROUNDS.length)
                  }
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-black font-black text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Jugar siguiente ronda ➔
                </button>
              </div>
            )}
          </div>
        ) : currentQ ? (
          /* ==================================================== */
          /* STANDARD QUESTION STAGE (MC, WORD ORDER, OPEN TEXT)   */
          /* ==================================================== */
          <div className="space-y-6">
            {/* The Question Prompt Card */}
            <div className="bg-[#480923] border border-[#C62828]/60 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Pregunta #{currentQuestionIndex + 1}
                    </span>
                  </div>

                  {/* Spanish Question */}
                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQ.questionEs}
                  </h3>

                  {/* Collapsible Armenian Translation of Question */}
                  {showQuestionTrans && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 text-amber-300 font-armenian font-semibold text-sm sm:text-base animate-in fade-in duration-150">
                      🇦🇲 {currentQ.questionHy}
                    </div>
                  )}
                </div>

                {/* Translation Icon for the Question */}
                <button
                  type="button"
                  onClick={() => setShowQuestionTrans((prev) => !prev)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    showQuestionTrans
                      ? 'bg-[#FF8A00] text-black'
                      : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                  title="Ver traducción al armenio de la pregunta"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span className="font-armenian text-xs">
                    {showQuestionTrans ? 'Փակել' : '🇦🇲 HY'}
                  </span>
                </button>
              </div>
            </div>

            {/* Question Type: MULTIPLE CHOICE & TRUE/FALSE & WHO SAID */}
            {(currentQ.type === 'multiple_choice' ||
              currentQ.type === 'true_false' ||
              currentQ.type === 'who_said') &&
              'options' in currentQ && (
                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = currentAnswer?.selectedOption === opt.id;
                    const isOptCorrect = opt.id === currentQ.correctOptionId;
                    const isTransOpen = !!showOptionTrans[opt.id];

                    let cardClass =
                      'bg-[#480923]/90 hover:bg-[#650D32] border-[#C62828]/60 text-white';

                    if (isAnswered) {
                      if (isOptCorrect) {
                        cardClass =
                          'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-900/30';
                      } else if (isSelected) {
                        cardClass =
                          'bg-red-950/80 border-red-500 text-red-100 shadow-md shadow-red-900/30';
                      } else {
                        cardClass =
                          'bg-black/20 border-white/5 text-zinc-400 opacity-60';
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`rounded-2xl border p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 ${cardClass}`}
                      >
                        {/* Left: Clickable selection area */}
                        <div
                          onClick={() => handleSelectOption(opt.id)}
                          className="flex-1 cursor-pointer flex items-start gap-3 select-none"
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? isOptCorrect
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-red-500 text-white'
                                : 'bg-black/40 text-[#FFD43B] border border-white/10'
                            }`}
                          >
                            {opt.id.toUpperCase()}
                          </span>

                          <div className="flex-1">
                            <span className="text-sm sm:text-base font-semibold leading-relaxed">
                              {opt.es}
                            </span>

                            {/* Option Armenian Translation */}
                            {isTransOpen && (
                              <p className="mt-1.5 font-armenian text-xs sm:text-sm text-amber-300 font-medium animate-in fade-in">
                                🇦🇲 {opt.hy}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Separate Translation Icon (DOES NOT SELECT OPTION) */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isAnswered && (
                            <span>
                              {isOptCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-red-400" />
                              ) : null}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => toggleOptionTranslation(e, opt.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                              isTransOpen
                                ? 'bg-[#FF8A00] text-black'
                                : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                            }`}
                            title="Ver traducción armenia de esta opción"
                          >
                            <Languages className="w-3 h-3" />
                            <span className="font-armenian">HY</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Question Type: SITUATIONAL (QUÉ HARÍAS TÚ) */}
            {currentQ.type === 'situational' && 'options' in currentQ && (
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer?.selectedOption === opt.id;
                  const isTransOpen = !!showOptionTrans[opt.id];

                  return (
                    <div
                      key={opt.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'bg-[#80133F] border-[#FF8A00] shadow-lg shadow-[#FF8A00]/20'
                          : 'bg-[#480923]/90 hover:bg-[#650D32] border-[#C62828]/60 text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => {
                            const nextProgress = recordAnswerInState(
                              progress,
                              currentQ.id,
                              opt.id,
                              true,
                              activeGameId,
                              totalQuestions,
                              currentQuestionIndex === totalQuestions - 1
                            );
                            setProgress(nextProgress);
                            syncProgressToServer(nextProgress);
                          }}
                          className="flex-1 cursor-pointer select-none"
                        >
                          <p className="text-sm sm:text-base font-semibold text-white">
                            {opt.es}
                          </p>
                          {isTransOpen && (
                            <p className="mt-1 font-armenian text-xs sm:text-sm text-amber-300">
                              🇦🇲 {opt.hy}
                            </p>
                          )}

                          {isSelected && 'feedbackEs' in opt && (
                            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-[#FF8A00]/40 text-xs text-amber-200 space-y-1 animate-in fade-in">
                              <p className="font-bold text-[#FFD43B]">
                                {opt.feedbackEs}
                              </p>
                              {showExplanationTrans && (
                                <p className="font-armenian text-zinc-300">
                                  {opt.feedbackHy}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => toggleOptionTranslation(e, opt.id)}
                          className={`shrink-0 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            isTransOpen
                              ? 'bg-[#FF8A00] text-black'
                              : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                          }`}
                        >
                          <Languages className="w-3 h-3" />
                          <span className="font-armenian">HY</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Question Type: WORD ORDER (ORDENA LAS PALABRAS) */}
            {currentQ.type === 'word_order' && (
              <div className="space-y-4">
                {/* Result Sentence Builder Box */}
                <div className="min-h-16 p-4 rounded-2xl bg-black/40 border-2 border-dashed border-[#FF8A00]/40 flex flex-wrap items-center gap-2">
                  {orderedWords.length === 0 ? (
                    <span className="text-xs sm:text-sm text-zinc-400 italic">
                      Toca las palabras de abajo para colocarlas aquí en orden correcto...
                    </span>
                  ) : (
                    orderedWords.map((word, idx) => (
                      <button
                        key={`${word}_${idx}`}
                        onClick={() => handleWordClick(word, false)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-black font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform"
                      >
                        {word} ✕
                      </button>
                    ))
                  )}
                </div>

                {/* Available Word Chips */}
                <div className="p-4 rounded-2xl bg-[#480923] border border-[#C62828]/50 flex flex-wrap gap-2 justify-center">
                  {availableWords.map((word, idx) => (
                    <button
                      key={`${word}_avail_${idx}`}
                      onClick={() => handleWordClick(word, true)}
                      className="px-3.5 py-2 rounded-xl bg-[#650D32] hover:bg-[#80133F] text-white font-bold text-xs sm:text-sm border border-[#C62828] hover:border-[#FF8A00] transition-all hover:scale-105 shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Type: OPEN WRITTEN TEXT (RESPONDE CON TUS PALABRAS) */}
            {currentQ.type === 'open_text' && (
              <div className="space-y-4">
                {/* Hints toggle */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowHint((prev) => !prev)}
                    className="text-xs font-bold text-[#FFD43B] hover:text-[#FF8A00] flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{showHint ? 'Ocultar pistas' : 'Ver pistas y palabras clave'}</span>
                  </button>

                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    {isSavingText ? (
                      <span className="text-amber-300 animate-pulse font-medium">
                        Guardando automáticamente...
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        ✓ Guardado en vivo para el profesor
                      </span>
                    )}
                  </div>
                </div>

                {/* Hint Card */}
                {showHint && currentQ.hintEs && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-[#FF8A00]/40 text-xs text-amber-200 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FFD43B]">💡 Pista de apoyo:</span>
                      <button
                        onClick={() => setShowHintTrans((prev) => !prev)}
                        className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-zinc-300"
                      >
                        {showHintTrans ? 'Փակել' : '🇦🇲 Հայերեն'}
                      </button>
                    </div>
                    <p>{currentQ.hintEs}</p>
                    {showHintTrans && currentQ.hintHy && (
                      <p className="font-armenian text-amber-300">{currentQ.hintHy}</p>
                    )}
                    {'keywords' in currentQ && currentQ.keywords && (
                      <div className="pt-2 flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                          Palabras útiles:
                        </span>
                        {currentQ.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded-full bg-[#FF8A00]/20 text-[#FFD43B] border border-[#FF8A00]/30 text-[10px] font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={currentTextAnswer}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onBlur={handleBlurText}
                    placeholder="Escribe tu respuesta aquí en español... (Se guarda automáticamente mientras escribes)"
                    className="w-full bg-[#480923] border border-[#C62828] focus:border-[#FF8A00] rounded-2xl p-4 text-white text-sm outline-none transition-colors placeholder-zinc-400"
                  />
                </div>

                {/* Suggested model answer reveal */}
                <div className="pt-2">
                  <details className="group rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
                    <summary className="font-bold text-[#FFD43B] cursor-pointer flex items-center gap-1 select-none">
                      <Eye className="w-3.5 h-3.5 text-[#FF8A00]" />
                      <span>Ver ejemplo de respuesta modelo</span>
                    </summary>
                    <div className="mt-2 space-y-1 text-zinc-200">
                      <p className="italic font-medium">«{currentQ.suggestedAnswerEs}»</p>
                      <p className="font-armenian text-amber-200">«{currentQ.suggestedAnswerHy}»</p>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Explanation & Feedback Card (When Answered) */}
            {isAnswered && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 space-y-2 ${
                  isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-100'
                    : 'bg-red-950/70 border-red-500/60 text-red-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-black text-emerald-300 text-base">
                          ¡Muy bien! ¡Excelente! 🌟
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="font-black text-red-300 text-base">
                          ¡No te preocupes! Repasa la respuesta correcta:
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setShowExplanationTrans((prev) => !prev)}
                    className="px-2.5 py-1 rounded-lg bg-black/40 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Languages className="w-3 h-3" />
                    <span className="font-armenian">
                      {showExplanationTrans ? 'Փակել' : 'Բացատրություն (🇦🇲)'}
                    </span>
                  </button>
                </div>

                <p className="leading-relaxed font-medium">
                  {currentQ.explanationEs}
                </p>

                {showExplanationTrans && (
                  <p className="font-armenian text-amber-200/90 leading-relaxed pt-1 border-t border-white/10">
                    🇦🇲 {currentQ.explanationHy}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Question Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#C62828]/40">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {/* Retry button for question */}
              {isAnswered && !isCorrect && (
                <button
                  onClick={() => {
                    // Allow retry
                    const updatedAnswers = { ...progress.answers };
                    delete updatedAnswers[currentQ.id];
                    const nextProgress = {
                      ...progress,
                      answers: updatedAnswers,
                    };
                    setProgress(nextProgress);
                    syncProgressToServer(nextProgress);
                    if (currentQ.type === 'word_order') {
                      setAvailableWords([...currentQ.words].sort(() => Math.random() - 0.5));
                      setOrderedWords([]);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF8A00]/20 hover:bg-[#FF8A00] text-[#FFD43B] hover:text-black border border-[#FF8A00]/40 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Probar de nuevo</span>
                </button>
              )}

              {/* Next Question / Finish Game Button */}
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Advance to next game in list
                    const currentIdx = GAMES_LIST.findIndex((g) => g.id === activeGameId);
                    const nextGame = GAMES_LIST[(currentIdx + 1) % GAMES_LIST.length];
                    setActiveGameId(nextGame.id);
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Siguiente Juego! ({GAMES_LIST[(GAMES_LIST.findIndex((g) => g.id === activeGameId) + 1) % GAMES_LIST.length].titleEs})</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
