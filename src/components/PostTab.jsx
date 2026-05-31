import { usePostingStore } from '../stores/postingStore';
import ScannerOverlay from './ScannerOverlay';
import CameraCapture from './CameraCapture';
import ConfirmationCard from './ConfirmationCard';
import ManualEntry from './ManualEntry';

export default function PostTab() {
  const { flowStep } = usePostingStore();
  if (flowStep === 'idle') return <ManualEntry />;
  if (flowStep === 'manual-entry') return <ManualEntry />;
  if (flowStep === 'scanning') return <ScannerOverlay />;
  if (flowStep === 'confirming') return <ConfirmScreen />;
  if (flowStep === 'capturing' || flowStep === 'processing') return <CameraCapture mode="photo" />;
  if (flowStep === 'video-prompt') return <VideoPrompt />;
  if (flowStep === 'recording-video') return <CameraCapture mode="video" />;
  if (flowStep === 'processing-video') return <ProcessingScreen />;
  if (flowStep === 'success') return <ConfirmationCard />;
  return null;
}

function ConfirmScreen() {
  const { postingId, postingIdRaw, confirmPostingId, setPostingId, resetFlow } = usePostingStore();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="text-yellow-500 text-xs tracking-widest uppercase mb-1 text-center">Step 2</p>
        <h2 className="text-xl font-bold mb-6 text-center">CONFIRM POSTING ID</h2>
        <div className="bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-800">
          <label className="text-neutral-500 text-xs uppercase tracking-wider mb-2 block">Scanned ID</label>
          <input
            type="text" value={postingId}
            onChange={(e) => setPostingId(e.target.value)}
            className="w-full bg-neutral-800 text-white text-lg font-mono p-3 rounded-lg border border-neutral-700 focus:border-yellow-500 outline-none"
          />
          <p className="text-neutral-600 text-xs mt-2">Raw: {postingIdRaw}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => confirmPostingId(true)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors">CONFIRM & CONTINUE</button>
          <button onClick={() => confirmPostingId(false)} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors">SCAN AGAIN</button>
          <button onClick={resetFlow} className="w-full py-3 text-neutral-500 hover:text-white text-sm transition-colors">CANCEL</button>
        </div>
      </div>
    </div>
  );
}

function VideoPrompt() {
  const { setRecordVideo, overlayText } = usePostingStore();
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Add Video?</h2>
        <p className="text-neutral-400 mb-2">Watermark text ready:</p>
        <p className="text-yellow-500 font-mono text-sm mb-8 bg-neutral-900 p-3 rounded-lg border border-neutral-800">{overlayText}</p>
        <div className="space-y-3">
          <button onClick={() => setRecordVideo(true)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors">YES, RECORD VIDEO</button>
          <button onClick={() => setRecordVideo(false)} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors">NO, FINISH HERE</button>
        </div>
      </div>
    </div>
  );
}

function ProcessingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-neutral-400">Processing video overlay...</p>
    </div>
  );
}