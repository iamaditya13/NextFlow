"use client";
import { useEffect, useRef, useState } from "react";
import { RectangleHorizontal, Tag, ImageIcon, Sparkles, Plus } from "lucide-react";

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function RevealLine({
  text,
  visible,
  delay = 0,
}: {
  text: string;
  visible: boolean;
  delay?: number;
}) {
  return (
    <span
      className="block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {text}
    </span>
  );
}

export const UISection = () => {
  const { ref: headingRef, visible: headingVisible } = useScrollReveal(0.2);
  const { ref: bodyRef, visible: bodyVisible } = useScrollReveal(0.2);
  const { ref: cardRef, visible: cardVisible } = useScrollReveal(0.1);
  const { ref: sectionRef, visible: sectionVisible } = useScrollReveal(0.05);

  return (
    <section ref={sectionRef} className="relative bg-[#f5f5f5] z-10">
      {/* Sidebar — absolutely positioned left, vertically centered */}
      <div
        style={{
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? "translateX(0)" : "translateX(-100px)",
          transition:
            "opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s",
        }}
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-50"
      >
        <div className="bg-[#e5e5e5] p-2.5 rounded-2xl flex flex-col items-center gap-2 shadow-md">
          {/* Plus / Add button */}
          <button
            type="button"
            className="bg-white flex items-center justify-center w-12 h-12 rounded-lg border-none cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={1.33} className="text-black" />
          </button>
          {/* 8 image placeholder slots */}
          <div className="flex flex-col gap-2 mt-0.5">
            {Array.from({ length: 8 }).map((_, n) => (
              <button
                type="button"
                key={n}
                aria-label={`Slot ${n + 1}`}
                className="bg-[#a3a3a3] block shrink-0 h-12 w-12 p-0 rounded-lg border-none cursor-pointer hover:bg-neutral-400 transition-colors"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-12 py-32 md:py-48">
        {/* Heading */}
        <div className="flex flex-col justify-center mx-auto px-5 text-center max-w-4xl">
          <h2
            ref={headingRef}
            aria-label="Dead simple UI. No tutorials needed."
            className="text-black text-4xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.025em] leading-[1.05] text-center"
          >
            <RevealLine text="Dead simple UI." visible={headingVisible} delay={0} />
            <RevealLine text="No tutorials needed." visible={headingVisible} delay={0.1} />
          </h2>

          <p
            ref={bodyRef}
            style={{
              opacity: bodyVisible ? 1 : 0,
              transform: bodyVisible ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 0.7s ease-out 0.1s, transform 0.7s ease-out 0.1s",
            }}
            className="text-[#404040] text-lg md:text-[19px] font-medium leading-relaxed mt-6 max-w-2xl mx-auto"
          >
            NextFlow offers the simplest interfaces. Skip dry tutorials and get
            right into your creative flow with minimal distraction, even if you
            or your team has never worked with AI tools before.
          </p>
        </div>

        {/* Prompt Card */}
        <div
          ref={cardRef}
          style={{
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s",
          }}
          className="w-[92%] max-w-[800px] mx-auto"
        >
          <div className="bg-[#e5e5e5] p-3.5 rounded-[30px] shadow-sm flex flex-col gap-3">
            {/* Prompt text */}
            <p className="text-[#737373] text-[15px] font-normal leading-relaxed px-2 py-1 min-h-[80px]">
              Describe any visual you want to create. NextFlow will generate an
              image for free. You can write in any language.
            </p>

            {/* Bottom toolbar row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-white text-black text-[11px] font-medium px-2 py-1.5 rounded-full hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <RectangleHorizontal size={13} />
                  <span>3:4</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-white text-black text-[11px] font-medium px-2 py-1.5 rounded-full hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <Tag size={13} />
                  <span>Style</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-white text-black text-[11px] font-medium px-2 py-1.5 rounded-full hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <span>1K</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-white text-black text-[11px] font-medium px-2 py-1.5 rounded-full hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <ImageIcon size={13} />
                  <span>Image prompt</span>
                </button>
              </div>

              {/* Generate button — white per Figma */}
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 bg-white text-black text-[13.8px] font-semibold px-4 py-[13px] rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
              >
                <Sparkles size={15} />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
