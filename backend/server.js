const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs'); // 引入加密工具

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- 靜態檔案服務 (更穩健的路徑設定) ---
// 服務後端自身的靜態檔案 (css, js)
app.use(express.static(__dirname));
// 服務前端網站的靜態檔案
app.use(express.static(path.join(__dirname, "..", "frontend")));

// 備用方案：如果根目錄請求沒有被靜態服務攔截，手動發送 index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const PORT = process.env.PORT || 3000;

// --- API Helper 函式 ---
const handlePrismaError = (res, error) => {
    console.error("Prisma Error:", error);
    res.status(500).json({ error: "伺服器內部錯誤，請查看後端日誌。" });
};

// ==========================================================
// ===== API 端點 (全部升級為使用 Prisma) =====
// ==========================================================

// GET /api/settings - 從資料庫取得所有網站設定
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await prisma.siteSettings.findFirst();
        if (!settings) {
            console.log("未找到任何設定，正在建立預設設定...");
            settings = await prisma.siteSettings.create({
                data: {
                    reminderItems: '[]', // 預設為空的 JSON 字串
                    socialLinks: {},
                    promoPopup: {}
                }
            });
        }
        res.json(settings);
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// GET /api/products - 從資料庫取得所有商品
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// POST /api/login - 後台登入 API (*** 使用真實資料庫與加密驗證 ***)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body; // HTML 表單中的 username 對應到 email 欄位
    try {
        // 1. 根據 email 在資料庫中尋找使用者
        const user = await prisma.user.findUnique({
            where: { email: username }
        });

        // 2. 如果找不到使用者，直接回傳錯誤
        if (!user) {
            return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
        }

        // 3. 比較使用者輸入的密碼與資料庫中加密儲存的密碼
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // 密碼正確，登入成功
            res.json({ success: true, message: '登入成功' });
        } else {
            // 密碼錯誤
            res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
        }
    } catch (error) {
        handlePrismaError(res, error);
    }
});


// ( ... 為了完整性，此處包含所有其他管理 API ... )

// PUT /api/settings - 更新所有網站設定
app.put('/api/settings', async (req, res) => {
    try {
        const currentSettings = await prisma.siteSettings.findFirst();
        const updatedSettings = await prisma.siteSettings.update({
            where: { id: currentSettings.id },
            data: req.body,
        });
        res.json({ success: true, settings: updatedSettings });
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// POST /api/products - 新增商品
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = await prisma.product.create({
            data: req.body
        });
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// PUT /api/products/:id - 修改指定商品
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: req.body,
        });
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// DELETE /api/products/:id - 刪除指定商品
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        await prisma.product.delete({
            where: { id: productId }
        });
        res.json({ success: true, message: '商品已刪除' });
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// GET /api/users - 取得所有會員
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, createdAt: true }, // 不回傳密碼
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        handlePrismaError(res, error);
    }
});

// GET /api/orders - 取得所有訂單
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        handlePrismaError(res, error);
    }
});


// --- 啟動伺服器 ---
app.listen(PORT, () => {
  console.log(`伺服器正在 port ${PORT} 上成功運行`);
});