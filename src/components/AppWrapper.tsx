"use client";

import { useEffect } from "react";

/**
 * Wraps the application to ensure animations are correctly restored
 * when the user returns via the browser's Back button (BFCache).
 * Forcefully makes stuck Framer Motion elements visible on pageshow.
 */
export default function AppWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Defeat BFCache by adding an unload listener. 
    // Many browsers will refuse to BFCache a page if it has an unload listener.
    const disableBFCache = () => {};
    window.addEventListener("unload", disableBFCache);

    const handlePageShow = (e: PageTransitionEvent) => {
      // 2. If the browser STILL used BFCache (e.persisted is true),
      // we forcefully reload the page to ensure Framer Motion and React mount cleanly.
      // We don't use sessionStorage, so it won't infinite loop.
      if (e.persisted) {
        window.location.reload();
      } else if (typeof window !== "undefined" && (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger) {
        // Normal navigation: just refresh GSAP
        (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger?.refresh();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("unload", disableBFCache);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {children}
    </div>
  );
}
