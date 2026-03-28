"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NavbarLogo } from "@/sections/Navbar/components/NavbarLogo";
import { DesktopNav } from "@/sections/Navbar/components/DesktopNav";
import { NavbarActions } from "@/sections/Navbar/components/NavbarActions";
import { FeaturesDropdown } from "@/sections/Navbar/components/FeaturesDropdown";

const LIGHT_THEME_SWITCH_OFFSET_PX = 120;

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  // "dark" = over black hero, "light" = over white sections
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const onScroll = () => {
      const sentinel = document.getElementById("dark-section-end");
      if (!sentinel) return;
      setTheme(
        sentinel.getBoundingClientRect().top <= LIGHT_THEME_SWITCH_OFFSET_PX
          ? "light"
          : "dark",
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = theme === "dark";
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <header
          className={`relative box-border caret-transparent outline-[oklab(0.556_0_0_/_0.5)] w-full mx-auto px-4 py-4 border-b border-solid sm:px-5 md:px-8 lg:px-10 xl:px-16 transition-all duration-500 ${isDark ? "text-white border-white/15" : "text-neutral-900 border-black/10"}`}
        >
          <div className="items-center box-border caret-transparent grid grid-cols-[repeat(2,minmax(0px,1fr))] outline-[oklab(0.556_0_0_/_0.5)] w-full xl:grid-cols-[repeat(3,minmax(0px,1fr))]">
            <NavbarLogo isDark={isDark} />
            <DesktopNav
              featuresOpen={featuresOpen}
              setFeaturesOpen={setFeaturesOpen}
              isDark={isDark}
            />
            <NavbarActions
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              isDark={isDark}
            />
          </div>
          <FeaturesDropdown
            isOpen={featuresOpen}
            onClose={() => setFeaturesOpen(false)}
          />
          {/* Backdrop - switches between dark and light blur */}
          <div
            className={`absolute backdrop-blur-xl box-border caret-transparent h-full outline-[oklab(0.556_0_0_/_0.5)] w-full z-[-1] left-0 top-0 transition-all duration-500 ${isDark ? "bg-black/80" : "bg-white/85"}`}
          />
        </header>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMobile}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-black/95 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-out border-l border-white/10 flex flex-col pt-20 pb-8 px-6 xl:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <nav className="flex flex-col gap-1">
          {[
            { label: "App", href: "/dashboard/node-editor" },
            { label: "Image Generation", href: "/sign-up" },
            { label: "Video Generation", href: "/sign-up" },
            { label: "Upscale & Enhance", href: "/sign-up" },
            { label: "Mini Apps", href: "/sign-up" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeMobile}
              className="text-white/80 hover:text-white text-[15px] tracking-[0.15px] py-3 border-b border-white/10 transition-colors hover:pl-1 transition-all duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/sign-up"
            className="flex items-center justify-center text-black text-sm font-medium bg-white rounded-full h-10 px-4 hover:bg-white/90 transition-colors"
          >
            Sign up for free
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center text-white text-sm font-medium bg-[#262626] rounded-full h-10 px-4 hover:bg-neutral-700 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
};
