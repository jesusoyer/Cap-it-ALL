
  
"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import AutoCapsClipboard from "./components/CapitAll";

export default function Home() {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-3">
        {/* Header toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowHeader((prev) => !prev)}
            className="text-[11px] text-gray-500 hover:text-gray-800"
          >
            {showHeader ? "Hide description" : "Show description"}
          </button>
        </div>

        {/* Header (optional) */}
        {showHeader && <Header />}

        {/* App */}
        <div className="flex justify-center">
          <AutoCapsClipboard />
        </div>
      </div>
    </main>
  );
}


