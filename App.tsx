/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { VideoPlayer } from './VideoPlayer';
import { InteractiveSubtitles } from './InteractiveSubtitles';
import { VocabularySection } from './VocabularySection';
import { GamesSection } from './GamesSection';
import { TeacherDashboard } from './TeacherDashboard';
import { ResetModal } from './ResetModal';
import { StatsCard } from './StatsCard';
import {
  StudentProgress,
  DifficultyLevel,
} from './types';
import {
  loadLocalProgress,
  saveLocalProgress,
  syncProgressToServer,
  checkServerStatus,
  saveStudentName,
  getInitialProgress,
} from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'video' | 'subtitles' | 'vocab' | 'games' | 'teacher'>('video');
  const [progress, setProgress] = useState<StudentProgress>(loadLocalProgress());
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Initial load & periodic check of server status
  useEffect(() => {
    checkServerStatus().then((res) => {
      setIsBackendConnected(res.online);
    });

    const interval = setInterval(() => {
      checkServerStatus().then((res) => {
        setIsBackendConnected(res.online);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Update level
  const handleUpdateLevel = (level: DifficultyLevel) => {
    const next = { ...progress, level, updatedAt: new Date().toISOString() };
    setProgress(next);
    syncProgressToServer(next);
  };

  // Update student name
  const handleUpdateStudentName = (name: string) => {
    saveStudentName(name);
    const next = { ...progress, studentName: name, updatedAt: new Date().toISOString() };
    setProgress(next);
    syncProgressToServer(next);
  };

  // Reset current game
  const handleResetCurrentGame = () => {
    const gameId = progress.stats.lastGameId || 'escucha_elige';
    // Remove answers for this game
    const updatedAnswers = { ...progress.answers };
    Object.keys(updatedAnswers).forEach((qId) => {
      if (qId.startsWith(gameId.substring(0, 3))) {
        delete updatedAnswers[qId];
      }
    });

    const updatedGameProg = { ...progress.gameProgress };
    delete updatedGameProg[gameId];

    const next: StudentProgress = {
      ...progress,
      answers: updatedAnswers,
      gameProgress: updatedGameProg,
      updatedAt: new Date().toISOString(),
    };
    setProgress(next);
    syncProgressToServer(next);
  };

  // Reset all progress
  const handleResetAllProgress = () => {
    const reset = getInitialProgress(progress.studentId, progress.studentName);
    setProgress(reset);
    saveLocalProgress(reset);
    syncProgressToServer(reset);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#650D32] via-[#480923] to-[#2E0516] text-white flex flex-col font-sans selection:bg-[#FF8A00] selection:text-black">
      {/* Navbar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        progress={progress}
        onOpenReset={() => setIsResetModalOpen(true)}
        onUpdateLevel={handleUpdateLevel}
        onUpdateStudentName={handleUpdateStudentName}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* TAB 1: VIDEO & OVERVIEW */}
        {currentTab === 'video' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Embedded Video Player */}
            <VideoPlayer />

            {/* Overall Student Progress Dashboard Card */}
            <StatsCard
              progress={progress}
              onGoToGames={() => setCurrentTab('games')}
            />

            {/* Interactive Subtitles directly underneath video, completely unsynced */}
            <InteractiveSubtitles />
          </div>
        )}

        {/* TAB 2: SUBTITLES ONLY */}
        {currentTab === 'subtitles' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <InteractiveSubtitles />
          </div>
        )}

        {/* TAB 3: VOCABULARY */}
        {currentTab === 'vocab' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <VocabularySection />
          </div>
        )}

        {/* TAB 4: GAMES (16 INTERACTIVE MODES) */}
        {currentTab === 'games' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <StatsCard
              progress={progress}
              onGoToGames={() => {}}
            />
            <GamesSection
              progress={progress}
              setProgress={setProgress}
              onOpenReset={() => setIsResetModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 5: TEACHER DASHBOARD */}
        {currentTab === 'teacher' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <TeacherDashboard
              currentStudentProgress={progress}
              onExitTeacherMode={() => setCurrentTab('video')}
            />
          </div>
        )}
      </main>

      {/* Confirmation Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetCurrentGame={handleResetCurrentGame}
        onResetAllProgress={handleResetAllProgress}
      />

      {/* Footer */}
      <footer className="border-t border-[#C62828]/40 bg-[#480923]/90 py-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-white tracking-wide">
            ÁLVARO SOLER — ESPAÑOL EN ACCIÓN
          </p>
          <p className="text-[#FFD43B] font-armenian">
            Իսպաներենի ինտերակտիվ դասընթաց Ալվարո Սոլերի հարցազրույցի հիման վրա (իսպաներեն և հայերեն)
          </p>
          <p className="text-[11px] text-zinc-400">
            Diseñado para estudiantes y profesores de español. Respuestas guardadas en tiempo real.
          </p>
        </div>
      </footer>
    </div>
  );
}
