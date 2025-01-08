import { create } from "zustand";
import { produce } from "immer";

interface WatchlistEvent {
  user_ids: string[]
  name: string
}

interface FriendsStore {
  friends: WatchlistEvent[]
  updateFriends: (data: WatchlistEvent) => void,
  clear: () => void
}

export const useFriendsStore = create<FriendsStore>((set) => ({
  friends: [],

  updateFriends: (data: WatchlistEvent) => set(produce((state) => {
    state.friends = [...state.friends, data]
  })),
  clear: () => set(produce((state) => {
    state.friends = []
  }))
}))
