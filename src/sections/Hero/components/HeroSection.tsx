"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const HERO_BACKGROUND_IMAGE = "/assets/hero-monitor.png";

export const HeroSection = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative isolate mx-auto overflow-hidden"
      style={{
        minHeight: "calc(100vh - 69px)",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 96,
        paddingBottom: 72,
        backgroundColor: "#05080d",
      }}
    >
      <Image
        src={HERO_BACKGROUND_IMAGE}
        alt=""
        aria-hidden="true"
        fill
        preload
        sizes="100vw"
        className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.28) 56%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 24%, rgba(18,54,86,0.42) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <div
        className="relative z-20 mx-auto flex flex-col items-center"
        style={{
          maxWidth: 980,
        }}
      >
        <h1
          aria-label="Krea.ai is the world's most powerful creative AI suite."
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.75s ease-out, transform 0.75s ease-out",
            fontFamily:
              '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: "clamp(36px, 6.1vw, 62px)",
            lineHeight: "1.05",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "#f5f5f5",
            textAlign: "center",
            maxWidth: 920,
            margin: 0,
            textShadow: "0 2px 20px rgba(0,0,0,0.45)",
          }}
        >
          Krea.ai is the world&apos;s most
          <br />
          powerful creative AI suite.
        </h1>

        <p
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.75s ease-out 0.12s, transform 0.75s ease-out 0.12s",
            fontFamily:
              '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: "clamp(14px, 1.3vw, 20px)",
            lineHeight: "1.45",
            fontWeight: 450,
            color: "#d4d4d4",
            textAlign: "center",
            maxWidth: 780,
            margin: 0,
            marginTop: 14,
            textShadow: "0 1px 10px rgba(0,0,0,0.45)",
          }}
        >
          Generate, enhance, and edit images, videos, or 3D meshes for free with
          AI.
        </p>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 0.75s ease-out 0.24s, transform 0.75s ease-out 0.24s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 22,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/sign-up"
            className="inline-flex h-10 items-center justify-center rounded-full px-10 text-[15px] font-medium text-black bg-white no-underline transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98]"
          >
            Start for free
          </Link>
          <Link
            href="/dashboard/node-editor"
            className="inline-flex h-10 items-center justify-center rounded-full px-10 text-[15px] font-medium text-white no-underline border border-white/20 backdrop-blur-[6px] bg-white/10 transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
          >
            Launch App
          </Link>
        </div>
      </div>
    </section>
  );
};
