import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { SITE_URL, SOCIAL_IMAGE, absoluteUrl } from "@/lib/seo";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { AdminProvider } from "@/lib/admin-context";
import { ProductsProvider } from "@/lib/products-context";
import {
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsWrapper } from "@/components/analytics-wrapper";
import "./globals.css";

// Load fonts with display swap for better LCP
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KicksHub - Premium Vintage & Thrifted Sneakers Pakistan",
    template: "%s | KicksHub",
  },
  description:
    "Shop KicksHub's current selection of pre-owned sneakers and footwear available for delivery in Pakistan.",
  keywords: [
    "vintage sneakers Pakistan",
    "thrifted shoes Lahore",
    "authentic sneakers",
    "retro shoes Pakistan",
    "Air Jordan Pakistan",
    "Nike thrift",
    "Adidas vintage",
    "New Balance Pakistan",
    "pre-owned sneakers",
    "second hand shoes",
    "KicksHub",
    "sneaker store Pakistan",
  ],
  authors: [{ name: "KicksHub" }],
  creator: "KicksHub",
  publisher: "KicksHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "KicksHub - Premium Vintage & Thrifted Sneakers Pakistan",
    description:
      "Browse KicksHub's current selection of pre-owned sneakers and footwear.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "KicksHub",
    images: [
      {
        url: absoluteUrl(SOCIAL_IMAGE),
        alt: "KicksHub - Premium Vintage Sneakers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KicksHub - Premium Vintage & Thrifted Sneakers",
    description:
      "Browse KicksHub's current pre-owned sneaker inventory.",
    images: [absoluteUrl(SOCIAL_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/placeholder-logo.png" sizes="any" />
        <meta name="theme-color" content="#000000" />
        {/* Preconnect to external domains first for faster connections */}
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <OrganizationSchema />
        <WebsiteSchema />
        <AdminProvider>
          <ProductsProvider>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </AdminProvider>
        <Toaster position="top-right" richColors />
        <AnalyticsWrapper />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EVQ3WR6K16"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-EVQ3WR6K16');`}
        </Script>
      </body>
    </html>
  );
}
