import { HeroSection } from "@/sections/Hero/components/HeroSection";

export const Hero = () => {
  return (
    <div
      data-hero-root
      className="hero-section box-border"
    >
      {/* Navbar spacer - matches the fixed navbar height */}
      <div className="relative box-border h-[69px] z-10">
        <div className="absolute bg-black box-border origin-[50%_100%] inset-0"></div>
      </div>
      <HeroSection />
    </div>
  );
};
