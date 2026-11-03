import React, { useState } from 'react';
import {
  Languages,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { SUBTITLES_DATA } from './data';
import { SubtitleItem } from './types';

export const InteractiveSubtitles: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSentence = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set(SUBTITLES_DATA.map((s) => s.id));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredSubtitles = SUBTITLES_DATA.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      sub.es.toLowerCase().includes(q) ||
      sub.hy.toLowerCase().includes(q) ||
      sub.time.includes(q)
    );
  });

  return (
    <div className="bg-gradient-to-b from-[#650D32] to-[#480923] border border-[#C62828]/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#C62828]/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              SUBTÍTULOS INTERACTIVOS
            </h2>
            <span className="text-[#FFD43B] font-armenian font-bold text-lg sm:text-xl">
              — Ինտերակտիվ ենթագրեր
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300">
            Haz clic en cualquier frase para revelar su traducción al armenio. Puedes abrir varias a la vez.
          </p>
          <p className="text-xs text-amber-300/80 font-armenian mt-0.5">
            Սեղմի՛ր ցանկացած նախադասության վրա՝ հայերեն թարգմանությունը բացելու համար։
          </p>
        </div>

        {/* Global Expand / Collapse and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en texto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#480923] border border-[#C62828]/60 text-white placeholder-zinc-400 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-1.5 outline-none focus:border-[#FF8A00] w-36 sm:w-44 transition-colors"
            />
          </div>

          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF8A00]/20 hover:bg-[#FF8A00] text-[#FFD43B] hover:text-black border border-[#FF8A00]/40 transition-all"
            title="Mostrar todas las traducciones"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver todo (🇦🇲)</span>
          </button>

          <button
            onClick={collapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20 transition-all"
            title="Ocultar todas las traducciones"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ocultar</span>
          </button>
        </div>
      </div>

      {/* Subtitles List */}
      <div className="space-y-3">
        {filteredSubtitles.map((sub: SubtitleItem, index: number) => {
          const isExpanded = expandedIds.has(sub.id);

          return (
            <div
              key={sub.id}
              onClick={() => toggleSentence(sub.id)}
              className={`group cursor-pointer rounded-2xl transition-all duration-200 border p-3.5 sm:p-4 ${
                isExpanded
                  ? 'bg-gradient-to-r from-[#650D32] to-[#80133F] border-[#FF8A00] shadow-lg shadow-[#FF8A00]/10 scale-[1.01]'
                  : 'bg-[#480923]/80 hover:bg-[#650D32]/90 border-[#C62828]/50 hover:border-[#FF8A00]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Time & Sentence Number */}
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px] sm:text-xs font-mono font-bold text-[#FFD43B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF8A00]" />
                    {sub.time}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold hidden sm:inline">
                    #{index + 1}
                  </span>
                </div>

                {/* Spanish Sentence */}
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-relaxed">
                    <span className="mr-2 text-base">🇪🇸</span>
                    {sub.es}
                  </p>

                  {/* Armenian Translation (revealed on click) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-sm sm:text-base font-medium text-amber-200 font-armenian leading-relaxed">
                        <span className="mr-2 text-base">🇦🇲</span>
                        {sub.hy}
                      </p>

                      {/* Linguistic note (if present, like in 00:47) */}
                      {sub.note && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-black/30 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                          <Info className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">{sub.note.es}</p>
                            <p className="font-armenian text-zinc-300 mt-0.5">
                              {sub.note.hy}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Click / Expand icon */}
                <div className="shrink-0 flex items-center gap-1 pt-0.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                      isExpanded
                        ? 'bg-[#FF8A00] text-black'
                        : 'bg-white/10 text-zinc-300 group-hover:bg-[#FF8A00]/20 group-hover:text-[#FFD43B]'
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-armenian">
                      {isExpanded ? 'Փակել' : 'Թարգմանել'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-[#C62828]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#FF8A00]" />
          <span>Total: 12 fragmentos interactivos auténticos</span>
        </span>
        <span className="font-armenian text-amber-200/80">
          Բոլոր 12 հատվածները ներկայացված են ամբողջությամբ՝ առանց կրճատումների
        </span>
      </div>
    </div>
  );
};
