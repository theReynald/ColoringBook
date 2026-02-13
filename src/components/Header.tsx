export default function Header() {
  return (
    <header className="text-center mb-8 relative z-10">
      <h1
        className="text-5xl font-black tracking-tight mb-2"
        style={{
          background: "linear-gradient(135deg, #FF6B9D, #C084FC, #7DD3FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "logoShimmer 6s ease-in-out infinite alternate",
        }}
      >
        ColorSplash 🎨
      </h1>
      <p className="text-plum-muted text-lg font-semibold">
        Turn your photos into magical coloring pages!
      </p>
    </header>
  );
}
