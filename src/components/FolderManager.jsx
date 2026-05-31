import { useState } from 'react';
import { usePostingStore } from '../stores/postingStore';
import { X, Plus, Folder, Pencil, Trash2 } from 'lucide-react';

export default function FolderManager({ onClose }) {
  const { folders, postings, addFolder, updateFolder, deleteFolder } = usePostingStore();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addFolder(name.trim());
    setName('');
  };

  const startEdit = (folder) => {
    setEditing(folder.id);
    setEditName(folder.name);
  };

  const handleEditSave = (id) => {
    if (!editName.trim()) return;
    updateFolder(id, editName.trim());
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-yellow-500 font-bold text-lg tracking-wide">MANAGE FOLDERS</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="NEW FOLDER NAME..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700 focus:border-yellow-500 outline-none"
          />
          <button
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        <div className="space-y-2">
          {folders.map(folder => {
            const count = postings.filter(p => p.folderId === folder.id).length;
            return (
              <div key={folder.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
                  {editing === folder.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleEditSave(folder.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave(folder.id)}
                      className="bg-neutral-900 text-white px-2 py-1 rounded border border-yellow-500 outline-none w-full"
                    />
                  ) : (
                    <span className="text-white font-medium truncate">{folder.name} <span className="text-neutral-500">({count})</span></span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => startEdit(folder)} className="text-neutral-500 hover:text-yellow-500 p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this folder?')) deleteFolder(folder.id); }}
                    className="text-neutral-500 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {folders.length === 0 && (
            <p className="text-neutral-600 text-center py-4">No folders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}