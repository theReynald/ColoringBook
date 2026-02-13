"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import RainbowDivider from "@/components/RainbowDivider";

interface ColoringPage {
  id: string;
  original_url: string;
  coloring_page_url: string | null;
  name: string;
  status: string;
  created_at: string;
}

export default function GalleryGrid() {
  const router = useRouter();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setPages(data);
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    }
    fetchPages();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="flex justify-center gap-3 mb-4">
            {["#FF6B9D", "#C084FC", "#6EE7B7", "#FBBF24", "#7DD3FC"].map((c, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background: c,
                  animation: `loaderBounce 1.4s ${i * 0.15}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-plum-muted font-semibold">Loading gallery...</p>
        </div>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🎨</p>
          <h2 className="text-2xl font-extrabold text-plum mb-2">
            No coloring pages yet!
          </h2>
          <p className="text-plum-muted mb-6">
            Upload a photo and create your first coloring page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-full font-extrabold text-white text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
              boxShadow: "0 6px 20px rgba(255,107,157,0.25)",
            }}
          >
            ✨ Create Your First
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {pages.map((page) => (
        <Card key={page.id} className="!p-5">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 rounded-xl overflow-hidden border border-white/40">
              <img
                src={page.original_url}
                alt="Original photo"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="text-center py-1 text-xs font-bold text-plum-muted bg-white/30">
                Original
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-white/40">
              <img
                src={page.coloring_page_url!}
                alt="Coloring page"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="text-center py-1 text-xs font-bold text-plum-muted bg-white/30">
                Coloring Page
              </div>
            </div>
          </div>

          <RainbowDivider />

          <div className="flex items-center justify-between">
            <span className="text-xs text-plum-hint font-semibold">
              {new Date(page.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/color/${page.id}`)}
                className="px-4 py-2 rounded-full font-bold text-xs transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FBBF24, #FF6B9D)",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(251,191,36,0.2)",
                }}
              >
                🎨 Color
              </button>
              <button
                onClick={async () => {
                  const res = await fetch(page.coloring_page_url!);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `colorsplash-${page.id}.png`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-full font-bold text-xs transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
                  color: "#1E5048",
                  boxShadow: "0 4px 12px rgba(110,231,183,0.2)",
                }}
              >
                💾 Save
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
