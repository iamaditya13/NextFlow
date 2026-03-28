import Link from "next/link";

type NavbarLogoProps = { isDark: boolean };

export const NavbarLogo = ({ isDark }: NavbarLogoProps) => {
  return (
    <div className="w-fit">
      <Link href="/" aria-label="Return to home" className="block">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            fill: isDark ? "#FFFFFF" : "#000000",
            transition: "fill 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Approximate Krea Logo Shapes */}
          <rect x="2" y="3" width="5" height="18" rx="2.5" />
          <rect x="9" y="8" width="5" height="5" rx="2.5" />
          <rect x="9" y="15" width="5" height="5" rx="2.5" />
          <rect x="16" y="11" width="5" height="5" rx="2.5" />
        </svg>
      </Link>
    </div>
  );
};
