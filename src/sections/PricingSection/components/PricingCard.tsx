import { Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type PricingCardProps = {
  cardClassName: string;
  titleClassName: string;
  title: string;
  descriptionClassName: string;
  description: string;
  priceContent: ReactNode;
  computeUnitsVariantClass: string;
  computeUnitsContent: ReactNode;
  sliderContent?: ReactNode;
  everythingInIconSrc?: string;
  everythingInLabel?: string;
  features: string[];
  buttonHref: string;
  buttonText: string;
};

export const PricingCard = (props: PricingCardProps) => {
  return (
    <div
      className={`relative flex flex-col h-full border overflow-hidden p-6 rounded-2xl border-solid transition-all duration-200 hover:shadow-lg hover:border-neutral-300 ${props.cardClassName}`}
    >
      <div className="flex flex-col">
        <h3
          className={`text-2xl font-semibold leading-8 ${props.titleClassName}`}
        >
          {props.title}
        </h3>
        <p
          className={`text-sm leading-5 mt-2 ${props.descriptionClassName}`}
        >
          {props.description}
        </p>
        <div className="mt-4 mb-2">
          {props.priceContent}
        </div>
        <div
          className={`text-neutral-600 text-sm font-medium leading-5 ${props.computeUnitsVariantClass}`}
        >
          {props.computeUnitsContent}
        </div>
        {props.sliderContent && (
          <div className="mt-4 mb-6">
            {props.sliderContent}
          </div>
        )}
        {props.everythingInLabel && (
          <div className="text-sm font-semibold items-center gap-x-2 flex leading-5 gap-y-2 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="block">
              {props.everythingInLabel}
            </span>
          </div>
        )}
        <div className="text-neutral-700 text-[13px] gap-x-3 flex flex-col leading-5 gap-y-3">
          {props.features.map((feature, index) => (
            <div
              key={index}
              className="items-start gap-x-3 flex gap-y-3"
            >
              <Check className="text-neutral-800 shrink-0 h-4 w-4 mt-0.5 font-bold" strokeWidth={3} />
              <span className="block">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-6">
        <a
          href={props.buttonHref}
          className="relative text-[13px] font-semibold items-center bg-white flex h-10 justify-center leading-[13px] w-full overflow-hidden px-5 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          {props.buttonText}
        </a>
      </div>
    </div>
  );
};