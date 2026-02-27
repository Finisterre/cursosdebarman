import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "fs-eshop",
  description: "Starter ecommerce con Next.js 14 y Supabase",
  icons: {
    icon: [{ url: "/beacon-favicon.png", sizes: "48x37", type: "image/png" }],
  },
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
    <html lang="es">
      <body className="min-h-screen">
        <AppProviders>{children}</AppProviders>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

