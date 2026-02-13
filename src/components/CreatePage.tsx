"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import RainbowDivider from "@/components/RainbowDivider";
import Loader from "@/components/Loader";
import { showToast } from "@/components/Toast";

export default function CreatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    coloringPageUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      showToast("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      showToast("Image must be under 20MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Conversion failed.");
        return;
      }

      setResult({ id: data.id, coloringPageUrl: data.coloringPageUrl });
      showToast("Coloring page created!", "success");
    } catch {
      showToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const res = await fetch(result.coloringPageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "colorsplash-coloring-page.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed.");
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      {loading && <Loader />}

      {/* Upload Card */}
      <Card>
        <h2 className="text-2xl font-extrabold text-plum mb-1">📸 Upload Your Photo</h2>
        <RainbowDivider />

        {!preview ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-[32px] p-12 text-center transition-all duration-300"
            style={{
              border: dragOver
                ? "3px solid #C084FC"
                : "3px dashed rgba(192,132,252,0.35)",
              background: dragOver
                ? "rgba(192,132,252,0.07)"
                : "rgba(255,255,255,0.35)",
              transform: dragOver ? "scale(1.01)" : "scale(1)",
            }}
          >
            <div className="text-5xl mb-4" style={{ animation: "gentleBounce 2.5s ease-in-out infinite" }}>
              ☁️
            </div>
            <p className="font-bold text-plum-light text-lg">
              Drop your photo here
            </p>
            <p className="text-plum-hint text-sm mt-1">
              or click to browse · JPG, PNG, WEBP
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full max-h-96 object-contain rounded-2xl"
            />
            <button
              onClick={resetAll}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-110"
              style={{ background: "rgba(255,107,157,0.85)" }}
            >
              ✕
            </button>
          </div>
        )}

        {preview && !result && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="px-8 py-4 rounded-full font-extrabold text-white text-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
                boxShadow: "0 6px 20px rgba(255,107,157,0.25)",
              }}
            >
              🪄 Convert to Coloring Page
            </button>
          </div>
        )}
      </Card>

      {/* Result Card */}
      {result && (
        <Card>
          <h2 className="text-2xl font-extrabold text-plum mb-1">
            🖍️ Your Coloring Page
          </h2>
          <RainbowDivider />

          <img
            src={result.coloringPageUrl}
            alt="Coloring page result"
            className="w-full rounded-2xl mb-6"
          />

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
                color: "#1E5048",
                boxShadow: "0 6px 20px rgba(110,231,183,0.25)",
              }}
            >
              💾 Download
            </button>
            <button
              onClick={() => router.push(`/color/${result.id}`)}
              className="px-6 py-3 rounded-full font-extrabold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FBBF24, #FF6B9D)",
                boxShadow: "0 6px 20px rgba(251,191,36,0.25)",
              }}
            >
              🎨 Color It!
            </button>
            <button
              onClick={resetAll}
              className="px-6 py-3 rounded-full font-extrabold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
                boxShadow: "0 6px 20px rgba(255,107,157,0.25)",
              }}
            >
              🔄 New Image
            </button>
          </div>
        </Card>
      )}
    </>
  );
}
