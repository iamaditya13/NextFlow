"use client";
import React, { useEffect, useRef, useState } from "react";
import { PricingToggle } from "@/sections/PricingSection/components/PricingToggle";
import { PricingCard } from "@/sections/PricingSection/components/PricingCard";
import { EnterprisePricingGrid } from "@/sections/PricingSection/components/EnterprisePricingGrid";
import { AnimatedWord } from "@/components/AnimatedWord";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const headingLines = [
  ["Trusted", "by", "over", "30,000,000", "users"],
  ["From", "191", "countries."],
  ["We've", "got", "a", "plan", "for", "everybody..."],
];

const MAX_PLAN_UNITS = [40, 60, 80, 100] as const;

const AnimatedAmount = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const startValue = prevValueRef.current;
    if (startValue === value) return;

    const duration = 420;
    let frameId = 0;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(
        startValue + (value - startValue) * eased,
      );
      prevValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        prevValueRef.current = value;
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <>{displayValue}</>;
};

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [maxUnitsIndex, setMaxUnitsIndex] = useState(1);

  useEffect(() => {
    try {
      const storedYearly = window.localStorage.getItem("landing.pricing.isYearly");
      const storedMaxUnitsIndex = window.localStorage.getItem(
        "landing.pricing.maxUnitsIndex",
      );
      if (storedYearly === "1" || storedYearly === "0") {
        setIsYearly(storedYearly === "1");
      }
      if (storedMaxUnitsIndex !== null) {
        const parsed = Number(storedMaxUnitsIndex);
        if (Number.isFinite(parsed)) {
          setMaxUnitsIndex(
            Math.min(
              MAX_PLAN_UNITS.length - 1,
              Math.max(0, Math.round(parsed)),
            ),
          );
        }
      }
    } catch {
      // Ignore storage errors in restricted browsers.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "landing.pricing.isYearly",
        isYearly ? "1" : "0",
      );
      window.localStorage.setItem(
        "landing.pricing.maxUnitsIndex",
        String(maxUnitsIndex),
      );
    } catch {
      // Ignore storage errors in restricted browsers.
    }
  }, [isYearly, maxUnitsIndex]);

  const handleMaxUnitsIndexChange = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return;
    const maxIndex = MAX_PLAN_UNITS.length - 1;
    const clamped = Math.min(maxIndex, Math.max(0, Math.round(nextValue)));
    setMaxUnitsIndex(clamped);
  };

  const units = MAX_PLAN_UNITS[maxUnitsIndex];

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    if (!isYearly) return monthlyPrice;
    return Math.floor(monthlyPrice * 0.8);
  };

  const prices = {
    free: getPrice(0),
    basic: getPrice(9),
    pro: getPrice(35),
    max: getPrice(105),
  };
  const maxPlanPrice = Math.round((units / 60) * prices.max);

  const { ref: headingRef, visible: headingVisible } = useScrollReveal(0.2);

  const { ref: cardsRef, visible: cardsVisible } = useScrollReveal(0.1);

  return (
    <section
      className="w-full mx-auto pt-40 pb-20 px-5 md:pb-32 md:px-16"
      id="pricing"
    >
      <h2
        ref={headingRef}
        aria-label="Trusted by over 30,000,000 users From 191 countries. We've got a plan for everybody..."
        className="text-4xl font-semibold text-neutral-900 flex flex-col gap-x-6 gap-y-6 tracking-[-0.9px] leading-[37.8px] md:text-7xl md:tracking-[-1.8px] md:leading-[75.6px]"
      >
        {headingLines.map((line, lineIndex) => {
          const lineCharsBefore =
            headingLines.slice(0, lineIndex).join("").length + lineIndex * 5; // approx gaps
          return (
            <span
              key={`line-${lineIndex}`}
              className="text-4xl font-semibold text-neutral-900 block tracking-[-0.9px] leading-[37.8px] md:text-7xl md:tracking-[-1.8px] md:leading-[75.6px]"
            >
              {line.map((word, wordIndex) => {
                const wordCharsBefore =
                  line.slice(0, wordIndex).join("").length + wordIndex;
                const startIdx = lineCharsBefore + wordCharsBefore;
                return (
                  <span
                    key={`${word}-${wordIndex}`}
                    className="inline-block mr-3 md:mr-4 align-top"
                  >
                    <AnimatedWord
                      word={word}
                      className="text-4xl font-semibold text-neutral-900 tracking-[-0.9px] leading-[37.8px] md:text-7xl md:tracking-[-1.8px] md:leading-[75.6px]"
                      baseIndex={startIdx}
                      visible={headingVisible}
                    />
                  </span>
                );
              })}
            </span>
          );
        })}
      </h2>

      <div ref={cardsRef}>
        <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8 md:mt-12">
        <div
          className={`transition-all duration-[700ms] ease-out transform ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          style={{ transitionDelay: "0ms" }}
        >
          <PricingCard
            cardClassName="bg-white border-neutral-200 text-neutral-900"
            titleClassName="text-neutral-900"
            title="Free"
            descriptionClassName="text-neutral-500"
            description="Get free daily credits to try basic features."
            priceContent={
              <div className="flex items-end gap-x-1">
                <span className="text-neutral-900 text-5xl font-bold leading-none">
                  $<AnimatedAmount value={prices.free} />
                </span>
                <span className="text-neutral-500 text-sm font-medium mb-0.5">
                  /month
                </span>
              </div>
            }
            computeUnitsVariantClass="mb-5"
            computeUnitsContent="100 compute units / day"
            features={[
              "No credit card required",
              "Full access to real-time models",
              "Limited access to image, video, 3D, and lipsync models",
              "Limited access to image upscaling",
              "Limited access to LoRA training",
            ]}
            buttonText="Start for Free"
            buttonHref="/sign-up"
          />
        </div>

        <div
          className={`transition-all duration-[700ms] ease-out transform ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          style={{ transitionDelay: "120ms" }}
        >
          <PricingCard
            cardClassName="bg-white border-neutral-200 text-neutral-900"
            titleClassName="text-neutral-900"
            title="Basic"
            descriptionClassName="text-neutral-500"
            description="Access our most popular features"
            priceContent={
              <div className="flex items-end gap-x-1">
                <span className="text-neutral-900 text-5xl font-bold leading-none">
                  $<AnimatedAmount value={prices.basic} />
                </span>
                <span className="text-neutral-500 text-sm font-medium mb-0.5">
                  /month
                </span>
              </div>
            }
            computeUnitsVariantClass="mb-5"
            computeUnitsContent="5,000 compute units / month"
            everythingInLabel="Everything in Free plus:"
            everythingInIconSrc="/assets/icon-36.svg"
            features={[
              "Commercial license",
              "Full access to Image, 3D, and Lipsync models",
              "LoRA fine-tuning with up to 50 images",
              "Upscale & enhance to 4K",
              "Access to selected video models",
            ]}
            buttonText="Get Basic"
            buttonHref="/sign-up"
          />
        </div>

        <div
          className={`transition-all duration-[700ms] ease-out transform ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          style={{ transitionDelay: "240ms" }}
        >
          <PricingCard
            cardClassName="bg-white border-neutral-200 text-neutral-900"
            titleClassName="text-neutral-900"
            title="Pro"
            descriptionClassName="text-neutral-500"
            description="Advanced features and discounts on compute units"
            priceContent={
              <div className="flex items-end gap-x-1">
                <span className="text-neutral-900 text-5xl font-bold leading-none">
                  $<AnimatedAmount value={prices.pro} />
                </span>
                <span className="text-neutral-500 text-sm font-medium mb-0.5">
                  /month
                </span>
              </div>
            }
            computeUnitsVariantClass="mb-5"
            computeUnitsContent="20,000 compute units / month"
            everythingInLabel="Everything in Basic plus:"
            everythingInIconSrc="/assets/icon-36.svg"
            features={[
              "Access to all video models",
              "Workflow automation with Nodes and Apps",
              "AI-powered Nodes Agent",
              "Bulk discounts on compute unit packs",
              "Upscale & enhance to 8K",
            ]}
            buttonText="Get Pro"
            buttonHref="/sign-up"
          />
        </div>

        <div
          className={`transition-all duration-[700ms] ease-out transform ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
          style={{ transitionDelay: "360ms" }}
        >
          <PricingCard
            cardClassName="bg-white border-neutral-200 text-neutral-900"
            titleClassName="text-neutral-900"
            title="Max"
            descriptionClassName="text-neutral-500"
            description="Full access with higher discounts on compute units"
            priceContent={
              <div className="flex items-end gap-x-1">
                <span className="text-neutral-900 text-5xl font-bold leading-none">
                  $<AnimatedAmount value={maxPlanPrice} />
                </span>
                <span className="text-neutral-500 text-sm font-medium mb-0.5">
                  /month
                </span>
              </div>
            }
            computeUnitsVariantClass="mb-2"
            computeUnitsContent={`${units}k compute units / month`}
            sliderContent={
              <>
                <div className="text-xs font-semibold flex justify-between px-1 relative z-10 pointer-events-auto">
                  {MAX_PLAN_UNITS.map((unit, index) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleMaxUnitsIndexChange(index)}
                      className={`text-center p-0 transition-colors ${units === unit ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                    >
                      {unit}k
                    </button>
                  ))}
                </div>
                <div className="px-1 relative w-full mt-2 z-10 pointer-events-auto">
                  <input
                    type="range"
                    min={0}
                    max={MAX_PLAN_UNITS.length - 1}
                    step={1}
                    value={maxUnitsIndex}
                    onChange={(e) =>
                      handleMaxUnitsIndexChange(Number(e.currentTarget.value))
                    }
                    aria-label="Max plan compute units"
                    className="pricing-slider cursor-pointer accent-current relative z-10 pointer-events-auto"
                    style={
                      {
                        '--slider-fill': `${(maxUnitsIndex / (MAX_PLAN_UNITS.length - 1)) * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </>
            }
            everythingInLabel="Everything in Pro plus:"
            everythingInIconSrc="/assets/icon-37.svg"
            features={[
              "Unlimited Lora fine-tunings with 2,000 files",
              "Unlimited Concurrency",
              "Unlimited relaxed generations",
              "Upscale & enhance to 22K",
            ]}
            buttonText="Get Max"
            buttonHref="/sign-up"
          />
        </div>
      </div>

      <EnterprisePricingGrid isYearly={isYearly} />
    </section>
  );
};
