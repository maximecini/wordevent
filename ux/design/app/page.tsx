"use client"

import { VibrantSocialDesign } from "@/components/designs/vibrant-social-design"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[390px] aspect-[9/19] bg-black rounded-[3rem] p-3 shadow-2xl">
        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.4rem] overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50" />
          
          {/* Content */}
          <VibrantSocialDesign />
        </div>
      </div>
    </div>
  )
}
