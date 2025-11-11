import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { apps } from './appConfig';
import { useWindowStore } from '../stores/windowStore';

export function Taskbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { windows, openWindow, minimizeWindow } = useWindowStore();

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 flex items-center px-4 gap-4 z-50">
      <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 w-64">
        <FaSearch className="text-gray-400 mr-2" size={14} />
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-400"
        />
      </div>

      {searchQuery && filteredApps.length > 0 && (
        <div className="absolute bottom-20 left-4 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden w-64">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  openWindow(app.id, app.name);
                  setSearchQuery('');
                }}
              >
                <Icon size={20} className="text-white" />
                <span className="text-white text-sm">{app.name}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-10 w-px bg-gray-700" />

      <div className="flex gap-2">
        {apps.filter(app => app.isPinned).map((app) => {
          const Icon = app.icon;
          const isOpen = windows.some((w) => w.appId === app.id && !w.isMinimized);
          const window = windows.find((w) => w.appId === app.id);

          return (
            <button
              key={app.id}
              onClick={() => {
                if (window) {
                  minimizeWindow(window.id);
                } else {
                  openWindow(app.id, app.name);
                }
              }}
              className={`p-3 rounded-lg transition-all ${
                isOpen
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title={app.name}
            >
              <Icon size={20} className="text-white" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
