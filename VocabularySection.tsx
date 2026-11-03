import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Languages,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VOCABULARY_DATA } from './data';
import { VocabItem } from './types';

export const VocabularySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVocabIds, setExpandedVocabIds] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedTranslationQuizzes, setRevealedTranslationQuizzes] = useState<Set<string>>(new Set());

  const toggleVocab = (id: string) => {
    setExpandedVocabIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleQuizTranslation = (e: React.MouseEvent, quizKey: string) => {
    e.stopPropagation();
    setRevealedTranslationQuizzes((prev) => {
      const next = new Set(prev);
      if (next.has(quizKey)) next.delete(quizKey);
      else next.add(quizKey);
      return next;
    });
  };

  const handleSelectOption = (vocabId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [vocabId]: optionId,
    }));
  };

  const filteredVocab = VOCABULARY_DATA.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.word.toLowerCase().includes(q) ||
      item.hy.toLowerCase().includes(q) ||
      item.meaningEs.toLowerCase().includes(q) ||
      item.exampleEs.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-gradient-to-b from-[#650D32] to-[#480923] border border-[#C62828]/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#C62828]/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-[#FF8A00]" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              VOCABULARIO DEL VIDEO
            </h2>
            <span className="text-[#FFD43B] font-armenian font-bold text-lg sm:text-xl">
              — Բառապաշար
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300">
            22 expresiones y giros coloquiales extraídos de la conversación real de Álvaro Soler.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar vocabulario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#480923] border border-[#C62828]/60 text-white placeholder-zinc-400 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-1.5 outline-none focus:border-[#FF8A00] w-full sm:w-56"
          />
        </div>
      </div>

      {/* Vocab Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVocab.map((item: VocabItem) => {
          const isExpanded = expandedVocabIds.has(item.id);
          const chosenAnswer = selectedAnswers[item.id];
          const isAnswered = !!chosenAnswer;
          const isCorrect = chosenAnswer === item.quiz.correctId;
          const isQuizTransRevealed = revealedTranslationQuizzes.has(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-[#650D32] border-[#FF8A00] shadow-lg shadow-[#FF8A00]/10'
                  : 'bg-[#480923]/90 border-[#C62828]/50 hover:border-[#FF8A00]/60'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleVocab(item.id)}
                className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                      {item.word}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FF8A00]/20 text-[#FFD43B] border border-[#FF8A00]/30">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-armenian font-semibold text-amber-300 mt-1">
                    🇦🇲 {item.hy}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-zinc-300 flex items-center gap-1">
                    <span className="hidden sm:inline font-armenian text-[11px]">
                      {isExpanded ? 'Փակել' : 'Մանրամասն'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>

              {/* Card Body: Example & Mini Quiz */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                  {/* Meaning & Video Quote */}
                  <div className="bg-black/25 rounded-xl p-3 border border-white/5 space-y-2 mt-3">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Significado:
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-200">{item.meaningEs}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Ejemplo real en el video:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-white italic mt-0.5">
                        «{item.exampleEs}»
                      </p>
                      <p className="text-xs font-armenian text-amber-200/90 mt-0.5">
                        «{item.exampleHy}»
                      </p>
                    </div>
                  </div>

                  {/* Mini Practice Quiz */}
                  <div className="bg-[#480923] rounded-xl p-3.5 border border-[#C62828]/70">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-[#FFD43B]" />
                        <h4 className="text-xs sm:text-sm font-bold text-[#FFD43B]">
                          Mini-Reto de práctica
                        </h4>
                      </div>

                      {/* Translation toggle button for the quiz */}
                      <button
                        onClick={(e) => toggleQuizTranslation(e, item.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                          isQuizTransRevealed
                            ? 'bg-[#FF8A00] text-black'
                            : 'bg-white/10 text-zinc-300 hover:text-white'
                        }`}
                        title="Ver traducción armenia del ejercicio"
                      >
                        <Languages className="w-3 h-3" />
                        <span>🇦🇲 HY</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-white mb-2.5">
                      {item.quiz.questionEs}
                    </p>
                    {isQuizTransRevealed && (
                      <p className="text-xs font-armenian font-semibold text-amber-300 mb-2.5 -mt-1">
                        {item.quiz.questionHy}
                      </p>
                    )}

                    {/* Quiz Options */}
                    <div className="space-y-1.5">
                      {item.quiz.options.map((opt) => {
                        const isChosen = chosenAnswer === opt.id;
                        const isOptCorrect = opt.id === item.quiz.correctId;

                        let btnStyle = 'bg-black/30 hover:bg-black/50 border-white/10 text-zinc-200';
                        if (isAnswered) {
                          if (isOptCorrect) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-red-950/80 border-red-500 text-red-200 font-bold';
                          } else {
                            btnStyle = 'bg-black/20 border-white/5 text-zinc-400 opacity-60';
                          }
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${btnStyle}`}
                            onClick={() => handleSelectOption(item.id, opt.id)}
                          >
                            <span className="font-medium pr-2">
                              {opt.es}
                              {isQuizTransRevealed && (
                                <span className="block text-[11px] font-armenian text-amber-200/90 mt-0.5">
                                  {opt.hy}
                                </span>
                              )}
                            </span>

                            {isAnswered && (
                              <span className="shrink-0">
                                {isOptCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : isChosen ? (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                ) : null}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz Feedback */}
                    {isAnswered && (
                      <div
                        className={`mt-3 p-2.5 rounded-lg text-xs border ${
                          isCorrect
                            ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-red-900/40 border-red-500/40 text-red-200'
                        }`}
                      >
                        <p className="font-bold flex items-center gap-1 mb-0.5">
                          {isCorrect ? '¡Correcto! 🌟' : '¡Incorrecto! Repasa la explicación:'}
                        </p>
                        <p>{item.quiz.explanationEs}</p>
                        {isQuizTransRevealed && (
                          <p className="font-armenian text-amber-200 mt-1">
                            {item.quiz.explanationHy}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
