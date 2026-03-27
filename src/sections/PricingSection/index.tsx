"use client";
import { useEffect, useRef, useState } from "react";
import { PricingToggle } from "@/sections/PricingSection/components/PricingToggle";
import { PricingCard } from "@/sections/PricingSection/components/PricingCard";
import { EnterprisePricingGrid } from "@/sections/PricingSection/components/EnterprisePricingGrid";

const headingLines = [
  ["Trusted", "by", "over", "30,000,000", "users"],
  ["From", "191", "countries."],
  ["We've", "got", "a", "plan", "for", "everybody..."],
];

import { useScrollReveal } from "@/hooks/useScrollReveal";

const AnimatedAmount = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

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
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        prevValueRef.current = value;
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <>{displayValue}</>;
};

const AnimatedWord = ({
  word,
  baseIndex = 0,
  visible = true,
}: {
  word: string;
  baseIndex?: number;
  visible?: boolean;
}) => {
  return (
    <div className="relative text-4xl font-semibold text-neutral-900 inline-block tracking-[-0.9px] leading-[37.8px] md:text-7xl md:tracking-[-1.8px] md:leading-[75.6px]">
      {word.split("").map((character, index) => (
        <div
          key={`${word}-${index}`}
          className={`relative text-4xl font-semibold text-neutral-900 inline-block tracking-[-0.9px] leading-[37.8px] md:text-7xl md:tracking-[-1.8px] md:leading-[75.6px] transition-all duration-[600ms] ease-out transform ${visible ? "opacity-100 translate-y-0 blur-[0px]" : "opacity-0 translate-y-8 blur-[10px]"}`}
          style={{ transitionDelay: `${(baseIndex + index) * 15}ms` }}
        >
          {character}
        </div>
      ))}
    </div>
  );
};

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [units, setUnits] = useState(60);

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
                <div className="text-xs font-semibold flex justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setUnits(40)}
                    className={`text-center p-0 transition-colors ${units === 40 ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    40k
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits(60)}
                    className={`text-center p-0 transition-colors ${units === 60 ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    60k
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits(80)}
                    className={`text-center p-0 transition-colors ${units === 80 ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    80k
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits(100)}
                    className={`text-center p-0 transition-colors ${units === 100 ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    100k
                  </button>
                </div>
                <div className="px-1 relative w-full mt-2">
                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={5}
                    value={units}
                    onInput={(e) => setUnits(Number(e.currentTarget.value))}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    aria-label="Max plan compute units"
                    className="pricing-slider cursor-pointer accent-current"
                    style={{
                      background: `linear-gradient(to right, #171717 0%, #171717 ${((units - 40) / 60) * 100}%, #e5e7eb ${((units - 40) / 60) * 100}%, #e5e7eb 100%)`,
                    }}
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
