"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Link2,
  Monitor,
  MoreHorizontal,
  Star,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

/* ─────────────────────── Types ─────────────────────── */

type ModelCard = {
  title: string;
  description: string;
  image: string;
  badges: { label: string; color: string }[];
  speed: string;
  quality: string;
  credits: string;
};

type QuickAction = {
  title: string;
  image: string;
  href: string;
};

type NodeApp = {
  title: string;
  description: string;
  image: string;
};

type NewsItem = {
  title: string;
  description: string;
  date: string;
  image: string;
};

type ActionCard = {
  title: string;
  description: string;
  image: string;
};

type FooterColumn = {
  title: string;
  links: string[];
};

/* ─────────────────────── Data ─────────────────────── */

const heroSlides = [
  {
    image:
      "https://www.figma.com/api/mcp/asset/5f8e03bc-1713-4ec9-816b-b466de85a906",
    gradient:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #5c1a1a 0%, #2a0a0a 40%, #0a0a0a 80%)",
    title: "Start by generating a free image",
    buttons: [
      { label: "Generate Image →", href: "/image", primary: true },
      { label: "Generate Video →", href: "/video", primary: false },
    ],
  },
  {
    image:
      "https://www.figma.com/api/mcp/asset/d01c89cb-749f-4d58-9fc0-454a9e32254a",
    gradient:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #1a3a5c 0%, #0a1a30 40%, #0a0a0a 80%)",
    title: "Annotations in Krea Edit",
    buttons: [
      { label: "Try Annotations →", href: "/dashboard/edit", primary: true },
      { label: "Read more →", href: "#", primary: false },
    ],
  },
  {
    image:
      "https://www.figma.com/api/mcp/asset/ce16fff6-4171-4b17-a051-f15473ec87c0",
    gradient:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #2e1a5c 0%, #150a30 40%, #0a0a0a 80%)",
    title: "The Node Agent",
    buttons: [
      { label: "Try the Node Agent →", href: "/nodes", primary: true },
      { label: "Read more →", href: "#", primary: false },
    ],
  },
  {
    image:
      "https://www.figma.com/api/mcp/asset/834ecef0-4d25-4585-a8bd-7008183e6906",
    gradient:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #1a3a2a 0%, #0a1a10 40%, #0a0a0a 80%)",
    title: "A New, More Powerful Krea Edit",
    buttons: [
      { label: "Try Krea Edit →", href: "/dashboard/edit", primary: true },
      { label: "Read more →", href: "#", primary: false },
    ],
  },
  {
    image:
      "https://www.figma.com/api/mcp/asset/a7669516-68f8-4ff9-b0d7-46e08dbf6a16",
    gradient:
      "radial-gradient(ellipse 80% 70% at 50% 50%, #12122e 0%, #080818 40%, #050505 80%)",
    title: "Announcing the Krea Node Agent",
    buttons: [
      { label: "Upgrade to Pro →", href: "/dashboard/pricing", primary: true },
      { label: "Read announcement →", href: "#", primary: false },
    ],
  },
];

const quickActions: QuickAction[] = [
  {
    title: "Generate Image",
    image: "/assets/c879c585174b87b2d8ab43884e8f69bb.jpg",
    href: "/image",
  },
  {
    title: "Generate Video",
    image: "/assets/80afb2b863333a10da2db7491ef56cab.jpg",
    href: "/video",
  },
  {
    title: "Upscale & Enhance",
    image: "/assets/eye-macro.webp",
    href: "/dashboard/enhancer",
  },
  { title: "Realtime", image: "/assets/realtimeBase.webp", href: "/realtime" },
];

const imageModels: ModelCard[] = [
  {
    title: "Nano Banana Pro",
    description:
      "Smartest model for image editing and complex prompt adherence.",
    image: "/assets/09e40a3f556058ae2f57ba22bce36f12.jpg",
    badges: [{ label: "Featured", color: "#e8ffcc" }],
    speed: "~30s",
    quality: "Highest",
    credits: "~100",
  },
  {
    title: "Nano Banana 2",
    description: "Google's latest flash model optimized for prompt fidelity.",
    image: "/assets/9098912c68944c798e511f4d06b4a9b0.jpg",
    badges: [
      { label: "Featured", color: "#e8ffcc" },
      { label: "New", color: "#f5ff38" },
    ],
    speed: "~15s",
    quality: "Highest",
    credits: "~50",
  },
  {
    title: "Flux 2",
    description: "FLUX.2 [dev] — crisper text generation and cleaner details.",
    image: "/assets/d25a8fdbfae20e1bfd0b428f0a16f64e.jpg",
    badges: [
      { label: "Free", color: "#d1fae5" },
      { label: "New", color: "#f5ff38" },
    ],
    speed: "~10s",
    quality: "Medium",
    credits: "20",
  },
  {
    title: "Z Image",
    description: "Cheapest model for rapid prototyping and iteration.",
    image: "/assets/krea1-example.webp",
    badges: [{ label: "Free", color: "#d1fae5" }],
    speed: "~5s",
    quality: "Lower",
    credits: "free",
  },
];

