import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Sneakers",
  description:
    "Browse our complete collection of vintage and thrifted sneakers. Find authentic Air Jordans, Nike, Adidas, New Balance and more at affordable prices in Pakistan.",
  keywords: [
    "buy sneakers Pakistan",
    "vintage sneakers shop",
    "thrifted shoes online",
    "authentic sneakers Lahore",
    "Air Jordan Pakistan",
    "Nike shoes Pakistan",
    "Adidas vintage Pakistan",
    "affordable sneakers",
    "pre-owned shoes",
    "sneaker collection",
  ],
  openGraph: {
    title: "Shop All Sneakers | KicksHub",
    description:
      "Browse our complete collection of vintage and thrifted sneakers. Authentic brands at affordable prices.",
    type: "website",
    url: "https://www.kickshub.site/products",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Sneakers | KicksHub",
    description:
      "Browse our complete collection of vintage and thrifted sneakers.",
  },
  alternates: {
    canonical: "https://www.kickshub.site/products",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
