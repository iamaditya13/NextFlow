import { IconRenderer } from "@/components/ui/IconRenderer";
import type { ReactNode } from "react";

export type GalleryGridProps = {
  variant: "grid" | "carousel";
  gridClassName?: string;
  cards?: ReactNode;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  leftArrowSrc?: string;
  rightArrowSrc?: string;
};

export const GalleryGrid = (props: GalleryGridProps) => {
  const {
    variant = "grid",
    gridClassName,
    cards,
    onMoveLeft,
    onMoveRight,
    leftArrowSrc = "/assets/icon-20.svg",
    rightArrowSrc = "/assets/icon-21.svg",
  } = props;

  return (
    <div
      className={`box-border flex ${
        variant === "grid"
          ? `gap-x-6 gap-y-6 mx-5 md:gap-x-10 md:gap-y-10 md:mx-16 ${gridClassName ?? ""}`
          : "justify-end mt-10 px-5 md:px-16"
      }`}
    >
      {variant === "grid" && cards}

      {variant === "carousel" && (
        <div className="box-border gap-x-3 flex gap-y-3">
          <button
            name="Move carousel to the left"
            className="items-center bg-neutral-200 flex h-12 justify-center text-center w-12 p-0 rounded-[3.35544e+07px]"
            onClick={onMoveLeft}
          >
            <IconRenderer
              src={leftArrowSrc}
              alt="Icon"
              className="box-border h-[17px] w-2.5"
            />
          </button>

          <button
            name="Move carousel to the right"
            className="items-center bg-neutral-200 flex h-12 justify-center text-center w-12 p-0 rounded-[3.35544e+07px]"
            onClick={onMoveRight}
          >
            <IconRenderer
              src={rightArrowSrc}
              alt="Icon"
              className="box-border h-[17px]"
            />
          </button>
        </div>
      )}
    </div>
  );
};