const videoModels: ModelCard[] = [
  {
    title: "Kling 2.6",
    description: "Frontier model from Kling with native audio support.",
    image: "/assets/80afb2b863333a10da2db7491ef56cab.jpg",
    badges: [{ label: "Featured", color: "#e8ffcc" }],
    speed: "~5 min",
    quality: "Highest",
    credits: "~300",
  },
  {
    title: "Runway Gen-4.5",
    description: "Latest frontier model from Runway with higher fidelity.",
    image: "/assets/e9d66bd59ef5adefe928e5fb0298cb66.jpg",
    badges: [{ label: "New", color: "#f5ff38" }],
    speed: "~5 min",
    quality: "Highest",
    credits: "~500",
  },
  {
    title: "Grok Imagine",
    description: "Fast, high-quality video generation with style control.",
    image: "/assets/9098912c68944c798e511f4d06b4a9b0.jpg",
    badges: [{ label: "New", color: "#f5ff38" }],
    speed: "~2 min",
    quality: "Medium",
    credits: "~250",
  },
];

const nodeApps: NodeApp[] = [
  {
    title: "CCTV Selfies",
    description:
      "Put your face and outfit into a convincing collection of CCTV footage.",
    image: "/assets/asset-manager.webp",
  },
  {
    title: "Animorph yourself",
    description: "How would you look like morphing into a raccoon or a fox?",
    image: "/assets/krea1-example.webp",
  },
  {
    title: "Digicam Snapshots",
    description:
      "Show your best outfits on a 2000s digicam. Perfect throwback.",
    image: "/assets/isometricPromptStyles.webp",
  },
  {
    title: "Truck Ad",
    description:
      "Place your product on a virtual truck. Get a viral ad in seconds.",
    image: "/assets/realtimeBase.webp",
  },
];

const releaseNotes: NewsItem[] = [
  {
    title: "A New, More Powerful Krea Edit",
    description:
      "Change specific regions, render new perspectives, adjust lighting and color palettes with fine-grained controls.",
    date: "Mar 9, 2026",
    image: "/assets/b87be2638aa0dd26622549e9ee274afc.jpg",
  },
  {
    title: "Turn Any Image Into a Prompt",
    description:
      "Drop any image into Krea and get a detailed generation-ready prompt in seconds.",
    date: "Mar 5, 2026",
    image: "/assets/Mountainhouse.jpg",
  },
  {
    title: "Introducing the Redesigned Krea App",
    description:
      "Krea's biggest interface redesign to date with unified navigation and rebuilt mobile UX.",
    date: "Mar 2, 2026",
    image: "/assets/skinTexture.webp",
  },
  {
    title: "Introducing Voice Mode",
    description:
      "Speak as you draw and get changes in real-time using voice actions.",
    date: "Mar 2, 2026",
    image: "/assets/download.png",
  },
];

const instantActions: ActionCard[] = [
  {
    title: "AI Image Generator – Wan 2.2",
    description: "Generate stunning images with the latest Wan 2.2 model.",
    image: "/assets/landingEnhancerExampleSwirlBloomCentered.webp",
  },
  {
    title: "AI Image Generator – Qwen",
    description: "Powerful image generation using Qwen AI technology.",
    image: "/assets/landingPhotorealExamplePortrait.webp",
  },
  {
    title: "AI Hairstyle",
    description: "Try new hairstyles with AI for free.",
    image: "/assets/image-editor.webp",
  },
];

const footerColumns: FooterColumn[] = [
  {
    title: "Krea",
    links: [
      "Log In",
      "Pricing",
      "Plans",
      "Krea Teams",
      "Krea Enterprise",
      "Gallery",
      "Krea for Architecture",
    ],
  },
  {
    title: "Products",
    links: [
      "Image",
      "Video",
      "Enhancer",
      "Realtime",
      "Edit",
      "Chat",
      "Stage",
      "Animator",
      "Train",
    ],
  },
  {
    title: "Resources",
    links: [
      "Pricing",
      "Careers",
      "Terms of Service",
      "Privacy Policy",
      "Documentation",
      "Models",
    ],
  },
  { title: "About", links: ["Blog", "Discord", "Articles"] },
];

