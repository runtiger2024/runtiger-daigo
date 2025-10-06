const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("開始播種 (Seeding)...");

  // 1. 建立第一筆網站設定
  // upsert = update or insert (如果找不到就新增，如果找到了就更新)
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      reminderItems:
        '["<strong>關於價格：</strong>...", "<strong>關於運費：</strong>...", "<strong>關於出貨：</strong>..."]',
      socialLinks: { facebook: "", instagram: "", line: "" },
      promoPopup: {
        enabled: false,
        title: "",
        content: "",
        buttonText: "",
        buttonLink: "",
      },
    },
  });
  console.log("網站設定已建立。");

  // 2. 建立一個預設的管理員帳號
  const hashedPassword = await bcrypt.hash("12345", 10); // 將密碼 '12345' 加密
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hashedPassword,
    },
  });
  console.log("管理員帳號已建立。");

  // 3. 建立幾筆範例商品
  await prisma.product.createMany({
    data: [
      {
        id: 1,
        name: "純金璀璨星河項鍊",
        price: 8800,
        category: "項鍊",
        description: "...",
        image: "...",
      },
      {
        id: 2,
        name: "簡約主義純金戒指",
        price: 5200,
        category: "戒指",
        description: "...",
        image: "...",
      },
    ],
    skipDuplicates: true, // 如果 ID 已存在，則跳過
  });
  console.log("範例商品已建立。");

  console.log("播種完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
