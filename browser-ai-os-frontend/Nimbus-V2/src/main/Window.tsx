import { Rnd } from "react-rnd";
import { useWindowStore } from "../stores/windowStore";
import { FaMinus, FaSquare, FaTimes } from "react-icons/fa";
import type { ReactNode } from "react";

type WindowProps = {
  id: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  children: ReactNode;
};

export function Window({
  id,
  title,
  isMinimized,
  isMaximized,
  position,
  size,
  zIndex,
  children,
}: WindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  if (isMinimized) {
    return null;
  }

  const finalPosition = isMaximized ? { x: 0, y: 0 } : position;
  const finalSize = isMaximized
    ? { width: window.innerWidth, height: window.innerHeight - 64 }
    : size;

  return (
    <Rnd
      position={finalPosition}
      size={finalSize}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          updateWindowPosition(id, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          updateWindowSize(id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          updateWindowPosition(id, position);
        }
      }}
      minWidth={400}
      minHeight={300}
      bounds="parent"
      dragHandleClassName="window-header"
      style={{ zIndex }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      onMouseDown={() => focusWindow(id)}
    >
      <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300">
        <div className="window-header flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 cursor-move">
          <span className="font-semibold text-base">{title}</span>
          <div className="flex gap-2">
            <button
              onClick={() => minimizeWindow(id)}
              className="hover:bg-blue-700 p-1.5 rounded transition-colors"
            >
              <FaMinus size={12} />
            </button>
            <button
              onClick={() => maximizeWindow(id)}
              className="hover:bg-blue-700 p-1.5 rounded transition-colors"
            >
              <FaSquare size={12} />
            </button>
            <button
              onClick={() => closeWindow(id)}
              className="hover:bg-red-600 p-1.5 rounded transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </Rnd>
  );
}
