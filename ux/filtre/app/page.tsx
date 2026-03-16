"use client"

import { useState } from "react"
import { Compass, Flame, Dumbbell, Utensils, TreePine, Music, Filter } from "lucide-react"

const typeColors: Record<string, { gradient: string; text: string; shadow: string }> = {
  party: { gradient: "from-pink-500 to-rose-500", text: "text-pink-500", shadow: "shadow-pink-500/30" },
  sport: { gradient: "from-blue-500 to-indigo-500", text: "text-blue-500", shadow: "shadow-blue-500/30" },
  food: { gradient: "from-orange-400 to-amber-500", text: "text-orange-500", shadow: "shadow-orange-500/30" },
  nature: { gradient: "from-emerald-400 to-teal-500", text: "text-emerald-500", shadow: "shadow-emerald-500/30" },
  music: { gradient: "from-violet-500 to-purple-500", text: "text-violet-500", shadow: "shadow-violet-500/30" },
}

const typeLabels: Record<string, { label: string; icon: typeof Flame }> = {
  party: { label: "Fetes", icon: Flame },
  sport: { label: "Sport", icon: Dumbbell },
  food: { label: "Food", icon: Utensils },
  nature: { label: "Nature", icon: TreePine },
  music: { label: "Musique", icon: Music },
}

