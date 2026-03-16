"use client"

import { Flame, Dumbbell, Utensils, TreePine, Music, Compass, ChevronDown, X, Check, SlidersHorizontal, Sparkles, Zap } from "lucide-react"
import { useState } from "react"

const categories = [
  { id: "all", label: "Tout", icon: Compass, color: "slate" },
  { id: "party", label: "Fetes", icon: Flame, color: "pink", gradient: "from-pink-500 to-rose-500" },
  { id: "sport", label: "Sport", icon: Dumbbell, color: "blue", gradient: "from-blue-500 to-indigo-500" },
  { id: "food", label: "Food", icon: Utensils, color: "orange", gradient: "from-orange-400 to-amber-500" },
  { id: "nature", label: "Nature", icon: TreePine, color: "emerald", gradient: "from-emerald-400 to-teal-500" },
  { id: "music", label: "Musique", icon: Music, color: "violet", gradient: "from-violet-500 to-purple-500" },
]

// ============================================
// STYLE A - Chips Pills (3 variations)
// ============================================

export function ChipsStyleA1() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? `bg-slate-900 text-white`
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

export function ChipsStyleA2() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? `bg-gradient-to-r ${cat.gradient || "from-slate-800 to-slate-900"} text-white shadow-lg`
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

export function ChipsStyleA3() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all border-2 ${
              isActive
                ? "bg-white border-slate-900 text-slate-900 shadow-sm"
                : "bg-white border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isActive ? "bg-slate-900" : "bg-slate-100"
            }`}>
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
            </div>
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// STYLE B - Icones seules (3 variations)
// ============================================

export function IconsStyleB1() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-4 justify-center">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isActive
                ? `bg-gradient-to-br ${cat.gradient || "from-slate-800 to-slate-900"} shadow-lg`
                : "bg-slate-100 hover:bg-slate-200"
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-slate-900" : "text-slate-400"}`}>
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function IconsStyleB2() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-2 justify-center bg-slate-100 p-2 rounded-2xl">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isActive
                ? "bg-white shadow-md"
                : "hover:bg-white/50"
            }`}
          >
            <Icon className={`w-5 h-5 transition-colors ${
              isActive ? "text-slate-900" : "text-slate-400"
            }`} />
          </button>
        )
      })}
    </div>
  )
}

export function IconsStyleB3() {
  const [active, setActive] = useState("all")
  return (
    <div className="flex gap-3 justify-center">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isActive
                ? "bg-slate-900 scale-110"
                : "bg-white border-2 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-400"}`} />
            {isActive && (
              <div className="absolute -bottom-1 w-2 h-2 bg-pink-500 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// STYLE C - Segmented Control (3 variations)
// ============================================

export function SegmentedStyleC1() {
  const [active, setActive] = useState("all")
  const shortList = categories.slice(0, 4)
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl">
      {shortList.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SegmentedStyleC2() {
  const [active, setActive] = useState("all")
  const shortList = categories.slice(0, 4)
  return (
    <div className="flex bg-slate-900 p-1.5 rounded-2xl">
      {shortList.map((cat) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? `bg-gradient-to-r ${cat.gradient || "from-pink-500 to-rose-500"} text-white`
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

export function SegmentedStyleC3() {
  const [active, setActive] = useState("all")
  const shortList = categories.slice(0, 4)
  return (
    <div className="inline-flex border-2 border-slate-200 rounded-full p-1">
      {shortList.map((cat, idx) => {
        const Icon = cat.icon
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// STYLE D - Dropdown (3 variations)
// ============================================

export function DropdownStyleD1() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(categories[0])
  const Icon = active.icon
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm min-w-[180px]"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${active.gradient || "from-slate-700 to-slate-900"}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="flex-1 text-left font-medium text-slate-700">{active.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            const isSelected = active.id === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setActive(cat); setOpen(false) }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 ${
                  isSelected ? "bg-slate-50" : ""
                }`}
              >
                <CatIcon className={`w-4 h-4 ${isSelected ? "text-slate-900" : "text-slate-400"}`} />
                <span className={`flex-1 text-left ${isSelected ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                  {cat.label}
                </span>
                {isSelected && <Check className="w-4 h-4 text-pink-500" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DropdownStyleD2() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(categories[0])
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full font-medium"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {active.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-slate-900 rounded-2xl shadow-xl py-2 min-w-[200px] z-50">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            const isSelected = active.id === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => { setActive(cat); setOpen(false) }}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 ${
                  isSelected ? "bg-white/10" : ""
                }`}
              >
                <CatIcon className={`w-4 h-4 ${isSelected ? "text-pink-400" : "text-slate-400"}`} />
                <span className={`flex-1 text-left ${isSelected ? "text-white font-medium" : "text-slate-300"}`}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DropdownStyleD3() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(["all"])
  
  const toggleSelect = (id: string) => {
    if (id === "all") {
      setSelected(["all"])
    } else {
      const newSelected = selected.filter(s => s !== "all")
      if (newSelected.includes(id)) {
        const filtered = newSelected.filter(s => s !== id)
        setSelected(filtered.length ? filtered : ["all"])
      } else {
        setSelected([...newSelected, id])
      }
    }
  }
  
  const displayText = selected.includes("all") 
    ? "Toutes categories" 
    : `${selected.length} categorie${selected.length > 1 ? "s" : ""}`
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 border-slate-200 min-w-[220px]"
      >
        <div className="flex -space-x-2">
          {selected.slice(0, 3).map((id) => {
            const cat = categories.find(c => c.id === id)!
            const CatIcon = cat.icon
            return (
              <div key={id} className={`w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br ${cat.gradient || "from-slate-700 to-slate-900"} border-2 border-white`}>
                <CatIcon className="w-3.5 h-3.5 text-white" />
              </div>
            )
          })}
        </div>
        <span className="flex-1 text-left font-medium text-slate-700">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const CatIcon = cat.icon
              const isSelected = selected.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleSelect(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                    isSelected 
                      ? `bg-gradient-to-r ${cat.gradient || "from-slate-700 to-slate-900"} text-white` 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <CatIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              )
            })}
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="w-full mt-3 py-2.5 bg-slate-900 text-white rounded-xl font-medium"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// STYLE E - Bottom Sheet (3 variations)
// ============================================

export function BottomSheetStyleE1() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("all")
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-slate-200 shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filtres</span>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Categories</h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = active === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${cat.gradient || "from-slate-800 to-slate-900"} text-white`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                )
              })}
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-semibold"
            >
              Voir les resultats
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function BottomSheetStyleE2() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(["all"])
  
  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      const filtered = selected.filter(s => s !== id)
      setSelected(filtered.length ? filtered : ["all"])
    } else {
      setSelected([...selected.filter(s => s !== "all"), id])
    }
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-medium"
      >
        <Sparkles className="w-4 h-4" />
        Filtrer
        {selected.length > 0 && !selected.includes("all") && (
          <span className="w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center">
            {selected.length}
          </span>
        )}
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 animate-in slide-in-from-bottom">
            <div className="p-6">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-1">Filtrer par categorie</h3>
              <p className="text-slate-500 text-sm mb-6">Selectionne une ou plusieurs categories</p>
              
              <div className="space-y-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = selected.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleSelect(cat.id)}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-white/20" : `bg-gradient-to-br ${cat.gradient || "from-slate-200 to-slate-300"}`
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-white"}`} />
                      </div>
                      <span className="flex-1 text-left font-medium">{cat.label}</span>
                      {isSelected && <Check className="w-5 h-5" />}
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <button 
                onClick={() => { setSelected(["all"]); setOpen(false) }}
                className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-semibold text-slate-600"
              >
                Reset
              </button>
              <button 
                onClick={() => setOpen(false)}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-semibold"
              >
                Appliquer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function BottomSheetStyleE3() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("all")
  const [distance, setDistance] = useState(5)
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="w-11 h-11 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center"
      >
        <SlidersHorizontal className="w-5 h-5 text-slate-600" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl text-white z-50 animate-in slide-in-from-bottom">
            <div className="p-6">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Filtres avances</h3>
                <button 
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-3">Categorie</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isActive = active === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActive(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${cat.gradient || "from-pink-500 to-rose-500"}`
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">Distance max</span>
                  <span className="font-medium">{distance} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                />
              </div>
              
              <button 
                onClick={() => setOpen(false)}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Appliquer les filtres
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
