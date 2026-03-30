"use client";

import Link from "next/link";
import { ModelShowcase } from "@/sections/ProprietaryModels/components/ModelShowcase";
import { AnimatedWord } from "@/components/AnimatedWord";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TITLE = "Krea 1 - Our ultra-realistic image model";
const titleWords = TITLE.split(" ");
const titleWordClassName =
  "text-3xl font-semibold tracking-[-0.45px] leading-9 md:text-5xl md:tracking-[-0.72px] md:leading-[48px]";

function InvestorLogos() {
  return (
    <>
      {/* Andreessen Horowitz */}
      <a href="https://a16z.com/" className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0" aria-label="Andreessen Horowitz">
        <div className="flex flex-col uppercase leading-[0.88] tracking-[0.02em] font-bold" style={{ color: "#061C37" }}>
          <span style={{ fontSize: "11.5px" }}>Andreessen</span>
          <span style={{ fontSize: "15px" }}>Horowitz</span>
        </div>
      </a>
      {/* BCV */}
      <a href="https://bcv.vc/" className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0" aria-label="BCV">
        <span className="font-extrabold tracking-tighter" style={{ fontSize: "26px", color: "#0B38C2", letterSpacing: "-1px" }}>BCV</span>
      </a>
      {/* Gradient Ventures */}
      <a href="https://gradient.com/" className="flex min-h-[40px] items-center gap-2 transition-opacity hover:opacity-70 shrink-0" aria-label="Gradient Ventures">
        <svg width="17" height="19" viewBox="0 0 17 19" fill="none" aria-hidden="true">
          <path d="M0 0H17L8.5 19Z" fill="#EA4335" />
          <path d="M3.5 6.5H13.5L8.5 14Z" fill="white" />
        </svg>
        <span className="font-bold" style={{ fontSize: "13px", color: "#11191F", letterSpacing: "2px" }}>GRADIENT</span>
      </a>
      {/* Pebblebed */}
      <a href="https://pebblebed.com/" className="flex min-h-[40px] items-center gap-1.5 transition-opacity hover:opacity-70 shrink-0" aria-label="Pebblebed">
        <span className="font-bold" style={{ fontSize: "20px", color: "#000", opacity: 0.75, letterSpacing: "-1px" }}>|:|</span>
        <span className="font-medium tracking-tight" style={{ fontSize: "20px", color: "#000" }}>Pebblebed</span>
      </a>
      {/* HF0 */}
      <a href="https://hf0.com/" className="flex min-h-[40px] items-center gap-2 transition-opacity hover:opacity-70 shrink-0" aria-label="HF0">
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
          <img src="/assets/hf0.webp" alt="HF0 logo" className="object-cover w-full h-full" />
        </div>
        <span className="font-extrabold tracking-tighter" style={{ fontSize: "22px", color: "#000", letterSpacing: "-0.5px" }}>HF0</span>
      </a>
      {/* Abstract. */}
      <a href="https://abstractvc.com/" className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0" aria-label="Abstract">
        <span style={{ fontSize: "22px", color: "#141414", fontWeight: 500, letterSpacing: "-0.3px", fontFamily: "Georgia, 'Times New Roman', serif" }}>Abstract.</span>
      </a>
    </>
  );
}

export const ProprietaryModels = () => {
  const { ref: headingRef, visible: headingVisible } = useScrollReveal(0.2);

  return (
    <div className="relative max-w-screen-2xl z-10 mx-auto">
      <section className="flex flex-col gap-y-12 mx-auto px-5 md:gap-y-16 md:px-16">
        <div className="flex flex-col gap-y-8 w-full pt-24 md:flex-row md:items-end md:gap-x-10 md:gap-y-10 md:pt-40">
          <div className="opacity-100">
            <div className="text-neutral-500 text-base font-medium leading-6 mb-2 md:text-xl md:leading-7 md:mb-3">
              Powerful proprietary models
            </div>
            <h2
              ref={headingRef}
              aria-label={TITLE}
              className={titleWordClassName}
            >
              {titleWords.map((word, wordIndex) => {
                const wordCharsBefore =
                  titleWords.slice(0, wordIndex).join("").length + wordIndex;
                return (
                  <span
                    key={`${word}-${wordIndex}`}
                    className="inline-block mr-2 md:mr-3 align-top"
                  >
                    <AnimatedWord
                      word={word}
                      className={titleWordClassName}
                      baseIndex={wordCharsBefore}
                      visible={headingVisible}
                    />
                  </span>
                );
              })}
            </h2>
          </div>
          <p className="text-neutral-500 font-medium leading-7 max-w-2xl opacity-100 text-start md:text-end" style={{ fontSize: "19.2px" }}>
            Krea 1 is our proprietary image model. Unlike traditional
            models, it offers accurate skin textures, dynamic camera angles, and
            expressive styles. Discover an exceptionally artistic latent space.
          </p>
        </div>
        <ModelShowcase />
      </section>

      <section className="mx-auto px-5 py-24 md:px-16 md:py-40">
        <div className="text-neutral-500 text-base font-medium leading-6 mb-2 md:text-xl md:leading-7 md:mb-3">
          Our Investors
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.36px] leading-8 max-w-4xl md:text-3xl md:tracking-[-0.45px] md:leading-9">
          We are backed by world-class venture firms. And we are hiring.
        </h2>

        <div className="mt-16 md:mt-24">
          {/* Desktop: spread evenly */}
          <div className="hidden justify-between items-center w-full md:flex">
            <InvestorLogos />
          </div>
          {/* Mobile: marquee */}
          <div className="block overflow-hidden md:hidden">
            <div className="relative">
              <div className="flex gap-x-12 w-full overflow-hidden p-2">
                <div className="flex shrink-0 items-center gap-x-12 animate-[marquee_20s_linear_infinite]">
                  <InvestorLogos />
                </div>
                <div className="flex shrink-0 items-center gap-x-12 animate-[marquee_20s_linear_infinite]">
                  <InvestorLogos />
                </div>
              </div>
              <div className="absolute h-full w-12 left-0 top-0 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute h-full w-12 right-0 top-0 bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2.5 mt-16 md:mt-20">
          <Link
            href="/sign-up?redirect_url=/dashboard"
            className="relative text-[13px] items-center bg-white flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            Sign up for free
          </Link>
          <a
            href="#"
            className="relative text-white text-[13px] items-center bg-neutral-800 flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Browse job listings
          </a>
        </div>
      </section>
    </div>
  );
};
