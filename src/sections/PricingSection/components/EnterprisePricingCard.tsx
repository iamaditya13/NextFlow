"use client";
import { Check, Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export type EnterprisePricingCardProps = {
  isYearly?: boolean;
  variant: "business" | "enterprise";
  cardClassName: string;
  titleClassName: string;
  title: string;
  descriptionClassName: string;
  description: string;
  ctaHref: string;
  ctaText: string;
  everythingPlusIconSrc: string;
  everythingPlusText: string;
  featureIconSrc: string;
  featureIconClassName: string;
  featureTextClassName: string;
  features: string[];
  featuresSectionClassName: string;
};

const BUSINESS_PRICES = [50, 100, 200, 400, 600, 1000, 1250, 1875, 2500, 3750];
const BUSINESS_UNITS = [
  "20,000",
  "40,000",
  "80,000",
  "160,000",
  "240,000",
  "400,000",
  "500,000",
  "750,000",
  "1,000,000",
  "1,500,000",
];
const SCALE_LABELS = [
  { label: "20k", show: true },
  { label: "40k", show: false },
  { label: "80k", show: true },
  { label: "160k", show: false },
  { label: "240k", show: false },
  { label: "400k", show: true },
  { label: "500k", show: false },
  { label: "750k", show: false },
  { label: "1M", show: false },
  { label: "1.5M", show: true },
];

const AnimatedAmount = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const startValue = prevValueRef.current;
    if (startValue === value) return;

    const duration = 380;
    let frameId = 0;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (value - startValue) * eased);
      prevValueRef.current = nextValue;
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

const BUSINESS_MAX_INDEX = BUSINESS_PRICES.length - 1;

export const EnterprisePricingCard = (props: EnterprisePricingCardProps) => {
  const {
    variant,
    cardClassName,
    titleClassName,
    title,
    descriptionClassName,
    description,
    ctaHref,
    ctaText,
    everythingPlusText,
    featureIconClassName,
    featureTextClassName,
    features,
    featuresSectionClassName,
  } = props;

  const [sliderIndex, setSliderIndex] = useState(2); // Default to 80k
  const currentBusinessPrice = props.isYearly
    ? Math.floor(BUSINESS_PRICES[sliderIndex] * 0.8)
    : BUSINESS_PRICES[sliderIndex];

  const handleBusinessSlider = (rawValue: number | string) => {
    const parsed =
      typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(BUSINESS_MAX_INDEX, Math.max(0, Math.round(parsed)));
    setSliderIndex(clamped);
  };

  return (
    <div
      className={`relative box-border flex flex-col min-h-[480px] border overflow-hidden p-6 rounded-2xl border-solid md:col-span-1 animate-fade-in-up ${cardClassName}`}
    >
      <h3
        className={`text-2xl font-semibold box-border leading-8 ${titleClassName}`}
      >
        {title}
      </h3>
      <p
        className={`text-sm box-border leading-5 mt-2 ${descriptionClassName}`}
      >
        {description}
      </p>

      {variant === "business" && (
        <>
          <div className="box-border mt-4 mb-2">
            <div className="flex items-end gap-x-1">
              <span className="text-neutral-900 text-5xl font-bold leading-none">
                $<AnimatedAmount value={currentBusinessPrice} />
              </span>
              <span className="text-neutral-500 text-sm font-medium mb-0.5">
                /month
              </span>
            </div>
            <div className="text-neutral-700 text-sm font-medium mt-1">
              <span>{BUSINESS_UNITS[sliderIndex]} compute units / month</span>
            </div>
          </div>

          <div className="box-border mt-4 mb-6">
            <div className="box-border flex text-xs font-semibold items-center justify-between leading-4 px-1">
              {SCALE_LABELS.map((mark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSliderIndex(idx)}
                  className={`bg-transparent block text-center p-0 transition-colors cursor-pointer ${
                    mark.show
                      ? idx === sliderIndex
                        ? "text-neutral-900"
                        : "text-neutral-400"
                      : "text-transparent pointer-events-none"
                  }`}
                >
                  {mark.label}
                </button>
              ))}
            </div>
            <div className="mt-2 px-1 relative w-full pt-2 pb-2 z-10 pointer-events-auto">
              <input
                type="range"
                min={0}
                max={BUSINESS_MAX_INDEX}
                step={1}
                value={sliderIndex}
                onChange={(e) =>
                  handleBusinessSlider(Number(e.currentTarget.value))
                }
                aria-label="Business plan compute units"
                className="pricing-slider cursor-pointer accent-current relative z-10 pointer-events-auto"
                style={
                  {
                    '--slider-fill': `${(sliderIndex / BUSINESS_MAX_INDEX) * 100}%`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="text-sm font-semibold items-center gap-x-2 flex leading-5 gap-y-2 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="block">
              {everythingPlusText}
            </span>
          </div>
        </>
      )}

      {variant === "enterprise" && (
        <>
          <div className="box-border mt-4 mb-6">
            <div className="box-border items-baseline gap-x-2 flex gap-y-2">
              <span className="text-white text-4xl font-semibold box-border block leading-10">
                Custom
              </span>
            </div>
          </div>

          <div className="text-sm text-white font-semibold items-center gap-x-2 flex gap-y-2 mt-4 mb-2">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="block">
              {everythingPlusText}
            </span>
          </div>
        </>
      )}

      <div
        className={`gap-y-3 flex flex-col pt-4 ${featuresSectionClassName}`}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="items-start gap-x-3 flex gap-y-3"
          >
            <Check className={`${featureIconClassName} font-bold`} strokeWidth={3} />
            <span className={featureTextClassName}>{feature}</span>
          </div>
        ))}
      </div>

      <div className="box-border mt-auto pt-6">
        <a
          href={ctaHref}
          className="relative text-[13px] font-semibold items-center bg-white box-border flex h-10 justify-center leading-[13px] w-full overflow-hidden px-5 py-3 rounded-lg"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
};
