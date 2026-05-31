import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { usePostingStore } from '../stores/postingStore';
import { X } from 'lucide-react';

export default function ScannerOverlay() {
  const scannerRef = useRef(null);
  const { setPostingId, goManual } = usePostingStore();

  useEffect(() => {
    const scanner = new Html5Qrcode('scanner-container');
    scannerRef.current = scanner;
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };
    scanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        scanner.stop().then(() => setPostingId(decodedText));
      },
      () => {}
    );
    return () => {
      if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
    };
  }, [setPostingId]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="pt-12 pb-4 text-center z-10">
        <p className="text-neutral-500 text-xs tracking-widest uppercase mb-1">Step 1</p>
        <h2 className="text-xl font-bold text-yellow-500 tracking-wide">SCAN BARCODE</h2>
        <p className="text-neutral-400 text-sm mt-1">POINT CAMERA AT BARCODE OR QR CODE</p>
      </div>

      <div className="flex-1 relative mx-4 mb-4 rounded-lg overflow-hidden border-2 border-yellow-500/50">
        <div id="scanner-container" className="w-full h-full" />
        {/* Bracket overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M15,20 L15,15 L20,15" stroke="#EAB308" strokeWidth="1" fill="none" />
          <path d="M80,15 L85,15 L85,20" stroke="#EAB308" strokeWidth="1" fill="none" />
          <path d="M15,80 L15,85 L20,85" stroke="#EAB308" strokeWidth="1" fill="none" />
          <path d="M80,85 L85,85 L85,80" stroke="#EAB308" strokeWidth="1" fill="none" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#EAB308" strokeWidth="0.3" strokeDasharray="2,2">
            <animate attributeName="y1" values="20;80;20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y2" values="20;80;20" dur="2s" repeatCount="indefinite" />
          </line>
        </svg>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="inline-block bg-black/60 text-yellow-500 text-sm tracking-widest px-4 py-2 rounded-full animate-pulse">SCANNING...</span>
        </div>
      </div>

      <button
        onClick={() => { scannerRef.current?.stop().catch(() => {}); goManual(); }}
        className="mx-4 mb-8 py-3 flex items-center justify-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" /> ENTER MANUALLY
      </button>
    </div>
  );
}