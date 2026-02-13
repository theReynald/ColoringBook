"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "✨ Create", key: "create" },
  { href: "/gallery", label: "🖼️ Gallery", key: "gallery" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center gap-3 mb-8 relative z-10">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.key === "create"
            ? pathname === "/"
            : pathname.startsWith(`/${item.key}`);

        return (
          <Link
            key={item.key}
            href={item.href}
            className="px-6 py-3 rounded-full font-extrabold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #FF6B9D, #C084FC)"
                : "rgba(255, 255, 255, 0.55)",
              color: isActive ? "#fff" : "#7C6A96",
              border: isActive
                ? "none"
                : "1.5px solid rgba(255, 255, 255, 0.7)",
              backdropFilter: isActive ? "none" : "blur(18px)",
              boxShadow: isActive
                ? "0 6px 20px rgba(255,107,157,0.25)"
                : "0 4px 12px rgba(192,132,252,0.08)",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
