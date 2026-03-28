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

type CarouselMode = "mobile" | "desktop";

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
  const dragStateRef = useRef<{
    mode: CarouselMode;
    pointerId: number;
    startX: number;
    offsetX: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const MOBILE_CARD_WIDTH = 288;
  const MOBILE_GAP = 16;
  const MOBILE_STEP = MOBILE_CARD_WIDTH + MOBILE_GAP;
  const [desktopStep, setDesktopStep] = useState(430);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [desktopVisibleCards, setDesktopVisibleCards] = useState(1);
  const [mobileDragOffset, setMobileDragOffset] = useState(0);
  const [desktopDragOffset, setDesktopDragOffset] = useState(0);
  const [mobileDragging, setMobileDragging] = useState(false);
  const [desktopDragging, setDesktopDragging] = useState(false);
  const maxMobileIndex = Math.max(0, cards.length - 1);
  const maxDesktopIndex = Math.max(0, cards.length - desktopVisibleCards);
  const safeMobileIndex = Math.min(mobileIndex, maxMobileIndex);
  const safeDesktopIndex = Math.min(desktopIndex, maxDesktopIndex);

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

  const setDragOffsetForMode = (mode: CarouselMode, value: number) => {
    if (mode === "desktop") {
      setDesktopDragOffset(value);
      return;
    }
    setMobileDragOffset(value);
  };

  const setDraggingForMode = (mode: CarouselMode, value: boolean) => {
    if (mode === "desktop") {
      setDesktopDragging(value);
      return;
    }
    setMobileDragging(value);
  };

  const applyEdgeResistance = (mode: CarouselMode, offset: number) => {
    const index = mode === "desktop" ? safeDesktopIndex : safeMobileIndex;
    const maxIndex = mode === "desktop" ? maxDesktopIndex : maxMobileIndex;

    if ((index === 0 && offset > 0) || (index === maxIndex && offset < 0)) {
      return offset * 0.35;
    }

    return offset;
  };

  const finishDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    forceReset = false,
  ) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const step = dragState.mode === "desktop" ? desktopStep : MOBILE_STEP;
    const threshold = Math.min(72, step * 0.24);

    if (!forceReset) {
      if (dragState.offsetX <= -threshold) {
        if (dragState.mode === "desktop") {
          setDesktopIndex((prev) => Math.min(prev + 1, maxDesktopIndex));
        } else {
          setMobileIndex((prev) => Math.min(prev + 1, maxMobileIndex));
        }
      } else if (dragState.offsetX >= threshold) {
        if (dragState.mode === "desktop") {
          setDesktopIndex((prev) => Math.max(prev - 1, 0));
        } else {
          setMobileIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    }

    setDragOffsetForMode(dragState.mode, 0);
    setDraggingForMode(dragState.mode, false);
    dragStateRef.current = null;
  };

  const handlePointerDown =
    (mode: CarouselMode) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      suppressClickRef.current = false;
      dragStateRef.current = {
        mode,
        pointerId: event.pointerId,
        startX: event.clientX,
        offsetX: 0,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingForMode(mode, true);
      setDragOffsetForMode(mode, 0);
    };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const rawOffset = event.clientX - dragState.startX;
    const offset = applyEdgeResistance(dragState.mode, rawOffset);
    dragState.offsetX = offset;
    setDragOffsetForMode(dragState.mode, offset);

    if (Math.abs(rawOffset) > 6) {
      suppressClickRef.current = true;
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const moveCards = (direction: "left" | "right") => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    const delta = direction === "left" ? -1 : 1;

    if (isDesktop) {
      setDesktopIndex((prev) =>
        Math.min(Math.max(prev + delta, 0), maxDesktopIndex),
      );
      return;
    }

    setMobileIndex((prev) =>
      Math.min(Math.max(prev + delta, 0), maxMobileIndex),
    );
  };

  return (
    <div className="bg-white box-border">
      <div className="box-border max-w-screen-2xl mx-auto">
        {/* Gallery */}
        <section className="bg-white box-border overflow-hidden mx-auto pt-20 md:pt-24">
          <div className="box-border">
            <div
              ref={mobileViewportRef}
              className="md:hidden overflow-hidden px-5 cursor-grab active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
              onPointerDown={handlePointerDown("mobile")}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={(event) => finishDrag(event, true)}
              onLostPointerCapture={(event) => finishDrag(event, true)}
              onClickCapture={handleClickCapture}
            >
              <div
                ref={mobileTrackRef}
                className={`flex gap-4 select-none ${mobileDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
                style={{
                  transform: `translate3d(${-(safeMobileIndex * MOBILE_STEP) + mobileDragOffset}px, 0, 0)`,
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
              <div
                ref={desktopViewportRef}
                className="overflow-hidden px-16 cursor-grab active:cursor-grabbing"
                style={{ touchAction: "pan-y" }}
                onPointerDown={handlePointerDown("desktop")}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={(event) => finishDrag(event, true)}
                onLostPointerCapture={(event) => finishDrag(event, true)}
                onClickCapture={handleClickCapture}
              >
                <div
                  ref={desktopTrackRef}
                  className={`flex gap-10 select-none ${desktopDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
                  style={{
                    transform: `translate3d(${-(safeDesktopIndex * desktopStep) + desktopDragOffset}px, 0, 0)`,
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
