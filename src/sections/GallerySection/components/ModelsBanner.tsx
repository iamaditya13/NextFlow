"use client";
import { useEffect, useRef, useState } from "react";
import { ModelLogosMarquee } from "@/sections/GallerySection/components/ModelLogosMarquee";

const rotatingLabels = [
  { word: "Generative", activeModel: "Flux" },
  { word: "Image", activeModel: "Ideogram" },
  { word: "Video", activeModel: "Veo 3.1" },
  { word: "3D", activeModel: "Luma" },
  { word: "Creative AI", activeModel: "NextFlow 1" },
];
const INTERVAL = 2800;
const SLIDE_DURATION = 460;
const WIDTH_PADDING_PX = 8;

export const ModelsBanner = () => {
  const [index, setIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [wordWidths, setWordWidths] = useState<number[]>([]);
  const measureRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const slideTimeoutRef = useRef<number | null>(null);
  const nextIndex = (index + 1) % rotatingLabels.length;

  useEffect(() => {
    const measure = () => {
      setWordWidths(
        rotatingLabels.map((_, i) => measureRefs.current[i]?.offsetWidth ?? 0),
      );
    };

    measure();
    window.addEventListener("resize", measure);

    if ("fonts" in document) {
      document.fonts.ready.then(measure).catch(() => undefined);
    }

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsSliding(true);
      slideTimeoutRef.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % rotatingLabels.length);
        setIsSliding(false);
      }, SLIDE_DURATION);
    }, INTERVAL);

    return () => {
      window.clearInterval(timer);
      if (slideTimeoutRef.current !== null) {
        window.clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

  const current = rotatingLabels[index];
  const next = rotatingLabels[nextIndex];
  const dynamicWidth = wordWidths.length
    ? (wordWidths[isSliding ? nextIndex : index] ?? 0) + WIDTH_PADDING_PX
    : undefined;

  return (
    <section className="relative box-border overflow-hidden mx-auto pt-24 px-5 md:px-16">
      <h2 className="text-4xl font-semibold box-border tracking-[-0.9px] leading-[43.2px] md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
        <span className="relative text-4xl box-border inline-block tracking-[-0.9px] leading-[43.2px] z-20 align-top md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
          The industry&apos;s best
        </span>{" "}
        <span
          className="relative inline-flex align-top overflow-hidden h-[43.2px] md:h-[86.4px] transition-[width] duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: dynamicWidth ? `${dynamicWidth}px` : undefined,
          }}
        >
          <span
            className="flex flex-col will-change-transform"
            style={{
              transform: isSliding ? "translateY(0%)" : "translateY(-100%)",
              transitionProperty: "transform",
              transitionDuration: isSliding ? `${SLIDE_DURATION}ms` : "0ms",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <span className="block whitespace-nowrap text-4xl tracking-[-0.9px] leading-[43.2px] md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
              {next.word}
            </span>
            <span className="block whitespace-nowrap text-4xl tracking-[-0.9px] leading-[43.2px] md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
              {current.word}
            </span>
          </span>
        </span>{" "}
        <span className="text-4xl box-border tracking-[-0.9px] leading-[43.2px] align-top md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
          models.
        </span>
        <br />
        <span className="relative text-4xl box-border inline-block tracking-[-0.9px] leading-[43.2px] z-20 md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]">
          In one subscription.
        </span>
      </h2>

      <div className="pointer-events-none absolute -z-10 opacity-0 whitespace-nowrap">
        {rotatingLabels.map((item, i) => (
          <span
            key={`measure-${item.word}`}
            ref={(el) => {
              measureRefs.current[i] = el;
            }}
            className="inline-block text-4xl tracking-[-0.9px] leading-[43.2px] md:text-7xl md:tracking-[-1.8px] md:leading-[86.4px]"
          >
            {item.word}
          </span>
        ))}
      </div>

      <ModelLogosMarquee activeModel={current.activeModel} />
    </section>
  );
};
