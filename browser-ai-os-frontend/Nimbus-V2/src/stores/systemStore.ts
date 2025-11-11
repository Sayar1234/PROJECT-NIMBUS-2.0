import { create } from 'zustand';

type SystemStore = {
  background: string;
  fontSize: string;
  fontFamily: string;
  fontColor: string;
  setBackground: (bg: string) => void;
  setFontSize: (size: string) => void;
  setFontFamily: (family: string) => void;
  setFontColor: (color: string) => void;
};

export const useSystemStore = create<SystemStore>((set) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fontSize: '16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontColor: '#000000',

  setBackground: (bg: string) => set({ background: bg }),
  setFontSize: (size: string) => set({ fontSize: size }),
  setFontFamily: (family: string) => set({ fontFamily: family }),
  setFontColor: (color: string) => set({ fontColor: color }),
}));
