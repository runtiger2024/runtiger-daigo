// =================================================================
// 模擬商品資料庫 (In-memory Database)
// 在真實世界中，這些資料會來自後端伺服器和資料庫。
// 為了前端開發方便，我們先將資料寫死在這裡。
// =================================================================

const productsDB = [
  {
    id: 1,
    name: "純金璀璨星河項鍊",
    price: 8800,
    category: "項鍊",
    description:
      "以9999純金打造，設計靈感源自夜空中閃爍的銀河，細緻的鏈條與點點星光般的墜飾相得益彰，是日常穿搭的點睛之筆。",
    image:
      "https://images.unsplash.com/photo-1611652022417-a551155e9b33?q=80&w=1974&auto=format&fit=crop", // 使用 Unsplash 的高品質圖片作為範例
    images: [
      "https://images.unsplash.com/photo-1611652022417-a551155e9b33?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599330293288-c8352b2d01e0?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617038260897-41a4f22942db?q=80&w=1974&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    name: "簡約主義純金戒指",
    price: 5200,
    category: "戒指",
    description:
      "回歸設計的本質，這款純金戒指以其光滑的鏡面拋光和簡潔的線條，展現了低調的奢華感。適合疊戴或單獨佩戴。",
    image:
      "https://images.unsplash.com/photo-1605001438362-e73a0a194569?q=80&w=1974&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1605001438362-e73a0a194569?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1627293589112-1d193132b4f9?q=80&w=1974&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    name: "幸運四葉草純金手鍊",
    price: 6500,
    category: "手鍊",
    description:
      "傳說中的四葉草，代表著幸運與希望。我們將其化為精緻的純金墜飾，搭配纖細手鍊，願它為您帶來每一天的好運氣。",
    image:
      "https://images.unsplash.com/photo-1611591437134-4b5a3b7a5e8b?q=80&w=1974&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611591437134-4b5a3b7a5e8b?q=80&w=1974&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    name: "復古宮廷風純金耳環",
    price: 7300,
    category: "耳環",
    description:
      "設計靈感來自歐洲宮廷的華麗珠寶，精巧的雕花工藝與溫潤的黃金光澤結合，散發出濃厚的古典氣息，讓您在舉手投足間盡顯優雅。",
    image:
      "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?q=80&w=1964&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?q=80&w=1964&auto=format&fit=crop",
    ],
  },
];
