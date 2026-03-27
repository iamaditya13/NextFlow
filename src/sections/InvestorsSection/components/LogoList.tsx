import React from "react";

export const LogoList = () => {
  return (
    <>
      {/* 1. Andreessen Horowitz */}
      <a
        href="https://a16z.com/"
        className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0"
        aria-label="Andreessen Horowitz"
      >
        <div
          className="flex flex-col uppercase leading-[0.88] tracking-[0.02em] font-bold select-none"
          style={{ color: "#061C37" }}
        >
          <span style={{ fontSize: "11.5px" }}>Andreessen</span>
          <span style={{ fontSize: "15px" }}>Horowitz</span>
        </div>
      </a>

      {/* 2. BCV */}
      <a
        href="https://bcv.vc/"
        className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0"
        aria-label="BCV"
      >
        <span
          className="font-extrabold tracking-tighter select-none"
          style={{ fontSize: "26px", color: "#0B38C2", letterSpacing: "-1px" }}
        >
          BCV
        </span>
      </a>

      {/* 3. Gradient Ventures */}
      <a
        href="https://gradient.com/"
        className="flex min-h-[40px] items-center gap-2 transition-opacity hover:opacity-70 shrink-0"
        aria-label="Gradient Ventures"
      >
        <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 0H17L8.5 19Z" fill="#EA4335" />
          <path d="M3.5 6.5H13.5L8.5 14Z" fill="white" />
        </svg>
        <span
          className="font-bold tracking-widest select-none"
          style={{ fontSize: "13px", color: "#11191F", letterSpacing: "2px" }}
        >
          GRADIENT
        </span>
      </a>

      {/* 4. Pebblebed */}
      <a
        href="https://pebblebed.com/"
        className="flex min-h-[40px] items-center gap-1.5 transition-opacity hover:opacity-70 shrink-0"
        aria-label="Pebblebed"
      >
        <span
          className="font-bold select-none"
          style={{ fontSize: "20px", color: "#000", opacity: 0.75, letterSpacing: "-1px" }}
        >
          |:|
        </span>
        <span
          className="font-medium tracking-tight select-none"
          style={{ fontSize: "20px", color: "#000" }}
        >
          Pebblebed
        </span>
      </a>

      {/* 5. HF0 */}
      <a
        href="https://hf0.com/"
        className="flex min-h-[40px] items-center gap-2 transition-opacity hover:opacity-70 shrink-0"
        aria-label="HF0"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
          <img src="/assets/hf0.webp" alt="HF0 logo" className="object-cover w-full h-full" />
        </div>
        <span
          className="font-extrabold tracking-tighter select-none"
          style={{ fontSize: "22px", color: "#000", letterSpacing: "-0.5px" }}
        >
          HF0
        </span>
      </a>

      {/* 6. Abstract. */}
      <a
        href="https://abstractvc.com/"
        className="flex min-h-[40px] items-center transition-opacity hover:opacity-70 shrink-0"
        aria-label="Abstract"
      >
        <span
          className="select-none"
          style={{
            fontSize: "22px",
            color: "#141414",
            fontWeight: 500,
            letterSpacing: "-0.3px",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Abstract.
        </span>
      </a>
    </>
  );
};
