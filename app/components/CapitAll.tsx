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
      // quietly give up if this fails too
    }
  }
}

interface Snippet {
  id: number;
  text: string; // ALWAYS ALL CAPS
}

export default function AutoCapsClipboard() {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  // helper to add a snippet (max 10) + copy
  function addSnippet(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const upper = trimmed.toUpperCase();

    setSnippets((prev) => {
      const next: Snippet[] = [
        { id: Date.now() + Math.random(), text: upper },
        ...prev,
      ];
      return next.slice(0, 10); // keep latest 10
    });

    copyToClipboardSafe(upper);
    setCopied(true);
  }

  // Handle typing/pasting → ALL CAPS
  // If this is the first non-empty input (initial paste / type),
  // it ALSO gets added to history + copied.
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const upper = raw.toUpperCase();
    const prevValue = value; // previous state

    setValue(upper);

    if (!upper) {
      setCopied(false);
      return;
    }

    if (!prevValue) {
      // initial non-empty entry → treat as "first snippet"
      addSnippet(upper);
    } else {
      // subsequent edits → just auto-copy, don't flood history
      copyToClipboardSafe(upper);
      setCopied(true);
    }
  }

  function handleCopyClick() {
    if (!value) return;
    addSnippet(value); // also copies + adds to history
  }

  // Trim to 100 chars and add to history
  function handleTrimTo100() {
    if (!value) return;
    const trimmed = value.slice(0, 100);
    setValue(trimmed);
    addSnippet(trimmed); // also copies + adds to history
  }

  function handleClear() {
    setValue("");
    setCopied(false);
  }

  function handleCopySnippet(id: number) {
    const snip = snippets.find((s) => s.id === id);
    if (!snip) return;
    copyToClipboardSafe(snip.text);
    setCopied(true);
  }

  function handleClearSnippet(id: number) {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }

  // 🔹 NEW: clear all snippets/history
  function handleClearAllSnippets() {
    setSnippets([]);
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

  // ---------- Floating mini view ----------
  if (isFloating) {
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

        {/* Recent snippets – compact list */}
        {snippets.length > 0 && (
          <>
            <div className="mt-2 space-y-1 max-h-40 overflow-auto">
              {snippets.map((snip) => (
                <div
                  key={snip.id}
                  className="border rounded-lg bg-gray-50 px-2 py-1.5 flex items-start justify-between gap-2"
                >
                  <div className="font-mono text-[10px] text-gray-800 break-words">
                    {snip.text}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(snip.id)}
                      className="px-2 py-0.5 rounded text-[9px] border border-gray-300 hover:bg-gray-100"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearSnippet(snip.id)}
                      className="text-[10px] text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear all snippets button (floating) */}
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleClearAllSnippets}
                className="text-[9px] px-2 py-0.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Clear history
              </button>
            </div>
          </>
        )}

        <div className="text-[9px] text-gray-400 text-right">
          Ctrl + Shift + K to toggle
        </div>
      </div>
    );
  }

  // ---------- Full inline card view ----------
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

      {/* Recent snippets list */}
      {snippets.length > 0 && (
        <>
          <div className="mt-3 space-y-2 max-h-56 overflow-auto">
            {snippets.map((snip) => (
              <div
                key={snip.id}
                className="border rounded-lg bg-gray-50 px-3 py-2 flex items-start justify-between gap-3"
              >
                <div className="font-mono text-[11px] text-gray-800 break-words">
                  {snip.text}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(snip.id)}
                    className="px-2 py-0.5 rounded text-[10px] border border-gray-300 hover:bg-gray-100"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearSnippet(snip.id)}
                    className="text-[11px] text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Clear all snippets button (full view) */}
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={handleClearAllSnippets}
              className="px-3 py-1 rounded-lg text-[10px] border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Clear snippets
            </button>
          </div>
        </>
      )}

      <div className="text-[10px] text-gray-400 text-right">
        Press <span className="font-semibold">Ctrl + Shift + K</span> to pop out mini helper
      </div>
    </div>
  );
}
