import { apps } from './appConfig';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import { useWindowStore } from '../stores/windowStore';
import { useSystemStore } from '../stores/systemStore';
import FileManager from '../apps/FileManager/FileManager';
import Notes from '../apps/Notes/Notes';
import Terminal from '../apps/Terminal/Terminal';
import Settings from '../apps/Settings/Settings';
import AIChat from '../apps/AIChat/AIChat';

export function Desktop() {
  const { windows } = useWindowStore();
  const { background } = useSystemStore();

  const getAppComponent = (appId: string) => {
    switch (appId) {
      case 'file-manager':
        return <FileManager />;
      case 'notes':
        return <Notes />;
      case 'terminal':
        return <Terminal />;
      case 'settings':
        return <Settings />;
      case 'ai-chat':
        return <AIChat />;
      default:
        return <div>App not found</div>;
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden relative"
      style={{ background }}
    >
      <div className="absolute inset-0 pb-16 overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-8">
          {apps.map((app) => (
            <DesktopIcon key={app.id} app={app} />
          ))}
        </div>

        {windows.map((window) => (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            isMinimized={window.isMinimized}
            isMaximized={window.isMaximized}
            position={window.position}
            size={window.size}
            zIndex={window.zIndex}
          >
            {getAppComponent(window.appId)}
          </Window>
        ))}
      </div>

      <Taskbar />
    </div>
  );
}
