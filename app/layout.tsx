import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/lib/cart-context";
import { AdminProvider } from "@/lib/admin-context";
import { ProductsProvider } from "@/lib/products-context";
import { Toaster } from "@/components/ui/sonner";
import {
  OrganizationSchema,
  WebsiteSchema,
  LocalBusinessSchema,
} from "@/components/seo/json-ld";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
        <link rel="icon" href="/placeholder-logo.png" />
        <meta name="theme-color" content="#000000" />
        {/* Preload critical images for LCP optimization */}
        <link
          rel="preload"
          href="/shoes/hero-shoes.jpg"
          as="image"
          type="image/jpeg"
        />
        <link rel="preload" href="/placeholder-logo.png" as="image" />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
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
        {/* Google Analytics (GA4) - gtag.js */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: true });`,
              }}
            />
          </>
        )}
      </head>
      <body className={`font-sans antialiased`}>
        <OrganizationSchema />
        <WebsiteSchema />
        <LocalBusinessSchema />
        <AdminProvider>
          <ProductsProvider>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </AdminProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
