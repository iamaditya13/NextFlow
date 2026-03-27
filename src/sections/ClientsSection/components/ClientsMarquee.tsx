import { IconRenderer } from "@/components/ui/IconRenderer";
const clients = [
  {
    name: "Lego",
    iconSrc: "/assets/icon-30.svg",
    iconClass: "h-7 w-7",
  },
  {
    name: "Samsung",
    iconSrc: "/assets/icon-31.svg",
    iconClass: "h-10 w-10",
  },
  {
    name: "Nike",
    iconSrc: "/assets/icon-32.svg",
    iconClass: "h-10 w-10",
  },
  {
    name: "Microsoft",
    iconSrc: "/assets/icon-33.svg",
    iconClass: "h-7 w-7",
  },
  {
    name: "Shopify",
    iconSrc: "/assets/icon-34.svg",
    iconClass: "h-7 w-7",
  },
];

export const ClientsMarquee = () => {
  return (
    <div className="relative box-border overflow-hidden mt-12">
      <div className="relative box-border">
        <div className="flex w-full overflow-hidden p-2">
          <div
            className="flex shrink-0 items-center gap-x-12 md:gap-x-24 animate-marquee"
            aria-hidden="false"
          >
            {[...clients, ...clients].map((client, i) => (
              <div
                key={i}
                className="text-neutral-700 text-2xl font-medium items-center flex justify-center leading-8 opacity-65 gap-x-2.5 whitespace-nowrap hover:opacity-100"
              >
                <IconRenderer
                  src={client.iconSrc}
                  alt={client.name}
                  className={`box-border ${client.iconClass}`}
                />
                <span>{client.name}</span>
              </div>
            ))}
          </div>
          <div
            className="flex shrink-0 items-center gap-x-12 md:gap-x-24 animate-marquee"
            aria-hidden="true"
          >
            {[...clients, ...clients].map((client, i) => (
              <div
                key={i}
                className="text-neutral-700 text-2xl font-medium items-center flex justify-center leading-8 opacity-65 gap-x-2.5 whitespace-nowrap"
              >
                <IconRenderer
                  src={client.iconSrc}
                  alt={client.name}
                  className={`box-border ${client.iconClass}`}
                />
                <span>{client.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bg-[linear-gradient(90deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full left-0 top-0 w-16 z-10"></div>
        <div className="absolute bg-[linear-gradient(270deg,rgb(255,255,255)_0%,rgba(255,255,255,0)_100%)] box-border h-full right-0 top-0 w-16 z-10"></div>
      </div>
    </div>
  );
};
