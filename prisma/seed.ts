import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", subcategories: [{ name: "Phones", slug: "phones" }, { name: "Laptops", slug: "laptops" }] },
  { name: "Clothing", slug: "clothing", subcategories: [{ name: "Men", slug: "men" }, { name: "Women", slug: "women" }] },
  { name: "Home & Garden", slug: "home-garden", subcategories: [{ name: "Furniture", slug: "furniture" }, { name: "Decor", slug: "decor" }] },
  { name: "Sports", slug: "sports", subcategories: [{ name: "Outdoor", slug: "outdoor" }, { name: "Fitness", slug: "fitness" }] },
  { name: "Books", slug: "books", subcategories: [{ name: "Fiction", slug: "fiction" }, { name: "Non-Fiction", slug: "non-fiction" }] },
];

const BRANDS = [
  { name: "Acme", slug: "acme" },
  { name: "TechPro", slug: "techpro" },
  { name: "StyleCo", slug: "styleco" },
  { name: "HomeBase", slug: "homebase" },
  { name: "FitGear", slug: "fitgear" },
];

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashed },
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    },
  });
  console.log("Admin:", admin.email, "/", ADMIN_PASSWORD);

  const sellerPass = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: { password: sellerPass },
    create: {
      name: "Demo Seller",
      email: "seller@example.com",
      password: sellerPass,
      role: "seller",
    },
  });
  console.log("Seller: seller@example.com / seller123");

  const customerPass = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { password: customerPass },
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      password: customerPass,
      role: "customer",
    },
  });
  console.log("Customer: customer@example.com / customer123");

  const categoryIds: string[] = [];
  const subcategoryIds: string[] = [];

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryIds.push(category.id);
    for (const sub of cat.subcategories) {
      let subcategory = await prisma.subcategory.findFirst({
        where: { categoryId: category.id, slug: sub.slug },
      });
      if (!subcategory) {
        subcategory = await prisma.subcategory.create({
          data: { name: sub.name, slug: sub.slug, categoryId: category.id },
        });
      }
      subcategoryIds.push(subcategory.id);
    }
  }
  console.log("Categories:", CATEGORIES.length, "| Subcategories:", subcategoryIds.length);

  const brandIds: string[] = [];
  for (const b of BRANDS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { name: b.name, slug: b.slug },
    });
    brandIds.push(brand.id);
  }
  console.log("Brands:", BRANDS.length);

  const productsData = [
    { name: "Wireless Headphones", slug: "wireless-headphones-seed", price: 89.99, categoryIdx: 0, subcategoryIdx: 0, brandIdx: 0 },
    { name: "Running Shoes", slug: "running-shoes-seed", price: 129.99, categoryIdx: 3, subcategoryIdx: 6, brandIdx: 4 },
    { name: "Cotton T-Shirt", slug: "cotton-tshirt-seed", price: 24.99, categoryIdx: 1, subcategoryIdx: 2, brandIdx: 2 },
    { name: "Desk Lamp", slug: "desk-lamp-seed", price: 45.5, categoryIdx: 2, subcategoryIdx: 4, brandIdx: 3 },
    { name: "Programming Guide", slug: "programming-guide-seed", price: 39.99, categoryIdx: 4, subcategoryIdx: 8, brandIdx: 0 },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        stock: 50,
        status: "active",
        categoryId: categoryIds[p.categoryIdx],
        subcategoryId: subcategoryIds[p.subcategoryIdx] ?? null,
        brandId: brandIds[p.brandIdx],
        sellerId: seller.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: `Quality ${p.name} for everyday use.`,
        price: p.price,
        stock: 50,
        sku: `SKU-${p.slug}`,
        images: [],
        status: "active",
        categoryId: categoryIds[p.categoryIdx],
        subcategoryId: subcategoryIds[p.subcategoryIdx] ?? null,
        brandId: brandIds[p.brandIdx],
        sellerId: seller.id,
      },
    });
  }
  console.log("Products:", productsData.length);

  const productList = await prisma.product.findMany({ where: { slug: { in: productsData.map((p) => p.slug) } }, take: 3 });
  const existingOrder = await prisma.order.findFirst({ where: { orderNumber: "SEED-ORDER-1" } });
  if (productList.length >= 2 && !existingOrder) {
    const order = await prisma.order.create({
      data: {
        orderNumber: "SEED-ORDER-1",
        userId: customer.id,
        totalPrice: productList[0].price.toNumber() * 2 + productList[1].price.toNumber(),
        status: "delivered",
        paymentStatus: "completed",
      },
    });
    await prisma.orderItem.createMany({
      data: [
        { orderId: order.id, productId: productList[0].id, quantity: 2, price: productList[0].price },
        { orderId: order.id, productId: productList[1].id, quantity: 1, price: productList[1].price },
      ],
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalPrice,
        method: "stripe",
        status: "completed",
      },
    });
    console.log("Sample order + payment created");
  }

  console.log("Seed done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
