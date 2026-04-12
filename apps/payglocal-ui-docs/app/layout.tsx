import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/docs/ThemeProvider";
import { Toaster } from "@payglocal/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "PayGlocal UI — open design system";
const description =
  "Install @payglocal/ui in one command. React, Tailwind CSS v4, Radix primitives, and PayGlocal tokens — same system we ship in product.";

export const metadata: Metadata = {
  title: { default: title, template: "%s — PayGlocal UI" },
  description,
  keywords: ["PayGlocal", "design system", "React", "Tailwind", "Radix", "components", "open source"],
  openGraph: {
    title,
    description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
