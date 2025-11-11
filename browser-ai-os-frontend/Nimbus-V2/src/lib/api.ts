// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface File {
  id: number;
  name: string;
  path: string;
  type: "file" | "folder";
  parent_path: string | null;
  is_folder: boolean;
  size: number;
  mime_type?: string;
  created_at?: string;
  modified_at?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
  created_at?: string;
  modified_at?: string;
}

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  history: ChatMessage[];
}

// Utility function for making requests
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Files API
export const filesAPI = {
  list: (path: string = "/") =>
    apiCall<File[]>(`/api/files?path=${encodeURIComponent(path)}`),

  create: (data: {
    name: string;
    type: "file" | "folder";
    parent_path?: string | null;
    content?: string;
  }) =>
    apiCall<File>("/api/files", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (fileId: number) => apiCall<File>(`/api/files/${fileId}`),

  getContent: (fileId: number) =>
    apiCall<{ content: string }>(`/api/files/${fileId}/content`),

  update: (fileId: number, data: { name?: string; content?: string }) =>
    apiCall<File>(`/api/files/${fileId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (fileId: number) =>
    apiCall<{ message: string }>(`/api/files/${fileId}`, {
      method: "DELETE",
    }),

  upload: (file: globalThis.File, parentPath: string = "/") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("parent_path", parentPath);

    return fetch(`${API_BASE_URL}/api/files/upload`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },
};

// Notes API
export const notesAPI = {
  list: () => apiCall<Note[]>("/api/notes"),

  create: (data: {
    title: string;
    content: string;
    tags?: string[];
    pinned?: boolean;
  }) =>
    apiCall<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (noteId: number) => apiCall<Note>(`/api/notes/${noteId}`),

  update: (
    noteId: number,
    data: {
      title?: string;
      content?: string;
      tags?: string[];
      pinned?: boolean;
    }
  ) =>
    apiCall<Note>(`/api/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (noteId: number) =>
    apiCall<{ message: string }>(`/api/notes/${noteId}`, {
      method: "DELETE",
    }),

  search: (query: string) =>
    apiCall<Note[]>(`/api/notes/search/${encodeURIComponent(query)}`),
};

// Chat API
export const chatAPI = {
  send: (message: string) =>
    apiCall<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  history: () => apiCall<ChatMessage[]>("/api/chat/history"),

  clearHistory: () =>
    apiCall<{ message: string }>("/api/chat/history", {
      method: "DELETE",
    }),
};

// Health check
export const healthAPI = {
  check: () => apiCall<{ status: string }>("/api/health"),
};
