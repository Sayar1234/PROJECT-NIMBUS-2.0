import { create } from 'zustand';

export type WindowState = {
  id: string;
  appId: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
};

type WindowStore = {
  windows: WindowState[];
  highestZIndex: number;
  openWindow: (appId: string, title: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],
  highestZIndex: 1,

  openWindow: (appId: string, title: string) => {
    set((state) => {
      const existingWindow = state.windows.find((w) => w.appId === appId);

      if (existingWindow) {
        return {
          windows: state.windows.map((w) =>
            w.id === existingWindow.id
              ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 }
              : w
          ),
          highestZIndex: state.highestZIndex + 1,
        };
      }

      const newWindow: WindowState = {
        id: `${appId}-${Date.now()}`,
        appId,
        title,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + state.windows.length * 30, y: 100 + state.windows.length * 30 },
        size: { width: 800, height: 600 },
        zIndex: state.highestZIndex + 1,
      };

      return {
        windows: [...state.windows, newWindow],
        highestZIndex: state.highestZIndex + 1,
      };
    });
  },

  closeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  minimizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    }));
  },

  maximizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  focusWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.highestZIndex + 1 } : w
      ),
      highestZIndex: state.highestZIndex + 1,
    }));
  },

  updateWindowPosition: (id: string, position: { x: number; y: number }) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  updateWindowSize: (id: string, size: { width: number; height: number }) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }));
  },
}));
