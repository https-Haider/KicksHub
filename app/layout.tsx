import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/lib/cart-context";
import { AdminProvider } from "@/lib/admin-context";
import { ProductsProvider } from "@/lib/products-context";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KicksHub - Vintage & Thrifted Sneakers | Authentic Shoes",
  description:
    "Discover authentic vintage and thrifted sneakers. Shop classic Air Jordans, Nike, Adidas, and more. Curated collection of quality thrifted shoes.",
  keywords:
    "vintage sneakers, thrifted shoes, authentic sneakers, retro shoes, Air Jordan, Nike, Adidas",
  generator: "v0.app",
  openGraph: {
    title: "KicksHub - Vintage & Thrifted Sneakers",
    description:
      "Discover authentic vintage and thrifted sneakers from top brands.",
    type: "website",
    url: "https://thriftshoes.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "KicksHub - Vintage & Thrifted Sneakers",
    description:
      "Discover authentic vintage and thrifted sneakers from top brands.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <link rel="canonical" href="/" />
        <meta name="theme-color" content="#000000" />
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
        <AdminProvider>
          <ProductsProvider>
            <CartProvider>{children}</CartProvider>
          </ProductsProvider>
        </AdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
