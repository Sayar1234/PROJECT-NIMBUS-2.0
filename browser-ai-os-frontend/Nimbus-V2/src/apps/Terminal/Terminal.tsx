import { useState, useRef, useEffect } from 'react';

type CommandOutput = {
  command: string;
  output: string;
  timestamp: string;
};

export default function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setCommandHistory([...commandHistory, trimmedCmd]);

    let output = '';
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        output = `Available commands:
  help        - Show this help message
  clear       - Clear terminal
  echo        - Print text
  date        - Show current date and time
  ls          - List files (simulated)
  pwd         - Print working directory
  whoami      - Display current user
  uname       - System information
  Or type any natural language command (e.g. "create a note about my meeting")`;
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'echo':
        output = parts.slice(1).join(' ');
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'ls':
        output = 'Desktop  Documents  Downloads  Pictures  Videos';
        break;

      case 'pwd':
        output = '/home/user';
        break;

      case 'whoami':
        output = 'user';
        break;

      case 'uname':
        output = 'Browser OS 1.0.0';
        break;

      default:
        // send to backend
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/terminal/execute`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ command: trimmedCmd }),
            }
          );
          if (!res.ok) {
            output = `API Error: ${res.statusText}`;
          } else {
            const data = await res.json();
            output = data.output || JSON.stringify(data);
          }
        } catch (err: any) {
          output = `Network error: ${err.message}`;
        }
    }

    setHistory([
      ...history,
      {
        command: trimmedCmd,
        output,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="h-full bg-black rounded-lg p-4 font-mono text-sm overflow-auto">
      <div className="text-green-400 mb-4">
        <p>Browser OS Terminal v1.0.0</p>
        <p>Type 'help' for available commands.</p>
        <p className="mb-2">================================</p>
      </div>

      {history.map((entry, index) => (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="text-green-400">user@browseros</span>
            <span className="text-white">:</span>
            <span className="text-blue-500">~</span>
            <span className="text-white">$</span>
            <span className="text-white">{entry.command}</span>
          </div>
          {entry.output && (
            <pre className="text-gray-300 whitespace-pre-wrap mt-1 ml-4">
              {entry.output}
            </pre>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <span className="text-green-400">user@browseros</span>
        <span className="text-white">:</span>
        <span className="text-blue-500">~</span>
        <span className="text-white">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none"
          autoFocus
        />
      </div>

      <div ref={terminalEndRef} />
    </div>
  );
}
