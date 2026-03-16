"use client"

import { MapPin, Search, Plus, MessageCircle, User, Calendar, X, Users, Clock, ChevronRight, Sparkles, SlidersHorizontal, Bell, Heart, Flame, Zap, Music, Utensils, TreePine, Dumbbell, Compass } from "lucide-react"
import { useState } from "react"

const events = [
  { id: 1, x: 20, y: 40, type: "party", name: "Soiree Techno", participants: 45, max: 60, time: "22h", distance: "1.2km", host: "Alex", avatar: "A", live: true },
  { id: 2, x: 65, y: 30, type: "sport", name: "Foot 5v5", participants: 10, max: 10, time: "18h", distance: "800m", host: "Karim", avatar: "K", live: false },
  { id: 3, x: 40, y: 60, type: "food", name: "Brunch collectif", participants: 12, max: 20, time: "11h", distance: "2.1km", host: "Marie", avatar: "M", live: false },
  { id: 4, x: 80, y: 55, type: "nature", name: "Rando groupe", participants: 8, max: 15, time: "9h", distance: "5km", host: "Lucas", avatar: "L", live: false },
  { id: 5, x: 30, y: 75, type: "party", name: "Apero rooftop", participants: 30, max: 50, time: "19h", distance: "600m", host: "Emma", avatar: "E", live: true },
  { id: 6, x: 55, y: 45, type: "music", name: "Jam Session", participants: 7, max: 12, time: "20h", distance: "1.5km", host: "Tom", avatar: "T", live: false },
]

const typeColors: Record<string, { bg: string; gradient: string; text: string; light: string; shadow: string }> = {
  party: { bg: "bg-pink-500", gradient: "from-pink-500 to-rose-500", text: "text-pink-500", light: "bg-pink-50", shadow: "shadow-pink-500/30" },
  sport: { bg: "bg-blue-500", gradient: "from-blue-500 to-indigo-500", text: "text-blue-500", light: "bg-blue-50", shadow: "shadow-blue-500/30" },
  food: { bg: "bg-orange-500", gradient: "from-orange-400 to-amber-500", text: "text-orange-500", light: "bg-orange-50", shadow: "shadow-orange-500/30" },
  nature: { bg: "bg-emerald-500", gradient: "from-emerald-400 to-teal-500", text: "text-emerald-500", light: "bg-emerald-50", shadow: "shadow-emerald-500/30" },
  music: { bg: "bg-violet-500", gradient: "from-violet-500 to-purple-500", text: "text-violet-500", light: "bg-violet-50", shadow: "shadow-violet-500/30" },
}

const typeLabels: Record<string, { label: string; icon: typeof Flame }> = {
  party: { label: "Fetes", icon: Flame },
  sport: { label: "Sport", icon: Dumbbell },
  food: { label: "Food", icon: Utensils },
  nature: { label: "Nature", icon: TreePine },
  music: { label: "Musique", icon: Music },
}

