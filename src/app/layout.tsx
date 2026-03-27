import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const suisseIntl = localFont({
  src: [
    { path: "../../public/fonts/SuisseIntl-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/SuisseIntl-Book.ttf", weight: "450", style: "normal" },
    { path: "../../public/fonts/SuisseIntl-Medium.ttf", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-suisse-intl",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "NextFlow — AI Workflow Builder",
  description:
    "Build powerful AI workflows visually. Chain LLM calls, image processing, and video analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={suisseIntl.variable}>
        <body className={suisseIntl.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
