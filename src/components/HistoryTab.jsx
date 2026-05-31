import { useState, useEffect, useMemo } from 'react';
import { usePostingStore } from '../stores/postingStore';
import { useStorage } from '../hooks/useStorage';
import { Search, Trash2, FolderOpen, MapPin, Calendar, Download, Eye, Video, X, Folder } from 'lucide-react';
import MediaViewer from './MediaViewer';
import FolderManager from './FolderManager';

export default function HistoryTab() {
  const { postings, folders, currentFolderId, setCurrentFolder, deletePosting, deleteAll, movePostingToFolder } = usePostingStore();
  const { getFile, deleteFile } = useStorage();
  const [search, setSearch] = useState('');
  const [thumbs, setThumbs] = useState({});
  const [viewer, setViewer] = useState(null);
  const [showFolders, setShowFolders] = useState(false);
  const [detailPosting, setDetailPosting] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const map = {};
      for (const p of postings) {
        if (!p.imageId) continue;
        const f = await getFile(p.imageId);
        if (f?.blob) map[p.id] = URL.createObjectURL(f.blob);
      }
      if (!cancelled) setThumbs(map);
    };
    load();
    return () => {
      cancelled = true;
      Object.values(thumbs).forEach(URL.revokeObjectURL);
    };
  }, [postings]);

  const filtered = useMemo(() => {
    let list = postings;
    if (currentFolderId) list = list.filter(p => p.folderId === currentFolderId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.postingId.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
    }
    return list;
  }, [postings, currentFolderId, search]);

  const handleDelete = async (id) => {
    const p = postings.find(x => x.id === id);
    if (p?.imageId) await deleteFile(p.imageId);
    if (p?.videoId) await deleteFile(p.videoId);
    deletePosting(id);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all postings and media?')) return;
    for (const p of postings) {
      if (p.imageId) await deleteFile(p.imageId);
      if (p.videoId) await deleteFile(p.videoId);
    }
    deleteAll();
  };

  return (
    <div className="p-4 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-yellow-500 tracking-wide">HISTORY</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFolders(true)} className="flex items-center gap-2 px-3 py-2 border border-yellow-500/50 text-yellow-500 rounded-lg text-xs font-bold hover:bg-yellow-500/10 transition-colors">
            <FolderOpen className="w-4 h-4" /> FOLDERS
          </button>
          <button onClick={handleDeleteAll} className="flex items-center gap-2 px-3 py-2 border border-red-500/50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" /> DELETE ALL
          </button>
        </div>
      </div>

      {/* Folder chips */}
      {folders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          <button
            onClick={() => setCurrentFolder(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${!currentFolderId ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
          >
            ALL
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setCurrentFolder(currentFolderId === f.id ? null : f.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${currentFolderId === f.id ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          type="text"
          placeholder="SEARCH BY ID OR CITY..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-900 text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-800 focus:border-yellow-500 outline-none text-sm"
        />
      </div>

      {/* List */}
      <div className="space-y-3 pb-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 flex gap-3">
            <div className="w-20 h-20 bg-neutral-800 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
              {thumbs[p.id] ? (
                <img src={thumbs[p.id]} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-700 text-xs">NO IMG</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="font-mono font-bold text-yellow-500 truncate">{p.postingId}</h3>
                <button onClick={() => handleDelete(p.id)} className="text-neutral-600 hover:text-red-500 ml-2 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                <MapPin className="w-3 h-3" /> {p.city}
              </div>
              <div className="flex items-center gap-1 text-neutral-600 text-xs mt-0.5">
                <Calendar className="w-3 h-3" /> {p.dateFormatted}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => setViewer({ posting: p, type: 'photo' })} className="flex items-center gap-1 text-yellow-500 text-xs font-bold hover:text-yellow-400">
                  <Download className="w-3 h-3" /> PHOTO
                </button>
                <button onClick={() => setDetailPosting(p)} className="flex items-center gap-1 text-yellow-500 text-xs font-bold hover:text-yellow-400">
                  <Eye className="w-3 h-3" /> VIEW
                </button>
                {p.hasVideo && (
                  <button onClick={() => setViewer({ posting: p, type: 'video' })} className="flex items-center gap-1 text-yellow-500 text-xs font-bold hover:text-yellow-400">
                    <Video className="w-3 h-3" /> VIDEO
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && postings.length > 0 && (
          <p className="text-neutral-600 text-center py-8">No matches found</p>
        )}
        {postings.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-neutral-800 mx-auto mb-3" />
            <p className="text-neutral-600">No postings yet</p>
            <p className="text-neutral-700 text-sm mt-1">Scan a posting ID to get started</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewer && <MediaViewer posting={viewer.posting} type={viewer.type} onClose={() => setViewer(null)} />}
      {showFolders && <FolderManager onClose={() => setShowFolders(false)} />}
      {detailPosting && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-sm border border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold text-yellow-500">{detailPosting.postingId}</h3>
              <button onClick={() => setDetailPosting(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Location</span><span className="text-white">{detailPosting.city}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Date</span><span className="text-white">{detailPosting.dateFormatted}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Photo</span><span className="text-yellow-500">{detailPosting.imagePath || '—'}</span></div>
              {detailPosting.hasVideo && <div className="flex justify-between"><span className="text-neutral-500">Video</span><span className="text-yellow-500">{detailPosting.videoPath || '—'}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Saved</span><span className="text-neutral-400">{new Date(detailPosting.timestamp).toLocaleString()}</span></div>
            </div>
            {folders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Move to folder</p>
                <div className="flex flex-wrap gap-2">
                  {folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { movePostingToFolder(detailPosting.id, f.id); setDetailPosting(null); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${detailPosting.folderId === f.id ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}