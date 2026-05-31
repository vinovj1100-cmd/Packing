import { usePostingStore } from '../stores/postingStore';
import { CheckCircle } from 'lucide-react';

export default function ConfirmationCard() {
  const { postingId, city, dateFormatted, completePosting, resetFlow } = usePostingStore();
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-sm bg-yellow-500 rounded-2xl p-8 text-center text-black">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
        </div>
        <h2 className="text-2xl font-black tracking-wider mb-1">ALL GOOD</h2>
        <p className="font-bold text-lg mb-1">{postingId} saved!</p>
        <p className="text-black/70 mb-6">Thanks!</p>
        <p className="text-black/60 text-sm font-medium mb-8">{city} • {dateFormatted}</p>
        <button
          onClick={() => { completePosting(); resetFlow(); }}
          className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors tracking-wide"
        >
          NEXT POSTING
        </button>
      </div>
    </div>
  );
}