import { useState } from 'react';
import { usePostingStore } from '../stores/postingStore';
import { ScanBarcode, ArrowRight } from 'lucide-react';

export default function ManualEntry() {
  const [val, setVal] = useState('');
  const { setPostingId, startScan } = usePostingStore();

  const confirm = () => {
    if (!val.trim()) return;
    setPostingId(val.trim());
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="text-neutral-500 text-xs tracking-widest uppercase mb-1 text-center">Step 1</p>
        <h2 className="text-xl font-bold mb-8 text-center tracking-wide">ENTER POSTING ID</h2>

        <input
          type="text"
          placeholder="POSTING-ID"
          value={val}
          onChange={(e) => setVal(e.target.value.toUpperCase())}
          className="w-full bg-neutral-900 text-white text-center text-2xl font-bold tracking-widest p-4 rounded-xl border border-neutral-800 focus:border-yellow-500 outline-none placeholder:text-neutral-700 mb-6"
        />

        <button
          onClick={confirm}
          disabled={!val.trim()}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          CONFIRM <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-neutral-600 text-sm">OR</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <button
          onClick={startScan}
          className="w-full py-4 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
        >
          <ScanBarcode className="w-5 h-5" />
          SCAN BARCODE / QR
        </button>
      </div>
    </div>
  );
}