export function VibrantSocialDesign() {
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)

  const filteredEvents = activeFilter 
    ? events.filter(e => e.type === activeFilter)
    : events

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      {/* Improved Map Background */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
          {/* Water */}
          <ellipse cx="320" cy="100" rx="120" ry="80" fill="#e0f2fe" />
          
          {/* Parks/Green areas */}
          <ellipse cx="280" cy="280" rx="70" ry="50" fill="#dcfce7" />
          <ellipse cx="80" cy="500" rx="55" ry="40" fill="#dcfce7" />
          <ellipse cx="350" cy="550" rx="45" ry="35" fill="#d1fae5" />
          
          {/* Main Roads */}
          <path d="M 0 200 Q 200 180 400 220" stroke="#f1f5f9" strokeWidth="20" fill="none" />
          <path d="M 0 400 Q 200 380 400 420" stroke="#f1f5f9" strokeWidth="20" fill="none" />
          <path d="M 100 0 Q 120 350 100 700" stroke="#f1f5f9" strokeWidth="18" fill="none" />
          <path d="M 280 0 Q 300 350 280 700" stroke="#f1f5f9" strokeWidth="18" fill="none" />
          
          {/* Secondary Roads */}
          <path d="M 0 300 L 400 300" stroke="#f8fafc" strokeWidth="10" fill="none" />
          <path d="M 0 500 Q 200 480 400 520" stroke="#f8fafc" strokeWidth="10" fill="none" />
          <path d="M 190 0 L 190 700" stroke="#f8fafc" strokeWidth="10" fill="none" />
          
          {/* Buildings */}
          <rect x="130" y="230" width="40" height="50" fill="#e2e8f0" rx="4" />
          <rect x="180" y="240" width="30" height="40" fill="#e2e8f0" rx="4" />
          <rect x="220" y="320" width="45" height="55" fill="#e2e8f0" rx="4" />
          <rect x="50" y="350" width="35" height="45" fill="#e2e8f0" rx="4" />
          <rect x="320" y="380" width="50" height="60" fill="#e2e8f0" rx="4" />
          <rect x="140" y="450" width="40" height="50" fill="#e2e8f0" rx="4" />
          <rect x="240" y="480" width="35" height="45" fill="#e2e8f0" rx="4" />
        </svg>
      </div>

      {/* Header with Search */}
      <div className="absolute top-0 left-0 right-0 pt-10 px-4 pb-4 bg-gradient-to-b from-white via-white/98 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-lg shadow-slate-200/60 border border-slate-100">
            <Search className="w-5 h-5 text-slate-400" />
            <span className="text-slate-400 text-sm flex-1">Rechercher un event...</span>
          </div>
          <button className="w-11 h-11 bg-white rounded-xl shadow-lg shadow-slate-200/60 flex items-center justify-center border border-slate-100">
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          </button>
          <button className="relative w-11 h-11 bg-white rounded-xl shadow-lg shadow-slate-200/60 flex items-center justify-center border border-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">3</span>
            </div>
          </button>
        </div>

      </div>

      {/* Vertical Sidebar Filter - Left side */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        <button
          onClick={() => setActiveFilter(null)}
          className="flex flex-col items-center gap-1 transition-all"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            activeFilter === null 
              ? "bg-slate-900 shadow-lg shadow-slate-900/30" 
              : "bg-white/80 backdrop-blur-sm"
          }`}>
            <Compass className={`w-5 h-5 ${activeFilter === null ? "text-white" : "text-slate-400"}`} />
          </div>
          <span className={`text-[9px] font-semibold ${activeFilter === null ? "text-slate-900" : "text-slate-400"}`}>
            Tout
          </span>
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
                  ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow}` 
                  : "bg-white/80 backdrop-blur-sm"
              }`}>
                <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : colors.text}`} />
              </div>
              <span className={`text-[9px] font-semibold ${isActive ? colors.text : "text-slate-400"}`}>
                {typeLabels[type].label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Event Markers with improved styling */}
      {filteredEvents.map((event) => (
        <button
          key={event.id}
          onClick={() => setSelectedEvent(event)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${event.x}%`, top: `${event.y}%` }}
        >
          {/* Pulse animation for live events */}
          {event.live && (
            <div className={`absolute inset-0 w-12 h-12 -m-1 rounded-full bg-gradient-to-r ${typeColors[event.type].gradient} animate-ping opacity-30`} />
          )}
          
          <div className={`relative w-11 h-11 bg-gradient-to-br ${typeColors[event.type].gradient} rounded-2xl flex items-center justify-center shadow-lg ${typeColors[event.type].shadow} group-hover:scale-110 transition-transform`}>
            <span className="text-white font-bold text-sm">{event.participants}</span>
            
            {/* Live indicator */}
            {event.live && (
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-white rounded-full shadow-sm">
                <span className="text-[9px] font-bold text-pink-500 uppercase tracking-wide">Live</span>
              </div>
            )}
          </div>
          
          {/* Event name tooltip on hover */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap">
              {event.name}
            </div>
          </div>
        </button>
      ))}

      {/* User Location - improved */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -inset-4 bg-blue-400/20 rounded-full animate-pulse" />
        <div className="absolute -inset-2 bg-blue-400/30 rounded-full" />
        <div className="relative w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-3 border-white shadow-lg shadow-blue-500/40" />
      </div>

      {/* Improved Event Card Popup */}
      {selectedEvent && (
        <div className="absolute bottom-28 left-4 right-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-slate-300/50 border border-slate-100">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
            
            <div className="flex items-start gap-4">
              {/* Event Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${typeColors[selectedEvent.type].gradient} rounded-2xl flex items-center justify-center shadow-lg ${typeColors[selectedEvent.type].shadow}`}>
                <span className="text-white font-bold text-lg">{selectedEvent.participants}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{selectedEvent.name}</h3>
                  {selectedEvent.live && (
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] font-bold rounded-full uppercase">Live</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    {selectedEvent.participants}/{selectedEvent.max}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {selectedEvent.time}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.distance}
                  </span>
                </div>

                {/* Host info */}
                <div className="flex items-center gap-2 mt-3">
                  <div className={`w-7 h-7 bg-gradient-to-br ${typeColors[selectedEvent.type].gradient} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{selectedEvent.avatar}</span>
                  </div>
                  <span className="text-sm text-slate-600">Organise par <strong>{selectedEvent.host}</strong></span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Places restantes</span>
                <span className="font-semibold">{selectedEvent.max - selectedEvent.participants} places</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${typeColors[selectedEvent.type].gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${(selectedEvent.participants / selectedEvent.max) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button 
                onClick={() => setLiked(!liked)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  liked ? "bg-pink-100" : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <Heart className={`w-5 h-5 transition-colors ${liked ? "text-pink-500 fill-pink-500" : "text-slate-400"}`} />
              </button>
              <button className={`flex-1 py-3.5 bg-gradient-to-r ${typeColors[selectedEvent.type].gradient} text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg ${typeColors[selectedEvent.type].shadow} hover:opacity-90 transition-opacity`}>
                Rejoindre
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Pro Design */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="relative bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {/* Navigation Items */}
          <div className="flex items-end justify-around px-4 pt-2 pb-3">
            {[
              { icon: Compass, label: "Explorer", active: true },
              { icon: Calendar, label: "Agenda", active: false },
            ].map((item) => (
              <button key={item.label} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  item.active 
                    ? "bg-slate-900" 
                    : "hover:bg-slate-50"
                }`}>
                  <item.icon className={`w-5 h-5 ${item.active ? "text-white" : "text-slate-400"}`} />
                  {item.active && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-slate-900 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${item.active ? "text-slate-900" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </button>
            ))}

            {/* Center Create Button */}
            <div className="flex flex-col items-center -mt-6">
              <button className="w-14 h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-full flex items-center justify-center shadow-xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-transform border-4 border-white">
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-medium text-slate-400 mt-1">Creer</span>
            </div>

            {[
              { icon: MessageCircle, label: "Messages", active: false, badge: 2 },
              { icon: User, label: "Profil", active: false },
            ].map((item) => (
              <button key={item.label} className="relative flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  item.active 
                    ? "bg-slate-900" 
                    : "hover:bg-slate-50"
                }`}>
                  <item.icon className={`w-5 h-5 ${item.active ? "text-white" : "text-slate-400"}`} />
                </div>
                <span className={`text-[10px] font-medium ${item.active ? "text-slate-900" : "text-slate-400"}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <div className="absolute top-0 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-[10px] text-white font-bold">{item.badge}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-1">
            <div className="w-32 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
