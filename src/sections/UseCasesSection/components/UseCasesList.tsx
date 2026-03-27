"use client";
import { useState } from "react";
import Link from "next/link";

const useCases = [
  {
    title: "AI Image Generation",
    desc: "Generate images with a simple text description. Control your compositions precisely with over 1000 styles, 20 different models, native 4K, image prompts, and image style transfer through exceptionally simple interfaces. NextFlow offers the industry's fastest generation speeds at 3s for a 1024px Flux image at FP16.",
    btnText: "Try AI Image Generation",
    href: "/sign-up",
  },
  {
    title: "Image Upscaling",
    desc: "Enhance and upscale images up to a 2X resolution. Make blurry photos razor-sharp, turn simple 3D renders into photo-like architecture visualizations, restore old film scans, or add ultra-fine skin textures to your portraits. A single subscription unlocks 7 different upscaling models, including Topaz Photo and Gigapixel.",
    btnText: "Try Image Upscaling",
    href: "/sign-up",
  },
  {
    title: "Real-time rendering",
    desc: "NextFlow is the market leader in realtime image generation for creatives. Turn easy-to-control primitives into photorealistic images in less than 50ms. Or try out the revolutionary Video Realtime with full frame consistency.",
    btnText: "Try Real-time rendering",
    href: "/sign-up",
  },
  {
    title: "AI Video Generation",
    desc: "Access all of the most powerful AI video models including Veo 3, Kling, Hailuo, Wan, and Runway. Generate viral videos for social media, animate static images, or add new details to existing videos. NextFlow offers the world's most intuitive AI video generation interface.",
    btnText: "Try AI Video Generation",
    href: "/sign-up",
  },
  {
    title: "LoRA Fine-tuning",
    desc: "Train your own model. Upload just a few images of the same face, product, or visual style and teach NextFlow to generate it on demand.",
    btnText: "Try LoRA Fine-tuning",
    href: "/sign-up",
  },
  {
    title: "Video Upscaling",
    desc: "Upscale videos up to 8K and interpolate frames to 120fps. The NextFlow and Topaz Video upscalers can restore old videos, turn phone captures into professional footage, or make regular videos ultra slow-mo.",
    btnText: "Try Video Upscaling",
    href: "/sign-up",
  },
  {
    title: "Generative Editing",
    desc: "Choose from 10 editing models, including Nano Banana, Flux Kontext, and Qwen to edit images with generative AI. Add or remove objects, merge images, change expressions, or lighting in an exceptionally simple interface.",
    btnText: "Try Generative Editing",
    href: "/sign-up",
  },
];

export const UseCasesList = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="relative box-border basis-[0%] grow z-0">
      <ul className="box-border list-none max-h-none overflow-x-visible overflow-y-visible pl-0 md:max-h-[672px] md:overflow-x-auto md:overflow-y-scroll">
        {useCases.map((item, index) => {
          const isActive = index === activeTab;
          return (
            <li
              key={item.title}
              className="box-border mb-3 scroll-m-12"
            >
              <div
                role="button"
                onClick={() => setActiveTab(index)}
                className={`box-border gap-x-2.5 flex flex-col gap-y-2.5 text-left w-full p-5 rounded-[14px] transition-colors duration-300 ${
                  isActive
                    ? "text-neutral-600 bg-neutral-100"
                    : "text-neutral-400 bg-transparent hover:bg-neutral-50"
                }`}
              >
                <h3
                  className={`text-black text-2xl font-semibold box-border leading-8 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-35"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-sm font-[450] box-border leading-[19.6px]">
                  {item.desc}
                </p>
                <div
                  className={`box-border w-fit mt-3 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "max-h-12 opacity-100 pointer-events-auto"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="relative text-black text-[13px] items-center bg-white box-border flex justify-center leading-[13px] overflow-hidden px-5 py-3 rounded-lg border border-neutral-200"
                  >
                    {item.btnText}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
