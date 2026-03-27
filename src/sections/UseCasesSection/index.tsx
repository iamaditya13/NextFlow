import { UseCasesList } from "@/sections/UseCasesSection/components/UseCasesList";
import { UseCasesVideo } from "@/sections/UseCasesSection/components/UseCasesVideo";

export const UseCasesSection = () => {
  return (
    <section className="box-border mx-auto pt-24 px-5 md:pt-40 md:px-16">
      <div className="text-neutral-500 text-base font-medium box-border leading-6 mb-2 md:text-xl md:leading-7 md:mb-3">
        Use cases
      </div>
      <h2 className="text-2xl font-semibold box-border tracking-[-0.36px] leading-8 max-w-screen-md md:text-3xl md:tracking-[-0.45px] md:leading-9">
        Generate or edit high quality images, videos, and 3D objects with AI
      </h2>
      <div className="items-end box-border gap-x-8 flex flex-col-reverse gap-y-8 w-full mt-11 md:flex-row">
        <UseCasesList />
        <UseCasesVideo />
      </div>
    </section>
  );
};
