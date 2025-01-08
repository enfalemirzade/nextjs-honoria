"use client";

import clsx from "clsx";
import { useEffect, useMemo } from "react";
import { usePanelsStore } from "@/store/panelsStore";
import { usePeerStore } from "@/store/peerStore";
import { Peer } from "peerjs";

interface ServerContextProps {
  children: React.ReactNode
  userId: string
}

export default function ServerContext({ children, userId }: ServerContextProps) {
  const { peer, setPeer, clearPeer } = usePeerStore()
  const { panels } = usePanelsStore()

  const newPeer = useMemo(() => new Peer(userId), [userId])

  useEffect(() => {
    if(!peer && newPeer) {
      setPeer(newPeer)
      newPeer.on("error", (err) => {
        if(err.type === "disconnected" || err.type === "invalid-id" || err.type === "network" || err.type === "unavailable-id") {
          alert("Connection error!")
          window.location.href = "/"
        }
      })

      return () => {
        if(newPeer.open) {
          newPeer.destroy()
          clearPeer()
        }
      } 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPeer])

  return (
    <div className={clsx("w-full relative", {"opacity-40 pointer-events-none": panels.serverPanel})}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </div>
  )
}
