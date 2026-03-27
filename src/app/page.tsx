import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { GallerySection } from "@/sections/GallerySection";
import { ProprietaryModels } from "@/sections/ProprietaryModels";

import { UISection } from "@/sections/UISection";
import { Footer } from "@/sections/Footer";

export default function HomePage() {
  return (
    <div className="bg-black">
      <main className="relative text-black bg-white overflow-x-hidden z-10">
        <Navbar />
        <div className="relative z-10">
          <Hero />
          <div id="dark-section-end" />
          <GallerySection />
        </div>

        <UISection />
        <ProprietaryModels />
        <Footer />
      </main>
    </div>
  );
}
