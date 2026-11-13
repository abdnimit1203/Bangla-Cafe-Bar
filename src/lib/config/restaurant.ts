/**
 * Restaurant site configuration: the ONLY place branding lives.
 *
 * "Bangla Cafe and Bar" is a temporary placeholder name. Name, logo, tagline,
 * copy, contact details, hours and feature flags are all read from here by
 * components; nothing is hardcoded elsewhere. Products, prices, stock, orders
 * and reservations always come from the Brihot API (or labelled fixtures in
 * preview mode), never from this file.
 */

export interface DayHours {
  /** "HH:mm" 24h local time */
  open: string;
  close: string;
}

export interface RestaurantAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
}

export interface ReservationServiceRule {
  /** Booking service slug in the store catalog (productType: service). */
  slug: string;
  minGuests: number;
  maxGuests: number;
}

export interface BrandImage {
  /** Public path (e.g. /brand/hero.jpg) or https URL on an allowed host. */
  src: string;
  alt: string;
}

const address: RestaurantAddress = {
  line1: "House 12, Road 45, Gulshan 2",
  city: "Dhaka",
  state: "Dhaka",
  postalCode: "1212",
  country: "BD",
};

const reservationServices: ReservationServiceRule[] = [
  { slug: "table-for-2", minGuests: 1, maxGuests: 2 },
  { slug: "table-for-4", minGuests: 3, maxGuests: 4 },
  { slug: "table-for-6", minGuests: 5, maxGuests: 6 },
  { slug: "table-for-8", minGuests: 7, maxGuests: 8 },
];

/** 0 = Sunday ... 6 = Saturday. `null` means closed that day. */
const hours: Record<number, DayHours | null> = {
  0: { open: "11:00", close: "23:00" },
  1: { open: "11:00", close: "23:00" },
  2: { open: "11:00", close: "23:00" },
  3: { open: "11:00", close: "23:00" },
  4: { open: "11:00", close: "23:30" },
  5: { open: "12:00", close: "23:30" },
  6: { open: "11:00", close: "23:30" },
};

export const restaurantConfig = {
  /** PLACEHOLDER brand. Replace the whole `brand` block when the final name and assets arrive. */
  name: "Bangla Cafe and Bar",
  shortName: "Bangla",
  descriptor: "Cafe & Bar",
  tagline: "Gulshan 2, Dhaka",
  logo: {
    /** Set `imageSrc` to a file in /public/brand to replace the icon mark. */
    imageSrc: null as string | null,
    icon: "crown" as const,
    alt: "Bangla Cafe and Bar",
  },
  hero: {
    eyebrow: "Gulshan 2, Dhaka • Premium Coffee & Kitchen",
    heading: "Good Coffee Brings Better Days",
    accent: "Better Days",
    description:
      "At Bangla Cafe & Bar, we serve more than just coffee — we serve moments. Fresh roasts, cozy vibes, handcrafted bakery treats, and slow-cooked Bengali kitchen favorites.",
    /** Large hero photograph. */
    image: {
      src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
      alt: "Freshly poured artisanal latte art on wooden board with coffee beans",
    } as BrandImage,
  },
  features: [
    { icon: "coffee" as const, title: "Premium Roasts", description: "Single-origin beans roasted weekly in small batches." },
    { icon: "leaf" as const, title: "Fresh Daily", description: "Seasonal river fish, produce & dairy sourced every morning." },
    { icon: "flame" as const, title: "Charcoal Grill", description: "Handcrafted skewers and slow bhunas over open coals." },
    { icon: "heart" as const, title: "Cozy Space", description: "Warm atmosphere, quiet nooks, and welcoming staff." },
  ],
  about: {
    eyebrow: "Our Story",
    heading: "More Than Coffee, It's a Lifestyle",
    description:
      "Bangla Cafe & Bar was born from a simple idea — that great coffee and soulful Bengali cooking can make everyday moments feel special. We bring together single-origin brews, fresh bakes, and family heritage recipes in a space that feels like home.",
    /** Story photograph. */
    image: {
      src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
      alt: "Cozy artisanal coffee and warm cafe lifestyle at Bangla Cafe & Bar",
    } as BrandImage,
    highlights: [
      {
        title: "Artisan Coffee & Roasting",
        description: "Ethically sourced beans, dialed espresso shots, and 18-hour slow cold brews.",
      },
      {
        title: "Bengali Heritage Flavours",
        description: "Authentic slow-cooked beef bhuna, dum kacchi biryani, and roasted spices.",
      },
      {
        title: "Handcrafted Daily Bakery",
        description: "Flaky almond croissants, berry cheesecakes, and artisanal cookies baked every dawn.",
      },
      {
        title: "A Cozy Space in Gulshan",
        description: "Sunlit corners, warm greenery, and friendly baristas who know your name.",
      },
    ],
  },
  address,
  phone: "+880 1XXX-XXXXXX",
  /** tel: href derived from phone; keep digits only. */
  phoneHref: "tel:+8801XXXXXXXXX",
  email: "hello@example.com",
  hours,
  search: {
    placeholder: "Search the menu...",
  },
  /** Prefix for browser storage keys (cart, order access). */
  storagePrefix: "restaurant",
  fulfillment: {
    delivery: {
      enabled: true,
      /** Destination country sent with quotes/checkout. */
      country: "BD",
      estimate: "35-50 min",
    },
    /**
     * DISABLED: the Brihot guest checkout has no fulfillment-mode field, so
     * pickup orders would be stored as shipments and charged delivery.
     * See docs/adr/0003. Flip only after the backend adds `fulfillment`.
     */
    pickup: {
      enabled: false,
      leadMinutes: 20,
      intervalMinutes: 15,
      maxSlots: 24,
    },
    /** DISABLED for the same reason as pickup. See docs/adr/0003. */
    dineIn: {
      enabled: false,
      /** When true the table number is mandatory at checkout. */
      requireTable: false,
    },
  },
  reservation: {
    /**
     * DISABLED until party-size validation and booking safety are confirmed
     * on the real store (docs/adr/0004). The page shows a call-to-reserve state.
     */
    enabled: false,
    services: reservationServices,
    maxGuests: 8,
    daysAhead: 14,
  },
  catalog: {
    tags: {
      veg: "veg",
      nonVeg: "non-veg",
      spicy: "spicy",
      chefsPick: "chefs-pick",
    },
    featuredCollection: "featured",
    addOnsCollection: "add-ons",
    menuPageSize: 24,
  },
  locale: "en-BD",
};

export type RestaurantConfig = typeof restaurantConfig;
