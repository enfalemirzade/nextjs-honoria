"use client";

import SWRContext from "@/context/SWRContext";
import { usePanelsStore } from "@/store/panelsStore";
import { useEffect } from "react";
import { throttle } from "lodash";

interface ContentContextProps {
  children: React.ReactNode
}

export default function ContentContext({ children }: ContentContextProps) {
  const { closeAllPanels } = usePanelsStore()

  useEffect(() => {
    closeAllPanels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleResize = throttle(() => {
      if (window.innerWidth > 1024) {
        closeAllPanels()
      }
    }, 200)
  
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeAllPanels])

  return (
    <SWRContext>
      <div>
        <div className="cursor-default bg-base-100 font-bold">Honoria</div>
        <div style={{ height: "calc(100dvh - 24px)" }} className="flex bg-base-200 text-[#ebebeb]">
          {children}
        </div>
      </div>
    </SWRContext>
  )
}
            