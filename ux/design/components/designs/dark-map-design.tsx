"use client"

import { MapPin, Search, Plus, MessageCircle, User, Calendar, Users } from "lucide-react"

const events = [
  { id: 1, x: 25, y: 35, count: 12, type: "party" },
  { id: 2, x: 60, y: 25, count: 8, type: "sport" },
  { id: 3, x: 45, y: 55, count: 24, type: "party" },
  { id: 4, x: 75, y: 60, count: 5, type: "meetup" },
  { id: 5, x: 30, y: 70, count: 15, type: "sport" },
]

export function DarkMapDesign() {
  return (
    <div className="relative w-full h-full bg-neutral-900">
      {/* Fake Map Background - Dark Style */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Map grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#525252" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dark)" />
        </svg>

        {/* Fake roads */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M 0 120 Q 100 100 200 140 T 400 100" stroke="#404040" strokeWidth="8" fill="none" />
          <path d="M 50 0 Q 80 150 120 300 T 200 500" stroke="#404040" strokeWidth="6" fill="none" />
          <path d="M 150 0 Q 180 200 250 400" stroke="#525252" strokeWidth="4" fill="none" />
          <path d="M 0 250 Q 150 230 300 280" stroke="#404040" strokeWidth="6" fill="none" />
        </svg>

        {/* Water area */}
        <div className="absolute bottom-0 right-0 w-32 h-40 bg-neutral-800/50 rounded-tl-full" />
      </div>

      {/* Stats Bar */}
      <div className="absolute top-12 left-4 right-4 flex gap-2">
        <div className="flex-1 bg-neutral-800/90 backdrop-blur-sm rounded-xl p-3 border border-neutral-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs text-neutral-400">Events</p>
              <p className="text-lg font-bold text-white">47</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-neutral-800/90 backdrop-blur-sm rounded-xl p-3 border border-neutral-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs text-neutral-400">Online</p>
              <p className="text-lg font-bold text-white">234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute top-32 left-4 right-4">
        <div className="flex items-center gap-3 bg-neutral-800/90 backdrop-blur-sm rounded-full px-4 py-3 border border-neutral-700">
          <Search className="w-5 h-5 text-neutral-400" />
          <span className="text-neutral-500 text-sm">Rechercher un event...</span>
        </div>
      </div>

      {/* Event Markers */}
      {events.map((event) => (
        <div
          key={event.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${event.x}%`, top: `${event.y}%` }}
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping" />
          
          {/* Marker */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-amber-300">
            <span className="text-sm font-bold text-neutral-900">{event.count}</span>
          </div>
        </div>
      ))}

      {/* User Location */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50" />
        <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
      </div>

      {/* Create Event FAB */}
      <button className="absolute right-4 bottom-28 w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40">
        <Plus className="w-7 h-7 text-neutral-900" />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800">
        <div className="flex items-center justify-around py-4 px-6">
          <button className="flex flex-col items-center gap-1">
            <MapPin className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-amber-400">Carte</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Calendar className="w-6 h-6 text-neutral-500" />
            <span className="text-xs text-neutral-500">Events</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <MessageCircle className="w-6 h-6 text-neutral-500" />
            <span className="text-xs text-neutral-500">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-neutral-500" />
            <span className="text-xs text-neutral-500">Profil</span>
          </button>
        </div>
      </div>
    </div>
  )
}