export default function FilterShowcase() {
  const [activeVersion, setActiveVersion] = useState(1)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Filtres Verticaux Transparents</h1>
      <p className="text-slate-500 text-center mb-6">3 propositions claires</p>

      {/* Version selector */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((v) => (
          <button
            key={v}
            onClick={() => { setActiveVersion(v); setActiveFilter(null) }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeVersion === v
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            V{v}
          </button>
        ))}
      </div>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-slate-800">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-2xl z-50" />

          {/* Map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 700">
              <ellipse cx="280" cy="280" rx="70" ry="50" fill="#dcfce7" />
              <ellipse cx="80" cy="500" rx="55" ry="40" fill="#dcfce7" />
              <path d="M 0 200 Q 200 180 400 220" stroke="#e2e8f0" strokeWidth="20" fill="none" />
              <path d="M 100 0 Q 120 350 100 700" stroke="#e2e8f0" strokeWidth="18" fill="none" />
              <path d="M 280 0 Q 300 350 280 700" stroke="#e2e8f0" strokeWidth="18" fill="none" />
            </svg>
          </div>

          {/* VERSION 1: Glass pill vertical avec label en haut - COMPACT */}
          {activeVersion === 1 && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1.5">
                {/* Filter label */}
                <div className="flex items-center justify-center gap-1 px-1 py-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Filtres</span>
                </div>
                
                <div className="w-6 h-px bg-slate-200 mx-auto mb-1" />
                
                {/* Filter items */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                      activeFilter === null ? "bg-slate-900" : "hover:bg-white/50"
                    }`}
                  >
                    <Compass className={`w-4 h-4 ${activeFilter === null ? "text-white" : "text-slate-400"}`} />
                    <span className={`text-[7px] font-medium ${activeFilter === null ? "text-white" : "text-slate-400"}`}>Tout</span>
                  </button>
                  
                  {Object.entries(typeColors).map(([type, colors]) => {
                    const IconComponent = typeLabels[type].icon
                    const isActive = activeFilter === type
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveFilter(isActive ? null : type)}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                          isActive ? `bg-gradient-to-br ${colors.gradient}` : "hover:bg-white/50"
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : colors.text}`} />
                        <span className={`text-[7px] font-medium ${isActive ? "text-white" : "text-slate-400"}`}>
                          {typeLabels[type].label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VERSION 2: Ligne minimaliste avec badge */}
          {activeVersion === 2 && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
              {/* Vertical line */}
              <div className="absolute left-1/2 top-6 bottom-0 w-[2px] bg-slate-300/40 -translate-x-1/2 rounded-full" />
              
              {/* Filter label at top */}
              <div className="relative z-10 bg-slate-900 rounded-full px-2.5 py-1 mb-4">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Filtres</span>
              </div>
              
              {/* Filter items */}
              <div className="relative z-10 flex flex-col gap-3">
                <button
                  onClick={() => setActiveFilter(null)}
                  className="flex flex-col items-center gap-1 transition-all"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    activeFilter === null 
                      ? "bg-slate-900 shadow-lg scale-110" 
                      : "bg-white/70 backdrop-blur-sm"
                  }`}>
                    <Compass className={`w-5 h-5 ${activeFilter === null ? "text-white" : "text-slate-400"}`} />
                  </div>
                  {activeFilter === null && (
                    <span className="text-[9px] font-semibold text-slate-900">Tout</span>
                  )}
                </button>
                
                {Object.entries(typeColors).map(([type, colors]) => {
                  const IconComponent = typeLabels[type].icon
                  const isActive = activeFilter === type
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(isActive ? null : type)}
                      className="flex flex-col items-center gap-1 transition-all"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        isActive 
                          ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow} scale-110` 
                          : "bg-white/70 backdrop-blur-sm"
                      }`}>
                        <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : colors.text}`} />
                      </div>
                      {isActive && (
                        <span className={`text-[9px] font-semibold ${colors.text}`}>{typeLabels[type].label}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* VERSION 3: Icones pures avec indicateur lateral */}
          {activeVersion === 3 && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              {/* Tout */}
              <button
                onClick={() => setActiveFilter(null)}
                className="relative flex items-center transition-all"
              >
                {activeFilter === null && (
                  <div className="absolute -left-1 w-1 h-8 bg-slate-900 rounded-full" />
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  activeFilter === null 
                    ? "bg-slate-900 shadow-lg" 
                    : "bg-white/60 backdrop-blur-sm"
                }`}>
                  <Compass className={`w-5 h-5 ${activeFilter === null ? "text-white" : "text-slate-400"}`} />
                </div>
                {activeFilter === null && (
                  <span className="absolute left-14 text-[10px] font-bold text-slate-900 whitespace-nowrap">Tout</span>
                )}
              </button>
              
              {Object.entries(typeColors).map(([type, colors]) => {
                const IconComponent = typeLabels[type].icon
                const isActive = activeFilter === type
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(isActive ? null : type)}
                    className="relative flex items-center transition-all"
                  >
                    {isActive && (
                      <div className={`absolute -left-1 w-1 h-8 bg-gradient-to-b ${colors.gradient} rounded-full`} />
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isActive 
                        ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow}` 
                        : "bg-white/60 backdrop-blur-sm"
                    }`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : colors.text}`} />
                    </div>
                    {isActive && (
                      <span className={`absolute left-14 text-[10px] font-bold ${colors.text} whitespace-nowrap`}>
                        {typeLabels[type].label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Sample markers */}
          <div className="absolute right-16 top-40 w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">12</span>
          </div>
          <div className="absolute right-24 bottom-48 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">8</span>
          </div>
          <div className="absolute right-12 bottom-72 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">5</span>
          </div>

          {/* User position */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -inset-3 bg-blue-400/20 rounded-full animate-pulse" />
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 max-w-md mx-auto">
        {activeVersion === 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">V1 - Glass avec label</h3>
            <p className="text-sm text-slate-500">Conteneur transparent avec icone + texte "Filtrer" en haut, separateur, puis icones avec labels en colonne.</p>
          </div>
        )}
        {activeVersion === 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">V2 - Ligne avec badge</h3>
            <p className="text-sm text-slate-500">Badge noir "Filtres" en haut, ligne verticale discrete, icones rondes flottantes. Le label apparait seulement sur l'actif.</p>
          </div>
        )}
        {activeVersion === 3 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">V3 - Indicateur lateral</h3>
            <p className="text-sm text-slate-500">Icones carrees sans conteneur, barre coloree sur le cote gauche + label qui apparait a droite quand actif. Ultra clean.</p>
          </div>
        )}
      </div>
    </div>
  )
}
