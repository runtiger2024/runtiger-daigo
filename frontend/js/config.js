// =================================================================
// 網站中央設定檔 (Site Configuration) - 最終旗艦版
// =================================================================

const siteConfig = {
  // --- 全域設定 ---
  websiteName: "CHARLINe",
  primaryColor: "#FF5700",
  fontFamily: "'Noto Sans TC', sans-serif",
  enableDarkMode: false, // 新增！深色模式開關

  // --- 首頁配置 ---
  showReminderBox: true,
  heroImageUrl:
    "https://images.unsplash.com/photo-1599330293288-c8352b2d01e0?q=80&w=1974&auto.format&fit=crop",
  heroTitle: "品味純粹，始於此刻",
  heroSubtitle: "探索我們為您精心打造的9999純金飾品系列",

  // --- 重要提醒區塊設定 ---
  reminderTitle: "⚠️ 重要提醒，請務必詳讀 ⚠️",
  reminderItems: [
    "<strong>關於價格：</strong>頁面顯示的【台幣價格】即為您需要支付的全部費用，已包含代購服務費。",
    "<strong>關於運費：</strong>本站不經手任何運費。貨物送達後，您需自行登入「跑跑虎集運APP」支付國際運費。",
    "<strong>關於出貨：</strong>請務必填寫正確的「跑跑虎集運」會員編號。",
  ],

  // --- 頁尾 & 社群設定 ---
  footerText: `&copy; ${new Date().getFullYear()} CHARLINe 純金飾品. All Rights Reserved.`,
  socialLinks: {
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
    line: "https://line.me/tw/",
  },

  // --- 彈出式促銷公告 (新增！) ---
  promoPopup: {
    enabled: false,
    title: "✨ 新品上市優惠 ✨",
    content: "全館消費滿 NT$5,000，立即享 95 折優惠！",
    buttonText: "立即選購",
    buttonLink: "products.html",
  },

  // --- 網站維護模式 (新增！) ---
  maintenanceMode: false,
  maintenanceMessage:
    "網站正在進行系統維護，暫時無法提供服務。請稍後再回來，感謝您的耐心等待。",
};
