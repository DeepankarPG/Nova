import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/components/theme/AppToaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayGlocal GCC — Global Currency Connect",
  description: "Manage your global payments, settlements, and currency accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-dvh overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-dvh min-h-0 overflow-hidden antialiased bg-background text-foreground`}
      >
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="afterInteractive"
          />
        )}
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
