import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

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
  console.log("Admin user:", admin.email, "(password:", ADMIN_PASSWORD + ")");

  const cat = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });
  console.log("Category:", cat.name);

  const brand = await prisma.brand.upsert({
    where: { slug: "acme" },
    update: {},
    create: { name: "Acme", slug: "acme" },
  });
  console.log("Brand:", brand.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
