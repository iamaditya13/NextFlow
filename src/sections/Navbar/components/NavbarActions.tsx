import Link from "next/link";

type NavbarActionsProps = {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  isDark: boolean;
};

export const NavbarActions = ({
  mobileOpen,
  setMobileOpen,
  isDark,
}: NavbarActionsProps) => {
  return (
    <div className="box-border justify-self-end">
      <div className="items-center box-border gap-x-2 flex gap-y-2">
        <Link
          href="/sign-up"
          className="focus-visible:border-ring text-sm items-center flex shrink-0 h-[36px] justify-center leading-5 text-center text-nowrap px-4 rounded-full active:scale-95 transition-all duration-500 hover:opacity-90"
          style={{
            backgroundColor: "#ffffff",
            color: "#000000",
            fontFamily: '"Suisse Intl", ui-sans-serif, system-ui',
            fontWeight: 450,
            padding: "8px 16px",
          }}
        >
          Sign up for free
        </Link>

        <Link
          href="/sign-in"
          className="focus-visible:border-ring text-[#ffffff] text-sm items-center flex shrink-0 h-[36px] justify-center leading-5 text-center text-nowrap px-4 rounded-full active:scale-95 transition-all duration-500 hover:opacity-90"
          style={{
            backgroundColor: "#262626",
            fontFamily: '"Suisse Intl", ui-sans-serif, system-ui',
            fontWeight: 450,
            padding: "8px 16px",
          }}
        >
          Log in
        </Link>

        <div className="items-center box-border flex justify-center md:hidden md:min-h-0 md:min-w-0">
          <button
            className={`bg-transparent block text-center p-0 md:min-h-0 md:min-w-0 hover:opacity-70 transition-opacity ${isDark ? "text-white" : "text-black"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="box-border h-[30px] w-[30px] transition-all duration-500"
              >
                <path
                  d="M8 8L22 22M22 8L8 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="30"
                height="18"
                viewBox="0 0 30 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="box-border h-[18px] w-[30px] transition-all duration-500"
              >
                <path
                  d="M1 1H29M1 9H29M1 17H29"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
