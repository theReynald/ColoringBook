"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#FF6B9D", "#C084FC", "#6EE7B7", "#FBBF24", "#7DD3FC"];

export default function BubblesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const bubble = document.createElement("div");
      const size = Math.random() * 60 + 20;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const duration = Math.random() * 18 + 12;
      const delay = Math.random() * 15;

      Object.assign(bubble.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: color,
        opacity: "0.18",
        left: `${Math.random() * 100}%`,
        bottom: `-${size}px`,
        animation: `floatUp ${duration}s ${delay}s linear infinite`,
        pointerEvents: "none",
      });

      container.appendChild(bubble);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
