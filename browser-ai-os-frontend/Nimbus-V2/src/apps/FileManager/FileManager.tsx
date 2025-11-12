// import { useState, useEffect } from "react";
// import { FaFolder, FaFile, FaTrash, FaPlus } from "react-icons/fa";
// import { filesAPI, type File as FileType } from "../../lib/api";

// export default function FileManager() {
//   const [files, setFiles] = useState<FileType[]>([]);
//   const [currentFolder, setCurrentFolder] = useState<string | null>(null);
//   const [newFileName, setNewFileName] = useState("");
//   const [showNewFileInput, setShowNewFileInput] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadFiles();
//   }, [currentFolder]);

//   const loadFiles = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const path = currentFolder || "/";
//       const data = await filesAPI.list(path);
//       setFiles(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load files");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createFile = async (type: "file" | "folder") => {
//     if (!newFileName.trim()) return;

//     try {
//       setError(null);
//       await filesAPI.create({
//         name: newFileName,
//         type,
//         parent_path: currentFolder,
//         content: type === "file" ? "" : undefined,
//       });

//       setNewFileName("");
//       setShowNewFileInput(false);
//       loadFiles();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to create file");
//     }
//   };

//   const deleteFile = async (id: number) => {
//     try {
//       setError(null);
//       await filesAPI.delete(id);
//       loadFiles();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to delete file");
//     }
//   };

//   const openFile = (file: FileType) => {
//     if (file.is_folder) {
//       setCurrentFolder(file.path);
//     }
//   };

//   const goBack = () => {
//     if (currentFolder && currentFolder !== "/") {
//       const parentPath =
//         currentFolder.substring(0, currentFolder.lastIndexOf("/")) || "/";
//       setCurrentFolder(parentPath);
//     }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {error && (
//         <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
//           {error}
//         </div>
//       )}

//       <div className="flex items-center justify-between mb-4 pb-3 border-b">
//         <div className="flex items-center gap-2">
//           {currentFolder && currentFolder !== "/" && (
//             <button
//               onClick={goBack}
//               className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
//             >
//               Back
//             </button>
//           )}
//           <span className="text-lg font-semibold">
//             {currentFolder && currentFolder !== "/" ? "Subfolder" : "Root"}
//           </span>
//         </div>
//         <button
//           onClick={() => setShowNewFileInput(!showNewFileInput)}
//           className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 text-sm font-medium transition-colors"
//         >
//           <FaPlus size={12} />
//           New
//         </button>
//       </div>

//       {showNewFileInput && (
//         <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//           <input
//             type="text"
//             value={newFileName}
//             onChange={(e) => setNewFileName(e.target.value)}
//             placeholder="Enter name..."
//             className="w-full px-3 py-2 border rounded mb-2 text-sm"
//           />
//           <div className="flex gap-2">
//             <button
//               onClick={() => createFile("file")}
//               className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
//             >
//               Create File
//             </button>
//             <button
//               onClick={() => createFile("folder")}
//               className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
//             >
//               Create Folder
//             </button>
//             <button
//               onClick={() => {
//                 setShowNewFileInput(false);
//                 setNewFileName("");
//               }}
//               className="px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm font-medium transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="flex-1 overflow-auto">
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-500">Loading files...</p>
//           </div>
//         ) : files.length === 0 ? (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-400">No files or folders</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-4 gap-3">
//             {files.map((file) => (
//               <div
//                 key={file.id}
//                 className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer group relative"
//                 onDoubleClick={() => openFile(file)}
//               >
//                 {file.is_folder ? (
//                   <FaFolder size={40} className="text-yellow-500 mb-2" />
//                 ) : (
//                   <FaFile size={40} className="text-blue-500 mb-2" />
//                 )}
//                 <span className="text-sm text-center break-words w-full">
//                   {file.name}
//                 </span>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     deleteFile(file.id);
//                   }}
//                   className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
//                 >
//                   <FaTrash size={10} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }







import { useState, useEffect } from "react";
import { FaFolder, FaFile, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { filesAPI, type File as FileType } from "../../lib/api";

export default function FileManager() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File viewer states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const path = currentFolder || "/";
      const data = await filesAPI.list(path);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const createFile = async (type: "file" | "folder") => {
    if (!newFileName.trim()) return;

    try {
      setError(null);
      await filesAPI.create({
        name: newFileName,
        type,
        parent_path: currentFolder,
        content: type === "file" ? "" : undefined,
      });

      setNewFileName("");
      setShowNewFileInput(false);
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
    }
  };

  const deleteFile = async (id: number) => {
    try {
      setError(null);
      await filesAPI.delete(id);
      loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const openFile = async (file: FileType) => {
    if (file.is_folder) {
      setCurrentFolder(file.path);
    } else {
      // Open text file in viewer
      try {
        setLoadingContent(true);
        setSelectedFile(file);
        setViewerOpen(true);
        const content = await filesAPI.getContent(file.id);
        setFileContent(content.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to open file");
        setViewerOpen(false);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedFile(null);
    setFileContent("");
  };

  const saveFileContent = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      await filesAPI.update(selectedFile.id, { content: fileContent });
      alert("File saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file");
    }
  };

  const goBack = () => {
    if (currentFolder && currentFolder !== "/") {
      const parentPath =
        currentFolder.substring(0, currentFolder.lastIndexOf("/")) || "/";
      setCurrentFolder(parentPath);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          {currentFolder && currentFolder !== "/" && (
            <button
              onClick={goBack}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
            >
              Back
            </button>
          )}
          <span className="text-lg font-semibold">
            {currentFolder && currentFolder !== "/" ? "Subfolder" : "Root"}
          </span>
        </div>
        <button
          onClick={() => setShowNewFileInput(!showNewFileInput)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FaPlus size={12} />
          New
        </button>
      </div>

      {showNewFileInput && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter name..."
            className="w-full px-3 py-2 border rounded mb-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => createFile("file")}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
            >
              Create File
            </button>
            <button
              onClick={() => createFile("folder")}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors"
            >
              Create Folder
            </button>
            <button
              onClick={() => {
                setShowNewFileInput(false);
                setNewFileName("");
              }}
              className="px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No files or folders</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer group relative"
                onDoubleClick={() => openFile(file)}
              >
                {file.is_folder ? (
                  <FaFolder size={40} className="text-yellow-500 mb-2" />
                ) : (
                  <FaFile size={40} className="text-blue-500 mb-2" />
                )}
                <span className="text-sm text-center break-words w-full">
                  {file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <FaFile className="text-blue-500" />
                <h3 className="font-semibold text-lg">{selectedFile?.name}</h3>
              </div>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {loadingContent ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading file content...</p>
                </div>
              ) : (
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="File content..."
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
              <button
                onClick={closeViewer}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={saveFileContent}
                disabled={loadingContent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}