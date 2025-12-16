import React from "react";

const Header = () => {
  return (
    <header className="w-full max-w-md mx-auto mb-6 text-xs sm:text-sm">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
        Cap it ALL
      </h1>

      <p className="mt-1 text-gray-700">
        Type or paste any text and it will automatically turn into ALL CAPS and
        be copied to your clipboard.
      </p>

      <p className="mt-2 text-[11px] text-gray-500">
        Use <span className="font-semibold">Clear</span> to reset the field, or{" "}
        <span className="font-semibold">Copy again</span> if you need to grab it one more time.
      </p>
    </header>
  );
};

export default Header;
