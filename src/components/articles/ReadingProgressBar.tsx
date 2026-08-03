"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number | undefined;

    const updateProgress = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const scrollableHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const nextProgress =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
          : 0;

      setProgress(nextProgress);
      animationFrameId = undefined;
    };

    const requestProgressUpdate = () => {
      if (animationFrameId === undefined) {
        animationFrameId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-emerald-950/10"
    >
      <div
        className="h-full origin-left bg-yellow-400 transition-transform duration-150 ease-out will-change-transform"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
