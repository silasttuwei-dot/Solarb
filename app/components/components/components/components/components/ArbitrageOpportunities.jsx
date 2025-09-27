'use client';
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ExternalLink, Filter, TrendingUp, Clock, Zap } from 'lucide-react';
import Skeleton from './Skeleton';

const TABS = ['All Opportunities', 'High Profit', 'Low Risk', 'Quick Execute', 'Large Volume'];
const dexes = [
  { id: 'raydium', name: 'Raydium', color: '#8C65F7' },
  { id: 'orca', name: 'Orca', color: '#FFD512' },
  { id: 'serum', name: 'Serum', color: '#00D4AA' },
  { id: 'jupiter', name: 'Jupiter', color: '#FBA43A' },
  { id: 'saber', name: 'Saber', color: '#FF6B9D' },
  { id: 'aldrin', name: 'Aldrin', color: '#4ECDC4' },
  { id: 'mercurial', name: 'Mercurial', color: '#9945FF' },
  { id: 'lifinity', name: 'Lifinity', color: '#14F195' },
];

export default function ArbitrageOpportunities() {
  const [filter, setFilter] = useState('All Opportunities');
  const [minProfit, setMinProfit] = useState(0.5);
  const [selectedDexes, setSelectedDexes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['arbitrage-opportunities', filter, minProfit, selectedDexes],
    queryFn: async () => {
      const params = new URLSearchParams({ filter, minProfit: minProfit.toString(), dexes: selectedDexes.join(',') });
      const res = await fetch(`/api/arbitrage-opportunities?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    },
    refetchInterval: 5_000,
  });

  /* ---------- keyboard nav ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown') setHighlighted((h) => Math.min(h + 1, opportunities?.length - 1 || 0));
      if (e.key === 'ArrowUp') setHighlighted((h) => Math.max(h - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opportunities]);

  const fmtNum = useCallback((n) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  }, []);

  const fmtPct = useCallback((n) => `${n.toFixed(2)}%`, []);

  const profitColor = useCallback((p) => (p >= 5 ? 'text-[#14F195]' : p >= 2 ? 'text-[#FFE66D]' : 'text-[#FF6B6B]'), []);

  const risk = useCallback((p, v) => (p > 3 && v > 10_000 ? { level: 'Low', color: 'text-[#14F195]' } : p > 1.5 && v > 5_000 ? { level: 'Medium', color: 'text-[#FFE66D]' } : { level: 'High', color: 'text-[#FF6B6B]' }), []);

  const toggleDex = useCallback((id) => setSelectedDexes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])), []);

  return (
    <div className="space-y-6 max-w-full">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-white font-semibold text-2xl md:text-[26px] tracking-[-0.25px] font-poppins">Live Arbitrage Opportunities</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-2 px-4 py-2 bg-[#13161F] border border-[#2A2D36] rounded-lg text-[#8C94A6] hover:border-[#9945FF] hover:text-white transition-all"><Filter className="w-4 h-4" /><span className="text-sm font-medium">Filters</span></button>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-wrap">
            {TABS.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`flex-shrink-0 px-5 py-3 rounded-full font-medium text-sm transition-all ${filter === t ? 'bg-gradient-to-b from-[#9945FF] to-[#14F195] text-white' : 'text-white text-opacity-60 hover:text-opacity-85 hover:bg-[#13161F]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[#13161F] rounded-2xl p-6 space-y-6">
          <h3 className="text-white font-semibold text-lg font-poppins">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#8C94A6] text-sm mb-3">Minimum Profit Margin: {fmtPct(minProfit)}</label>
              <input type="range" min="0.1" max="10" step="0.1" value={minProfit} onChange={(e) => setMinProfit(parseFloat(e.target.value))} className="w-full h-2 bg-[#1A1F25] rounded-lg appearance-none cursor-pointer slider" />
            </div>
            <div>
              <label className="block text-[#8C94A6] text-sm mb-3">Select DEXes ({selectedDexes.length} selected)</label>
              <div className="grid grid-cols-2 gap-2">
                {dexes.map((d) => (
                  <button key={d.id} onClick={() => toggleDex(d.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedDexes.includes(d.id) ? 'bg-[#1A1F25] border border-[#9945FF] text-white' : 'bg-[#1A1F25] border border-[#2A2D36] text-[#8C94A6] hover:border-[#9945FF] hover:text-white'}`}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* table */}
      <div className="w-full overflow-x-auto bg-[#0D0F12] rounded-lg">
        <div className="min-w-[1000px]">
          <table className="w-full">
            <thead>
              <tr className="h-12 border-b border-[#1F2328]">
                {['Token Pair', 'DEX Route', 'Profit %', 'Est. Profit', 'Volume', 'Risk', 'Time Left', 'Action'].map((h) => (
                  <th key={h} className="text-left text-[#AEB4BC] font-medium text-[13px] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8">{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</td>
                </tr>
              ) : !opportunities?.length ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-[#8C94A6]">No opportunities found</td>
                </tr>
              ) : (
                opportunities.map((row, i) => {
                  const r = risk(row.profitPercentage, row.volume);
                  return (
                    <tr key={row.id} onClick={() => setHighlighted(i)} className={`h-18 border-b border-[#1F2328] hover:bg-[#171A1F] transition-colors cursor-pointer ${highlighted === i ? 'bg-[#1A1F25]' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <img src={row.tokenA.logo} alt={row.tokenA.symbol} className="w-8 h-8 rounded-full border-2 border-[#0D0F11]" onError={(e) => (e.target.src = '/placeholder.svg')} />
                            <img src={row.tokenB.logo} alt={row.tokenB.symbol} className="w-8 h-8 rounded-full border-2 border-[#0D0F11]" onError={(e) => (e.target.src = '/placeholder.svg')} />
                          </div>
                          <div>
                            <span className="text-white font-medium text-[15px]">{row.tokenA.symbol}/{row.tokenB.symbol}</span>
                            <div className="text-[#8C94A6] text-[12px]">{row.tokenA.name} / {row.tokenB.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2"><span className="text-white text-[14px]">{row.buyDex}</span><ArrowRight className="w-3 h-3 text-[#14F195]" /><span className="text-white text-[14px]">{row.sellDex}</span></div>
                      </td>
                      <td className="px-4 py-4 text-right"><span className={`font-semibold text-[15px] ${profitColor(row.profitPercentage)}`}>+{fmtPct(row.profitPercentage)}</span></td>
                      <td className="px-4 py-4 text-right"><span className="text-white font-medium text-[15px]">{fmtNum(row.estimatedProfit)}</span></td>
                      <td className="px-4 py-4 text-right"><span className="text-white text-[15px]">{fmtNum(row.volume)}</span></td>
                      <td className="px-4 py-4 text-center"><span className={`font-medium text-[13px] ${r.color}`}>{r.level}</span></td>
                      <td className="px-4 py-4 text-center"><div className="flex items-center justify-center gap-1"><Clock className="w-3 h-3 text-[#8C94A6]" /><span className="text-[13px] text-[#8C94A6]">{row.timeLeft}</span></div></td>
                      <td className="px-4 py-4 text-right">
                        <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg hover:from-[#b366ff] hover:to-[#2bff9f] active:scale-95 transition-all"><Zap className="w-3 h-3" /><span className="text-white text-[12px] font-medium">Execute</span></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(45deg, #9945FF, #14F195); cursor: pointer; }
        .slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(45deg, #9945FF, #14F195); cursor: pointer; border: none; }
      `}</style>
    </div>
  );
}
