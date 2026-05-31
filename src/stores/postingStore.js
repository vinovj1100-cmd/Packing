import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePostingStore = create(
  persist(
    (set, get) => ({
      // Flow
      flowStep: 'idle',
      postingIdRaw: '',
      postingId: '',
      photo: null,
      location: null,
      city: '',
      dateRaw: null,
      dateFormatted: '',
      overlayText: '',
      savedImageFile: null,
      recordVideo: false,
      video: null,
      videoDuration: 0,
      savedVideoFile: null,

      // Data
      postings: [],
      folders: [],
      currentFolderId: null,

      // Actions
      startScan: () => set({ flowStep: 'scanning' }),
      goManual: () => set({ flowStep: 'manual-entry' }),
      setPostingId: (raw) => set({ postingIdRaw: raw, postingId: raw.trim(), flowStep: 'confirming' }),
      confirmPostingId: (confirmed) => {
        if (!confirmed) return set({ flowStep: 'idle', postingIdRaw: '', postingId: '' });
        set({ flowStep: 'capturing' });
      },
      setPhoto: (photoBlob) => set({ photo: photoBlob, flowStep: 'processing' }),
      setLocationData: (loc, city) => set({ location: loc, city }),
      setDateData: (raw, formatted) => set({ dateRaw: raw, dateFormatted: formatted }),
      setOverlayText: (text) => set({ overlayText: text }),
      setSavedImage: (fileEntry) => set({ savedImageFile: fileEntry, flowStep: 'video-prompt' }),
      setRecordVideo: (choice) => set({ recordVideo: choice, flowStep: choice ? 'recording-video' : 'success' }),
      setVideo: (videoBlob, duration) => set({ video: videoBlob, videoDuration: duration, flowStep: 'processing-video' }),
      setSavedVideo: (fileEntry) => set({ savedVideoFile: fileEntry, flowStep: 'success' }),
      completePosting: () => {
        const p = {
          id: crypto.randomUUID(),
          postingId: get().postingId,
          city: get().city,
          dateFormatted: get().dateFormatted,
          timestamp: Date.now(),
          imageId: get().savedImageFile?.id,
          imagePath: get().savedImageFile?.path,
          videoId: get().savedVideoFile?.id,
          videoPath: get().savedVideoFile?.path,
          hasVideo: !!get().savedVideoFile,
          folderId: get().currentFolderId,
        };
        set({
          postings: [p, ...get().postings],
          flowStep: 'idle',
          postingIdRaw: '', postingId: '', photo: null, location: null, city: '',
          dateRaw: null, dateFormatted: '', overlayText: '', savedImageFile: null,
          recordVideo: false, video: null, videoDuration: 0, savedVideoFile: null,
        });
      },
      deletePosting: (id) => set({ postings: get().postings.filter(x => x.id !== id) }),
      deleteAll: () => set({ postings: [] }),
      resetFlow: () => set({
        flowStep: 'idle', postingIdRaw: '', postingId: '', photo: null, location: null,
        city: '', dateRaw: null, dateFormatted: '', overlayText: '', savedImageFile: null,
        recordVideo: false, video: null, videoDuration: 0, savedVideoFile: null,
      }),

      // Folders
      addFolder: (name) => {
        const folder = { id: crypto.randomUUID(), name, createdAt: Date.now() };
        set({ folders: [...get().folders, folder] });
      },
      updateFolder: (id, name) => set({
        folders: get().folders.map(f => f.id === id ? { ...f, name } : f)
      }),
      deleteFolder: (id) => set({
        folders: get().folders.filter(f => f.id !== id),
        postings: get().postings.map(p => p.folderId === id ? { ...p, folderId: null } : p),
        currentFolderId: get().currentFolderId === id ? null : get().currentFolderId,
      }),
      setCurrentFolder: (id) => set({ currentFolderId: id }),
      movePostingToFolder: (postingId, folderId) => set({
        postings: get().postings.map(p => p.id === postingId ? { ...p, folderId } : p)
      }),
    }),
    { name: 'posting-storage', partialize: (state) => ({ postings: state.postings, folders: state.folders }) }
  )
);