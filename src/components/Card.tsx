import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[32px] p-8 mb-6 transition-shadow duration-300 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        border: "1.5px solid rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:
          "0 8px 32px rgba(192,132,252,0.10), 0 1.5px 6px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}
