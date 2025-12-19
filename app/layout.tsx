import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { AdminProvider } from "@/lib/admin-context";
import { ProductsProvider } from "@/lib/products-context";
import {
  OrganizationSchema,
  WebsiteSchema,
  LocalBusinessSchema,
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
  metadataBase: new URL(process.env.SITE_URL || "https://www.kickshub.site"),
  title: {
    default: "KicksHub - Premium Vintage & Thrifted Sneakers Pakistan",
    template: "%s | KicksHub",
  },
  description:
    "Pakistan's #1 destination for authentic vintage and thrifted sneakers. Shop premium Air Jordans, Nike, Adidas, New Balance & more. Quality verified, affordable prices, nationwide delivery.",
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
      "Pakistan's #1 destination for authentic vintage and thrifted sneakers. Quality verified, affordable prices.",
    type: "website",
    locale: "en_US",
    url: "https://www.kickshub.site",
    siteName: "KicksHub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KicksHub - Premium Vintage Sneakers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KicksHub - Premium Vintage & Thrifted Sneakers",
    description:
      "Pakistan's #1 destination for authentic vintage sneakers. Shop now!",
    images: ["/og-image.jpg"],
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
    canonical: "https://www.kickshub.site",
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
        {/* Preload critical LCP image */}
        <link
          rel="preload"
          href="/shoes/hero-shoes.jpg"
          as="image"
          type="image/jpeg"
          fetchPriority="high"
        />
        {/* Default Open Graph / Twitter image to avoid missing image errors */}
        <meta property="og:image" content="/placeholder-logo.png" />
        <meta name="twitter:image" content="/placeholder-logo.png" />
        {/* Google Search Console verification */}
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        )}
        {/* Google Analytics (GA4) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EVQ3WR6K16"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EVQ3WR6K16');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
        <AdminProvider>
          <ProductsProvider>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </AdminProvider>
        <Toaster position="top-right" richColors />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
