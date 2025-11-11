import type { IconType } from "react-icons";

export interface IconProps {
  title: string;
  Icon: IconType;
}

export interface WindowData {
  id: string;
  appId: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DesktopAppIconProps {
  title: string;
  Icon: IconType;
  onClick?: () => void;
}

export interface TaskbarAppIconProps {
  Icon: IconType;
  title: string;
}