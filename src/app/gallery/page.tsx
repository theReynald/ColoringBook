import BubblesBackground from "@/components/BubblesBackground";
import DecorativeElements from "@/components/DecorativeElements";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import GalleryGrid from "@/components/GalleryGrid";
import ToastContainer from "@/components/Toast";

export default function GalleryPage() {
  return (
    <>
      <BubblesBackground />
      <DecorativeElements />
      <main className="relative z-10 max-w-[780px] mx-auto px-5 pt-8 pb-16">
        <Header />
        <Navigation />
        <h2 className="text-2xl font-extrabold text-plum text-center mb-6">
          🖼️ Your Coloring Pages
        </h2>
        <GalleryGrid />
      </main>
      <ToastContainer />
    </>
  );
}
