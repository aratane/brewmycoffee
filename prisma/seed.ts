import { PrismaClient, type RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const CATEGORIES = [
  { name: "Signature Coffee", slug: "signature-coffee", icon: "sparkles", description: "House favorites crafted with a little bunny magic.", imageUrl: img("photo-1509042239860-f550ce710b93") },
  { name: "Espresso", slug: "espresso", icon: "coffee", description: "Bold, concentrated, and unapologetically delicious.", imageUrl: img("photo-1511920170033-f8396924c348") },
  { name: "Latte", slug: "latte", icon: "milk", description: "Silky milk meets our signature espresso.", imageUrl: img("photo-1517701604599-bb29b565090c") },
  { name: "Cappuccino", slug: "cappuccino", icon: "cloud", description: "A cloud of foam over rich espresso.", imageUrl: img("photo-1498804103079-a6351b050096") },
  { name: "Matcha", slug: "matcha", icon: "leaf", description: "Ceremonial grade matcha, whisked to perfection.", imageUrl: img("photo-1515823064-d6e0c04616a7") },
  { name: "Chocolate", slug: "chocolate", icon: "cocoa", description: "Decadent cocoa for the sweet tooth.", imageUrl: img("photo-1563805042-7684c019e1cb") },
  { name: "Non-Coffee", slug: "non-coffee", icon: "cup", description: "All the cozy, none of the caffeine.", imageUrl: img("photo-1544787219-7f47ccb76574") },
  { name: "Tea", slug: "tea", icon: "teapot", description: "Carefully sourced leaves, steeped with care.", imageUrl: img("photo-1544787219-7f47ccb76574") },
  { name: "Pastries", slug: "pastries", icon: "croissant", description: "Flaky, buttery, baked fresh every morning.", imageUrl: img("photo-1555507036-ab1f4038808a") },
  { name: "Desserts", slug: "desserts", icon: "cake", description: "Little treats for a happy ending.", imageUrl: img("photo-1488477181946-6428a0291777") },
];

type P = {
  name: string; slug: string; desc: string; price: number; cat: string; sku: string;
  img: string; featured?: boolean; grad?: string; time?: number; cal?: number;
};

const PRODUCTS: P[] = [
  { name: "Bunny Signature Latte", slug: "bunny-signature-latte", desc: "Our Signature latte with velvety milk, a double espresso, and a swirl of caramel. Topped with bunny foam art!", price: 38000, cat: "signature-coffee", sku: "SIG-001", img: img("photo-1517701604599-bb29b565090c"), featured: true, grad: "from-amber-300 to-orange-500", cal: 210 },
  { name: "Honey Cloud Cold Brew", slug: "honey-cloud-cold-brew", desc: "18-hour cold brew, honey, and a cloud of vanilla cream. Smooth, sweet, and totally dreamy.", price: 42000, cat: "signature-coffee", sku: "SIG-002", img: img("photo-1461023058943-07fcbe16d735"), featured: true, grad: "from-stone-400 to-amber-700", cal: 180 },
  { name: "Caramel Bunny Macchiato", slug: "caramel-bunny-macchiato", desc: "Espresso marked with caramel milk foam and a drizzle of sea-salt caramel.", price: 40000, cat: "signature-coffee", sku: "SIG-003", img: img("photo-1514432324607-a09d9b4aefdd"), featured: true, grad: "from-orange-300 to-amber-600" },
  { name: "Classic Espresso", slug: "classic-espresso", desc: "A rich, full-bodied shot with notes of chocolate and toasted nuts. Pulled to perfection.", price: 24000, cat: "espresso", sku: "ESP-001", img: img("photo-1511920170033-f8396924c348"), featured: true, grad: "from-amber-600 to-stone-800", time: 3, cal: 5 },
  { name: "Double Shot", slug: "double-shot", desc: "Two shots for when you need a little extra hop in your step.", price: 30000, cat: "espresso", sku: "ESP-002", img: img("photo-1495474472287-4d71bcdd2085"), grad: "from-amber-700 to-stone-900", time: 3, cal: 10 },
  { name: "Americano", slug: "americano", desc: "Espresso lengthened with hot water for a clean, bold cup.", price: 26000, cat: "espresso", sku: "ESP-003", img: img("photo-1509042239860-f550ce710b93"), grad: "from-stone-500 to-amber-800", cal: 10 },
  { name: "Café Latte", slug: "cafe-latte", desc: "Espresso with steamed milk and a light layer of foam. Simple, comforting, perfect.", price: 34000, cat: "latte", sku: "LAT-001", img: img("photo-1517701604599-bb29b565090c"), featured: true, grad: "from-amber-200 to-amber-500", cal: 190 },
  { name: "Vanilla Bean Latte", slug: "vanilla-bean-latte", desc: "Smooth latte with real Madagascar vanilla bean. Sweet but never overpowering.", price: 37000, cat: "latte", sku: "LAT-002", img: img("photo-1570968915860-54d5c301fa9f"), grad: "from-yellow-100 to-amber-400" },
  { name: "Hazelnut Latte", slug: "hazelnut-latte", desc: "Toasted hazelnut syrup swirled into our creamy latte.", price: 38000, cat: "latte", sku: "LAT-003", img: img("photo-1541167760496-1628856ab772"), grad: "from-orange-200 to-amber-600" },
  { name: "Classic Cappuccino", slug: "classic-cappuccino", desc: "Equal parts espresso, steamed milk, and airy foam with a dusting of cocoa.", price: 34000, cat: "cappuccino", sku: "CAP-001", img: img("photo-1498804103079-a6351b050096"), featured: true, grad: "from-amber-200 to-stone-500", cal: 160 },
  { name: "Cinnamon Dream Cappuccino", slug: "cinnamon-dream-cappuccino", desc: "Cappuccino with warm cinnamon and a dollop of whipped cream.", price: 39000, cat: "cappuccino", sku: "CAP-002", img: img("photo-1514432324607-a09d9b4aefdd"), grad: "from-orange-200 to-amber-600" },
  { name: "Ceremonial Matcha Latte", slug: "ceremonial-matcha-latte", desc: "Stone-ground ceremonial matcha whisked with silky steamed milk.", price: 42000, cat: "matcha", sku: "MAT-001", img: img("photo-1515823064-d6e0c04616a7"), featured: true, grad: "from-lime-300 to-emerald-600", cal: 170 },
  { name: "Iced Matcha Cloud", slug: "iced-matcha-cloud", desc: "Iced matcha layered with oat milk and a matcha cream cap.", price: 45000, cat: "matcha", sku: "MAT-002", img: img("photo-1536256263959-770b48d82b0a"), grad: "from-emerald-200 to-green-600" },
  { name: "Matcha Espresso Fusion", slug: "matcha-espresso-fusion", desc: "The best of both worlds — matcha, milk, and a floating espresso shot.", price: 48000, cat: "matcha", sku: "MAT-003", img: img("photo-1570968915860-54d5c301fa9f"), grad: "from-lime-300 to-amber-700" },
  { name: "Signature Hot Chocolate", slug: "signature-hot-chocolate", desc: "Rich Belgian chocolate melted into steamed milk. Like a warm hug in a cup.", price: 38000, cat: "chocolate", sku: "CHO-001", img: img("photo-1563805042-7684c019e1cb"), featured: true, grad: "from-amber-700 to-stone-900", cal: 320 },
  { name: "Bunny Mocha", slug: "bunny-mocha", desc: "Chocolate and espresso with whipped cream and chocolate ears on top.", price: 42000, cat: "chocolate", sku: "CHO-002", img: img("photo-1541167760496-1628856ab772"), grad: "from-amber-500 to-stone-800" },
  { name: "Iced Chocolate", slug: "iced-chocolate", desc: "Chocolate, milk, and ice — a classic done right.", price: 40000, cat: "chocolate", sku: "CHO-003", img: img("photo-1517701550927-30cf4ba1dba5"), grad: "from-amber-400 to-stone-700" },
  { name: "Vanilla Steam", slug: "vanilla-steam", desc: "Steamed milk with vanilla and a touch of honey. Caffeine-free coziness.", price: 30000, cat: "non-coffee", sku: "NON-001", img: img("photo-1544787219-7f47ccb76574"), grad: "from-yellow-100 to-orange-300" },
  { name: "Strawberry Milk", slug: "strawberry-milk", desc: "Creamy strawberry milk with real fruit puree. Kid-friendly and nostalgic.", price: 32000, cat: "non-coffee", sku: "NON-002", img: img("photo-1551024506-0bccd828d307"), grad: "from-pink-300 to-rose-500" },
  { name: "Earl Grey Tea Latte", slug: "earl-grey-tea-latte", desc: "Bergamot-scented Earl Grey with steamed milk.", price: 34000, cat: "tea", sku: "TEA-001", img: img("photo-1544787219-7f47ccb76574"), grad: "from-amber-300 to-stone-500" },
  { name: "English Breakfast", slug: "english-breakfast", desc: "A robust, malty black tea brewed to order.", price: 26000, cat: "tea", sku: "TEA-002", img: img("photo-1594631252845-29fc4cc8cde9"), grad: "from-amber-600 to-stone-700" },
  { name: "Butter Croissant", slug: "butter-croissant", desc: "Flaky, golden, and baked fresh every morning. The perfect coffee companion.", price: 28000, cat: "pastries", sku: "PAS-001", img: img("photo-1555507036-ab1f4038808a"), featured: true, grad: "from-yellow-200 to-amber-500", time: 2, cal: 270 },
  { name: "Almond Croissant", slug: "almond-croissant", desc: "Twice-baked croissant filled with almond cream and topped with sliced almonds.", price: 34000, cat: "pastries", sku: "PAS-002", img: img("photo-1555507036-ab1f4038808a"), grad: "from-amber-200 to-orange-500", cal: 340 },
  { name: "Cinnamon Roll", slug: "cinnamon-roll", desc: "Soft, gooey roll with cinnamon swirls and cream cheese frosting.", price: 32000, cat: "pastries", sku: "PAS-003", img: img("photo-1509365465985-25d11c17e812"), grad: "from-orange-200 to-amber-600" },
  { name: "Glazed Donut", slug: "glazed-donut", desc: "Classic ring donut with a sweet vanilla glaze and sprinkles.", price: 26000, cat: "desserts", sku: "DES-001", img: img("photo-1551024506-0bccd828d307"), grad: "from-pink-200 to-rose-400", cal: 250 },
  { name: "Chocolate Brownie", slug: "chocolate-brownie", desc: "Fudgy, decadent brownie with a hint of sea salt.", price: 30000, cat: "desserts", sku: "DES-002", img: img("photo-1606313564200-e75d5e30476c"), grad: "from-amber-700 to-stone-900", cal: 380 },
  { name: "Bunny Cheesecake", slug: "bunny-cheesecake", desc: "Creamy cheesecake with a bunny-shaped cookie on top. Almost too cute to eat!", price: 38000, cat: "desserts", sku: "DES-003", img: img("photo-1488477181946-6428a0291777"), featured: true, grad: "from-pink-200 to-amber-300", cal: 410 },
];

const INGREDIENTS = [
  { name: "Arabica Coffee Beans", unit: "g", sku: "ING-BEAN", cost: 0.45, stock: 12000, min: 3000, supplier: "Java Coffee Co." },
  { name: "Whole Milk", unit: "ml", sku: "ING-MILK", cost: 0.02, stock: 40000, min: 10000, supplier: "Fresh Farm" },
  { name: "Oat Milk", unit: "ml", sku: "ING-OAT", cost: 0.035, stock: 15000, min: 5000, supplier: "Fresh Farm" },
  { name: "Matcha Powder", unit: "g", sku: "ING-MATCHA", cost: 1.2, stock: 3000, min: 800, supplier: "Uji Tea" },
  { name: "Chocolate Paste", unit: "g", sku: "ING-CHOC", cost: 0.18, stock: 8000, min: 2000, supplier: "Belgian Cocoa" },
  { name: "Caramel Syrup", unit: "ml", sku: "ING-CARAMEL", cost: 0.08, stock: 6000, min: 1500, supplier: "Sweet Supply" },
  { name: "Vanilla Syrup", unit: "ml", sku: "ING-VANILLA", cost: 0.07, stock: 6000, min: 1500, supplier: "Sweet Supply" },
  { name: "Sugar", unit: "g", sku: "ING-SUGAR", cost: 0.01, stock: 20000, min: 5000, supplier: "Local" },
  { name: "Tea Leaves", unit: "g", sku: "ING-TEA", cost: 0.15, stock: 4000, min: 1000, supplier: "Uji Tea" },
  { name: "Croissant Dough", unit: "pcs", sku: "ING-CROISSANT", cost: 9, stock: 180, min: 60, supplier: "Daily Bakery" },
  { name: "Donut", unit: "pcs", sku: "ING-DONUT", cost: 8, stock: 150, min: 50, supplier: "Daily Bakery" },
  { name: "Cup 12oz", unit: "pcs", sku: "ING-CUP", cost: 1.5, stock: 800, min: 200, supplier: "Packaging Co." },
];

async function main() {
  console.log("🌱 Seeding Artisan Brew Co....");

  const roleNames: RoleName[] = ["SUPER_ADMIN", "ADMIN", "CASHIER", "BARISTA", "CUSTOMER"];
  const roleMap = {} as Record<RoleName, string>;
  for (const name of roleNames) {
    const label = name.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name, label } });
    roleMap[name] = role.id;
  }

  const passwordHash = await bcrypt.hash("password123", 12);
  const users = [
    { email: "owner@artisanbrew.co", name: "Avery Brewster", phone: "081200000001", role: "SUPER_ADMIN" as const, position: "Owner", code: "EMP-001" },
    { email: "admin@artisanbrew.co", name: "Jordan Bean", phone: "081200000002", role: "ADMIN" as const, position: "Store Manager", code: "EMP-002" },
    { email: "cashier@artisanbrew.co", name: "Casey Pour", phone: "081200000003", role: "CASHIER" as const, position: "Cashier", code: "EMP-003" },
    { email: "barista@artisanbrew.co", name: "Blake Steam", phone: "081200000004", role: "BARISTA" as const, position: "Head Barista", code: "EMP-004" },
  ];

  const employeeIds = {} as Record<string, string>;
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name },
      create: { email: u.email, name: u.name, phone: u.phone, passwordHash, roleId: roleMap[u.role], emailVerified: new Date() },
    });
    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, position: u.position, cashierCode: u.code, branch: "Main" },
    });
    employeeIds[u.role] = emp.id;
  }

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash },
    create: { email: "customer@example.com", name: "Cindy Coffee", phone: "081299999999", passwordHash, roleId: roleMap.CUSTOMER, emailVerified: new Date() },
  });
  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: { userId: customerUser.id, name: "Cindy Coffee", email: customerUser.email, phone: customerUser.phone },
  });
  await prisma.loyaltyPoint.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id, points: 340, lifetimePoints: 1240, tier: "Coffee Lover" },
  });

  const categoryMap = {} as Record<string, string>;
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: { ...c }, create: c });
    categoryMap[c.slug] = row.id;
  }

  const addonNames = [
    { name: "Extra Espresso Shot", price: 8000 },
    { name: "Extra Milk", price: 5000 },
    { name: "Whipped Cream", price: 6000 },
    { name: "Caramel Drizzle", price: 5000 },
    { name: "Vanilla Syrup", price: 5000 },
    { name: "Oat Milk Swap", price: 7000 },
  ];

  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, description: p.desc, price: p.price, imageUrl: p.img,
        categoryId: categoryMap[p.cat], isFeatured: p.featured ?? false,
        gradient: p.grad ?? "from-caramel to-mocha", preparationTime: p.time ?? 5,
        calories: p.cal, sku: p.sku,
      },
      create: {
        name: p.name, slug: p.slug, description: p.desc, price: p.price,
        imageUrl: p.img, categoryId: categoryMap[p.cat], sku: p.sku,
        isFeatured: p.featured ?? false, gradient: p.grad ?? "from-caramel to-mocha",
        preparationTime: p.time ?? 5, calories: p.cal,
      },
    });

    const isDrink = !["pastries", "desserts"].includes(p.cat);
    if (isDrink) {
      for (const size of ["SMALL", "MEDIUM", "LARGE"] as const) {
        const adjustment = size === "SMALL" ? -4000 : size === "LARGE" ? 6000 : 0;
        await prisma.productVariant.upsert({
          where: { productId_name: { productId: product.id, name: size } },
          update: { size, priceAdjustment: adjustment },
          create: { productId: product.id, name: size, size, priceAdjustment: adjustment, sku: `${p.sku}-${size}` },
        });
      }
      for (const temp of ["HOT", "ICED"] as const) {
        await prisma.productVariant.upsert({
          where: { productId_name: { productId: product.id, name: temp } },
          update: { temperature: temp },
          create: { productId: product.id, name: temp, temperature: temp },
        });
      }
      for (const a of addonNames) {
        await prisma.productAddon.upsert({
          where: { productId_name: { productId: product.id, name: a.name } },
          update: { price: a.price },
          create: { productId: product.id, name: a.name, price: a.price },
        });
      }
    }
  }

  const ingredientMap = {} as Record<string, string>;
  for (const i of INGREDIENTS) {
    const ing = await prisma.ingredient.upsert({
      where: { sku: i.sku }, update: { name: i.name, unit: i.unit, costPerUnit: i.cost, supplier: i.supplier },
      create: { name: i.name, unit: i.unit, sku: i.sku, costPerUnit: i.cost, supplier: i.supplier },
    });
    ingredientMap[i.sku] = ing.id;
    await prisma.inventory.upsert({
      where: { ingredientId: ing.id },
      update: { minimumLevel: i.min, unitCost: i.cost },
      create: { ingredientId: ing.id, quantity: i.stock, minimumLevel: i.min, unitCost: i.cost },
    });
  }

  const recipes: Array<[string, string, number]> = [
    ["bunny-signature-latte", "ING-BEAN", 18], ["bunny-signature-latte", "ING-MILK", 220], ["bunny-signature-latte", "ING-CARAMEL", 15], ["bunny-signature-latte", "ING-CUP", 1],
    ["classic-espresso", "ING-BEAN", 18], ["classic-espresso", "ING-CUP", 1],
    ["ceremonial-matcha-latte", "ING-MATCHA", 8], ["ceremonial-matcha-latte", "ING-MILK", 220], ["ceremonial-matcha-latte", "ING-CUP", 1],
    ["signature-hot-chocolate", "ING-CHOC", 35], ["signature-hot-chocolate", "ING-MILK", 200], ["signature-hot-chocolate", "ING-CUP", 1],
    ["butter-croissant", "ING-CROISSANT", 1],
    ["glazed-donut", "ING-DONUT", 1],
  ];
  for (const [slug, sku, qty] of recipes) {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug } });
    await prisma.recipe.upsert({
      where: { productId_ingredientId: { productId: product.id, ingredientId: ingredientMap[sku] } },
      update: { quantity: qty },
      create: { productId: product.id, ingredientId: ingredientMap[sku], quantity: qty },
    });
  }

  for (let n = 1; n <= 12; n++) {
    await prisma.table.upsert({
      where: { number: String(n).padStart(2, "0") },
      update: {},
      create: { number: String(n).padStart(2, "0"), seats: n % 3 === 0 ? 4 : 2, qrToken: `table-${n}-artisan` },
    });
  }

  for (const v of [
    { code: "HAPPY10", type: "PERCENT" as const, value: 10, minOrder: 50000, maxDiscount: 25000, usageLimit: 500 },
    { code: "BUNNY15", type: "PERCENT" as const, value: 15, minOrder: 80000, maxDiscount: 40000, usageLimit: 200 },
    { code: "WELCOME20", type: "FIXED" as const, value: 20000, minOrder: 100000, usageLimit: 100 },
  ]) {
    await prisma.voucher.upsert({ where: { code: v.code }, update: { ...v }, create: v });
  }

  const settings: Array<[string, unknown, string]> = [
    ["store_name", { value: "Artisan Brew Co." }, "Store display name"],
    ["store_address", { value: "Jl. Kopi Sensor No. 12, Jakarta Selatan" }, "Store address"],
    ["store_phone", { value: "+62 812-3456-7890" }, "Store phone"],
    ["store_email", { value: "hello@artisanbrew.co" }, "Store email"],
    ["opening_hours", { value: "Mon–Sun · 07.00–22.00" }, "Opening hours"],
    ["tax_rate", { value: 10 }, "Tax percentage"],
    ["bank_account_bca", { value: "8808123456789" }, "BCA static account"],
    ["bank_account_bni", { value: "8808123456789" }, "BNI static account"],
    ["bank_account_bri", { value: "8808123456789" }, "BRI static account"],
    ["bank_account_mandiri", { value: "8808123456789" }, "Mandiri static account"],
    ["bank_account_permata", { value: "8808123456789" }, "Permata static account"],
    ["bank_account_name", { value: "ARTISAN BREW CO." }, "Bank account holder"],
  ];
  for (const [key, value, description] of settings) {
    await prisma.storeSetting.upsert({ where: { key }, update: { value: value as never, description }, create: { key, value: value as never, description } });
  }

  for (const r of [
    { product: "bunny-signature-latte", rating: 5, comment: "Absolutely adorable and delicious! The bunny foam art made my day." },
    { product: "ceremonial-matcha-latte", rating: 5, comment: "Best matcha in town, hands down." },
    { product: "butter-croissant", rating: 4, comment: "Flaky and buttery — perfect with a latte." },
  ]) {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: r.product } });
    const exists = await prisma.review.count({ where: { productId: product.id, comment: r.comment } });
    if (!exists) await prisma.review.create({ data: { productId: product.id, rating: r.rating, comment: r.comment, customerId: customer.id, isApproved: true } });
  }

  // Historical orders so admin analytics reflect real queries.
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const products = await prisma.product.findMany({ take: 8 });
    let seq = 1;
    for (let day = 29; day >= 0; day--) {
      const perDay = 2 + Math.floor(Math.random() * 4);
      for (let k = 0; k < perDay; k++) {
        const d = new Date();
        d.setDate(d.getDate() - day);
        d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
        const chosen = products[Math.floor(Math.random() * products.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        const subtotal = Number(chosen.price) * qty;
        const tax = Math.round(subtotal * 0.1);
        const total = subtotal + tax;
        const orderNumber = `ABC-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(seq++).padStart(6, "0")}`;
        const order = await prisma.order.create({
          data: {
            orderNumber,
            source: Math.random() > 0.4 ? "POS" : "ONLINE",
            type: ["DINE_IN", "TAKEAWAY", "DELIVERY"][Math.floor(Math.random() * 3)] as "DINE_IN",
            status: "COMPLETED",
            customerName: ["Walk-in Guest", "Cindy Coffee", "Rani Sari", "Dimas Ayu"][Math.floor(Math.random() * 4)],
            customerId: customer.id,
            subtotal, tax, total,
            createdAt: d, updatedAt: d,
            items: {
              create: [{
                productId: chosen.id, nameSnapshot: chosen.name, unitPrice: chosen.price, quantity: qty,
                size: "MEDIUM", temperature: "HOT", lineTotal: subtotal,
              }],
            },
            payments: {
              create: { method: ["QRIS", "CASH", "BANK_TRANSFER"][Math.floor(Math.random() * 3)] as "QRIS", status: "PAID", amount: total, paidAt: d },
            },
          },
        });
        await prisma.transaction.create({
          data: {
            transactionNumber: `TRX-${orderNumber.split("-")[2]}`,
            orderId: order.id,
            cashierId: employeeIds.CASHIER,
            type: order.source,
            subtotal, tax, total,
            paymentMethod: "QRIS",
            paymentStatus: "PAID",
            status: "COMPLETED",
            createdAt: d,
          },
        });
      }
    }
    await prisma.product.updateMany({ data: { soldCount: 0 } });
    const sold = await prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true } });
    for (const s of sold) if (s.productId) await prisma.product.update({ where: { id: s.productId }, data: { soldCount: s._sum.quantity ?? 0 } });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
