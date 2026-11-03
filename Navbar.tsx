import React, { useState } from 'react';
import {
  Trophy,
  Star,
  RotateCcw,
  GraduationCap,
  User,
  CloudCheck,
  CloudOff,
  Flame,
  Volume2,
} from 'lucide-react';
import { DifficultyLevel, StudentProgress } from './types';

interface NavbarProps {
  currentTab: 'video' | 'subtitles' | 'vocab' | 'games' | 'teacher';
  setCurrentTab: (tab: 'video' | 'subtitles' | 'vocab' | 'games' | 'teacher') => void;
  progress: StudentProgress;
  onOpenReset: () => void;
  onUpdateLevel: (level: DifficultyLevel) => void;
  onUpdateStudentName: (name: string) => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  progress,
  onOpenReset,
  onUpdateLevel,
  onUpdateStudentName,
  isBackendConnected,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(progress.studentName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateStudentName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const totalAnswered = progress.stats.totalQuestionsAnswered;
  const correctCount = progress.stats.correctAnswers;
  const pct = totalAnswered > 0 ? Math.round((correctCount / Math.max(1, totalAnswered)) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 bg-[#650D32]/95 backdrop-blur-md border-b border-[#C62828]/40 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#FF8A00] to-[#FFD43B] flex items-center justify-center shadow-lg shadow-[#FF8A00]/30 transform hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#650D32]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                ÁLVARO SOLER
              </h1>
              <span className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-[#650D32]">
                ESPAÑOL EN ACCIÓN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#FFD43B]/90 font-medium">
              Escucha, comprende, juega y habla español.
            </p>
          </div>
        </div>

        {/* Right side controls: Student identity, Level, Stars, Reset */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Cloud Sync Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isBackendConnected
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-900/50 text-amber-300 border border-amber-500/30'
            }`}
            title={isBackendConnected ? 'Respuestas sincronizadas con el profesor en tiempo real' : 'Guardado local activo'}
          >
            {isBackendConnected ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">En línea</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Local</span>
              </>
            )}
          </div>

          {/* Student Name */}
          <div className="flex items-center bg-[#480923]/80 border border-[#C62828]/50 rounded-xl px-2.5 py-1">
            <User className="w-4 h-4 text-[#FF8A00] mr-1.5" />
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="bg-black/40 text-white text-xs sm:text-sm px-2 py-0.5 rounded outline-none border border-[#FF8A00] w-24 sm:w-28"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xs sm:text-sm font-semibold text-white hover:text-[#FFD43B] flex items-center gap-1 transition-colors"
                title="Haz clic para cambiar tu nombre"
              >
                <span>{progress.studentName}</span>
                <span className="text-[10px] text-zinc-400">✏️</span>
              </button>
            )}
          </div>

          {/* Difficulty Level Switcher */}
          <div className="flex items-center bg-[#480923] border border-[#C62828]/60 rounded-xl p-0.5">
            <button
              onClick={() => onUpdateLevel('A2')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                progress.level === 'A2'
                  ? 'bg-[#FF8A00] text-black shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              A2
            </button>
            <button
              onClick={() => onUpdateLevel('B1')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                progress.level === 'B1'
                  ? 'bg-[#FF8A00] text-black shadow-md'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              B1–B2
            </button>
          </div>

          {/* Stars & Score */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF8A00]/20 to-[#FFD43B]/20 border border-[#FF8A00]/40 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-[#FFD43B]">
            <Star className="w-4 h-4 fill-[#FFD43B] text-[#FFD43B]" />
            <span>{progress.stats.totalStars}</span>
            <span className="text-zinc-400 font-normal ml-1">({pct}%)</span>
          </div>

          {/* Prominent Reset Button */}
          <button
            onClick={onOpenReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C62828]/80 hover:bg-[#C62828] text-white border border-red-500/40 hover:border-red-400 shadow-md transition-all active:scale-95"
            title="Сбросить прогресс / Reiniciar progreso"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REINICIAR</span>
            <span className="sm:hidden font-armenian">ԶՐՈՅԱՑՆԵԼ</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 border-t border-[#C62828]/30 text-xs sm:text-sm font-bold scrollbar-none">
        <button
          onClick={() => setCurrentTab('video')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'video'
              ? 'bg-[#FF8A00] text-black shadow-lg font-black'
              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>VIDEO & INTERACTIVO</span>
        </button>

        <button
          onClick={() => setCurrentTab('subtitles')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'subtitles'
              ? 'bg-[#FF8A00] text-black shadow-lg font-black'
              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span>SUBTÍTULOS</span>
          <span className="font-armenian text-xs opacity-90">(Ենթագրեր)</span>
        </button>

        <button
          onClick={() => setCurrentTab('vocab')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'vocab'
              ? 'bg-[#FF8A00] text-black shadow-lg font-black'
              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span>VOCABULARIO</span>
          <span className="font-armenian text-xs opacity-90">(Բառապաշար)</span>
        </button>

        <button
          onClick={() => setCurrentTab('games')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'games'
              ? 'bg-[#FFD43B] text-[#650D32] shadow-lg font-black'
              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#FF8A00]" />
          <span>JUEGOS (15+ ՄՈԴ)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#FF8A00] text-black text-[10px]">
            {progress.stats.completedGamesCount}/16
          </span>
        </button>

        <div className="flex-1" />

        {/* Teacher Room Tab */}
        <button
          onClick={() => setCurrentTab('teacher')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border ${
            currentTab === 'teacher'
              ? 'bg-amber-400 text-stone-950 font-black border-amber-300 shadow-lg'
              : 'bg-[#480923] text-amber-300 hover:bg-[#650D32] border-amber-500/40'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>PROFESOR</span>
          <span className="font-armenian text-xs font-semibold">(Ուսուցիչ)</span>
        </button>
      </div>
    </header>
  );
};
