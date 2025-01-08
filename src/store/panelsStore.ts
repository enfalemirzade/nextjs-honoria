import { create } from "zustand";
import { produce } from "immer";

interface PanelsStore {
  panels: Record<string, boolean>
  openPanel: (panelId: string) => void
  closePanel: (panelId: string) => void
  closeAllPanels: () => void
}

export const usePanelsStore = create<PanelsStore>((set) => ({
  panels: {},

  openPanel: (panelId: string) => set(produce((state) => {
    state.panels[panelId] = true
  })),
  closePanel: (panelId: string) => set(produce((state) => {
    state.panels[panelId] = false
  })),
  closeAllPanels: () => set(produce((state) => {
    state.panels = {}
  }))
}))
