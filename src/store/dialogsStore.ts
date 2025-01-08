import { Friend, User } from "@/types/models";
import { create } from "zustand";
import { produce } from "immer";

interface DialogsStore {
  dialogs: Record<string, boolean>
  data: Record<string, Friend | User>
  setData: (dataId: string, data: Friend | User) => void
  openDialog: (dialogId: string) => void
  closeDialog: (dialogId: string) => void
  closeAllDialogs: () => void
}

export const useDialogsStore = create<DialogsStore>((set) => ({
  dialogs: {},
  data: {},

  setData: (dataId: string, data: Friend | User) => set(produce((state) => {
    state.data[dataId] = data
  })),
  openDialog: (dialogId: string) => set(produce((state) => {
    state.dialogs[dialogId] = true
  })),
  closeDialog: (dialogId: string) => set(produce((state) => {
    state.dialogs[dialogId] = false
  })),
  closeAllDialogs: () => set(produce((state) => {
    state.dialogs = {}
  }))
}))
