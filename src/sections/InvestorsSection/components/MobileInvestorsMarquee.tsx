import { LogoList } from "./LogoList";

export const MobileInvestorsMarquee = () => {
  return (
    <div className="box-border block overflow-hidden md:hidden">
      <div className="relative box-border">
        <div className="box-border gap-x-12 flex gap-y-12 w-full overflow-hidden p-2 md:gap-x-24 md:gap-y-24">
          <div className="items-center box-border gap-x-12 flex shrink-0 gap-y-12 md:gap-x-24 md:min-h-0 md:min-w-0 md:gap-y-24 animate-[marquee_20s_linear_infinite]">
            <LogoList />
          </div>
          <div className="items-center box-border gap-x-12 flex shrink-0 gap-y-12 md:gap-x-24 md:min-h-0 md:min-w-0 md:gap-y-24 animate-[marquee_20s_linear_infinite]">
            <LogoList />
          </div>
        </div>
        <div className="absolute bg-[linear-gradient(90deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full w-12 left-0 top-0"></div>
        <div className="absolute bg-[linear-gradient(270deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full w-12 right-0 top-0"></div>
      </div>
    </div>
  );
};
