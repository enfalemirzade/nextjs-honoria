"use client";

import { usePanelsStore } from "@/store/panelsStore";
import { usePathname } from "next/navigation";

export function ServerHead() {
  const { openPanel } = usePanelsStore()
  const pathname = usePathname()

  const labelMapping: Record<string, string> = {
    chat: "Chat",
    cloud: "Cloud",
    screenshare: "Screen Share",
    "/": "Home"
  }
  
  const currentLabel = Object.keys(labelMapping).find((key) =>
    pathname.includes(key)
  )

  return(
    <div className="w-full h-20 flex justify-between items-center px-4 shadow-bottom-sm font-bold lg:px-8">
      <div className="flex gap-4 items-center">
        <button onClick={() => openPanel("serverPanel")} className="mt-1 px-1.5 py-2 rounded-btn bg-base-100 hover:bg-neutral lg:hidden">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/>
          </svg>
        </button>
        {currentLabel && <div>{labelMapping[currentLabel]}</div>}
      </div>
    </div>
  )
}
