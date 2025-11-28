import React from "react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-sky-600 to-blue-500 p-1 pl-10 text-white shadow">
      <div className="mx-auto px-1 flex items-center gap-4">

        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 ring-1 ring-white/20 flex-shrink-0">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" fill="currentColor" />
          </svg>
        </div>

        <div className="leading-tight">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Geo‑Measure</h1>
          <p className="text-sm text-white/90">Accurate image‑based measurement tools</p>
        </div>
      </div>
    </header>
  );
}
