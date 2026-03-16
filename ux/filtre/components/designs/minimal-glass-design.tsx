"use client"

import { MapPin, Search, Plus, MessageCircle, User, Calendar, ChevronRight, Zap } from "lucide-react"
import { useState } from "react"

const events = [
  { id: 1, x: 25, y: 40, name: "Tech Meetup", live: true, participants: 28 },
  { id: 2, x: 60, y: 30, name: "Yoga Session", live: true, participants: 12 },
  { id: 3, x: 45, y: 65, name: "Night Run", live: false, participants: 45 },
  { id: 4, x: 75, y: 55, name: "Coding Jam", live: false, participants: 8 },
  { id: 5, x: 30, y: 75, name: "Startup Pitch", live: true, participants: 64 },
]

export function MinimalGlassDesign() {
  const [showPanel, setShowPanel] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null)

  const handleEventClick = (event: typeof events[0]) => {
    setSelectedEvent(event)
    setShowPanel(true)
  }

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Fake Map Background - Cyber/Dark Style */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <defs>
            <pattern id="grid-cyber" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0891b2" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-cyber)" />
        </svg>

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 0 150 Q 150 130 300 170" stroke="#1e293b" strokeWidth="8" fill="none" />
          <path d="M 80 0 Q 100 200 150 400" stroke="#1e293b" strokeWidth="6" fill="none" />
          <path d="M 0 300 Q 180 280 350 320" stroke="#1e293b" strokeWidth="6" fill="none" />
        </svg>
      </div>

      {/* Top Bar - Glass */}
      <div className="absolute top-12 left-4 right-4">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl px-4 py-3 border border-cyan-500/20">
          <Search className="w-5 h-5 text-cyan-400" />
          <span className="text-slate-400 text-sm flex-1">Rechercher...</span>
          <div className="flex items-center gap-1 text-cyan-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Event Markers */}
      {events.map((event) => (
        <button
          key={event.id}
          onClick={() => handleEventClick(event)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${event.x}%`, top: `${event.y}%` }}
        >
          {/* Pulse for live events */}
          {event.live && (
            <div className="absolute inset-0 bg-cyan-400/40 rounded-full animate-ping" />
          )}
          
          {/* Marker */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
            event.live 
              ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30" 
              : "bg-slate-800/50 border-slate-600"
          }`}>
            <span className={`text-xs font-bold ${event.live ? "text-cyan-400" : "text-slate-400"}`}>
              {event.participants}
            </span>
          </div>
        </button>
      ))}

      {/* User Location */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-cyan-400 rounded-full border-2 border-cyan-200 shadow-lg shadow-cyan-400/50" />
        <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping" />
      </div>

      {/* Side Panel - Glass */}
      <div 
        className={`absolute top-0 right-0 w-64 h-full bg-slate-900/80 backdrop-blur-xl border-l border-cyan-500/20 transition-transform duration-300 ${
          showPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 pt-16">
          <button
            onClick={() => setShowPanel(false)}
            className="absolute top-12 left-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
          
          {selectedEvent && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-2">
                {selectedEvent.live && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.name}</h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                <User className="w-4 h-4" />
                <span>{selectedEvent.participants} participants</span>
              </div>

              <button className="w-full py-3 bg-cyan-500 text-slate-950 font-semibold rounded-xl hover:bg-cyan-400 transition-colors">
                Rejoindre
              </button>
              
              <button className="w-full py-3 mt-2 bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors">
                Voir les details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Event FAB */}
      <button className="absolute right-4 bottom-28 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:bg-cyan-400 transition-colors">
        <Plus className="w-7 h-7 text-slate-950" />
      </button>

      {/* Bottom Navigation - Glass */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-cyan-500/20">
        <div className="flex items-center justify-around py-4 px-6">
          <button className="flex flex-col items-center gap-1">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">Carte</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Calendar className="w-6 h-6 text-slate-500" />
            <span className="text-xs text-slate-500">Events</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <MessageCircle className="w-6 h-6 text-slate-500" />
            <span className="text-xs text-slate-500">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-slate-500" />
            <span className="text-xs text-slate-500">Profil</span>
          </button>
        </div>
      </div>
    </div>
  )
}
