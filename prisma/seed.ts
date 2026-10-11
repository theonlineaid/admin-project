import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

const CATEGORIES = [
  {
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      { name: "Audio & Headphones", slug: "audio-headphones" },
      { name: "Computers & Laptops", slug: "laptops" },
      { name: "Smartphones", slug: "smartphones" },
    ],
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Footwear", slug: "footwear" },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      { name: "Lighting & Lamps", slug: "lighting" },
      { name: "Home Decor", slug: "decor" },
      { name: "Kitchen & Dining", slug: "kitchen" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports",
    subcategories: [
      { name: "Fitness & Training", slug: "fitness" },
      { name: "Outdoor Gear", slug: "outdoor" },
    ],
  },
];

const BRANDS = [
  { name: "Sony", slug: "sony" },
  { name: "Apple", slug: "apple" },
  { name: "Nike", slug: "nike" },
  { name: "Nordic Living", slug: "nordic-living" },
  { name: "Logitech", slug: "logitech" },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Users
  const hashedAdmin = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedAdmin, role: "admin" },
    create: {
      name: "Super Administrator",
      email: ADMIN_EMAIL,
      password: hashedAdmin,
      role: "admin",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const hashedSeller = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: { password: hashedSeller, role: "seller" },
    create: {
      name: "Apex Electronics & Gear",
      email: "seller@example.com",
      password: hashedSeller,
      role: "seller",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const hashedCustomer = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { password: hashedCustomer, role: "customer" },
    create: {
      name: "Sarah Jenkins",
      email: "customer@example.com",
      password: hashedCustomer,
      role: "customer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Categories & Subcategories
  const catMap: Record<string, string> = {};
  const subMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, description: `Explore top rated ${cat.name}` },
    });
    catMap[cat.slug] = c.id;

    for (const sub of cat.subcategories) {
      const existing = await prisma.subcategory.findFirst({
        where: { categoryId: c.id, slug: sub.slug },
      });
      if (existing) {
        subMap[sub.slug] = existing.id;
      } else {
        const s = await prisma.subcategory.create({
          data: { name: sub.name, slug: sub.slug, categoryId: c.id },
        });
        subMap[sub.slug] = s.id;
      }
    }
  }

  // 3. Brands
  const brandMap: Record<string, string> = {};
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { name: b.name, slug: b.slug },
    });
    brandMap[b.slug] = brand.id;
  }

  // 4. Products with high quality demo images
  const sampleProducts = [
    {
      name: "Wireless Noise Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description: "Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic clarity. Designed for all-day comfort with memory foam ear cushions.",
      price: 199.99,
      compareAtPrice: 249.99,
      stock: 45,
      sku: "HD-NC-001",
      badge: "HOT",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "electronics",
      subSlug: "audio-headphones",
      brandSlug: "sony",
    },
    {
      name: "Minimalist Mechanical Keyboard",
      slug: "minimalist-mechanical-keyboard",
      description: "Custom mechanical keyboard with quiet tactile switches, sleek aluminum frame, per-key RGB backlighting, and Bluetooth 5.2 multi-device connectivity.",
      price: 129.5,
      compareAtPrice: 159.0,
      stock: 28,
      sku: "KB-MEC-002",
      badge: "NEW",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "electronics",
      subSlug: "laptops",
      brandSlug: "logitech",
    },
    {
      name: "Pro Air Trail Running Shoes",
      slug: "pro-air-trail-running-shoes",
      description: "High-performance trail running shoes with responsive cushioning, breathable mesh upper, and rugged grip outsole engineered for outdoor terrain.",
      price: 139.99,
      compareAtPrice: 179.99,
      stock: 35,
      sku: "FT-RUN-003",
      badge: "SALE",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "sports",
      subSlug: "fitness",
      brandSlug: "nike",
    },
    {
      name: "Nordic Ceramic Table Lamp",
      slug: "nordic-ceramic-table-lamp",
      description: "Artisan-crafted ceramic table lamp with linen shade. Adds warm ambient lighting to bedside tables, living room consoles, or home office desks.",
      price: 79.0,
      compareAtPrice: 99.0,
      stock: 22,
      sku: "HM-LMP-004",
      badge: "BESTSELLER",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "home-living",
      subSlug: "lighting",
      brandSlug: "nordic-living",
    },
    {
      name: "Smart Watch Ultra Pro",
      slug: "smart-watch-ultra-pro",
      description: "Advanced fitness and health tracker with always-on AMOLED display, heart rate monitor, sleep tracking, GPS navigation, and 5 ATM water resistance.",
      price: 249.0,
      compareAtPrice: 299.0,
      stock: 40,
      sku: "SW-ULT-005",
      badge: "HOT",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "electronics",
      subSlug: "smartphones",
      brandSlug: "apple",
    },
    {
      name: "Organic Heavyweight Cotton Hoodie",
      slug: "organic-heavyweight-cotton-hoodie",
      description: "Premium 450 GSM French Terry cotton hoodie with relaxed modern fit, kangaroo front pocket, and double-layered drawstring hood.",
      price: 68.0,
      compareAtPrice: 85.0,
      stock: 60,
      sku: "CL-HD-006",
      badge: null,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
      ],
      catSlug: "fashion",
      subSlug: "mens-clothing",
      brandSlug: "nike",
    },
  ];

  const createdProducts = [];
  for (const p of sampleProducts) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        badge: p.badge,
        isFeatured: p.isFeatured,
        images: p.images,
        status: "active",
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        sku: p.sku,
        badge: p.badge,
        isFeatured: p.isFeatured,
        images: p.images,
        status: "active",
        categoryId: catMap[p.catSlug],
        subcategoryId: subMap[p.subSlug],
        brandId: brandMap[p.brandSlug],
        sellerId: seller.id,
      },
    });
    createdProducts.push(prod);
  }

  // 5. Customer Reviews
  if (createdProducts.length > 0) {
    await prisma.review.upsert({
      where: { id: "seed-review-1" },
      update: {},
      create: {
        id: "seed-review-1",
        productId: createdProducts[0].id,
        userId: customer.id,
        rating: 5,
        title: "Incredible sound quality and comfort!",
        comment: "I wear these 8 hours a day while working. The active noise cancellation completely blocks out street noise and the battery truly lasts all week. Highly recommended!",
        approved: true,
      },
    });

    await prisma.review.upsert({
      where: { id: "seed-review-2" },
      update: {},
      create: {
        id: "seed-review-2",
        productId: createdProducts[1].id,
        userId: customer.id,
        rating: 5,
        title: "Top-tier keyboard for coding",
        comment: "The typing feel is super satisfying and quiet. Works flawlessly on both my Mac and PC with Bluetooth.",
        approved: true,
      },
    });
  }

  // 6. Promotional Discount Coupons
  const coupons = [
    {
      code: "WELCOME15",
      discountType: "percentage",
      discountValue: 15,
      minOrderAmount: 30,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: "FLASH20",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 50,
      usageLimit: 200,
      isActive: true,
    },
    {
      code: "SAVE10",
      discountType: "fixed",
      discountValue: 10,
      minOrderAmount: 40,
      usageLimit: 300,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        usageLimit: c.usageLimit,
        isActive: c.isActive,
      },
      create: {
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        usageLimit: c.usageLimit,
        isActive: c.isActive,
      },
    });
  }

  // 7. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default-settings" },
    update: {
      siteTitle: "Nova Commerce",
      headerVariant: "1",
      footerVariant: "1",
      homeVariant: "1",
      currency: "USD",
      currencySymbol: "$",
      announcementEnabled: true,
      announcementText: "🔥 Exclusive Deal: Get 15% OFF your entire order with code 'WELCOME15'!",
      freeShippingThreshold: 100,
      topbarEnabled: true,
      topbarItems: [
        { id: "1", type: "promotion", value: "Free worldwide shipping on orders over $100" },
        { id: "2", type: "phone", value: "+1 (800) 555-0199" },
      ],
      bannerUrls: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=80",
      ],
    },
    create: {
      id: "default-settings",
      siteTitle: "Nova Commerce",
      headerVariant: "1",
      footerVariant: "1",
      homeVariant: "1",
      currency: "USD",
      currencySymbol: "$",
      announcementEnabled: true,
      announcementText: "🔥 Exclusive Deal: Get 15% OFF your entire order with code 'WELCOME15'!",
      freeShippingThreshold: 100,
      topbarEnabled: true,
      topbarItems: [
        { id: "1", type: "promotion", value: "Free worldwide shipping on orders over $100" },
        { id: "2", type: "phone", value: "+1 (800) 555-0199" },
      ],
      bannerUrls: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=80",
      ],
    },
  });

  // 8. Sample Tracked Order
  const existingOrder = await prisma.order.findFirst({ where: { orderNumber: "ORD-DEMO-9912" } });
  if (!existingOrder && createdProducts.length >= 2) {
    const p1 = createdProducts[0];
    const p2 = createdProducts[1];
    const total = Number(p1.price) + Number(p2.price) - 15;

    const ord = await prisma.order.create({
      data: {
        orderNumber: "ORD-DEMO-9912",
        userId: customer.id,
        totalPrice: total,
        couponCode: "WELCOME15",
        discountAmount: 15,
        carrier: "FedEx Express",
        trackingNumber: "FX-9481948219",
        status: "shipped",
        paymentStatus: "completed",
        shippingAddress: {
          fullName: "Sarah Jenkins",
          phone: "+1 (555) 234-5678",
          street: "742 Evergreen Terrace",
          city: "Springfield",
          zip: "97477",
          country: "United States",
        },
        timeline: [
          { status: "pending", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: "Order placed online" },
          { status: "processing", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: "Payment verified, item packaged" },
          { status: "shipped", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: "Dispatched with FedEx Express" },
        ],
      },
    });

    await prisma.orderItem.createMany({
      data: [
        { orderId: ord.id, productId: p1.id, quantity: 1, price: p1.price },
        { orderId: ord.id, productId: p2.id, quantity: 1, price: p2.price },
      ],
    });
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
