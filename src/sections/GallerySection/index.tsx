"use client";
import { useEffect, useRef, useState } from "react";
import {
  GalleryCard,
  type GalleryCardProps,
} from "@/sections/GallerySection/components/GalleryCard";
import { GalleryGrid } from "@/sections/GallerySection/components/GalleryGrid";
import { ModelsBanner } from "@/sections/GallerySection/components/ModelsBanner";
import { FeaturesGrid } from "@/sections/FeaturesGrid";
import { ClientsSection } from "@/sections/ClientsSection";
import { UseCasesSection } from "@/sections/UseCasesSection";
import { PricingSection } from "@/sections/PricingSection";

const cards: GalleryCardProps[] = [
  {
    mediaType: "image" as const,
    imageSrc: "/assets/landingPhotorealExamplePortrait.webp",
    imageAlt: "Photoreal portrait example",
    iconSrc: "/assets/icon-12.svg",
    promptLabel: "Prompt",
    promptText: '"Cinematic photo of a Women  "',
    actionHref: "/sign-up",
    actionText: "Generate image",
  },
  {
    mediaType: "image" as const,
    imageSrc: "/assets/80afb2b863333a10da2db7491ef56cab.jpg",
    imageAlt: "Animated portrait concept",
    iconSrc: "/assets/icon-17.svg",
    promptLabel: "Prompt",
    promptText: '"Portrait with animated capybara talking about NextFlow"',
    actionHref: "/sign-up",
    actionText: "Generate video",
  },
  {
    mediaType: "image" as const,
    imageSrc: "/assets/e9d66bd59ef5adefe928e5fb0298cb66.jpg",
    imageAlt: "Enhancer result",
    iconSrc: "/assets/icon-18.svg",
    promptLabel: "Prompt",
    promptText: '"Upscale image 512p -> 8K"',
    actionHref: "/sign-up",
    actionText: "Upscale image",
  },
  {
    mediaType: "image" as const,
    imageSrc: "/assets/9098912c68944c798e511f4d06b4a9b0.jpg",
    imageAlt: "Workflow automation preview",
    iconSrc: "/assets/icon-19.svg",
    promptLabel: "Prompt",
    promptText:
      '"Advertisement shot of a sandwich vertically exploding into different layers"',
    actionHref: "/sign-up",
    actionText: "Animate image",
  },
  {
    mediaType: "image" as const,
    imageSrc: "/assets/b87be2638aa0dd26622549e9ee274afc.jpg",
    imageAlt: "Dramatic portrait",
    iconSrc: "/assets/icon-12.svg",
    promptLabel: "Prompt",
    promptText:
      '"Dramatic photo of an old offroad truck racing through the desert"',
    actionHref: "/sign-up",
    actionText: "Generate image",
  },
];

export const GallerySection = () => {
  const mobileViewportRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const desktopViewportRef = useRef<HTMLDivElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const MOBILE_CARD_WIDTH = 288;
  const MOBILE_GAP = 16;
  const MOBILE_STEP = MOBILE_CARD_WIDTH + MOBILE_GAP;
  const [desktopStep, setDesktopStep] = useState(430);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [desktopVisibleCards, setDesktopVisibleCards] = useState(1);

  useEffect(() => {
    const updateSteps = () => {
      const measure = (
        viewport: HTMLDivElement | null,
        track: HTMLDivElement | null,
      ) => {
        if (!viewport || !track) return null;
        const firstCard = track.firstElementChild as HTMLElement | null;
        if (!firstCard) return null;
        const gap = Number.parseFloat(
          window.getComputedStyle(track).gap || "0",
        );
        const step = firstCard.offsetWidth + gap;
        const visible = Math.max(
          1,
          Math.floor((viewport.offsetWidth + gap) / step),
        );
        return { step, visible };
      };

      const desktopMeasure = measure(
        desktopViewportRef.current,
        desktopTrackRef.current,
      );
      if (desktopMeasure) {
        setDesktopStep(desktopMeasure.step);
        setDesktopVisibleCards(desktopMeasure.visible);
      }
    };

    updateSteps();
    window.addEventListener("resize", updateSteps);
    return () => window.removeEventListener("resize", updateSteps);
  }, []);

  useEffect(() => {
    const maxMobile = Math.max(0, cards.length - 1);
    const maxDesktop = Math.max(0, cards.length - desktopVisibleCards);
    setMobileIndex((prev) => Math.min(prev, maxMobile));
    setDesktopIndex((prev) => Math.min(prev, maxDesktop));
  }, [desktopVisibleCards]);

  const moveCards = (direction: "left" | "right") => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    const delta = direction === "left" ? -1 : 1;

    if (isDesktop) {
      const maxDesktop = Math.max(0, cards.length - desktopVisibleCards);
      setDesktopIndex((prev) =>
        Math.min(Math.max(prev + delta, 0), maxDesktop),
      );
      return;
    }

    const maxMobile = Math.max(0, cards.length - 1);
    setMobileIndex((prev) => Math.min(Math.max(prev + delta, 0), maxMobile));
  };

  return (
    <div className="bg-white box-border">
      <div className="box-border max-w-screen-2xl mx-auto">
        {/* Gallery */}
        <section className="bg-white box-border overflow-hidden mx-auto pt-20 md:pt-24">
          <div className="box-border">
            <div
              ref={mobileViewportRef}
              className="md:hidden overflow-hidden px-5"
            >
              <div
                ref={mobileTrackRef}
                className="flex gap-4 transition-transform duration-500 ease-out touch-none"
                style={{
                  transform: `translate3d(-${mobileIndex * MOBILE_STEP}px, 0, 0)`,
                }}
              >
                {cards.map((card, i) => (
                  <GalleryCard
                    key={`mobile-${card.promptText}-${i}`}
                    mediaType={card.mediaType}
                    imageSrc={card.imageSrc}
                    imageAlt={card.imageAlt}
                    iframeTitle={card.iframeTitle}
                    iframeClassName={card.iframeClassName}
                    iconSrc={card.iconSrc}
                    promptLabel={card.promptLabel}
                    promptText={card.promptText}
                    actionHref={card.actionHref}
                    actionText={card.actionText}
                    rootClassName="w-[288px]"
                  />
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <div ref={desktopViewportRef} className="overflow-hidden px-16">
                <div
                  ref={desktopTrackRef}
                  className="flex gap-10 transition-transform duration-500 ease-out touch-none"
                  style={{
                    transform: `translate3d(-${desktopIndex * desktopStep}px, 0, 0)`,
                  }}
                >
                  {cards.map((card, i) => (
                    <GalleryCard
                      key={`desktop-${card.promptText}-${i}`}
                      mediaType={card.mediaType}
                      imageSrc={card.imageSrc}
                      imageAlt={card.imageAlt}
                      iframeTitle={card.iframeTitle}
                      iframeClassName={card.iframeClassName}
                      iconSrc={card.iconSrc}
                      promptLabel={card.promptLabel}
                      promptText={card.promptText}
                      actionHref={card.actionHref}
                      actionText={card.actionText}
                      rootClassName="w-[370px] lg:w-[390px]"
                    />
                  ))}
                </div>
              </div>
            </div>

            <GalleryGrid
              variant="carousel"
              onMoveLeft={() => moveCards("left")}
              onMoveRight={() => moveCards("right")}
            />
          </div>
        </section>

        <ModelsBanner />
        <FeaturesGrid />
        <ClientsSection />
        <UseCasesSection />
        <PricingSection />
      </div>
    </div>
  );
};
