"use client";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { useEffect, useRef, useState } from "react";

export type GalleryCardProps = {
  mediaType: "image" | "video" | "none";
  imageSrc?: string;
  imageAlt?: string;
  iframeTitle?: string;
  iframeClassName?: string;
  iconSrc: string;
  promptLabel?: string;
  promptText: string;
  actionHref: string;
  actionText: string;
  rootClassName?: string;
};

export const GalleryCard = (props: GalleryCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="figure"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
      className={`box-border shrink-0 ${props.rootClassName ?? ""}`}
    >
      <div className="relative w-full aspect-[2/3] bg-neutral-200 bg-cover box-border flex shrink-0 overflow-hidden bg-center rounded-2xl md:w-auto md:h-[500px] md:max-h-[500px] md:aspect-auto md:rounded-[32px] group">
        {props.mediaType === "image" && props.imageSrc && (
          <IconRenderer
            src={props.imageSrc}
            alt={props.imageAlt ?? ""}
            className="absolute box-border h-full max-w-full object-cover w-full z-0 inset-0 group-hover:scale-105 transition-transform duration-700"
          />
        )}

        {props.mediaType === "video" && (
          <div className="box-border h-full w-full absolute z-0 overflow-hidden inset-0">
            <iframe
              title={props.iframeTitle ?? "Example Video"}
              className={
                props.iframeClassName ??
                "absolute box-border h-full object-cover w-full inset-0"
              }
            ></iframe>
          </div>
        )}

        <div className="relative bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0)_58%)] box-border flex flex-col h-full w-full z-20 p-5 md:p-7">
          <div className="box-border">
            <IconRenderer
              src={props.iconSrc}
              alt="Icon"
              className="box-border h-4 md:h-6"
            />
          </div>

          <div className="box-border mt-auto">
            <div className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:-translate-y-3">
              <div className="text-[oklab(0.999994_0.000455677_0.0000200868_/_0.6)] text-xs font-medium box-border tracking-[1.2px] leading-4 uppercase pb-2">
                {props.promptLabel ?? ""}
              </div>
              <p className="text-white text-base font-medium box-border tracking-[-0.24px] leading-5 md:text-3xl md:tracking-[-0.45px] md:leading-[37.5px]">
                {props.promptText}
              </p>
            </div>

            <div className="box-border overflow-hidden transition-[max-height,opacity,transform,margin-top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-h-12 opacity-100 translate-y-0 mt-3 md:max-h-0 md:opacity-0 md:translate-y-3 md:mt-0 md:pointer-events-none md:group-hover:max-h-12 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:mt-3 md:group-hover:pointer-events-auto">
              <a
                href={props.actionHref}
                className="relative text-white text-[13px] items-center bg-neutral-800 box-border flex justify-center leading-[13px] w-fit overflow-hidden px-5 py-3 rounded-lg hover:bg-neutral-700 active:scale-95 transition-colors duration-200"
              >
                {props.actionText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
