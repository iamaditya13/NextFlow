import Link from "next/link";
import { DesktopInvestors } from "@/sections/InvestorsSection/components/DesktopInvestors";
import { MobileInvestorsMarquee } from "@/sections/InvestorsSection/components/MobileInvestorsMarquee";

export const InvestorsSection = () => {
  return (
    <section className="box-border mx-auto px-5 py-24 md:px-16 md:py-40">
      <div className="text-neutral-500 text-base font-medium box-border leading-6 mb-2 md:text-xl md:leading-7 md:mb-3">
        Our Investors
      </div>
      <h2 className="text-2xl font-semibold box-border tracking-[-0.36px] leading-8 max-w-4xl md:text-3xl md:tracking-[-0.45px] md:leading-9">
        We are backed by world-class venture firms. And we are hiring.
      </h2>
      <div className="box-border mt-16 md:mt-24">
        <DesktopInvestors />
        <MobileInvestorsMarquee />
      </div>
      <div className="items-center box-border gap-x-2.5 flex justify-center gap-y-2.5 mt-16 md:mt-20">
        <Link
          href="/sign-up?redirect_url=/dashboard"
          className="relative text-[13px] items-center bg-white box-border flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg"
        >
          Sign up for free
        </Link>
        <a
          href="#"
          className="relative text-white text-[13px] items-center bg-neutral-800 box-border flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg"
        >
          Browse job listings
        </a>
      </div>
    </section>
  );
};
