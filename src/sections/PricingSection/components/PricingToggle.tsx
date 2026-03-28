"use client";

export const PricingToggle = ({
  isYearly,
  setIsYearly,
}: {
  isYearly: boolean;
  setIsYearly: (yearly: boolean) => void;
}) => {
  return (
    <div className="flex justify-center w-full mt-12 md:mt-16">
      <div
        role="tablist"
        className="bg-neutral-100 flex h-[52px] items-center rounded-[26px] p-1.5 relative z-10 pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsYearly(false)}
          role="tab"
          aria-selected={!isYearly}
          aria-pressed={!isYearly}
          className={`h-10 w-[110px] text-sm font-semibold transition-all duration-200 cursor-pointer rounded-full ${
            !isYearly 
              ? "text-neutral-900 bg-white shadow-sm" 
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsYearly(true)}
          role="tab"
          aria-selected={isYearly}
          aria-pressed={isYearly}
          className={`h-10 w-[174px] text-sm font-semibold transition-all duration-200 cursor-pointer rounded-full ${
            isYearly 
              ? "text-neutral-900 bg-white shadow-sm" 
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Yearly
          <span className="ml-2 rounded-md bg-[#155DFC] px-1.5 py-0.5 text-xs text-white">
            -20% off
          </span>
        </button>
      </div>
    </div>
  );
};
