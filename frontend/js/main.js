// =================================================================
// 全站共用 JavaScript (最終修正版)
// 修正了 reminderItems 解析錯誤，並包含所有必要函式
// =================================================================

// --- 全域變數 ---
let allProducts = [];
let siteSettings = {};

// --- 主初始化函式 ---
async function initializeSite() {
  try {
    // 從後端獲取核心資料
    const [productsRes, settingsRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/settings"),
    ]);

    if (!productsRes.ok || !settingsRes.ok) {
      throw new Error("無法從後端載入網站資料");
    }

    allProducts = await productsRes.json();
    siteSettings = await settingsRes.json();

    // 成功獲取資料後，才開始渲染頁面
    applyConfig();
    if (siteSettings.maintenanceMode) return;
    setupPage();
  } catch (error) {
    console.error("初始化網站時發生錯誤:", error);
    document.body.innerHTML = "網站資料載入失敗，請稍後再試。";
  }
}

// --- 應用設定 ---
function applyConfig() {
  if (siteSettings.maintenanceMode) {
    document.body.innerHTML = `<div class="maintenance-container"><h1>🔧 網站維護中 🔧</h1><p style="font-size: 1.2rem;">${siteSettings.maintenanceMessage}</p></div>`;
    return;
  }
  document.body.classList.toggle("dark-mode", siteSettings.enableDarkMode);
  document
    .querySelectorAll(".header-logo")
    .forEach((el) => (el.textContent = siteSettings.websiteName));
  document.documentElement.style.setProperty(
    "--primary-color",
    siteSettings.primaryColor
  );
  document.body.style.fontFamily = siteSettings.fontFamily;
  const footerText = document.getElementById("footer-text");
  if (footerText) footerText.innerHTML = siteSettings.footerText;
  const socialContainer = document.getElementById("footer-socials");
  if (
    socialContainer &&
    typeof siteSettings.socialLinks === "object" &&
    siteSettings.socialLinks !== null
  ) {
    socialContainer.innerHTML = "";
    const links = siteSettings.socialLinks;
    if (links.facebook)
      socialContainer.innerHTML += `<a href="${links.facebook}" target="_blank">FB</a>`;
    if (links.instagram)
      socialContainer.innerHTML += `<a href="${links.instagram}" target="_blank">IG</a>`;
    if (links.line)
      socialContainer.innerHTML += `<a href="${links.line}" target="_blank">LINE</a>`;
  }
  if (document.body.querySelector(".hero-section")) {
    const reminderBox = document.querySelector(".important-reminder");
    if (reminderBox) {
      reminderBox.style.display = siteSettings.showReminderBox
        ? "block"
        : "none";
    }
    const heroSection = document.body.querySelector(".hero-section");
    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${siteSettings.heroImageUrl}')`;
    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.textContent = siteSettings.heroTitle;
    const heroSubtitle = document.getElementById("hero-subtitle");
    if (heroSubtitle) heroSubtitle.textContent = siteSettings.heroSubtitle;
    const reminderTitle = document.getElementById("reminder-title");
    if (reminderTitle) reminderTitle.textContent = siteSettings.reminderTitle;

    // ===================================
    // ===== 關鍵修正與優化之處 =====
    // ===================================
    const reminderList = document.getElementById("reminder-list");
    if (reminderList && typeof siteSettings.reminderItems === "string") {
      reminderList.innerHTML = "";
      try {
        // 1. 先用 JSON.parse() 將字串解析回真正的陣列
        const items = JSON.parse(siteSettings.reminderItems);
        // 2. 確認解析後確實是陣列
        if (Array.isArray(items)) {
          // 3. 然後才能安全地對陣列使用 forEach
          items.forEach((itemText) => {
            if (itemText) {
              const li = document.createElement("li");
              li.innerHTML = itemText; // 使用 innerHTML 是為了能解析 <strong> 等標籤
              reminderList.appendChild(li);
            }
          });
        }
      } catch (e) {
        console.error("提醒事項(reminderItems)格式錯誤，無法解析JSON字串:", e);
      }
    }
  }
  if (
    siteSettings.promoPopup &&
    typeof siteSettings.promoPopup === "object" &&
    siteSettings.promoPopup.enabled &&
    sessionStorage.getItem("promoClosed") !== "true"
  ) {
    const modal = document.createElement("div");
    modal.className = "promo-modal-overlay";
    modal.innerHTML = `<div class="promo-modal"><button class="promo-modal-close">&times;</button><h2>${siteSettings.promoPopup.title}</h2><p>${siteSettings.promoPopup.content}</p><a href="${siteSettings.promoPopup.buttonLink}" class="btn btn-primary">${siteSettings.promoPopup.buttonText}</a></div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("is-visible"), 100);
    modal.querySelector(".promo-modal-close").addEventListener("click", () => {
      modal.classList.remove("is-visible");
      sessionStorage.setItem("promoClosed", "true");
    });
  }
}

// --- 頁面邏輯設定 ---
function setupPage() {
  updateCartIcon();
  const path = window.location.pathname.split("/").pop();
  if (path === "index.html" || path === "") {
    loadFeaturedProducts();
  } else if (path === "products.html") {
    initializeProductPage();
  } else if (path === "product-detail.html") {
    loadProductDetail();
  } else if (path === "cart.html") {
    loadCartPage();
  }
}

// --- 程式執行入口 ---
document.addEventListener("DOMContentLoaded", initializeSite);

// =================================================
// ===== 以下為所有必要的輔助函式 (Helper Functions) =====
// =================================================

// --- 數據追蹤函式 ---
function trackProductView(productId) {
  if (!productId) return;
  const analytics = JSON.parse(localStorage.getItem("siteAnalytics")) || {
    productViews: {},
    addToCartClicks: 0,
  };
  analytics.productViews[productId] =
    (analytics.productViews[productId] || 0) + 1;
  localStorage.setItem("siteAnalytics", JSON.stringify(analytics));
}
function trackAddToCartClick() {
  const analytics = JSON.parse(localStorage.getItem("siteAnalytics")) || {
    productViews: {},
    addToCartClicks: 0,
  };
  analytics.addToCartClicks = (analytics.addToCartClicks || 0) + 1;
  localStorage.setItem("siteAnalytics", JSON.stringify(analytics));
}

// --- 貨幣格式化函式 ---
function formatCurrency(amount) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(amount);
}

// --- 商品頁面渲染函式 ---
function loadFeaturedProducts() {
  const grid = document.getElementById("featured-product-grid");
  if (grid) {
    const featuredProducts = allProducts.slice(0, 4);
    renderProductGrid(featuredProducts, grid);
  }
}
function initializeProductPage() {
  const searchInput = document.getElementById("search-input");
  const categoryFilters = document.getElementById("category-filters");
  const sortSelect = document.getElementById("sort-select");
  const categories = [
    "所有分類",
    ...new Set(allProducts.map((p) => p.category)),
  ];
  categoryFilters.innerHTML = categories
    .map((cat) => `<button data-category="${cat}">${cat}</button>`)
    .join("");
  const categoryButtons = categoryFilters.querySelectorAll("button");
  if (categoryButtons.length > 0) categoryButtons[0].classList.add("active");
  function render() {
    let productsToRender = [...allProducts];
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      productsToRender = productsToRender.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }
    const activeCategoryBtn = categoryFilters.querySelector(".active");
    if (activeCategoryBtn) {
      const activeCategory = activeCategoryBtn.dataset.category;
      if (activeCategory !== "所有分類") {
        productsToRender = productsToRender.filter(
          (p) => p.category === activeCategory
        );
      }
    }
    const sortBy = sortSelect.value;
    if (sortBy === "price-asc") {
      productsToRender.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      productsToRender.sort((a, b) => b.price - a.price);
    }
    renderProductGrid(
      productsToRender,
      document.getElementById("product-grid")
    );
  }
  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      render();
    });
  });
  render();
}
function renderProductGrid(products, gridElement) {
  if (!gridElement) return;
  gridElement.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `<a href="product-detail.html?id=${
      product.id
    }"><img src="${product.image}" alt="${
      product.name
    }" class="product-image"><div class="product-info"><h3 class="product-name">${
      product.name
    }</h3><p class="product-price">${formatCurrency(
      product.price
    )}</p></div></a>`;
    gridElement.appendChild(productCard);
  });
}
function loadProductDetail() {
  const container = document.getElementById("product-detail-container");
  if (!container) return;
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));
  trackProductView(productId);
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    container.innerHTML = `<div class="product-detail-image"><img src="${
      product.image
    }" alt="${
      product.name
    }"></div><div class="product-detail-info"><h1 class="product-name">${
      product.name
    }</h1><p class="product-price">${formatCurrency(
      product.price
    )}</p><p class="product-description">${
      product.description
    }</p><button class="btn btn-primary add-to-cart-btn" onclick="trackAddToCartClick(); addToCart(${
      product.id
    }, event)">加入購物車</button></div>`;
  } else {
    container.innerHTML = "<p>找不到該商品。</p>";
  }
}
function loadCartPage() {
  const container = document.getElementById("cart-container");
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">您的購物車是空的。</p>';
    return;
  }
  let subtotal = 0;
  const cartItemsHTML = cart
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.id);
      if (!product) return "";
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return `<tr><td><div class="cart-item-info"><img src="${
        product.image
      }" alt="${product.name}"><div><p>${
        product.name
      }</p><small>${formatCurrency(
        product.price
      )}</small></div></div></td><td class="item-quantity"><input type="number" value="${
        item.quantity
      }" min="1" onchange="updateCartQuantity(${
        product.id
      },parseInt(this.value));loadCartPage()"></td><td>${formatCurrency(
        itemTotal
      )}</td><td><span class="remove-item-btn" onclick="removeFromCart(${
        product.id
      });loadCartPage()">移除</span></td></tr>`;
    })
    .join("");
  container.innerHTML = `<div class="cart-grid"><div class="cart-items"><table><thead><tr><th>商品</th><th>數量</th><th>小計</th><th></th></tr></thead><tbody>${cartItemsHTML}</tbody></table></div><div class="cart-summary"><h2>訂單摘要</h2><div class="summary-row"><span>商品總計</span><span>${formatCurrency(
    subtotal
  )}</span></div><div class="summary-row"><span>運費</span><span>免運費</span></div><div class="summary-row summary-total"><span>總計</span><span>${formatCurrency(
    subtotal
  )}</span></div><a href="checkout.html" class="btn btn-primary checkout-btn">前往結帳</a></div></div>`;
}

