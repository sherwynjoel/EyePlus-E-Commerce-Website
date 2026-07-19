import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PriceListCode } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "TVs", slug: "tvs" },
  { name: "Panels", slug: "panels" },
  { name: "Kiosks", slug: "kiosks" },
  { name: "Signage", slug: "signage" },
  { name: "Tablets", slug: "tablets" },
  { name: "Laptops", slug: "laptops" },
  { name: "Desktops", slug: "desktops" },
];

const PRICE_LISTS: { code: PriceListCode; name: string; discountPct: number }[] = [
  { code: "RETAIL", name: "Retail", discountPct: 0 },
  { code: "DEALER_BRONZE", name: "Dealer — Bronze", discountPct: 5 },
  { code: "DEALER_SILVER", name: "Dealer — Silver", discountPct: 10 },
  { code: "DEALER_GOLD", name: "Dealer — Gold", discountPct: 15 },
];

const SAMPLE_PRODUCTS: {
  categorySlug: string;
  name: string;
  brand: string;
  basePrice: number;
  sizes: string[];
  color: string;
}[] = [
  { categorySlug: "tvs", name: "Crestline 4K UHD Smart TV", brand: "Crestline", basePrice: 34999, sizes: ["43 inch", "55 inch", "65 inch"], color: "1e3a5f" },
  { categorySlug: "tvs", name: "Crestline QLED Pro TV", brand: "Crestline", basePrice: 54999, sizes: ["55 inch", "65 inch"], color: "1e3a5f" },
  { categorySlug: "panels", name: "Vertex Interactive Flat Panel", brand: "Vertex", basePrice: 89999, sizes: ["65 inch", "75 inch"], color: "3f2e5c" },
  { categorySlug: "kiosks", name: "Vertex Self-Service Kiosk", brand: "Vertex", basePrice: 124999, sizes: ["32 inch"], color: "3f2e5c" },
  { categorySlug: "signage", name: "Vertex Digital Signage Display", brand: "Vertex", basePrice: 45999, sizes: ["43 inch", "55 inch"], color: "3f2e5c" },
  { categorySlug: "tablets", name: "Crestline Tab 11", brand: "Crestline", basePrice: 18999, sizes: ["64GB", "128GB"], color: "1a4d3a" },
  { categorySlug: "laptops", name: "Crestline Book Air 14", brand: "Crestline", basePrice: 52999, sizes: ["256GB", "512GB"], color: "1a4d3a" },
  { categorySlug: "desktops", name: "Vertex Compact Desktop", brand: "Vertex", basePrice: 39999, sizes: ["512GB SSD"], color: "5c3a1e" },
];

function placeholderImageUrl(name: string, color: string): string {
  const text = encodeURIComponent(name);
  return `https://placehold.co/600x600/${color}/f5f5f0?text=${text}&font=roboto`;
}

