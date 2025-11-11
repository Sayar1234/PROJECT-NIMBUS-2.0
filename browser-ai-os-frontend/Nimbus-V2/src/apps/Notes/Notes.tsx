import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import { notesAPI, type Note as NoteType } from "../../lib/api";

export default function Notes() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesAPI.list();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      setError(null);
      const newNote = await notesAPI.create({
        title: "Untitled Note",
        content: "",
        tags: [],
        pinned: false,
      });

      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  const saveNote = async () => {
    if (!selectedNote) return;

    try {
      setError(null);
      const updatedNote = await notesAPI.update(selectedNote.id, {
        title,
        content,
      });

      setSelectedNote(updatedNote);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const deleteNote = async (id: number) => {
    try {
      setError(null);
      await notesAPI.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const selectNote = (note: NoteType) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  return (
    <div className="h-full flex gap-4">
      <div className="w-64 flex flex-col bg-gray-50 rounded-lg p-3">
        {error && (
          <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
            {error}
          </div>
        )}

        <button
          onClick={createNote}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2 mb-3 text-sm font-medium transition-colors"
        >
          <FaPlus size={12} />
          New Note
        </button>

        <div className="flex-1 overflow-auto space-y-2">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-gray-400 text-sm">No notes yet</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded cursor-pointer group relative ${
                  selectedNote?.id === note.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-white hover:bg-gray-100 border-2 border-transparent"
                }`}
                onClick={() => selectNote(note)}
              >
                <p className="font-semibold text-sm truncate pr-6">
                  {note.title}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {note.content || "Empty note"}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold mb-3 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Note title..."
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-3 border rounded resize-none outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Start typing..."
            />
            <button
              onClick={saveNote}
              className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <FaSave size={14} />
              Save Note
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-lg">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
