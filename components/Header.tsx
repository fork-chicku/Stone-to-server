
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-6 border-b border-amber-900/10 flex flex-col md:flex-row items-center justify-between bg-[#fcfaf7]/60 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="w-14 h-14 rounded-full bg-orange-900 flex items-center justify-center text-amber-50 font-bold text-xl shadow-lg shadow-orange-900/20 border-4 border-amber-600/30 ring-1 ring-orange-900">
          <span className="font-serif translate-y-[2px]">ॐ</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Stone to Server</h1>
          <p className="text-amber-700 text-xs uppercase tracking-[0.15em] font-bold">Vijayanagara Restoration Project</p>
        </div>
      </div>
      <nav className="flex items-center gap-8 text-sm font-semibold text-stone-700 tracking-wide font-serif">
        <span className="hidden md:inline hover:text-orange-800 cursor-pointer transition-colors decoration-amber-500/30 underline-offset-4 hover:underline">Royal Archives</span>
        <span className="hidden md:inline hover:text-orange-800 cursor-pointer transition-colors decoration-amber-500/30 underline-offset-4 hover:underline">Shilpa Shastras</span>
        
        <span className="px-5 py-2 bg-stone-800 text-amber-50 rounded-sm border border-amber-500/20 text-xs tracking-widest uppercase shadow-md">
          Temple Link Active
        </span>
      </nav>
    </header>
  );
};

export default Header;