const PINCODES = [
  { pincode: "641001", city: "Coimbatore", state: "Tamil Nadu", serviceable: true, codAvailable: true, estimatedDays: 2 },
  { pincode: "600001", city: "Chennai", state: "Tamil Nadu", serviceable: true, codAvailable: true, estimatedDays: 3 },
  { pincode: "560001", city: "Bengaluru", state: "Karnataka", serviceable: true, codAvailable: false, estimatedDays: 4 },
  { pincode: "110001", city: "New Delhi", state: "Delhi", serviceable: false, codAvailable: false, estimatedDays: 7 },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding categories...");
  const categoriesBySlug = new Map<string, { id: string }>();
  for (const [index, category] of CATEGORIES.entries()) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, sortOrder: index },
    });
    categoriesBySlug.set(category.slug, created);
  }

  console.log("Seeding price lists...");
  const priceListsByCode = new Map<PriceListCode, { id: string }>();
  for (const priceList of PRICE_LISTS) {
    const created = await prisma.priceList.upsert({
      where: { code: priceList.code },
      update: {},
      create: { code: priceList.code, name: priceList.name },
    });
    priceListsByCode.set(priceList.code, created);
  }

  console.log("Seeding products, variants, prices, and inventory...");
  for (const item of SAMPLE_PRODUCTS) {
    const category = categoriesBySlug.get(item.categorySlug)!;
    const productSlug = slugify(item.name);
    const erpItemCode = `ITEM-${productSlug.toUpperCase()}`;

    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {},
      create: {
        name: item.name,
        slug: productSlug,
        categoryId: category.id,
        brand: item.brand,
        description: `${item.name} — available now with dealer and retail pricing.`,
        specs: { sizes: item.sizes },
        status: "ACTIVE",
        erpItemCode,
      },
    });

    const imageUrl = placeholderImageUrl(item.name, item.color);

    for (const size of item.sizes) {
      const sku = `${erpItemCode}-${slugify(size).toUpperCase()}`;
      const variant = await prisma.productVariant.upsert({
        where: { sku },
        update: { imageUrls: [imageUrl] },
        create: {
          productId: product.id,
          sku,
          attributes: { size },
          erpItemCode: sku,
          imageUrls: [imageUrl],
        },
      });

      const sizeIndex = item.sizes.indexOf(size);
      const mrp = item.basePrice + sizeIndex * 8000;

      for (const priceList of PRICE_LISTS) {
        const priceListRecord = priceListsByCode.get(priceList.code)!;
        const sellingPrice = Math.round((mrp * (1 - priceList.discountPct / 100)) / 10) * 10;

        const existingPrice = await prisma.price.findFirst({
          where: { variantId: variant.id, priceListId: priceListRecord.id },
        });
        if (!existingPrice) {
          await prisma.price.create({
            data: {
              variantId: variant.id,
              priceListId: priceListRecord.id,
              mrp,
              sellingPrice,
            },
          });
        }
      }

      await prisma.inventory.upsert({
        where: { variantId_warehouseCode: { variantId: variant.id, warehouseCode: "MAIN" } },
        update: {},
        create: {
          variantId: variant.id,
          warehouseCode: "MAIN",
          quantityOnHand: 50,
          quantityReserved: 0,
        },
      });
    }
  }

  console.log("Seeding pincode serviceability...");
  for (const pincode of PINCODES) {
    await prisma.pincodeServiceability.upsert({
      where: { pincode: pincode.pincode },
      update: {},
      create: pincode,
    });
  }

  console.log("Seeding one user per role...");
  const customer = await prisma.user.upsert({
    where: { phone: "+919000000001" },
    update: {},
    create: { phone: "+919000000001", name: "Asha Kumar", role: "CUSTOMER", locale: "en" },
  });
  await prisma.customerProfile.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  const dealerUser = await prisma.user.upsert({
    where: { phone: "+919000000002" },
    update: {},
    create: { phone: "+919000000002", name: "Ravi Traders", role: "DEALER", locale: "en" },
  });
  await prisma.dealerProfile.upsert({
    where: { userId: dealerUser.id },
    update: {},
    create: {
      userId: dealerUser.id,
      businessName: "Ravi Electronics Traders",
      gstNumber: "33ABCDE1234F1Z5",
      dealerCode: "DLR-SEED01",
      tier: "SILVER",
      approvalStatus: "APPROVED",
    },
  });

  const pendingDealerUser = await prisma.user.upsert({
    where: { phone: "+919000000003" },
    update: {},
    create: { phone: "+919000000003", name: "New Applicant Traders", role: "DEALER", locale: "en" },
  });
  await prisma.dealerProfile.upsert({
    where: { userId: pendingDealerUser.id },
    update: {},
    create: {
      userId: pendingDealerUser.id,
      businessName: "New Applicant Electronics",
      dealerCode: "DLR-SEED02",
      tier: "BRONZE",
      approvalStatus: "PENDING",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { phone: "+919000000004" },
    update: {},
    create: { phone: "+919000000004", name: "Priya Admin", role: "ADMIN", locale: "en" },
  });
  await prisma.staffProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, department: "Operations", permissions: { all: true } },
  });

  const staffUser = await prisma.user.upsert({
    where: { phone: "+919000000005" },
    update: {},
    create: { phone: "+919000000005", name: "Karthik Staff", role: "STAFF", locale: "en" },
  });
  await prisma.staffProfile.upsert({
    where: { userId: staffUser.id },
    update: {},
    create: { userId: staffUser.id, department: "Support", permissions: { orders: true, delivery: true } },
  });

  console.log("Seed complete:");
  console.log("  Customer : +919000000001");
  console.log("  Dealer   : +919000000002 (approved, silver tier)");
  console.log("  Dealer   : +919000000003 (pending approval)");
  console.log("  Admin    : +919000000004");
  console.log("  Staff    : +919000000005");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
