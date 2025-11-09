"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 1200); // how long to show
    const t2 = setTimeout(() => setHide(true), 1200 + 500); // fade duration
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hide) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src="/login-logo.svg"
        alt="Customer Happiness"
        className="h-16 w-auto md:h-20"
      />

      {/* three loading dots */}
      <div className="mt-6 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full bg-[#E8258E] animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-[#E8258E] animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-[#E8258E] animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
