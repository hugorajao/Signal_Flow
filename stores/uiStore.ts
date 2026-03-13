import { create } from 'zustand';

interface UIStore {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
  activeResultsTab: string;
  marketsModalOpen: boolean;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setBottomPanelHeight: (height: number) => void;
  setActiveResultsTab: (tab: string) => void;
  setMarketsModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: false,
  bottomPanelHeight: 320,
  activeResultsTab: 'equity',
  marketsModalOpen: false,

  toggleLeftPanel: () =>
    set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),

  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  toggleBottomPanel: () =>
    set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),

  setBottomPanelHeight: (height) =>
    set({ bottomPanelHeight: height }),

  setActiveResultsTab: (tab) =>
    set({ activeResultsTab: tab }),

  setMarketsModalOpen: (open) =>
    set({ marketsModalOpen: open }),
}));
