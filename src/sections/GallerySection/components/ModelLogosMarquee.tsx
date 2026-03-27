import { IconRenderer } from "@/components/ui/IconRenderer";

const MODELS = [
  {
    name: "Veo 3.1",
    src: "/assets/icon-22.svg",
  },
  {
    name: "Ideogram",
    src: "/assets/icon-23.svg",
  },
  {
    name: "Runway",
    src: "/assets/icon-24.svg",
  },
  {
    name: "Luma",
    src: "/assets/icon-25.svg",
  },
  {
    name: "Flux",
    src: "/assets/icon-26.svg",
  },
  {
    name: "Gemini",
    src: "/assets/icon-27.svg",
  },
  {
    name: "NextFlow 1",
    src: "/assets/icon-28.svg",
  },
];

type ModelLogosMarqueeProps = {
  activeModel: string;
};

export const ModelLogosMarquee = ({ activeModel }: ModelLogosMarqueeProps) => {
  return (
    <div className="relative box-border overflow-hidden mt-12">
      <div className="relative box-border">
        <div className="box-border flex items-center gap-x-8 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-2 md:justify-center md:gap-x-14">
          {MODELS.map((model) => {
            const isActive = model.name === activeModel;
            return (
              <div
                key={model.name}
                className={`text-xl font-medium items-center box-border gap-x-2.5 flex justify-center leading-7 gap-y-2.5 md:text-2xl md:leading-8 transition-all duration-500 ease-out ${isActive ? "opacity-100 text-neutral-800 scale-100" : "opacity-55 text-neutral-500 scale-[0.98]"}`}
              >
                <IconRenderer
                  src={model.src}
                  alt="Icon"
                  className="text-xl box-border shrink-0 h-7 leading-7 w-7 md:text-2xl md:leading-8"
                />
                <span className="text-xl box-border block leading-7 md:text-2xl md:leading-8 whitespace-nowrap">
                  {model.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="absolute bg-[linear-gradient(90deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full w-12 left-0 top-0"></div>
        <div className="absolute bg-[linear-gradient(270deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full w-12 right-0 top-0"></div>
      </div>
    </div>
  );
};
