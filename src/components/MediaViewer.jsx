import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';

export default function MediaViewer({ posting, type, onClose }) {
  const { getFile } = useStorage();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl;
    const load = async () => {
      const id = type === 'photo' ? posting.imageId : posting.videoId;
      if (!id) return;
      const file = await getFile(id);
      if (file?.blob) {
        objectUrl = URL.createObjectURL(file.blob);
        setUrl(objectUrl);
      }
      setLoading(false);
    };
    load();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [posting, type, getFile]);

  const download = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'photo' ? `${posting.postingId}.jpg` : `${posting.postingId}.webm`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-mono text-yellow-500 font-bold">{posting.postingId}</h3>
        <div className="flex items-center gap-3">
          <button onClick={download} className="text-white hover:text-yellow-500 transition-colors">
            <Download className="w-6 h-6" />
          </button>
          <button onClick={onClose} className="text-white hover:text-yellow-500 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {loading && <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />}
        {!loading && type === 'photo' && url && (
          <img src={url} alt={posting.postingId} className="max-w-full max-h-full object-contain rounded-lg" />
        )}
        {!loading && type === 'video' && url && (
          <video src={url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
        )}
        {!loading && !url && <p className="text-neutral-500">File not found</p>}
      </div>

      <div className="p-4 text-center text-neutral-400 text-sm">
        {posting.city} • {posting.dateFormatted}
      </div>
    </div>
  );
}