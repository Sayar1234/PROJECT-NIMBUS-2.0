import { useState } from 'react';
import { useSystemStore } from '../../stores/systemStore';

const backgrounds = [
  { name: 'Purple Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean Blue', value: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { name: 'Night Sky', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
  { name: 'Coral', value: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' },
  { name: 'Mountain', value: 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)' },
  { name: 'Custom Image', value: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)' },
];

const fontFamilies = [
  'system-ui, -apple-system, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Verdana, sans-serif',
];

export default function Settings() {
  const { background, fontSize, fontFamily, fontColor, setBackground, setFontSize, setFontFamily, setFontColor } = useSystemStore();
  const [customBg, setCustomBg] = useState('');

  const applyCustomBackground = () => {
    if (customBg.trim()) {
      setBackground(customBg);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Background</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {backgrounds.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setBackground(bg.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  background === bg.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                }`}
                style={{ background: bg.value, backgroundSize: 'cover' }}
              >
                <span className="text-white font-semibold drop-shadow-lg text-sm">
                  {bg.name}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customBg}
              onChange={(e) => setCustomBg(e.target.value)}
              placeholder="Custom CSS background value..."
              className="flex-1 px-3 py-2 border rounded text-sm"
            />
            <button
              onClick={applyCustomBackground}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Font Size</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="12"
              max="24"
              value={parseInt(fontSize)}
              onChange={(e) => setFontSize(`${e.target.value}px`)}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16">{fontSize}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Font Family</h3>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Font Color</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-16 h-10 cursor-pointer rounded"
            />
            <input
              type="text"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-sm font-mono"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <p style={{ fontSize, fontFamily, color: fontColor }}>
            The quick brown fox jumps over the lazy dog. 1234567890
          </p>
        </div>
      </div>
    </div>
  );
}
