"use client";

import { useEffect, useState, useCallback } from "react";

type Toast = {
  id: number;
  message: string;
  type: "error" | "success";
};

let addToastGlobal: ((message: string, type?: "error" | "success") => void) | null = null;

export function showToast(message: string, type: "error" | "success" = "error") {
  addToastGlobal?.(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "error" | "success" = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-6 py-3 rounded-full font-bold text-white text-sm shadow-lg animate-[slideUp_0.3s_ease-out]"
          style={{
            background:
              t.type === "error"
                ? "linear-gradient(135deg, #FF6B9D, #C084FC)"
                : "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
          }}
        >
          {t.type === "error" ? "⚠️" : "✅"} {t.message}
        </div>
      ))}
    </div>
  );
}
