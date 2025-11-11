import type { IconType } from 'react-icons';
import { FaFolder, FaStickyNote, FaTerminal, FaCog, FaRobot } from 'react-icons/fa';

export type AppConfig = {
  id: string;
  name: string;
  icon: IconType;
  isPinned: boolean;
};

export const apps: AppConfig[] = [
  { id: 'file-manager', name: 'File Manager', icon: FaFolder, isPinned: true },
  { id: 'notes', name: 'Notes', icon: FaStickyNote, isPinned: true },
  { id: 'terminal', name: 'Terminal', icon: FaTerminal, isPinned: true },
  { id: 'settings', name: 'Settings', icon: FaCog, isPinned: true },
  { id: 'ai-chat', name: 'AI Chat', icon: FaRobot, isPinned: true },
];
