'use client';
import { useState } from 'react';

export default function ProfileCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="w-10 h-10 grid place-items-center bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg hover:ring-2 ring-[#9945FF]">
        <span className="text-white font-bold text-sm">A</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#1A1F25] border border-[#1F252B] rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 grid place-items-center bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg"><span className="text-white font-bold text-lg">A</span></div>
            <div>
              <div className="flex items-center gap-2"><span className="text-white font-bold">Arbitrager</span><div className="w-4 h-4 bg-[#14F195] rounded-full grid place-items-center"><span className="text-[10px]">★</span></div></div>
              <p className="text-xs text-[#6B7683]">7xKs…9mPq</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
