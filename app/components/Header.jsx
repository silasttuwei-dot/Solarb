'use client';
import { useState, useDeferredValue } from 'react';
import dynamic from 'next/dynamic';
import { Search, Bell, Menu, X, Wallet } from 'lucide-react';

const ProfileCard = dynamic(() => import('./ProfileCard'), { ssr: false });

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [rawQuery, setRawQuery] = useState('');
  const query = useDeferredValue(rawQuery); // debounces downstream effects

  return (
    <div className="sticky top-0 z-50 bg-[#13171C]/90 backdrop-blur border-b border-[#1F252B] px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-xl md:text-2xl font-poppins">Arbitrage Dashboard</h1>

        {/* desktop centre */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center max-w-2xl">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#14F195] rounded-full" /><span className="text-sm font-bold">Live</span></div>
          <button className="text-sm hover:text-gray-200">Analytics</button>
          <button className="text-sm hover:text-gray-200">DEXes</button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7683]" />
            <input
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              type="text"
              placeholder="Search tokens, pairs..."
              className="w-full pl-10 pr-4 py-2 bg-[#1A1F25] border border-[#1F252B] rounded-full text-white placeholder-[#6B7683] focus:outline-none focus:ring-2 focus:ring-[#9945FF]"
            />
          </div>
        </div>

        {/* right */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg hover:from-[#b366ff] hover:to-[#2bff9f] active:scale-95"><Wallet className="w-4 h-4" /><span className="text-sm font-medium">Connect</span></button>
          <button className="relative w-10 h-10 grid place-items-center border border-[#1F252B] rounded-lg hover:bg-[#1A1F25]"><Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-[#14F195] rounded-full animate-pulse" /></button>
          <ProfileCard />
          <button className="md:hidden" onClick={() => setShowMobileMenu((s) => !s)}>{showMobileMenu ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      {/* mobile drawer */}
      {showMobileMenu && (
        <div onClick={() => setShowMobileMenu(false)} className="md:hidden fixed inset-0 bg-black/50 z-40">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#0D0F11] w-64 h-full p-4">
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] bg-opacity-10">Dashboard</button>
              <button className="w-full p-3 text-left text-sm text-[#6F7480] hover:text-white">Live</button>
              <button className="w-full p-3 text-left text-sm text-[#6F7480] hover:text-white">Analytics</button>
              <button className="w-full p-3 text-left text-sm text-[#6F7480] hover:text-white">DEXes</button>
            </nav>
            <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg"><Wallet className="w-4 h-4" /><span className="text-sm font-medium">Connect Wallet</span></button>
          </div>
        </div>
      )}
    </div>
  );
}
