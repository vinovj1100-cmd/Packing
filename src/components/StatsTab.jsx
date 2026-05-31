import { usePostingStore } from '../stores/postingStore';
import { useMemo } from 'react';
import { Hash, Clock, MapPin, TrendingUp } from 'lucide-react';

export default function StatsTab() {
  const { postings } = usePostingStore();

  const stats = useMemo(() => {
    const total = postings.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const today = postings.filter(p => new Date(p.timestamp).toISOString().split('T')[0] === todayStr).length;
    const uniqueCities = [...new Set(postings.map(p => p.city))];
    const cityCounts = {};
    postings.forEach(p => { cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });
    const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, today, uniqueCities: uniqueCities.length, topCities };
  }, [postings]);

  return (
    <div className="p-4 pt-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-yellow-500 tracking-wide mb-6">STATS & INFO</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={Hash} value={stats.total} label="TOTAL POSTINGS" />
        <StatCard icon={Clock} value={stats.today} label="TODAY" />
      </div>

      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
          <MapPin className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-3xl font-bold text-yellow-500">{stats.uniqueCities}</p>
          <p className="text-neutral-500 text-xs uppercase tracking-wider">UNIQUE CITIES</p>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Recent Cities</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.topCities.map(([city]) => (
            <span key={city} className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-bold rounded-lg border border-neutral-700">
              {city}
            </span>
          ))}
          {stats.topCities.length === 0 && <p className="text-neutral-600 text-sm">No data yet</p>}
        </div>
      </div>

      {postings.length === 0 && (
        <div className="text-center py-12 text-neutral-600">
          <TrendingUp className="w-12 h-12 text-neutral-800 mx-auto mb-3" />
          <p>No data available yet</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 flex flex-col items-center text-center">
      <Icon className="w-6 h-6 text-yellow-500 mb-2" />
      <p className="text-3xl font-bold text-yellow-500">{value}</p>
      <p className="text-neutral-500 text-xs uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}