import type { AppConfig } from './appConfig';
import { useWindowStore } from '../stores/windowStore';

type DesktopIconProps = {
  app: AppConfig;
};

export function DesktopIcon({ app }: DesktopIconProps) {
  const { openWindow } = useWindowStore();
  const Icon = app.icon;

  return (
    <div
      className="flex flex-col items-center justify-center w-24 h-24 cursor-pointer group"
      onDoubleClick={() => openWindow(app.id, app.name)}
    >
      <div className="p-3 rounded-lg group-hover:bg-white/20 transition-colors">
        <Icon size={40} className="text-white drop-shadow-lg" />
      </div>
      <span className="text-white text-sm mt-1 drop-shadow-md font-medium text-center">
        {app.name}
      </span>
    </div>
  );
}
