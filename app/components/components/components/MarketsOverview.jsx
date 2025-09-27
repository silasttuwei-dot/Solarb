'use client';
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from './Skeleton';

const timeframes = ['1h', '24h', '7d', '30d'];

export default function MarketOverview() {
  const [tf, setTf] = useState('24h');
  const { data, isLoading } = useQuery({
    queryKey: ['market-overview', tf],
    queryFn: async () => {
      const res = await fetch(`/api/market-overview?timeframe=${tf}`);
      if (!res.ok) throw new Error('market fetch failed');
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const stats = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-white font-semibold text-xl md:text-2xl font-poppins">Market Overview</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {timeframes.map((t) => (
            <button key={t} onClick={() => setTf(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tf === t ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white' : 'bg-[#13161F] border border-[#2A2D36] text-[#8C94A6] hover:border-[#9945FF] hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {isLoading ? (
          <>
            <Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton /><Skeleton />
          </>
        ) : (
          <>
            <MetricCard icon={<TrendingUp />} label="Opportunities" value={stats.totalOpportunities} delta="vs previous period" good />
            <MetricCard icon={<DollarSign />} label="Avg Profit" value={`${stats.avgProfitMargin?.toFixed(2)}%`} delta="vs previous period" good />
            <MetricCard icon={<Activity />} label="Volume" value={formatDollar(stats.totalVolume)} delta="vs previous period" bad />
            <MetricCard icon={<Zap />} label="Active DEXes" value={`${stats.activeDexes}/8`} delta="All online" good />
            <MetricCard icon={<TrendingUp />} label="Top Opp" value={`${stats.topOpportunity?.toFixed(2)}%`} delta="SOL/USDC pair" good />
            <MetricCard icon={<Clock />} label="Last Update" value={new Date(stats.lastUpdate).toLocaleTimeString()} delta="Live" good />
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, delta, good }) {
  return (
    <div className="bg-[#13161F] rounded-2xl p-4 md:p-6 hover:bg-[#171B26] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 grid place-items-center bg-gradient-to-br from-[#9945FF] to-[#14F195] bg-opacity-20 rounded-lg">{icon}</div>
        <div className="text-right">
          <div className="text-[#8C94A6] text-xs uppercase tracking-wide">{label}</div>
          <div className="text-white font-bold text-xl md:text-2xl font-poppins">{value}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${good ? 'bg-[#14F195]' : 'bg-[#FF6B6B]'}`} />
        <span className="text-xs font-medium text-[#8C94A6]">{delta}</span>
      </div>
    </div>
  );
}

function formatDollar(n) {
  if (!n) return '$0';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
