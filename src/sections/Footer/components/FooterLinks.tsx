import { FooterColumn } from "@/sections/Footer/components/FooterColumn";
import { FooterBottom } from "@/sections/Footer/components/FooterBottom";

export const FooterLinks = () => {
  return (
    <div className="mx-auto px-5 md:px-16">
      <div className="gap-8 grid grid-cols-2 md:grid-cols-4 mb-8">
        <FooterColumn
          title="NextFlow"
          items={[
            { label: "Log In", href: "/sign-in", hasDivider: true },
            { label: "Pricing", href: "/#pricing", hasDivider: true },
            { label: "Enterprise", href: "#", hasDivider: true },
            { label: "Gallery", href: "#" },
          ]}
        />

        <FooterColumn
          title="Products"
          items={[
            { label: "Image Generator", href: "#", hasDivider: true },
            { label: "Video Generator", href: "#", hasDivider: true },
            { label: "Enhancer", href: "#", hasDivider: true },
            { label: "Realtime", href: "#", hasDivider: true },
            { label: "Edit", href: "#" },
          ]}
        />

        <FooterColumn
          title="Resources"
          items={[
            { label: "Pricing", href: "/#pricing", hasDivider: true },
            { label: "Careers", href: "#", hasDivider: true },
            { label: "Terms of Service", href: "#", hasDivider: true },
            { label: "Privacy Policy", href: "#", hasDivider: true },
            { label: "API", href: "#", hasDivider: true },
            { label: "Documentation", href: "#" },
          ]}
        />

        <FooterColumn
          title="About"
          items={[
            { label: "Blog", href: "#", hasDivider: true },
            { label: "Discord", href: "#" },
          ]}
        />
      </div>

      <FooterBottom />
    </div>
  );
};
