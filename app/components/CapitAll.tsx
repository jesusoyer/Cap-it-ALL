"use client";

import React, { useState, useEffect } from "react";

// Robust copy helper: Clipboard API + fallback
function copyToClipboardSafe(text: string) {
  if (typeof window === "undefined") return;

  if (navigator && "clipboard" in navigator && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(value: string) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      // if even this fails, we quietly give up
    }
  }
}

export default function AutoCapsClipboard() {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFloating, setIsFloating] = useState(false);

  // Handle typing/pasting → ALL CAPS + auto-copy
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const upper = raw.toUpperCase();

    setValue(upper);
    if (upper) {
      copyToClipboardSafe(upper);
      setCopied(true);
    } else {
      setCopied(false);
    }
  }

  function handleCopyClick() {
    if (!value) return;
    const upper = value.toUpperCase();
    setValue(upper);
    copyToClipboardSafe(upper);
    setCopied(true);
  }

  // 🔹 New: trim to 100 chars and auto-copy
  function handleTrimTo100() {
    if (!value) return;
    const trimmed = value.slice(0, 100); // first 100 characters
    setValue(trimmed);
    copyToClipboardSafe(trimmed);
    setCopied(true);
  }

  function handleClear() {
    setValue("");
    setCopied(false);
  }

  // Small timeout to hide "Copied!" after a moment
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  // Keyboard shortcut: Ctrl+Shift+K toggles floating mini window
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl + Shift + K
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsFloating((prev) => !prev);
      }

      // ESC closes floating mode
      if (e.key === "Escape") {
        setIsFloating(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isFloating) {
    // 🔹 Mini floating version in top-right
    return (
      <div className="fixed top-3 right-3 z-50 w-80 border rounded-xl bg-white shadow-lg p-3 text-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-gray-800">
            CAPS Helper
          </span>
          <div className="flex items-center gap-2">
            {copied && (
              <span className="text-[10px] text-emerald-600 font-medium">
                Copied
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsFloating(false)}
              className="text-[11px] text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
          className="w-full border rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Type / paste…"
        />

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={!value}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border
              ${
                !value
                  ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            Clear
          </button>

          {/* New trim button in mini view */}
          <button
            type="button"
            onClick={handleTrimTo100}
            disabled={!value}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border
              ${
                !value
                  ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            Trim to 100
          </button>

          <button
            type="button"
            onClick={handleCopyClick}
            disabled={!value}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border
              ${
                !value
                  ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            Copy
          </button>
        </div>

        <div className="text-[9px] text-gray-400 text-right">
          Ctrl + Shift + K to toggle
        </div>
      </div>
    );
  }

  // 🔹 Normal inline full card version
  return (
    <div className="w-full max-w-md border rounded-xl bg-white shadow-sm p-4 text-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Auto CAPS & Clipboard</h3>
        {copied && (
          <span className="text-[11px] text-emerald-600 font-medium">
            Copied!
          </span>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-medium text-gray-700 mb-1">
          Text
        </label>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Type or paste here (auto ALL CAPS + copied)…"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={!value}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border
            ${
              !value
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
        >
          Clear
        </button>

        {/* New trim button in full view */}
        <button
          type="button"
          onClick={handleTrimTo100}
          disabled={!value}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border
            ${
              !value
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
        >
          Trim to 100
        </button>

        <button
          type="button"
          onClick={handleCopyClick}
          disabled={!value}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border
            ${
              !value
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
        >
          Copy again
        </button>
      </div>

      <div className="text-[10px] text-gray-400 text-right">
        Press <span className="font-semibold">Ctrl + Shift + K</span> to pop out mini helper
      </div>
    </div>
  );
}
