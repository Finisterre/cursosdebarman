import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "fs-eshop",
  description: "Starter ecommerce con Next.js 14 y Supabase",
  verification: {
    google: "evn9q9PWfhB1yTJtYzHaj23ai8ygy6_oX6nDVT5pIQA",
  },
};
// <meta name="google-site-verification" content="evn9q9PWfhB1yTJtYzHaj23ai8ygy6_oX6nDVT5pIQA" />

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

