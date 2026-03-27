"use client";
import { useState, useEffect, useCallback } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    imageSrc: "/assets/skinTexture.png",
    label: "Photorealistic skin textures and color science",
  },
  {
    imageSrc: "/assets/krea1-example.png",
    label: "Dynamic camera angles and expressive styles",
  },
  {
    imageSrc: "/assets/eye-macro.png",
    label: "Ultra-fine detail and macro precision",
  },
];

const INTERVAL_MS = 3000;

export const ModelShowcase = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { ref, visible } = useScrollReveal(0.15);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [],
  );

  // Auto-advance every 3 seconds with smooth progress fill
  useEffect(() => {
    setProgress(0);
    // Small delay to trigger CSS transition
    const kickoff = requestAnimationFrame(() => {
      setProgress(100);
    });

    const timer = setTimeout(() => {
      next();
    }, INTERVAL_MS);

    return () => {
      cancelAnimationFrame(kickoff);
      clearTimeout(timer);
    };
  }, [current, next]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(60px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
      className="relative bg-neutral-200 box-border h-[480px] w-full overflow-hidden rounded-3xl"
    >
      {/* Image layer */}
      <div className="absolute h-full w-full z-0">
        <div className="relative h-full w-full">
          <div className="absolute h-full w-full left-0 top-0">
            <img
              alt=""
              src={slides[current].imageSrc}
              key={current}
              className="relative h-full max-w-full object-cover w-full z-0 animate-[fadeIn_0.5s_ease-out]"
            />
          </div>
          {/* Bottom gradient */}
          <div className="absolute bg-gradient-to-t from-black/50 to-transparent h-1/2 w-full z-10 bottom-0 left-0">
            <div className="absolute flex w-full z-10 p-5 left-0 bottom-0 md:p-12">
              <p className="text-white text-2xl font-semibold tracking-[-0.36px] leading-8 max-w-sm">
                {slides[current].label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay: progress bar (left) + arrows (bottom-right) */}
      <div className="absolute flex flex-col h-full w-full z-20 p-5 left-0 top-0 md:p-12">
        {/* Progress bar - vertically centered on left */}
        <div className="flex basis-[0%] flex-col grow justify-center">
          <div className="relative bg-neutral-500/50 h-24 w-1.5 overflow-hidden rounded-full">
            <div
              className="absolute bg-white w-full left-0 bottom-0 rounded-full"
              style={{
                height: `${progress}%`,
                transition: progress === 0 ? "none" : `height ${INTERVAL_MS}ms linear`,
              }}
            />
          </div>
        </div>

        {/* Arrow buttons - bottom right */}
        <div className="flex justify-end gap-x-3">
          <button
            name="Show previous slide"
            onClick={prev}
            className="items-center bg-neutral-200/80 backdrop-blur-sm flex h-12 justify-center w-12 rounded-full border-none cursor-pointer hover:bg-neutral-300 transition-colors"
          >
            <ChevronLeft size={20} className="text-neutral-700" />
          </button>
          <button
            name="Show next slide"
            onClick={next}
            className="items-center bg-neutral-200/80 backdrop-blur-sm flex h-12 justify-center w-12 rounded-full border-none cursor-pointer hover:bg-neutral-300 transition-colors"
          >
            <ChevronRight size={20} className="text-neutral-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
