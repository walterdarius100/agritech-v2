"use client";

import { useEffect, useRef } from "react";

export function ReadingProgressBar() {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateProgress = () => {
      const { scrollHeight, clientHeight, scrollTop } =
        document.documentElement;
      const scrollableHeight = scrollHeight - clientHeight;
      const progress =
        scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      const boundedProgress = Math.min(100, Math.max(0, progress));

      progressBarRef.current?.style.setProperty(
        "transform",
        `scaleX(${boundedProgress / 100})`,
      );
      animationFrameId = null;
    };

    const requestProgressUpdate = () => {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(updateProgress);
      }
    };

    requestProgressUpdate();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
      if (animationFrameId !== null) {
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
        ref={progressBarRef}
        className="h-full origin-left scale-x-0 bg-yellow-400 will-change-transform"
      />
    </div>
  );
}
