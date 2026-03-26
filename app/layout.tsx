import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="afterInteractive"
          />
        )}
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#0f172a",
            },
          }}
        />
      </body>
    </html>
  );
}
