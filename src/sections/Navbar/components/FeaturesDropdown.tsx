"use client";
import { useRef } from "react";
import { ImageIcon, Video, Box, Sparkles, SlidersHorizontal, BrainCircuit, HardDrive, ChevronRight } from "lucide-react";

type FeaturesDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FeatureCard = {
  title: string;
  icon: React.ElementType;
  links: string[];
};

type FeatureGroup = {
  heading: string;
  cards: FeatureCard[];
};

const featureGroups: FeatureGroup[] = [
  {
    heading: "Generate",
    cards: [
      {
        title: "AI Image Generation",
        icon: ImageIcon,
        links: ["Text to Image", "Realtime Image Generation"],
      },
      {
        title: "AI Video Generation",
        icon: Video,
        links: ["Text to Video", "Motion Transfer"],
      },
      {
        title: "AI 3D Generation",
        icon: Box,
        links: ["Text to 3D Object", "Image to 3D Object"],
      },
    ],
  },
  {
    heading: "Edit",
    cards: [
      {
        title: "AI Image Enhancements",
        icon: Sparkles,
        links: ["Upscaling", "Generative Image Editing"],
      },
      {
        title: "AI Video Enhancements",
        icon: SlidersHorizontal,
        links: [
          "Frame Interpolation",
          "Video Style Transfer",
          "Video Upscaling",
        ],
      },
    ],
  },
  {
    heading: "Customize",
    cards: [
      {
        title: "AI Finetuning",
        icon: BrainCircuit,
        links: [
          "Image LoRa Finetuning",
          "Video LoRa Finetuning",
          "LoRa Sharing",
        ],
      },
      {
        title: "File Management",
        icon: HardDrive,
        links: ["NextFlow Asset Manager"],
      },
    ],
  },
];

export const FeaturesDropdown = ({
  isOpen,
  onClose,
}: FeaturesDropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`fixed left-0 top-[69px] w-full hidden md:flex justify-center z-40 transition-opacity duration-150 pointer-events-none ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        role="menu"
        onMouseLeave={onClose}
        className="bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-neutral-200/60 rounded-2xl overflow-hidden mt-2 pointer-events-auto"
      >
        <div className="flex gap-12 p-10 mx-auto w-max">
          <div className="flex gap-10">
            {featureGroups.map((group) => (
              <div key={group.heading} className="flex flex-col min-w-[200px]">
                <p className="text-[#a1a1aa] text-sm font-medium mb-6">
                  {group.heading}
                </p>
                <div className="flex flex-col gap-10">
                  {group.cards.map((card) => {
                    const IconComp = card.icon;
                    return (
                      <div key={card.title} className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600">
                            <IconComp size={16} strokeWidth={2} />
                          </div>
                          <span className="text-[#333] text-[14px] font-[600]">
                            {card.title}
                          </span>
                        </div>

                        <ul className="flex flex-col gap-2 pl-[44px]">
                          {card.links.map((link) => (
                            <li key={link}>
                              <a
                                href="#"
                                onClick={onClose}
                                className="flex items-center justify-between text-[#737373] text-[13px] font-medium hover:text-black transition-colors"
                              >
                                <span>{link}</span>
                                <ChevronRight size={14} className="opacity-40" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block w-[280px] rounded-2xl overflow-hidden relative shadow-md">
            <img
              alt="Promo"
              src="/assets/skinTexture.png"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-6">
              <div className="flex items-center gap-2 text-white/90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="5" height="18" rx="2.5" />
                  <rect x="9" y="8" width="5" height="5" rx="2.5" />
                  <rect x="9" y="15" width="5" height="5" rx="2.5" />
                  <rect x="16" y="11" width="5" height="5" rx="2.5" />
                </svg>
                <span className="font-bold text-[15px] tracking-tight">NextFlow 1</span>
              </div>

              <div>
                <div className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-1">
                  Prompt
                </div>
                <p className="text-white text-[22px] font-medium leading-[1.2] tracking-tight mb-5">
                  &ldquo;Cinematic photo of a person in a linen jacket&rdquo;
                </p>
                <a
                  href="#"
                  onClick={onClose}
                  className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Generate Image
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
