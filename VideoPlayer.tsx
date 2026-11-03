import React from 'react';
import { Play, Sparkles, ExternalLink, HelpCircle, Film } from 'lucide-react';

export const VideoPlayer: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#650D32] to-[#480923] border border-[#C62828]/50 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF8A00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C62828]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#C62828]/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF8A00] text-black">
              YouTube Shorts
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Español de España
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Álvaro Soler — ¿Qué es lo que más mola de ser famoso?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-armenian mt-0.5">
            Իսպաներեն հարցազրույց. լսի՛ր Ալվարոյի կենդանի խոսքը և ծանոթացի՛ր ենթագրերին
          </p>
        </div>

        <a
          href="https://www.youtube.com/shorts/Yxp4zyexusk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all hover:scale-105"
        >
          <ExternalLink className="w-4 h-4 text-[#FFD43B]" />
          <span>Ver en YouTube</span>
        </a>
      </div>

      {/* Player Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Video Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#FF8A00]/50 bg-black">
            <iframe
              src="https://www.youtube-nocookie.com/embed/Yxp4zyexusk?rel=0&modestbranding=1&playsinline=1"
              title="Álvaro Soler - Shorts Entrevista"
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Video Guide & Advice Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#480923]/90 border border-[#C62828]/60 rounded-2xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Film className="w-5 h-5 text-[#FF8A00]" />
              <h3 className="font-bold text-base sm:text-lg text-[#FFD43B]">
                ¿Cómo estudiar con este video?
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-zinc-200">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF8A00] text-black font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white">Escucha el video 1 o 2 veces:</strong>{' '}
                  Intenta captar la idea global sin estresarte por cada palabra.
                  <p className="text-zinc-400 font-armenian text-xs mt-0.5">
                    Լսի՛ր տեսանյութը 1-2 անգամ՝ փորձելով հասկանալ ընդհանուր իմաստը։
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF8A00] text-black font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white">Explora los subtítulos interactivos abajo:</strong>{' '}
                  Lee el español a tu propio ritmo. Si tienes dudas, haz clic en cada frase para desplegar la traducción en armenio.
                  <p className="text-zinc-400 font-armenian text-xs mt-0.5">
                    Ստորև կարդա՛ ենթագրերը քո տեմպով. սեղմի՛ր յուրաքանչյուր նախադասության վրա՝ հայերեն թարգմանությունը բացելու համար։
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF8A00] text-black font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white">Aprende el vocabulario y juega:</strong>{' '}
                  Supera los 15 juegos para memorizar los modismos y la gramática para siempre.
                  <p className="text-zinc-400 font-armenian text-xs mt-0.5">
                    Անցի՛ր խաղերը՝ Ալվարոյի խոսակցական արտահայտությունները մեկընդմիշտ յուրացնելու համար։
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Golden Rule Note */}
          <div className="bg-[#FF8A00]/10 border border-[#FF8A00]/30 rounded-2xl p-4 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#FFD43B] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-200">
              <span className="font-bold text-[#FFD43B]">Regla de oro pedagógica:</span> Los subtítulos no avanzan automáticamente. Eres tú quien tiene el control total de lectura para aprender sin prisas.
              <p className="font-armenian text-amber-300/80 text-xs mt-1">
                Կարևոր կանոն. Ենթագրերը ավտոմատ առաջ չեն գնում տեսանյութի հետ։ Դուք ինքներդ եք ազատ կարդում ու կառավարում։
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
