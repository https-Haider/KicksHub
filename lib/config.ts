/**
 * Site-wide configuration
 * This file contains all configurable values for the site.
 * For sensitive values, use environment variables instead.
 */

export const siteConfig = {
  // Site Info
  name: "KicksHub",
  tagline: "Premium Thrift Sneakers",
  description:
    "Pakistan's premier destination for authentic pre-owned sneakers.",

  // Contact Information
  contact: {
    email:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL || "thriftshoes.boss@gmail.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+923491441882",
    phoneFormatted:
      process.env.NEXT_PUBLIC_CONTACT_PHONE_FORMATTED || "+92 349 144 1882",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923491441882",
    address: {
      line1: "Shop #12, Liberty Market",
      line2: "Lahore, Pakistan",
    },
  },

  // Business Hours
  businessHours: {
    weekdays: "11:00 AM - 9:00 PM", // Mon - Sat
    sunday: "2:00 PM - 8:00 PM",
  },

  // Social Media Links
  social: {
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/kickshub",
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/kickshub",
    twitter:
      process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/kickshub",
  },
} as const;

// Helper to get WhatsApp link
export function getWhatsAppLink(message?: string): string {
  const baseUrl = `https://wa.me/${siteConfig.contact.whatsapp}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

// Helper to get email link
export function getEmailLink(subject?: string): string {
  const baseUrl = `mailto:${siteConfig.contact.email}`;
  if (subject) {
    return `${baseUrl}?subject=${encodeURIComponent(subject)}`;
  }
  return baseUrl;
}

// Helper to get phone link
export function getPhoneLink(): string {
  return `tel:${siteConfig.contact.phone}`;
}

export type SiteConfig = typeof siteConfig;
