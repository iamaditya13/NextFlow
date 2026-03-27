"use client";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const FeaturesGrid = () => {
  const { ref, visible } = useScrollReveal(0.05);

  const baseAnim = `transition-all duration-[800ms] ease-out transform pointer-events-auto ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"}`;

  return (
    <section
      ref={ref}
      id="features"
      className="box-border mx-auto pt-24 px-5 md:pt-40 md:px-16"
    >
      <div className="box-border gap-x-3.5 gap-y-3.5 grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(30,minmax(80px,auto))] md:grid-cols-[repeat(24,1fr)] md:grid-rows-[repeat(17,minmax(50px,auto))]">
        {/* Industry-leading speed */}
        <div
          style={{ transitionDelay: "0ms" }}
          className={`relative text-white items-center bg-neutral-800 bg-cover box-border flex flex-col justify-center overflow-hidden rounded-3xl col-span-4 row-span-4 md:col-[span_12] md:row-[span_5] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/light-streak.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0"
          />
          <div className="absolute bg-[radial-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2))] box-border h-full w-full z-0 left-0 top-0"></div>
          <span className="relative text-3xl font-semibold box-border block leading-[30px] text-center z-10 md:text-4xl md:leading-9">
            Industry-leading
            <br className="text-3xl box-border leading-[30px] md:text-4xl md:leading-9" />
            inference speed
          </span>
        </div>

        {/* 22K */}
        <div
          style={{ transitionDelay: "100ms" }}
          className={`items-center bg-neutral-100 box-border flex flex-col justify-center rounded-3xl col-span-2 row-span-3 md:col-[span_5] md:row-[span_5] ${baseAnim}`}
        >
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-[linear-gradient(200deg,rgb(0,0,0),rgb(100,100,100))] box-border block tracking-[-1.2px] leading-[48px] md:text-7xl md:tracking-[-1.8px] md:leading-[72px]">
            22K
          </span>
          <span className="text-base font-semibold box-border block leading-4 md:text-lg md:leading-[18px]">
            Pixels upscaling
          </span>
        </div>

        {/* Train */}
        <div
          style={{ transitionDelay: "200ms" }}
          className={`items-center bg-neutral-100 box-border flex flex-col justify-center rounded-3xl col-span-2 row-span-3 md:col-[span_7] md:row-[span_5] ${baseAnim}`}
        >
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-[linear-gradient(200deg,rgb(0,0,0),rgb(100,100,100))] box-border block tracking-[-1.2px] leading-[48px] md:text-7xl md:tracking-[-1.8px] md:leading-[72px]">
            Train
          </span>
          <span className="text-base font-semibold box-border block leading-4 md:text-lg md:leading-[18px]">
            Fine-tune models with your own data
          </span>
        </div>

        {/* 4K */}
        <div
          style={{ transitionDelay: "0ms" }}
          className={`relative text-white items-center bg-neutral-300 bg-cover box-border flex flex-col justify-center overflow-hidden rounded-3xl col-span-4 row-span-3 md:col-[span_8] md:row-[span_4] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/eye-macro.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0"
          />
          <span className="relative text-5xl font-bold box-border block tracking-[-1.2px] leading-[48px] z-10 md:text-7xl md:tracking-[-1.8px] md:leading-[72px]">
            4K
          </span>
          <span className="relative text-base font-medium box-border block leading-4 text-center z-10 md:text-lg md:leading-[18px]">
            Native image generation
          </span>
        </div>

        {/* NextFlow 1 */}
        <div
          style={{ transitionDelay: "300ms" }}
          className={`relative text-white items-center bg-neutral-800 bg-cover box-border flex flex-col justify-center overflow-hidden rounded-3xl col-span-4 row-span-4 md:col-[span_8] md:row-[span_8] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/krea1-example.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0"
          />
          <div className="absolute bg-[radial-gradient(at_50%_0%,rgba(0,0,0,0),rgba(0,0,0,0.4))] box-border h-full z-0 inset-0"></div>
          <span className="relative text-6xl font-semibold box-border block tracking-[-0.9px] leading-[60px] z-10 md:text-8xl md:tracking-[-1.44px] md:leading-[96px]">
            NextFlow
          </span>
          <span className="absolute font-medium box-border block leading-4 z-10 bottom-5 md:bottom-8">
            Ultra-realistic flagship model
          </span>
        </div>

        {/* Do not train */}
        <div
          style={{ transitionDelay: "400ms" }}
          className={`items-center bg-neutral-100 box-border flex flex-col justify-center rounded-3xl col-span-2 row-span-3 md:col-[span_8] md:row-[span_4] ${baseAnim}`}
        >
          <div className="text-2xl font-semibold bg-clip-text text-transparent bg-[linear-gradient(200deg,rgb(0,0,0),rgb(100,100,100))] box-border tracking-[-0.36px] leading-6 text-center md:text-3xl md:tracking-[-0.45px] md:leading-[30px]">
            Do not train
          </div>
          <div className="text-sm font-medium box-border leading-[16.8px] text-center mt-1">
            Safely generate proprietary data
          </div>
        </div>

        {/* Minimalist UI */}
        <div
          style={{ transitionDelay: "50ms" }}
          className={`relative text-white items-center bg-black bg-cover box-border flex flex-col justify-center overflow-hidden rounded-3xl col-span-2 row-span-3 md:col-[span_8] md:row-[span_4] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/minimalistBase.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0"
          />
          <div className="relative text-3xl font-semibold box-border tracking-[-0.45px] leading-[30px] text-center z-10">
            Minimalist UI{" "}
            <div className="absolute bg-clip-text text-transparent bg-[linear-gradient(to_top,rgb(255,255,255)_0%,rgba(0,0,0,0)_80%)] box-border blur-[2px] leading-9 opacity-50 -bottom-full">
              Minimalist UI
            </div>
          </div>
        </div>

        {/* 64+ Models */}
        <div
          style={{ transitionDelay: "450ms" }}
          className={`items-center bg-neutral-100 box-border flex flex-col justify-center rounded-3xl col-span-2 row-span-3 md:col-[span_8] md:row-[span_4] ${baseAnim}`}
        >
          <div className="text-5xl font-semibold bg-clip-text text-transparent bg-[linear-gradient(200deg,rgb(0,0,0),rgb(100,100,100))] box-border leading-[48px] md:text-7xl md:leading-[72px]">
            64+
          </div>
          <div className="text-base font-semibold box-border leading-4 md:text-2xl md:leading-6">
            Models
          </div>
        </div>

        {/* Asset manager */}
        <div
          style={{ transitionDelay: "100ms" }}
          className={`relative text-white bg-neutral-100 bg-cover box-border overflow-hidden rounded-3xl p-4 md:col-[span_4] md:row-[span_4] col-span-2 row-span-3 ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/asset-manager.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0 left-0 top-0"
          />
          <div className="absolute bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.1))] box-border h-full w-full z-0 left-0 top-0"></div>
          <div className="relative text-xl font-semibold box-border leading-[25px] z-10 pt-2 px-1">
            Full-fledged asset manager
          </div>
        </div>

        {/* Bleeding Edge */}
        <div
          style={{ transitionDelay: "150ms" }}
          className={`items-center bg-neutral-100 box-border flex flex-col justify-start p-4 rounded-3xl col-span-2 row-span-3 md:col-[span_4] md:row-[span_4] ${baseAnim}`}
        >
          <div className="text-xl font-semibold box-border tracking-[-0.3px] leading-[25px] pb-2 pt-2">
            Bleeding Edge
          </div>
          <IconRenderer
            src="/assets/icon-29.svg"
            alt="Icon"
            className="box-border h-[120px] w-[120px] md:h-[130px] md:w-[130px]"
          />
          <div className="text-sm font-medium box-border leading-[17.5px] text-center mt-2 px-1">
            Access the latest models directly on release day
          </div>
        </div>

        {/* 1000+ styles */}
        <div
          style={{ transitionDelay: "300ms" }}
          className={`relative text-white bg-neutral-100 bg-cover box-border overflow-hidden bg-center p-4 rounded-3xl col-span-2 row-span-3 md:col-[span_4] md:row-[span_4] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/isometricPromptStyles.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0 left-0 top-0"
          />
          <div className="relative text-lg font-semibold box-border leading-[22.5px] z-10 md:text-2xl md:leading-[30px] p-2">
            1000+ styles
          </div>
        </div>

        {/* Image Editor */}
        <div
          style={{ transitionDelay: "400ms" }}
          className={`relative text-white items-center bg-neutral-100 bg-cover box-border flex flex-col justify-center overflow-hidden rounded-3xl col-span-2 row-span-3 md:col-[span_4] md:row-[span_4] ${baseAnim}`}
        >
          <IconRenderer
            src="/assets/image-editor.webp"
            alt=""
            className="absolute box-border h-full max-w-full object-cover w-full z-0 left-0 top-0"
          />
          <div className="absolute bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.1))] box-border h-full w-full z-0"></div>
          <span className="relative text-white text-3xl font-semibold box-border block tracking-[-0.45px] leading-9 text-center z-10 md:text-4xl md:tracking-[-0.54px] md:leading-[48px]">
            Image{" "}
            <br className="text-3xl box-border tracking-[-0.45px] leading-9 md:text-4xl md:tracking-[-0.54px] md:leading-[48px]" />
            Editor
          </span>
        </div>

        {/* Lipsync */}
        <div
          style={{ transitionDelay: "500ms" }}
          className={`bg-neutral-100 box-border flex flex-col justify-center p-5 rounded-3xl col-span-2 row-span-3 md:col-[span_4] md:row-[span_4] md:gap-y-6 ${baseAnim}`}
        >
          <div className="text-base font-semibold box-border leading-5 md:text-xl md:leading-[25px] mt-2 mb-4 px-2">
            Lipsync
          </div>
          <div className="box-border flex justify-center px-0 md:px-4 mb-4">
            <div className="relative items-center box-border gap-x-1 flex md:gap-x-2 md:h-16 md:mt-2">
              <div className="relative w-1.5 md:w-2 h-8 md:h-12 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
              <div className="relative w-1.5 md:w-2 h-10 md:h-16 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
              <div className="relative w-1.5 md:w-2 h-14 md:h-20 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
              <div className="relative w-1.5 md:w-2 h-8 md:h-12 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
              <div className="relative w-1.5 md:w-2 h-12 md:h-16 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
              <div className="relative w-1.5 md:w-2 h-9 md:h-14 flex items-center">
                <div className="w-full h-full bg-[linear-gradient(rgb(71,71,71)_0%,rgb(0,0,0)_100%)] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Realtime Canvas Container */}
        <div
          style={{ transitionDelay: "600ms" }}
          className={`box-border flex flex-col justify-between gap-y-3 col-span-4 row-span-4 md:col-[span_4] md:row-[span_4] rounded-3xl overflow-hidden bg-center ${baseAnim}`}
        >
          <div className="relative text-white bg-black bg-cover box-border h-[48%] overflow-hidden bg-center pt-4 rounded-3xl">
            <IconRenderer
              src="/assets/realtimeBase.webp"
              alt=""
              className="absolute box-border h-full max-w-full object-cover w-full z-0 left-0 top-0"
            />
            <div className="relative text-lg font-semibold box-border leading-[22px] text-center z-10 mx-auto mt-2">
              Realtime Canvas
            </div>
            <IconRenderer
              alt=""
              src="/assets/realtimeOverlay.png"
              className="absolute box-border h-full max-w-full object-cover w-full z-10 left-0 top-0"
            />
          </div>

          <div
            role="presentation"
            className="relative items-center bg-neutral-100 box-border flex flex-col h-[48%] justify-center overflow-hidden rounded-3xl"
          >
            <div className="text-lg font-semibold bg-clip-text text-transparent bg-[linear-gradient(200deg,rgb(0,0,0),rgb(100,100,100))] box-border leading-[22px] mt-4 mb-2">
              Text to 3D
            </div>
            <div className="relative box-border h-10 w-10 mt-1 mb-5 mx-auto">
              <div className="relative box-border h-full w-full z-10">
                <div className="relative box-border h-full w-full">
                  <div className="absolute bg-white box-border h-full w-full">
                    <div className="bg-black/10 box-border h-full w-full"></div>
                  </div>
                  <div className="absolute bg-white border border-gray-400 box-border h-full w-full">
                    <div className="bg-black/20 box-border h-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
