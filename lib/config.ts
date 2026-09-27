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
    "Pre-owned sneakers and footwear available for delivery in Pakistan.",

  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+923177258837",
    phoneFormatted: process.env.NEXT_PUBLIC_CONTACT_PHONE_FORMATTED || "+92 317 725 8837",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923177258837",
    address: {
      line1: process.env.NEXT_PUBLIC_ADDRESS_LINE_1 || "",
      line2: process.env.NEXT_PUBLIC_ADDRESS_LINE_2 || "",
    },
  },

  // Business Hours
  businessHours: {
    weekdays: process.env.NEXT_PUBLIC_HOURS_WEEKDAYS || "",
    sunday: process.env.NEXT_PUBLIC_HOURS_SUNDAY || "",
  },

  // Social Media Links
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/haider_hunjraa",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/196NSceRLu/",
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "",
  },
  policies: {
    returnPeriodDays: process.env.NEXT_PUBLIC_RETURN_PERIOD_DAYS
      ? Number(process.env.NEXT_PUBLIC_RETURN_PERIOD_DAYS)
      : null,
    deliveryEstimate: process.env.NEXT_PUBLIC_DELIVERY_ESTIMATE || "",
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