const footerSocials = [
  { label: "Desktop app", icon: Monitor },
  { label: "X", icon: X },
  { label: "LinkedIn", icon: Link2 },
  { label: "Instagram", icon: Camera },
];

const PLAN_CYCLE = ["Basic", "Pro", "Max"] as const;
const PLAN_STYLES: Record<string, { gradient: string; glow: string }> = {
  Basic: {
    gradient: "linear-gradient(to bottom, #b9f8cf, #05df72, #009966)",
    glow: "rgba(34,197,94,0.9)",
  },
  Pro: {
    gradient: "linear-gradient(to bottom, #fffcd8, #c27aff, #7f22fe)",
    glow: "rgba(168,85,247,0.9)",
  },
  Max: {
    gradient: "linear-gradient(to bottom, #bedbff, #51a2ff, #155dfc)",
    glow: "rgba(59,130,246,0.9)",
  },
};

/* ─────────────── Horizontal Carousel ─────────────── */

function HorizontalRail({
  title,
  children,
  cardWidth,
  gap = 32,
  count,
}: {
  title: string;
  children: React.ReactNode;
  cardWidth: number;
  gap?: number;
  count: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const step = cardWidth + gap;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const visibleCount = useMemo(() => {
    if (!viewportWidth) return 1;
    return Math.max(1, Math.floor((viewportWidth + gap) / step));
  }, [viewportWidth, gap, step]);

  const maxIndex = Math.max(0, count - visibleCount);
  const idx = Math.min(activeIndex, maxIndex);

  return (
    <section>
      <div className="flex items-center justify-between mb-4 h-8">
        <h3
          className="m-0 text-lg font-medium leading-8"
          style={{ color: "var(--nf-text-primary)" }}
        >
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveIndex(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="w-8 h-8 rounded-full grid place-items-center disabled:opacity-40 cursor-pointer disabled:cursor-default transition-opacity nf-hover-item"
            style={{
              border: "1px solid var(--nf-border-inner)",
              background: "var(--nf-bg-node)",
              color: "var(--nf-text-muted)",
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setActiveIndex(Math.min(maxIndex, idx + 1))}
            disabled={idx >= maxIndex}
            className="w-8 h-8 rounded-full grid place-items-center disabled:opacity-40 cursor-pointer disabled:cursor-default transition-opacity nf-hover-item"
            style={{
              border: "1px solid var(--nf-border-inner)",
              background: "var(--nf-bg-node)",
              color: "var(--nf-text-muted)",
            }}
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={viewportRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            gap,
            transform: `translate3d(${-idx * step}px, 0, 0)`,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Ellipsis Dropdown ─────────────── */

function EllipsisMenu({ onUnpin }: { onUnpin?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="absolute top-2 right-2 z-10">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-7 h-7 rounded-md grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer nf-hover-item"
        style={{
          background: "color-mix(in srgb, var(--nf-bg-canvas) 82%, transparent)",
          color: "var(--nf-text-secondary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <MoreHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 w-40 rounded-lg shadow-xl overflow-hidden z-20"
            style={{
              background: "var(--nf-bg-node)",
              border: "1px solid var(--nf-border-inner)",
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnpin?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition-colors nf-hover-item"
              style={{ color: "var(--nf-text-primary)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="text-red-500 font-medium">Unpin Tool</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────── Model Card ─────────────── */

function ModelCardComponent({
  model,
  width,
  height,
}: {
  model: ModelCard;
  width: number;
  height: number;
}) {
  return (
    <Link
      href="#"
      className="group block relative rounded-2xl overflow-hidden flex-shrink-0"
      style={{ minWidth: width, width, height }}
    >
      <img
        src={model.image}
        alt={model.title}
        className="w-full h-full object-cover block"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent rounded-2xl" />
      <EllipsisMenu />
      {model.badges.length > 0 && (
        <div className="absolute top-3 left-3 flex gap-1.5">
          {model.badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[11px] font-semibold leading-[22px]"
              style={{ background: b.color, color: "#0a0a0a" }}
            >
              {b.label === "Featured" && <Star size={10} fill="#0a0a0a" />}
              {b.label}
            </span>
          ))}
        </div>
      )}
      <div className="absolute left-4 right-4 bottom-4">
        <h4 className="m-0 text-lg font-semibold text-white leading-6">
          {model.title}
        </h4>
        <p className="mt-1 text-[13px] text-neutral-400 leading-[18px] line-clamp-2">
          {model.description}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Zap size={12} /> {model.speed}
          </span>
          <span>{model.quality}</span>
          <span className="ml-auto">{model.credits} credits</span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────── Hero Carousel ─────────────── */

const heroSlideVariants = {
  initial: (dir: number) => ({ x: `${dir * 100}%`, opacity: 0 }),
  animate: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: `${-dir * 100}%`, opacity: 0 }),
};

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(true);
  const slideCount = heroSlides.length;

  useEffect(() => {
    const id = window.setTimeout(() => setShowWelcomeText(false), 1800);
    return () => window.clearTimeout(id);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slideCount);
  }, [slideCount]);

  const onDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const draggedLeft = info.offset.x < -72 || info.velocity.x < -520;
      const draggedRight = info.offset.x > 72 || info.velocity.x > 520;

      if (draggedLeft) {
        next();
        return;
      }

      if (draggedRight) {
        prev();
      }
    },
    [next, prev],
  );

  return (
    <section className="mb-[50px]">
      <div
        className="w-full h-[400px] rounded-2xl overflow-hidden relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={heroSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.07}
            onDragEnd={onDragEnd}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
            style={{ touchAction: "pan-y" }}
          >
            <img
              src={heroSlides[current].image}
              alt={heroSlides[current].title}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            <div
              className="absolute inset-0"
              style={{ background: heroSlides[current].gradient }}
            />
            <div className="relative z-10 h-full w-full">
              {current === 0 && (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center pointer-events-none">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h2
                      key={showWelcomeText ? "welcome" : "start-image"}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{
                        opacity: 1,
                        y: hovered && !showWelcomeText ? -12 : 0,
                      }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="m-0 text-white text-[36px] md:text-[57.5px] leading-[42px] md:leading-[60px] font-medium tracking-[-0.02em]"
                      style={{
                        fontFamily:
                          "'Suisse Intl', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      }}
                    >
                      {showWelcomeText
                        ? "Welcome to NextFlow"
                        : heroSlides[0].title}
                    </motion.h2>
                  </AnimatePresence>
                </div>
              )}
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform:
                    current === 0
                      ? "translate(-50%, 60px)"
                      : "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 24 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex justify-center gap-4 px-4"
                >
                  {heroSlides[current].buttons.map((btn) => (
                    <Link
                      key={btn.label}
                      href={btn.href}
                      className={`h-10 rounded-full px-8 inline-flex items-center justify-center gap-2 no-underline transition-colors duration-200 ${
                        btn.primary
                          ? "bg-neutral-100 text-neutral-900 hover:bg-white text-[13.7px] leading-5 font-medium"
                          : "backdrop-blur-[12px] bg-white/[0.05] text-neutral-100 hover:bg-white/[0.12] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] text-[13.5px] leading-5 font-medium"
                      }`}
                    >
                      {btn.label}
                    </Link>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Below-carousel row: slide title (left) + arrows (right) */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="overflow-hidden flex-1 min-h-[28px]">
          {current !== 0 && (
            <AnimatePresence mode="wait">
              <motion.h3
                key={current}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="m-0 font-medium text-lg leading-none truncate"
                style={{ color: "var(--nf-text-primary)" }}
              >
                {heroSlides[current].title}
              </motion.h3>
            </AnimatePresence>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full grid place-items-center cursor-pointer transition-all nf-hover-item"
            style={{
              background: "var(--nf-bg-node)",
              color: "var(--nf-text-muted)",
              border: "1px solid var(--nf-border-inner)",
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full grid place-items-center cursor-pointer transition-colors nf-hover-item"
            style={{
              background: "var(--nf-bg-node)",
              color: "var(--nf-text-secondary)",
              border: "1px solid var(--nf-border-inner)",
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Upgrade Banner ─────────────── */

function UpgradeBanner() {
  const [planIdx, setPlanIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlanIdx((i) => (i + 1) % PLAN_CYCLE.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const plan = PLAN_CYCLE[planIdx];

  return (
    <Link
      href="/dashboard/pricing"
      className="flex items-center justify-between w-full h-48 rounded-xl px-8 no-underline overflow-hidden relative"
      style={{
        border: "1px solid var(--nf-border-inner)",
        background: "var(--nf-bg-canvas-grid)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="max-w-[280px] z-[1]">
        <div
          className="flex flex-col gap-1 font-medium text-lg leading-7"
          style={{ color: "var(--nf-text-primary)" }}
        >
          <span>Upscale images & videos to 22K</span>
          <span>Lora fine-tuning</span>
          <span>Access all 150+ models</span>
          <span>Ultra fast & no throttling</span>
        </div>
      </div>
      <div
        className="z-[1] flex flex-col items-center justify-center"
        style={{ minHeight: 80, minWidth: 260 }}
      >
        <AnimatePresence mode="wait">
          {!hovered ? (
            <motion.div
              key="plan-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline gap-3 text-5xl font-bold tracking-tight leading-none"
            >
              <span style={{ color: "var(--nf-text-primary)" }}>Try</span>
              <div
                className="overflow-hidden"
                style={{ lineHeight: 1, display: "inline-block" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={plan}
                    initial={{ opacity: 0, y: "-100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="block"
                    style={{
                      backgroundImage: PLAN_STYLES[plan].gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: `drop-shadow(0 0 10px ${PLAN_STYLES[plan].glow})`,
                    }}
                  >
                    {plan}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pricing-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2.5 text-2xl font-bold"
              style={{ color: "var(--nf-text-primary)" }}
            >
              View pricing <ArrowRight size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-[200px] z-[1]" />
    </Link>
  );
}

/* ─────────────── Quick Action Card ─────────────── */

function QuickActionCard({
  card,
  showTooltip,
}: {
  card: QuickAction;
  showTooltip?: boolean;
}) {
  return (
    <Link
      href={card.href}
      className="group relative block h-[168px] rounded-xl overflow-hidden no-underline"
    >
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-9 left-4 z-10 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
          Click here to open the image tool
          <div className="absolute left-6 -bottom-1 w-2 h-2 bg-indigo-600 rotate-45" />
        </motion.div>
      )}
      <img
        src={card.image}
        alt={card.title}
        className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <EllipsisMenu />
      <motion.div
        className="absolute left-4 right-4 bottom-3"
        initial={false}
        whileHover={{ y: -4 }}
      >
        <p className="m-0 text-neutral-100 text-sm font-[450] leading-7">
          {card.title}
        </p>
      </motion.div>
    </Link>
  );
}

/* ─────────────── Node App Card ─────────────── */

function NodeAppCard({ app }: { app: NodeApp }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="#"
      className="group relative block h-[420px] rounded-xl overflow-hidden no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={app.image}
        alt={app.title}
        className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: hovered
            ? "rgba(0,0,0,0.7)"
            : "linear-gradient(to top, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.3) 45%, transparent 70%)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.3) 45%, transparent 70%)",
        }}
      />
      <EllipsisMenu />
      <div className="absolute left-4 right-4 bottom-4">
        <h4 className="m-0 text-lg font-semibold text-white leading-6">
          {app.title}
        </h4>
        <p className="mt-1 text-[13px] text-neutral-400 leading-[18px] truncate">
          {app.description}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-3"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium">
            Try it <ArrowRight size={14} />
          </span>
        </motion.div>
      </div>
    </Link>
  );
}

/* ─────────────── Instant Action Card ─────────────── */

function InstantActionCard({ action }: { action: ActionCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="#"
      className="group block relative rounded-2xl overflow-hidden flex-shrink-0"
      style={{ minWidth: 496, width: 496, height: 320 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={action.image}
        alt={action.title}
        className="w-full h-full object-cover block"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <EllipsisMenu />
      <div className="absolute left-4 right-4 bottom-4">
        <h4 className="m-0 text-lg font-semibold text-white leading-6">
          {action.title}
        </h4>
        <p className="mt-1 text-[13px] text-neutral-400 leading-[18px]">
          {action.description}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-3"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-sm font-medium">
            Try it <ArrowRight size={14} />
          </span>
        </motion.div>
      </div>
    </Link>
  );
}

/* ─────────────── Main Dashboard ─────────────── */

export function HomeDashboard({ guestMode = false }: { guestMode?: boolean }) {
  const router = useRouter();

  const handleGuestActionCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!guestMode) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button");
      if (!interactive) return;

      const anchor = interactive.closest("a");
      const href = anchor?.getAttribute("href");
      if (href && href.startsWith("/sign-up")) return;

      event.preventDefault();
      event.stopPropagation();
      router.push("/sign-up?redirect_url=/dashboard");
    },
    [guestMode, router],
  );

  return (
    <div
      className="nf-scroll min-h-full"
      style={{
        background: "var(--nf-bg-canvas)",
        color: "var(--nf-text-primary)",
      }}
      onClickCapture={handleGuestActionCapture}
    >
      <div className="w-full px-12 pt-12">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Quick Action Grid */}
        <section className="mb-14">
          <div className="grid grid-cols-4 gap-8">
            {quickActions.map((card, i) => (
              <QuickActionCard
                key={card.title}
                card={card}
                showTooltip={i === 0}
              />
            ))}
          </div>
        </section>

        {/* Upgrade Banner */}
        <section className="mb-14">
          <UpgradeBanner />
        </section>

        {/* Explore Image Models */}
        <section className="mb-14">
          <HorizontalRail
            title="Explore image models 🔍"
            cardWidth={496}
            gap={32}
            count={imageModels.length}
          >
            {imageModels.map((m) => (
              <ModelCardComponent
                key={m.title}
                model={m}
                width={496}
                height={320}
              />
            ))}
          </HorizontalRail>
        </section>

        {/* Try Video Models */}
        <section className="mb-14">
          <HorizontalRail
            title="Try video models"
            cardWidth={568}
            gap={32}
            count={videoModels.length}
          >
            {videoModels.map((m) => (
              <ModelCardComponent
                key={m.title}
                model={m}
                width={568}
                height={368}
              />
            ))}
          </HorizontalRail>
        </section>

        {/* Play with Node Apps */}
        <section className="mb-14">
          <h3
            className="m-0 mb-4 text-lg font-medium leading-8"
            style={{ color: "var(--nf-text-primary)" }}
          >
            Play with node apps
          </h3>
          <div className="grid grid-cols-4 gap-8">
            {nodeApps.map((app) => (
              <NodeAppCard key={app.title} app={app} />
            ))}
          </div>
        </section>

        {/* Instant Results with Krea Actions */}
        <section className="mb-14">
          <HorizontalRail
            title="Instant results with Krea actions"
            cardWidth={496}
            gap={32}
            count={instantActions.length}
          >
            {instantActions.map((action) => (
              <InstantActionCard key={action.title} action={action} />
            ))}
          </HorizontalRail>
        </section>

        {/* Release Notes */}
        <section className="mb-14">
          <h3
            className="m-0 mb-4 text-lg font-medium leading-8"
            style={{ color: "var(--nf-text-primary)" }}
          >
            Release notes
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {releaseNotes.map((item) => (
              <button
                key={item.title}
                type="button"
                className="group grid gap-4 p-2 h-[196px] rounded-xl border-none bg-transparent cursor-pointer text-left text-inherit transition-colors nf-hover-item"
                style={{ gridTemplateColumns: "280px 1fr" }}
              >
                <div className="w-[280px] h-[180px] rounded-xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover block"
                  />
                </div>
                <div className="flex flex-col justify-start pt-1">
                  <h4
                    className="m-0 text-base font-semibold leading-7"
                    style={{ color: "var(--nf-text-primary)" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="mt-1 text-[13px] leading-[18px] line-clamp-3"
                    style={{ color: "var(--nf-text-muted)" }}
                  >
                    {item.description}
                  </p>
                  <span
                    className="mt-auto text-xs leading-[18px]"
                    style={{ color: "var(--nf-text-label)" }}
                  >
                    {item.date}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="pt-12 pb-8"
          style={{ borderTop: "1px solid var(--nf-border-inner)" }}
        >
          <div className="grid grid-cols-4 gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4
                  className="m-0 text-sm font-semibold leading-5"
                  style={{ color: "var(--nf-text-primary)" }}
                >
                  {col.title}
                </h4>
                <ul className="list-none m-0 mt-4 p-0 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm no-underline leading-[26px] transition-colors"
                        style={{ color: "var(--nf-text-muted)" }}
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="mt-8 pt-4 flex justify-between items-center text-sm"
            style={{
              borderTop: "1px solid var(--nf-border-inner)",
              color: "var(--nf-text-label)",
            }}
          >
            <span>&copy; 2026 Krea</span>
            <div className="flex gap-4">
              {footerSocials.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    type="button"
                    aria-label={s.label}
                    className="border-none bg-transparent p-0 w-5 h-5 grid place-items-center cursor-pointer transition-colors"
                    style={{ color: "var(--nf-text-label)" }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
