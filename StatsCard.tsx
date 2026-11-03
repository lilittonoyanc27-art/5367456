import React from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { StudentProgress } from './types';
import { GAMES_LIST } from './data';

interface StatsCardProps {
  progress: StudentProgress;
  onGoToGames: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ progress, onGoToGames }) => {
  const totalAnswered = progress.stats.totalQuestionsAnswered;
  const correctCount = progress.stats.correctAnswers;
  const incorrectCount = progress.stats.incorrectAnswers;
  const pct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const completedGames = progress.stats.completedGamesCount;

  // Motivational badge dynamically calculated
  let motivationalBadge = {
    title: '¡Bienvenida al curso!',
    hy: 'Բարի գալուստ դասընթաց։',
    desc: 'Escucha el video y empieza tu primer juego interactivo.',
  };

  if (pct >= 85 && totalAnswered >= 15) {
    motivationalBadge = {
      title: '¡Eres una estrella! 🌟',
      hy: 'Դու իսկական աստղ ես։',
      desc: 'Dominio impresionante del español conversacional de Álvaro Soler.',
    };
  } else if (pct >= 70 && totalAnswered >= 10) {
    motivationalBadge = {
      title: '¡Excelente! ¡Lo has conseguido! 🏆',
      hy: 'Հիանալի՜ է։ Դու հաղթահարեցի՛ր։',
      desc: 'Gran precisión en las respuestas y comprensión auditiva.',
    };
  } else if (totalAnswered >= 5) {
    motivationalBadge = {
      title: '¡Sigue así! ¡Nivel completado! 🔥',
      hy: 'Շարունակի՛ր նույն ոգով։',
      desc: 'Estás avanzando a pasos agigantados. ¡No te detengas!',
    };
  }

  const lastGameMeta = GAMES_LIST.find((g) => g.id === progress.stats.lastGameId);

  return (
    <div className="bg-gradient-to-r from-[#650D32] via-[#80133F] to-[#480923] border border-[#C62828]/50 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF8A00]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Motivation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C62828]/40 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#FFD43B] flex items-center justify-center text-black font-black shadow-lg shadow-[#FF8A00]/30 shrink-0">
            <Trophy className="w-6 h-6 text-[#650D32]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {motivationalBadge.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-armenian font-semibold text-[#FFD43B]">
              {motivationalBadge.hy}
            </p>
            <p className="text-xs text-zinc-300 mt-0.5">
              {motivationalBadge.desc}
            </p>
          </div>
        </div>

        <button
          onClick={onGoToGames}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-black font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Practicar Juegos ➔</span>
        </button>
      </div>

      {/* Grid of 5 Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Progress % */}
        <div className="bg-[#480923]/90 border border-[#C62828]/60 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-bold">Acierto Global</span>
            <Flame className="w-4 h-4 text-[#FF8A00]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#FFD43B]">
            {pct}%
          </p>
          <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Completed Games */}
        <div className="bg-[#480923]/90 border border-[#C62828]/60 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-bold">Juegos Superados</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {completedGames} <span className="text-xs text-zinc-400 font-bold">/ 16</span>
          </p>
          <span className="text-[11px] font-armenian text-emerald-300 font-medium">
            Ավարտված խաղեր
          </span>
        </div>

        {/* Correct Answers */}
        <div className="bg-[#480923]/90 border border-emerald-500/40 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-bold text-emerald-300">Correctas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            {correctCount}
          </p>
          <span className="text-[11px] font-armenian text-emerald-300/80 font-medium">
            Ճիշտ պատասխաններ
          </span>
        </div>

        {/* Incorrect Answers */}
        <div className="bg-[#480923]/90 border border-red-500/40 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-bold text-red-300">Fallos</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-400">
            {incorrectCount}
          </p>
          <span className="text-[11px] font-armenian text-red-300/80 font-medium">
            Սխալներ (ուղղված)
          </span>
        </div>

        {/* Stars */}
        <div className="col-span-2 sm:col-span-1 bg-[#480923]/90 border border-amber-500/40 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="font-bold text-[#FFD43B]">Estrellas</span>
            <Star className="w-4 h-4 fill-[#FFD43B] text-[#FFD43B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#FFD43B]">
            {progress.stats.totalStars}
          </p>
          <span className="text-[11px] font-armenian text-amber-300/80 font-medium">
            Հավաքած աստղեր
          </span>
        </div>
      </div>
    </div>
  );
};
