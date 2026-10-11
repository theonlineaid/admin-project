# Nova Commerce — Flagship Commercial Theme & Multi-Vendor E-Commerce Platform

Welcome to **Nova Commerce**, a production-ready, ultra-modern, enterprise-grade E-Commerce Theme and Turnkey SaaS solution built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **PostgreSQL**.

---

## 🌟 Executive Feature Highlights

### 🛍️ Storefront Experience (Conversion-Optimized)
- **5 Interchangeable Homepage Layouts**:
  1. *Showcase*: Dynamic hero slider, deal cards, circular category carousel, and bestsellers.
  2. *Cinematic Banner*: Wide panoramic hero, category tiles, flash deals, and brand strip.
  3. *Minimal Editorial*: Modern typography-first layout, category chips, and 3-column curated grids.
  4. *Marketplace Hub*: Sticky sidebar category tree and scrolling product rails.
  5. *Boutique Collection*: Split hero showcase with dedicated category showcase shelves.
- **5 Interchangeable Header Variants**:
  - Marketplace Giant (Amazon-style with utility bar & search chrome)
  - Vibrant Bazaar (Daraz/AliExpress-style with oversized search & primary bar)
  - Minimal Storefront (Modern DTC indie-style)
  - Auction House Classic (eBay-style with mega-menu dropdown)
  - Handmade Market Clean (Etsy-style with pill search and text actions)
- **5 Interchangeable Footer Variants**:
  - Column Grid, Slim Minimal, Newsletter-first, Mega-category, and Inverted Dark Banded.
- **Slide-Out Mini Cart Drawer**: High-converting side cart with free shipping meter, quantity adjustments, and instant checkout link.
- **Interactive Quick-View Modal**: Instant product inspection without leaving the catalogue.
- **Wishlist & Favorites Engine**: Heart toggle with animated feedback and dedicated `/wishlist` management page.
- **Live Search & Autocomplete**: Instant suggestion dropdown with product thumbnails, live prices, and matching category links.
- **Customer Ratings & 5-Star Reviews**: Customer review submission, verified buyer badges, and star breakdowns.
- **Coupons & Promotional Codes**: Real-time coupon validation (`WELCOME15`, `FLASH20`, `SAVE10`) with percentage/fixed deductions at cart and checkout.
- **Live Order Tracking**: Visual step progress tracker, courier carrier details (FedEx, DHL, UPS), and timestamped activity logs.
- **Top Announcement Bar**: Dismissible promotional announcement ticker.

---

### ⚙️ Enterprise Admin Dashboard
- **Executive Analytics**: Real-time revenue charts, order volume trends, and key performance indicators.
- **Product Management**: Full CRUD, image uploads via Cloudinary, SKU tracking, stock management, promotional badges (HOT, NEW, SALE, BESTSELLER), categories & brands.
- **Order & Invoice Center**: Order lifecycle control, jsPDF invoice generator, courier tracking manager, and timeline logger.
- **Coupons Hub**: Full promotional campaign manager with usage limits, date ranges, and min/max order thresholds.
- **Customer Reviews Moderation**: Approve, reject, or delete customer reviews.
- **Multi-Role Security**:
  - **Admin**: Complete system control across all stores and settings.
  - **Seller**: Dedicated portal to manage own products, orders, and sales stats.
  - **Customer**: Storefront browsing, cart, checkout, wishlist, and order tracking.
- **Site Settings Configurator**: Switch header/footer/homepage variants, customize store title, logo, favicon, topbar lines, currency code/symbol, and promotional banners in one click.
- **Design & Theme Engine**: 6 accent themes (Emerald, Blue, Violet, Rose, Amber, Slate), Dark/Light mode, font scaling (12-22px), 4 typography styles, LTR/RTL support, and compact density.
- **Internationalization (i18n)**: 11 built-in languages (English, Bengali, German, Hindi, Spanish, French, Italian, Arabic with RTL, Chinese, Vietnamese, Filipino).

---

## 🚀 Quick Start Guide

### Option 1: Docker (Recommended)

1. **Clone & Configure Environment**:
   ```bash
   cp .env.example .env
   ```
2. **Start All Containers** (App, PostgreSQL, pgAdmin):
   ```bash
   docker compose up -d --build
   ```
3. **Access Services**:
   - **Storefront & Admin**: [http://localhost:3000](http://localhost:3000)
   - **pgAdmin**: [http://localhost:5050](http://localhost:5050) (User: `admin@admin.com` / Pass: `admin`)

The startup sequence automatically executes Prisma migrations and seeds sample data.

---

### Option 2: Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup PostgreSQL & Environment**:
   Update `DATABASE_URL` in `.env` to point to your PostgreSQL instance.
3. **Run Migrations & Seed Demo Data**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

---

## 🔑 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `admin123` |
| **Seller** | `seller@example.com` | `seller123` |
| **Customer** | `customer@example.com` | `customer123` |

### Sample Coupons (Ready to Test at Checkout)
- `WELCOME15`: 15% discount on orders above $30.
- `FLASH20`: 20% discount on orders above $50.
- `SAVE10`: $10 flat discount on orders above $40.

---

## 📁 Clean Architecture Directory Overview

```
├── app/
│   ├── (storefront)/         # High-converting storefront routes
│   │   ├── cart/             # Dedicated shopping bag page
│   │   ├── checkout/         # Streamlined checkout with coupons
│   │   ├── orders/           # Customer order history & live tracking
│   │   ├── products/         # Product catalog & [slug] detail page
│   │   ├── wishlist/         # Saved items gallery
│   │   └── page.tsx          # 5-variant homepage switcher
│   ├── api/                  # Secure RESTful API endpoints
│   │   ├── coupons/          # Coupons management & validation
│   │   ├── reviews/          # Customer reviews moderation
│   │   ├── storefront/       # Cart, checkout, search & wishlist APIs
│   │   └── site-settings/    # Theme & variant configuration
│   └── dashboard/            # Admin & Seller management suites
├── components/
│   ├── storefront/           # CartDrawer, QuickViewModal, ProductCard, Headers
│   ├── dashboard/            # Sidebar, HeaderDrawer, TrackingCard
│   └── ui/                   # Reusable UI primitives (Button, Table, Dialog)
├── lib/
│   ├── auth.ts               # NextAuth v5 session configuration
│   ├── prisma.ts             # Prisma ORM database client
│   └── storefront.ts         # High-performance storefront data queries
└── prisma/
    ├── schema.prisma         # Complete PostgreSQL schema
    └── seed.ts               # Rich 1-click demo data seeder
```

---

## 🎨 Theme Customization & White-Labeling

To customize the storefront appearance:
1. Log in as **Admin** at [http://localhost:3000/login](http://localhost:3000/login).
2. Navigate to **Site Settings** (`/dashboard/settings`).
3. Select your desired:
   - **Header Layout** (1 to 5)
   - **Homepage Style** (1 to 5)
   - **Footer Layout** (1 to 5)
   - **Store Currency & Symbol**
   - **Free Shipping Threshold**
   - **Store Logo & Favicon**
4. Click **Save Settings** — changes take effect immediately across all visitors!

