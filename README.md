# ☕ Bangla Cafe and Bar — Artisan Storefront

A modern, high-performance single-restaurant ordering and table reservation web application built on **Next.js 16 (App Router + Turbopack)**, **Tailwind CSS v4**, **Framer Motion**, and the **Brihot / Classytic Commerce Platform** (`@classytic/commerce-client`).

Designed with a warm cafe aesthetic combining soft neumorphic surfaces, atmospheric gradients, smooth animations, and a responsive mobile drawer navigation.

---

## ✨ Highlights & Features

- **🛍️ Headless Commerce Integration**: Powered by `@classytic/commerce-client`. Real-time catalog, collections, product variants (sizes, spice levels), stock tracking, and guest checkouts.
- **🎨 Modern Cafe UI / UX**:
  - Neumorphic cards with rich gradients and warm ambient lighting.
  - Interactive floating micro-animations (coffee beans, leaves, plates) via **Framer Motion**.
  - Left-aligned animated mobile hamburger drawer with table reservation quick-link.
  - Global slide-over **Order Tray** sidebar accessible across all devices.
  - Wide-screen adaptive grid layout (up to `1340px`).
- **📅 Table Reservations**: Dedicated booking system for party sizes, slots, and special requests.
- **⚡ Next.js 16 & Turbopack Ready**:
  - Full Partial Prerendering (PPR) and static route caching.
  - Ultra-fast build times and zero runtime hydration issues.
- **🛒 Dynamic Cart & Checkout**:
  - Client state managed with **Zustand** (with `localStorage` persistence).
  - Multi-attribute variant price calculators in minor currency units (`BDT`).
  - Idempotent guest order dispatch and real-time order tracking.
- **🌱 Automated Catalog Seeder**:
  - Standalone script (`scripts/seed-catalog.mjs`) that pushes categories, collections, and products with images and variants to Brihot backend in seconds.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16.4.6** | React Framework (App Router, Turbopack, PPR) |
| **React 19** | UI components and server actions |
| **Tailwind CSS v4** | Modern utility-first styling |
| **Framer Motion 14** | Smooth transitions, slide-over sheets, floating elements |
| **@classytic/commerce-client** | Brihot Commerce SDK (Storefront & Management) |
| **@classytic/primitives** | Standardized money and currency primitives |
| **Zustand 5** | Lightweight reactive cart and UI drawer store |
| **Vitest 5** | Unit and integration test suite |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** `>= 22.0.0` (Node 22 or 24 recommended)
- **npm** `>= 10.0.0`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/bangla-cafe-and-bar.git
cd bangla-cafe-and-bar

# Install dependencies
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Inside `.env.local`, configure your Brihot connection:
```env
# Brihot Commerce API mount
NEXT_PUBLIC_COMMERCE_API_URL=https://store-api.brihot.com/api/v1

# Your store slug on Brihot
NEXT_PUBLIC_COMMERCE_STORE=plant-world-bd

# Catalog Source: "store" (live API) or "fixtures" (local preview JSON)
NEXT_PUBLIC_CATALOG_SOURCE=store

# Merchant API key (private, required only if you run the catalog seed script)
COMMERCE_MERCHANT_KEY=ak_s_your_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 How to Seed Menu Data to Brihot Backend

If you want to sync your full menu, categories, and collections to your Brihot store:

1. Ensure `COMMERCE_MERCHANT_KEY` and `NEXT_PUBLIC_COMMERCE_STORE` are set in `.env.local`.
2. Run the seed script:
```bash
node scripts/seed-catalog.mjs
```
This automatically reads `src/lib/commerce/fixtures/sample-menu.json` and creates:
- 6 Categories (`Coffee & Drinks`, `Treats & Bakery`, `Starters`, `Mains`, etc.)
- 4 Collections (`Featured`, `Recommended Treats`, `Special Offers`, `Add-ons`)
- 15 Artisan dishes with photos, BDT pricing, and variant options.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Compiles an optimized production build with static/PPR generation |
| `npm start` | Runs the compiled production server |
| `npm run check` | Runs full suite: ESLint + TypeScript typecheck + Vitest tests |
| `npm test` | Runs Vitest unit tests |
| `npm run lint` | Runs Next.js ESLint rules |
| `npm run typecheck` | Validates TypeScript with `tsc --noEmit` |

---

## 📂 Project Architecture

```text
bangla-cafe-and-bar/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (storefront)/         # Home, Menu, Dish details, Cart, Checkout
│   │   ├── reservation/          # Table reservation flow
│   │   ├── order/                # Order status and lookup
│   │   ├── layout.tsx            # Root layout with site header & footer
│   │   └── icon.svg              # Custom cafe brand vector favicon
│   ├── components/               # UI and feature components
│   │   ├── cart/                 # Global order tray & slide-over sidebar
│   │   ├── home/                 # Hero, features, recommended treats, info
│   │   ├── layout/               # Site header, mobile navigation, footer
│   │   ├── menu/                 # Catalog listings and category filters
│   │   └── ui/                   # Buttons, badges, cards, dialogs
│   ├── lib/
│   │   ├── commerce/             # Brihot SDK client, loaders, checkout
│   │   ├── config/               # Store and restaurant configuration
│   │   ├── restaurant/           # Hours, fulfillment and table rules
│   │   └── validation/           # Form schema validators
│   └── stores/                   # Zustand stores (cart, UI state)
├── scripts/
│   └── seed-catalog.mjs          # Direct Brihot backend sync script
├── .env.local                    # Local environment variables
└── README.md
```

---

## 🚢 Publishing to GitHub

To push this project to a new repository on your GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (sensitive keys in .env.local are ignored by .gitignore)
git add .

# 3. Commit changes
git commit -m "feat: complete Bangla Cafe and Bar storefront with Brihot integration"

# 4. Rename default branch to main
git branch -M main

# 5. Link to your new remote GitHub repository
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License
This project is private and proprietary to **Bangla Cafe and Bar**.
