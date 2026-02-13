"use client";

const DECORATIONS = [
  // Stars
  { type: "star", color: "#FBBF24", top: "8%", left: "5%", size: 18, delay: 0 },
  { type: "star", color: "#FF6B9D", top: "15%", right: "8%", size: 16, delay: 1.2 },
  { type: "star", color: "#7DD3FC", bottom: "20%", left: "3%", size: 14, delay: 0.5 },
  { type: "star", color: "#FBBF24", bottom: "12%", right: "5%", size: 20, delay: 1.8 },
  // Hearts
  { type: "heart", color: "#FF6B9D", top: "35%", left: "2%", size: 16, delay: 0.8 },
  { type: "heart", color: "#C084FC", top: "55%", right: "3%", size: 14, delay: 2.0 },
  { type: "heart", color: "#FF6B9D", bottom: "35%", right: "6%", size: 18, delay: 0.3 },
  // Circles
  { type: "circle", color: "#6EE7B7", top: "25%", right: "4%", size: 12, delay: 1.5 },
  { type: "circle", color: "#7DD3FC", top: "70%", left: "6%", size: 14, delay: 0.7 },
  { type: "circle", color: "#6EE7B7", bottom: "8%", left: "10%", size: 10, delay: 2.2 },
];

const starClip =
  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";
const heartClip =
  "polygon(50% 100%,0% 35%,15% 0%,50% 20%,85% 0%,100% 35%)";

export default function DecorativeElements() {
  return (
    <>
      {DECORATIONS.map((d, i) => {
        const clipPath =
          d.type === "star" ? starClip : d.type === "heart" ? heartClip : undefined;

        return (
          <div
            key={i}
            className="fixed pointer-events-none"
            aria-hidden="true"
            style={{
              top: d.top,
              left: d.left,
              right: d.right,
              bottom: d.bottom,
              width: d.size,
              height: d.size,
              background: d.color,
              borderRadius: d.type === "circle" ? "50%" : undefined,
              clipPath,
              opacity: 0.35,
              animation: `twinkle ${d.type === "heart" ? 4 : d.type === "circle" ? 2.5 : 3}s ${d.delay}s ease-in-out infinite alternate`,
              zIndex: 0,
            }}
          />
        );
      })}
    </>
  );
}
