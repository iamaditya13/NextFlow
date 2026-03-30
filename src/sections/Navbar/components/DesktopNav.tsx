import Link from "next/link";
import { ChevronDown } from "lucide-react";
type DesktopNavProps = {
  featuresOpen: boolean;
  setFeaturesOpen: (v: boolean) => void;
  isDark: boolean;
};

export const DesktopNav = ({
  featuresOpen,
  setFeaturesOpen,
  isDark,
}: DesktopNavProps) => {
  const navLinks = [
    { label: "App", href: "/dashboard/node-editor" },
    { label: "Image Generator", href: "/sign-up?redirect_url=/dashboard" },
    { label: "Video Generator", href: "/sign-up?redirect_url=/dashboard" },
    { label: "Upscaler", href: "/sign-up?redirect_url=/dashboard" },
    { label: "API", href: "#" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Enterprise", href: "#" },
  ];

  const hoverClass = isDark ? "hover:bg-white/10" : "hover:bg-black/5";
  const linkStyle = {
    fontFamily:
      '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    color: isDark ? "#FAFAFA" : "#171717",
  };

  return (
    <div className="relative box-border hidden min-h-0 min-w-0 xl:block xl:min-h-[auto] xl:min-w-[auto]">
      <div className="absolute box-border hidden left-2/4 top-2/4 -translate-x-1/2 -translate-y-1/2 xl:block">
        <nav className="text-[16px] items-center box-border gap-x-0 flex leading-[22.5px] gap-y-0 whitespace-nowrap">
          <Link
            href="/dashboard/node-editor"
            onMouseEnter={() => setFeaturesOpen(false)}
            className={`nav-link block shrink-0 px-4 py-2 h-[36px] rounded-md transition-all duration-150 ${hoverClass}`}
            style={linkStyle}
          >
            App
          </Link>

          <button
            onMouseEnter={() => setFeaturesOpen(true)}
            className={`nav-features-button relative items-center bg-transparent gap-x-1 flex shrink-0 text-center px-4 py-2 h-[36px] rounded-md transition-colors duration-500 ${hoverClass} ${isDark ? "text-[#FAFAFA]" : "text-[#171717]"}`}
            style={{ fontFamily: linkStyle.fontFamily }}
          >
            Features{" "}
            <ChevronDown
              size={12}
              strokeWidth={3}
              className={`transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
            />
          </button>

          {navLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => setFeaturesOpen(false)}
              className={`nav-link block shrink-0 px-4 py-2 h-[36px] rounded-md transition-all duration-150 ${hoverClass}`}
              style={linkStyle}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
