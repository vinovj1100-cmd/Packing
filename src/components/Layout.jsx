import { useState } from 'react';
import { Camera, History, BarChart3 } from 'lucide-react';
import PostTab from './PostTab';
import HistoryTab from './HistoryTab';
import StatsTab from './StatsTab';

export default function Layout() {
  const [tab, setTab] = useState('post');
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {tab === 'post' && <PostTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'stats' && <StatsTab />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto pb-safe">
          <NavBtn active={tab === 'post'} onClick={() => setTab('post')} icon={Camera} label="POST" />
          <NavBtn active={tab === 'history'} onClick={() => setTab('history')} icon={History} label="HISTORY" />
          <NavBtn active={tab === 'stats'} onClick={() => setTab('stats')} icon={BarChart3} label="STATS" />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 py-3 px-6 transition-colors ${active ? 'text-yellow-500' : 'text-neutral-500'}`}>
      <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-bold tracking-wider">{label}</span>
    </button>
  );
}