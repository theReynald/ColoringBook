"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

const PRESET_COLORS = [
  "#FF6B9D", "#C084FC", "#6EE7B7", "#FBBF24", "#7DD3FC",
  "#F87171", "#FB923C", "#A78BFA", "#34D399", "#60A5FA",
  "#F472B6", "#FACC15", "#4ADE80", "#38BDF8", "#E879F9",
  "#000000",
];

const BRUSH_SIZES = [
  { label: "S", size: 4 },
  { label: "M", size: 12 },
  { label: "L", size: 24 },
  { label: "XL", size: 40 },
];

interface ColoringCanvasProps {
  imageUrl: string;
  pageId: string;
}

export default function ColoringCanvas({ imageUrl, pageId }: ColoringCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [color, setColor] = useState("#FF6B9D");
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Load the coloring page image onto the background canvas
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = canvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = containerRef.current?.clientWidth || 780;
      const scale = Math.min(maxW / img.width, 1);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);

      bgCanvas.width = w;
      bgCanvas.height = h;
      drawCanvas.width = w;
      drawCanvas.height = h;

      const bgCtx = bgCanvas.getContext("2d")!;
      bgCtx.fillStyle = "#FFFFFF";
      bgCtx.fillRect(0, 0, w, h);
      bgCtx.drawImage(img, 0, 0, w, h);

      // Save initial empty state for undo
      const drawCtx = drawCanvas.getContext("2d")!;
      setHistory([drawCtx.getImageData(0, 0, w, h)]);
      setImageLoaded(true);
    };
    img.onerror = () => {
      showToast("Failed to load coloring page image.");
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getPos = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e);
      lastPosRef.current = pos;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, (isEraser ? brushSize : brushSize) / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? "#FFFFFF" : color;
      ctx.globalCompositeOperation = isEraser ? "source-over" : "source-over";
      ctx.fill();
    },
    [getPos, color, brushSize, isEraser]
  );

  const draw = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !lastPosRef.current) return;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      ctx.stroke();

      lastPosRef.current = pos;
    },
    [isDrawing, getPos, color, brushSize, isEraser]
  );

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPosRef.current = null;

    // Save state for undo
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-20), snapshot]);
  }, [isDrawing]);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const newHistory = history.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(newHistory);
  }, [history]);

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const emptyState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([emptyState]);
  }, []);

  const handleDownload = useCallback(() => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = canvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    // Composite: bg + strokes
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = bgCanvas.width;
    exportCanvas.height = bgCanvas.height;
    const ctx = exportCanvas.getContext("2d")!;
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(drawCanvas, 0, 0);

    const link = document.createElement("a");
    link.download = `colorsplash-colored-${pageId}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }, [pageId]);

  const handleSave = useCallback(async () => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = canvasRef.current;
    if (!bgCanvas || !drawCanvas) return;

    setIsSaving(true);

    try {
      // Composite: bg + strokes
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = bgCanvas.width;
      exportCanvas.height = bgCanvas.height;
      const ctx = exportCanvas.getContext("2d")!;
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.drawImage(drawCanvas, 0, 0);

      const imageData = exportCanvas.toDataURL("image/png");

      const res = await fetch("/api/save-colored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, imageData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      showToast("Coloring saved successfully! ✨");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save coloring. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [pageId]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div
        className="rounded-[24px] p-4 flex flex-wrap items-center gap-4"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          border: "1.5px solid rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 8px 32px rgba(192,132,252,0.10)",
        }}
      >
        {/* Color palette */}
        <div className="flex flex-wrap gap-2 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex-shrink-0"
              style={{
                background: c,
                outline: color === c && !isEraser ? "3px solid #4A3060" : "2px solid rgba(255,255,255,0.7)",
                outlineOffset: "2px",
                transform: color === c && !isEraser ? "scale(1.15)" : "scale(1)",
              }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              setIsEraser(false);
            }}
            className="w-8 h-8 rounded-full cursor-pointer border-none"
            title="Custom color"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-plum-hint/30 hidden sm:block" />

        {/* Brush sizes */}
        <div className="flex gap-2 items-center">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.label}
              onClick={() => setBrushSize(b.size)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all"
              style={{
                background:
                  brushSize === b.size
                    ? "linear-gradient(135deg, #FF6B9D, #C084FC)"
                    : "rgba(255,255,255,0.5)",
                color: brushSize === b.size ? "#fff" : "#7C6A96",
                border: "1.5px solid rgba(255,255,255,0.7)",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-plum-hint/30 hidden sm:block" />

        {/* Tools */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsEraser(!isEraser)}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{
              background: isEraser
                ? "linear-gradient(135deg, #FF6B9D, #C084FC)"
                : "rgba(255,255,255,0.5)",
              color: isEraser ? "#fff" : "#7C6A96",
              border: "1.5px solid rgba(255,255,255,0.7)",
            }}
          >
            🧹 Eraser
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-40"
            style={{
              background: "rgba(255,255,255,0.5)",
              color: "#7C6A96",
              border: "1.5px solid rgba(255,255,255,0.7)",
            }}
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.5)",
              color: "#7C6A96",
              border: "1.5px solid rgba(255,255,255,0.7)",
            }}
          >
            🗑️ Reset
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative rounded-[24px] overflow-hidden"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 8px 32px rgba(192,132,252,0.10)",
        }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent"
              style={{
                borderColor: "#C084FC",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        )}
        <canvas ref={bgCanvasRef} className="block w-full h-auto" />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ cursor: isEraser ? "crosshair" : "crosshair", touchAction: "none" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, #C084FC, #A78BFA)",
            color: "#fff",
            boxShadow: "0 6px 20px rgba(192,132,252,0.25)",
          }}
        >
          {isSaving ? "💫 Saving..." : "💾 Save Progress"}
        </button>
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
            color: "#1E5048",
            boxShadow: "0 6px 20px rgba(110,231,183,0.25)",
          }}
        >
          ⬇️ Download
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-full font-extrabold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
            boxShadow: "0 6px 20px rgba(255,107,157,0.25)",
          }}
        >
          ✨ Create New
        </button>
        <button
          onClick={() => router.push("/gallery")}
          className="px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.55)",
            color: "#7C6A96",
            border: "1.5px solid rgba(255,255,255,0.7)",
            backdropFilter: "blur(18px)",
          }}
        >
          🖼️ Gallery
        </button>
      </div>
    </div>
  );
}
