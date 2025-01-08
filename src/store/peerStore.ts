import { create } from "zustand";
import { produce } from "immer";
import { Peer } from "peerjs";

interface PeerStore {
  peer: Peer | null
  setPeer: (peer: Peer) => void
  clearPeer: () => void
}

export const usePeerStore = create<PeerStore>((set) => ({
  peer: null,

  setPeer: (peer: Peer) => set(produce((state) => {
    state.peer = peer
  })),
  clearPeer: () => set(produce((state) => {
    state.peer = null
  }))
}))
