import { EnterprisePricingCard } from "@/sections/PricingSection/components/EnterprisePricingCard";

export const EnterprisePricingGrid = ({ isYearly }: { isYearly?: boolean }) => {
  return (
    <div className="box-border gap-x-5 grid grid-cols-[repeat(1,minmax(0px,1fr))] gap-y-5 mt-8 md:grid-cols-3">
      <div className="box-border flex flex-col justify-center p-4 md:col-span-1 md:pr-8 md:py-8">
        <h3 className="text-neutral-900 text-3xl font-medium box-border leading-[37.5px] mb-4">
          For Teams and Enterprises
        </h3>
        <p className="text-neutral-500 box-border">
          Workplace management, collaboration, and enterprise customizations
        </p>
      </div>
      <EnterprisePricingCard
        variant="business"
        isYearly={isYearly}
        cardClassName="bg-white border-neutral-200 text-neutral-900"
        titleClassName="text-neutral-900"
        title="Business"
        descriptionClassName="text-neutral-500"
        description="Secure and collaborative workspace for growing teams"
        ctaHref="/sign-up"
        ctaText="Try Business"
        everythingPlusIconSrc="/assets/icon-37.svg"
        everythingPlusText="Everything in Max plus:"
        featureIconSrc="/assets/icon-35.svg"
        featureIconClassName="text-neutral-500 shrink-0 h-4 mt-0.5 w-4"
        featureTextClassName="text-neutral-700"
        features={[
          "Business Terms of Service",
          "Up to 50 seats included",
          "Share private Node Apps with your team",
          "Train LoRAs with up to 20,000 images",
          "Custom user roles and permissions",
          "Fine-grained controls for model access",
        ]}
        featuresSectionClassName="text-neutral-700 text-sm gap-x-3 flex basis-[0%] flex-col grow leading-5 gap-y-3"
      />
      <EnterprisePricingCard
        variant="enterprise"
        isYearly={isYearly}
        cardClassName="bg-black border-neutral-800"
        titleClassName="text-white"
        title="Enterprise"
        descriptionClassName="text-neutral-400"
        description="Enterprise-grade security with dedicated support and admin features"
        ctaHref="#"
        ctaText="Contact sales"
        everythingPlusIconSrc="/assets/icon-38.svg"
        everythingPlusText="Everything in Business plus:"
        featureIconSrc="/assets/icon-39.svg"
        featureIconClassName="text-neutral-400 shrink-0 h-4 mt-0.5"
        featureTextClassName="text-white"
        features={[
          "Custom Terms of Service",
          "Priority support with SLA",
          "Analytics API",
          "Per-member spend limits",
          "Slack connect",
          "Custom compute packages",
          "Audit logs",
        ]}
        featuresSectionClassName="text-neutral-300 text-sm flex flex-col gap-y-3 basis-[0%] grow leading-5"
      />
    </div>
  );
};
