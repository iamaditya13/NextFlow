import Link from "next/link";
import { ClientsMarquee } from "@/sections/ClientsSection/components/ClientsMarquee";

export const ClientsSection = () => {
  return (
    <section className="box-border mx-auto pt-24 px-5 md:pt-40 md:px-16">
      <div className="text-neutral-500 text-base font-medium box-border leading-6 mb-2 md:text-xl md:leading-7 md:mb-3">
        A tool suite for pros and beginners alike
      </div>
      <h2 className="text-2xl font-semibold box-border tracking-[-0.36px] leading-8 md:text-3xl md:tracking-[-0.45px]">
        NextFlow powers millions of creatives, enterprises, and everyday people.
      </h2>
      <ClientsMarquee />
      <div className="items-center box-border gap-x-2.5 flex justify-center gap-y-2.5 mt-12">
        <div className="box-border">
          <Link
            href="/sign-up?redirect_url=/dashboard"
            className="relative text-[13px] items-center bg-white box-border flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg"
          >
            Sign up for free
          </Link>
        </div>
        <div className="box-border">
          <a
            href="#"
            className="relative text-white text-[13px] items-center bg-neutral-800 box-border flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
};
