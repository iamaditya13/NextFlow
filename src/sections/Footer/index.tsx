import { FooterLinks } from "@/sections/Footer/components/FooterLinks";

export const Footer = () => {
  return (
    <footer className="relative text-neutral-400 bg-neutral-100 box-border z-10">
      <div className="box-border max-w-screen-2xl mx-auto pt-28 pb-10">
        <FooterLinks />
      </div>
    </footer>
  );
};
