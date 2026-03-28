"use client";

type AnimatedWordProps = {
  word: string;
  className: string;
  baseIndex?: number;
  visible?: boolean;
};

export const AnimatedWord = ({
  word,
  className,
  baseIndex = 0,
  visible = true,
}: AnimatedWordProps) => {
  return (
    <span className={`relative inline-block ${className}`}>
      {word.split("").map((character, index) => (
        <span
          key={`${word}-${index}`}
          className={`relative inline-block transition-all duration-[600ms] ease-out transform ${className} ${visible ? "opacity-100 translate-y-0 blur-[0px]" : "opacity-0 translate-y-8 blur-[10px]"}`}
          style={{ transitionDelay: `${(baseIndex + index) * 15}ms` }}
        >
          {character}
        </span>
      ))}
    </span>
  );
};
