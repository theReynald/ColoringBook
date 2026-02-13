"use client";

const DOT_COLORS = ["#FF6B9D", "#C084FC", "#6EE7B7", "#FBBF24", "#7DD3FC"];

export default function Loader({ message = "Creating your coloring page..." }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "rgba(255, 240, 245, 0.82)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="flex gap-3 mb-6">
        {DOT_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full"
            style={{
              background: color,
              animation: `loaderBounce 1.4s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-plum font-bold text-lg">{message}</p>
    </div>
  );
}
