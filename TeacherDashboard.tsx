import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Unlock,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Eye,
  AlertCircle,
  FileText,
  Star,
  RefreshCw,
} from 'lucide-react';
import { StudentProgress, GameQuestion } from './types';
import { fetchTeacherData, teacherResetStudent } from './api';
import { QUESTIONS_DATABASE, GAMES_LIST } from './data';

interface TeacherDashboardProps {
  currentStudentProgress: StudentProgress;
  onExitTeacherMode: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentStudentProgress,
  onExitTeacherMode,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    currentStudentProgress.studentId
  );
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'written'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Handle Login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Por favor introduce la contraseña del profesor');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const res = await fetchTeacherData(passcode);
    setIsLoading(false);

    if (res.success && res.students) {
      setIsAuthenticated(true);
      // Ensure current student is present in the list
      const list = [...res.students];
      if (!list.some((s) => s.studentId === currentStudentProgress.studentId)) {
        list.unshift(currentStudentProgress);
      }
      setStudents(list);
      setSelectedStudentId(currentStudentProgress.studentId);
    } else {
      setErrorMsg(res.error || 'Contraseña incorrecta');
    }
  };

  // Refresh students list
  const refreshData = async () => {
    setIsLoading(true);
    const res = await fetchTeacherData(passcode);
    setIsLoading(false);
    if (res.success && res.students) {
      const list = [...res.students];
      if (!list.some((s) => s.studentId === currentStudentProgress.studentId)) {
        list.unshift(currentStudentProgress);
      }
      setStudents(list);
    }
  };

  // Reset a specific student
  const handleResetStudent = async (studentId: string) => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas reiniciar todos los progresos de esta alumna?'
      )
    ) {
      return;
    }
    await teacherResetStudent(passcode, studentId);
    setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
    setSelectedStudentId(null);
  };

  const selectedStudent =
    students.find((s) => s.studentId === selectedStudentId) ||
    (selectedStudentId === currentStudentProgress.studentId ? currentStudentProgress : null);

  // Flatten all questions to lookup text & details
  const allQuestionsMap: Record<string, GameQuestion> = {};
  Object.values(QUESTIONS_DATABASE).forEach((qList) => {
    qList.forEach((q) => {
      allQuestionsMap[q.id] = q;
    });
  });

  // Filter students
  const filteredStudents = students.filter((s) =>
    (s.studentName || 'Estudiante')
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Protected View Authentication */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-gradient-to-b from-[#650D32] to-[#480923] border border-[#C62828] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF8A00] to-[#FFD43B] flex items-center justify-center mx-auto shadow-lg shadow-[#FF8A00]/30">
            <Lock className="w-8 h-8 text-[#650D32]" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              PANEL DEL PROFESOR
            </h2>
            <p className="text-sm font-armenian text-amber-300 font-semibold mt-1">
              Ուսուցչի առանձնացված պաշտպանված մուտք
            </p>
            <p className="text-xs text-zinc-300 mt-2">
              Ingresa la clave de acceso de docente para revisar las respuestas y el progreso en tiempo real de las alumnas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Contraseña (ej: profesor o soler2025)"
                className="w-full bg-[#480923] border border-[#C62828] focus:border-[#FF8A00] rounded-xl px-4 py-2.5 text-white text-center font-mono text-sm outline-none placeholder-zinc-500"
              />
              {errorMsg && (
                <p className="text-xs text-red-400 mt-1.5 font-semibold">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFD43B] text-black font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isLoading ? 'Verificando...' : 'Acceder al Panel'}</span>
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 border-t border-white/10 pt-3">
            💡 Contraseña sugerida para pruebas: <strong className="text-[#FFD43B]">profesor</strong> o <strong className="text-[#FFD43B]">soler2025</strong>
          </p>
        </div>
      ) : (
        /* Authenticated Teacher View */
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-[#480923]/90 border border-[#C62828]/50 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  CABINET DOCENTE — Ուսուցչի Կաբինետ
                </h2>
                <p className="text-xs text-amber-300 font-medium">
                  {students.length} alumna(s) registrada(s) con guardado automático continuo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Actualizar datos del servidor"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>

              <button
                onClick={onExitTeacherMode}
                className="px-3.5 py-1.5 rounded-xl bg-[#C62828] hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                Volver a la lección
              </button>
            </div>
          </div>

          {/* 2-Column Layout: Students List on Left, Detailed Work on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Student List (Left Column) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#480923]/80 border border-[#C62828]/50 rounded-2xl p-3.5">
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Buscar alumna..."
                    className="w-full bg-[#650D32] border border-[#C62828] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none placeholder-zinc-400"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredStudents.map((st) => {
                    const isSelected = selectedStudentId === st.studentId;
                    const answeredCount = Object.keys(st.answers || {}).length;
                    const correctCount = st.stats?.correctAnswers || 0;
                    const pct =
                      answeredCount > 0
                        ? Math.round((correctCount / answeredCount) * 100)
                        : 0;

                    const isCompleted =
                      st.stats?.completedGamesCount && st.stats.completedGamesCount >= 10;

                    return (
                      <div
                        key={st.studentId}
                        onClick={() => setSelectedStudentId(st.studentId)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FF8A00] text-black border-amber-300 shadow-lg'
                            : 'bg-[#650D32] hover:bg-[#80133F] border-[#C62828]/50 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm tracking-wide">
                            {st.studentName || 'Estudiante'}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? isSelected
                                  ? 'bg-black text-emerald-400'
                                  : 'bg-emerald-900 text-emerald-300'
                                : isSelected
                                ? 'bg-black text-[#FFD43B]'
                                : 'bg-amber-900/60 text-amber-300'
                            }`}
                          >
                            {isCompleted ? 'Completado' : 'En progreso'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs opacity-90 mt-1">
                          <span>
                            Nivel: <strong>{st.level}</strong>
                          </span>
                          <span>
                            Respuestas: <strong>{answeredCount}</strong>
                          </span>
                          <span>
                            Aciertos: <strong>{pct}%</strong>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] opacity-75 mt-2 pt-1.5 border-t border-black/10">
                          <span>
                            {st.lastActiveAt
                              ? new Date(st.lastActiveAt).toLocaleDateString() +
                                ' ' +
                                new Date(st.lastActiveAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Hoy'}
                          </span>
                          <span className="flex items-center gap-0.5 text-[#FFD43B]">
                            <Star className="w-3 h-3 fill-current" />
                            {st.stats?.totalStars || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Student History (Right Column) */}
            <div className="lg:col-span-8 space-y-5">
              {selectedStudent ? (
                <div className="bg-[#480923]/90 border border-[#C62828]/50 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                  {/* Student Header & Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C62828]/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {selectedStudent.studentName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-[#FF8A00] text-black text-xs font-black">
                          Nivel {selectedStudent.level}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        ID: {selectedStudent.studentId} • Última actividad:{' '}
                        {selectedStudent.lastActiveAt
                          ? new Date(selectedStudent.lastActiveAt).toLocaleString()
                          : 'Reciente'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleResetStudent(selectedStudent.studentId)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar a esta alumna</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#650D32] p-3 rounded-2xl border border-[#C62828]/50">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">
                        Total Respondidas
                      </span>
                      <p className="text-lg font-black text-white">
                        {Object.keys(selectedStudent.answers || {}).length}
                      </p>
                    </div>

                    <div className="bg-[#650D32] p-3 rounded-2xl border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        Aciertos
                      </span>
                      <p className="text-lg font-black text-emerald-300">
                        {selectedStudent.stats?.correctAnswers || 0}
                      </p>
                    </div>

                    <div className="bg-[#650D32] p-3 rounded-2xl border border-red-500/40">
                      <span className="text-[10px] text-red-400 font-bold uppercase">
                        Errores
                      </span>
                      <p className="text-lg font-black text-red-300">
                        {selectedStudent.stats?.incorrectAnswers || 0}
                      </p>
                    </div>

                    <div className="bg-[#650D32] p-3 rounded-2xl border border-amber-500/40">
                      <span className="text-[10px] text-[#FFD43B] font-bold uppercase">
                        Estrellas
                      </span>
                      <p className="text-lg font-black text-[#FFD43B] flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FFD43B]" />
                        {selectedStudent.stats?.totalStars || 0}
                      </p>
                    </div>
                  </div>

                  {/* Filter tabs: All, Only Errors, Written answers */}
                  <div className="flex items-center gap-2 border-b border-[#C62828]/40 pb-3">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'all'
                          ? 'bg-[#FF8A00] text-black font-black'
                          : 'bg-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      Todas las respuestas ({Object.keys(selectedStudent.answers || {}).length})
                    </button>

                    <button
                      onClick={() => setFilterType('errors')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'errors'
                          ? 'bg-red-500 text-white font-black'
                          : 'bg-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ⚠️ Preguntas con dificultad / Errores
                    </button>

                    <button
                      onClick={() => setFilterType('written')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'written'
                          ? 'bg-amber-400 text-black font-black'
                          : 'bg-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ✍️ Respuestas escritas ({Object.keys(selectedStudent.writtenAnswers || {}).length})
                    </button>
                  </div>

                  {/* Answers Questionnaire Breakdown */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {filterType === 'written' ? (
                      /* Written open text answers */
                      Object.keys(selectedStudent.writtenAnswers || {}).length === 0 ? (
                        <p className="text-xs text-zinc-400 italic text-center py-6">
                          La alumna todavía no ha escrito respuestas en la sección «Responde con tus palabras».
                        </p>
                      ) : (
                        Object.entries(selectedStudent.writtenAnswers || {}).map(
                          ([qId, record]) => {
                            const q = allQuestionsMap[qId];
                            return (
                              <div
                                key={qId}
                                className="bg-[#650D32] border border-[#C62828] rounded-2xl p-4 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between text-zinc-400">
                                  <span className="font-bold text-[#FFD43B]">
                                    {q?.questionEs || qId}
                                  </span>
                                  <span>
                                    {record.lastSaved
                                      ? new Date(record.lastSaved).toLocaleTimeString()
                                      : ''}
                                  </span>
                                </div>
                                {q?.questionHy && (
                                  <p className="font-armenian text-amber-200">
                                    🇦🇲 {q.questionHy}
                                  </p>
                                )}
                                <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-white text-sm">
                                  <p className="font-medium whitespace-pre-wrap">
                                    {record.text || '(Texto vacío o en curso)'}
                                  </p>
                                </div>
                                {q && 'suggestedAnswerEs' in q && (
                                  <div className="text-[11px] text-zinc-400 pt-1">
                                    <strong>Respuesta modelo sugerida:</strong> {q.suggestedAnswerEs}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      )
                    ) : (
                      /* Multiple choice answers */
                      Object.entries(selectedStudent.answers || {})
                        .filter(([_, ans]) => {
                          if (filterType === 'errors') return !ans.isCorrect;
                          return true;
                        })
                        .map(([qId, ans]) => {
                          const q = allQuestionsMap[qId];

                          return (
                            <div
                              key={qId}
                              className={`rounded-2xl border p-4 space-y-2 text-xs transition-all ${
                                ans.isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/40'
                                  : 'bg-red-950/40 border-red-500/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {ans.isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span
                                    className={`font-black ${
                                      ans.isCorrect ? 'text-emerald-300' : 'text-red-300'
                                    }`}
                                  >
                                    {ans.isCorrect ? 'Correcto' : 'Incorrecto'}
                                  </span>
                                </div>

                                <span className="text-[11px] text-zinc-400">
                                  Intentos: {ans.attempts}
                                </span>
                              </div>

                              <p className="text-sm font-bold text-white">
                                {q?.questionEs || `Pregunta ID: ${qId}`}
                              </p>
                              {q?.questionHy && (
                                <p className="font-armenian text-amber-200">
                                  🇦🇲 {q.questionHy}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                <div className="bg-black/30 p-2.5 rounded-xl">
                                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                                    Respuesta de la alumna:
                                  </span>
                                  <span className="font-semibold text-amber-300">
                                    {Array.isArray(ans.selectedOption)
                                      ? ans.selectedOption.join(' ')
                                      : ans.selectedOption}
                                  </span>
                                </div>

                                {q && 'correctOptionId' in q && (
                                  <div className="bg-black/30 p-2.5 rounded-xl">
                                    <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-0.5">
                                      Respuesta correcta:
                                    </span>
                                    <span className="font-semibold text-emerald-300">
                                      {q.correctOptionId}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {q?.explanationEs && (
                                <div className="mt-2 text-[11px] text-zinc-300 pt-1">
                                  <strong>Explicación:</strong> {q.explanationEs}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#480923]/60 border border-[#C62828]/40 rounded-3xl p-10 text-center text-zinc-400">
                  <Users className="w-12 h-12 text-[#FF8A00] mx-auto mb-3 opacity-60" />
                  <p>Selecciona una alumna de la lista izquierda para auditar sus respuestas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
