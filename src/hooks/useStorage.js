import { set, get, del, keys } from 'idb-keyval';

export function useStorage() {
  const saveFile = async (blob, path) => {
    const id = crypto.randomUUID();
    const entry = { id, path, blob, timestamp: Date.now(), size: blob.size, type: blob.type };
    await set(`file-${id}`, entry);
    return { id, path, size: blob.size };
  };

  const getFile = async (id) => get(`file-${id}`);

  const deleteFile = async (id) => del(`file-${id}`);

  const getAllFiles = async () => {
    const all = await keys();
    const out = [];
    for (const k of all.filter(k => k.startsWith('file-'))) {
      const f = await get(k);
      if (f) out.push(f);
    }
    return out.sort((a, b) => b.timestamp - a.timestamp);
  };

  return { saveFile, getFile, deleteFile, getAllFiles };
}