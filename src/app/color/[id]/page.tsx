import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
import BubblesBackground from "@/components/BubblesBackground";
import DecorativeElements from "@/components/DecorativeElements";
import Header from "@/components/Header";
import Card from "@/components/Card";
import RainbowDivider from "@/components/RainbowDivider";
import ColoringCanvas from "@/components/ColoringCanvas";
import ToastContainer from "@/components/Toast";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ColorPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <>
        <BubblesBackground />
        <DecorativeElements />
        <main className="relative z-10 max-w-[780px] mx-auto px-5 pt-8 pb-16">
          <Header />
          <Card>
            <div className="text-center py-12">
              <p className="text-5xl mb-4">😿</p>
              <h2 className="text-2xl font-extrabold text-plum mb-2">
                Coloring page not found
              </h2>
              <p className="text-plum-muted mb-6">
                This page may have been removed or the link is incorrect.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full font-extrabold text-white text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
                  boxShadow: "0 6px 20px rgba(255,107,157,0.25)",
                }}
              >
                ✨ Go Create One
              </Link>
            </div>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <BubblesBackground />
      <DecorativeElements />
      <main className="relative z-10 max-w-[900px] mx-auto px-5 pt-8 pb-16">
        <Header />
        <Card>
          <h2 className="text-2xl font-extrabold text-plum mb-1">
            🎨 Color Your Page
          </h2>
          <RainbowDivider />
          <ColoringCanvas
            imageUrl={data.coloring_page_url}
            pageId={id}
          />
        </Card>
      </main>
      <ToastContainer />
    </>
  );
}
