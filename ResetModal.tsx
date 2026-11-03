import React from 'react';
import { AlertTriangle, RotateCcw, X, Trash2 } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetCurrentGame: () => void;
  onResetAllProgress: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onResetCurrentGame,
  onResetAllProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#650D32] to-[#480923] border-2 border-red-500 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 shadow-lg">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            ¿Reiniciar el Progreso?
          </h3>
          <p className="text-sm font-armenian font-bold text-[#FFD43B]">
            Վստա՞հ եք, որ ցանկանում եք զրոյացնել առաջընթացը։
          </p>
          <p className="text-xs text-zinc-300 pt-1">
            Por favor, selecciona qué tipo de reinicio deseas realizar:
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {/* Option 1: Reset current game only */}
          <button
            onClick={() => {
              onResetCurrentGame();
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-[#480923] hover:bg-[#650D32] border border-[#FF8A00]/50 hover:border-[#FF8A00] text-left transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF8A00]/20 text-[#FFD43B] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FF8A00] group-hover:text-black transition-colors">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">
                1. Reiniciar solo este juego actual
              </span>
              <span className="font-armenian text-xs text-amber-300 block mt-0.5">
                Սկսել միայն այս ընթացիկ խաղը նորից
              </span>
              <span className="text-[11px] text-zinc-400 block mt-1">
                Borra las respuestas del juego activo para volver a practicarlo desde cero.
              </span>
            </div>
          </button>

          {/* Option 2: Full reset */}
          <button
            onClick={() => {
              onResetAllProgress();
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-red-950/70 hover:bg-red-900 border border-red-500/60 hover:border-red-400 text-left transition-all group flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600/30 text-red-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-red-200 block">
                2. Reiniciar TODO mi progreso académico
              </span>
              <span className="font-armenian text-xs text-red-300 block mt-0.5">
                Ամբողջ ուսումնական առաջընթացի զրոյացում
              </span>
              <span className="text-[11px] text-zinc-300 block mt-1">
                Restablece todas las preguntas, estrellas, puntuaciones y respuestas escritas.
              </span>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 font-bold text-xs transition-colors"
          >
            Cancelar y volver (Չեղարկել)
          </button>
        </div>
      </div>
    </div>
  );
};