// --- 購物車與互動動畫函式 ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(productId, event) {
  const cart = getCart(),
    existingItem = cart.find((item) => item.id === productId);
  existingItem
    ? (existingItem.quantity += 1)
    : cart.push({ id: productId, quantity: 1 });
  saveCart(cart);
  updateCartIcon();
  showToastNotification("商品已成功加入購物車！");
  event && flyToCartAnimation(event.target);
}
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  loadCartPage();
}
function updateCartQuantity(productId, quantity) {
  const cart = getCart(),
    item = cart.find((item) => item.id === productId);
  item && (item.quantity = quantity);
  quantity <= 0 ? removeFromCart(productId) : saveCart(cart);
}
function showToastNotification(message) {
  if (document.querySelector(".toast-notification")) return;
  const toast = document.createElement("div");
  (toast.className = "toast-notification"),
    (toast.textContent = message),
    document.body.appendChild(toast),
    setTimeout(() => {
      toast.classList.add("show");
    }, 100),
    setTimeout(() => {
      toast.classList.remove("show"),
        toast.addEventListener("transitionend", () => toast.remove());
    }, 3e3);
}
function flyToCartAnimation(element) {
  const productVisual = element.closest(".product-card, .product-detail-info");
  if (!productVisual) return;
  const productImage = productVisual.querySelector(
    "img, .product-detail-image img"
  );
  if (!productImage) return;
  const cartIcon = document.querySelector(".cart-icon");
  if (!cartIcon) return;
  const flyImg = productImage.cloneNode();
  flyImg.classList.add("fly-to-cart");
  const startRect = productImage.getBoundingClientRect(),
    endRect = cartIcon.getBoundingClientRect();
  (flyImg.style.width = `${startRect.width}px`),
    (flyImg.style.height = `${startRect.height}px`),
    (flyImg.style.top = `${startRect.top}px`),
    (flyImg.style.left = `${startRect.left}px`),
    document.body.appendChild(flyImg),
    requestAnimationFrame(() => {
      (flyImg.style.width = "30px"),
        (flyImg.style.height = "30px"),
        (flyImg.style.top = `${endRect.top}px`),
        (flyImg.style.left = `${endRect.left}px`),
        (flyImg.style.opacity = "0.5");
    }),
    flyImg.addEventListener("transitionend", () => {
      flyImg.remove(),
        (cartIcon.style.transform = "scale(1.2)"),
        setTimeout(() => (cartIcon.style.transform = "scale(1)"), 200);
    });
}
