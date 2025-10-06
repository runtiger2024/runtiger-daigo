// =================================================================
// 購物車核心邏輯 (Cart Logic) - 互動升級版
// =================================================================

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// 加入商品至購物車 (*** 互動升級 ***)
function addToCart(productId, event) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  updateCartIcon();

  // --- 新增的互動回饋 ---
  showToastNotification("商品已成功加入購物車！");

  // 如果 event 存在 (表示是從按鈕點擊觸發)
  if (event) {
    flyToCartAnimation(event.target);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
}

function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = quantity;
  }
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart(cart);
  }
}

function clearCart() {
  localStorage.removeItem("cart");
}

// --- 新增的互動函式 ---
function showToastNotification(message) {
  // 避免重複生成
  if (document.querySelector(".toast-notification")) return;

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  document.body.appendChild(toast);

  // 延遲一點點再加 class，觸發 CSS transition 動畫
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // 3秒後自動消失
  setTimeout(() => {
    toast.classList.remove("show");
    // 等待淡出動畫結束後再移除元素
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

function flyToCartAnimation(clickedElement) {
  const productCard = clickedElement.closest(
    ".product-card, .product-detail-info"
  );
  if (!productCard) return;

  const productImage = productCard.querySelector(
    "img, .product-detail-image img"
  );
  if (!productImage) return;

  const cartIcon = document.querySelector(".cart-icon");
  if (!cartIcon) return;

  const flyImg = productImage.cloneNode();
  flyImg.classList.add("fly-to-cart");

  const startRect = productImage.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  flyImg.style.width = `${startRect.width}px`;
  flyImg.style.height = `${startRect.height}px`;
  flyImg.style.top = `${startRect.top}px`;
  flyImg.style.left = `${startRect.left}px`;

  document.body.appendChild(flyImg);

  // 延遲一點點再設定結束位置，觸發 CSS transition
  requestAnimationFrame(() => {
    flyImg.style.width = "30px";
    flyImg.style.height = "30px";
    flyImg.style.top = `${endRect.top}px`;
    flyImg.style.left = `${endRect.left}px`;
    flyImg.style.opacity = "0.5";
  });

  flyImg.addEventListener("transitionend", () => {
    flyImg.remove();
    // 購物車圖示閃爍一下
    cartIcon.style.transform = "scale(1.2)";
    setTimeout(() => (cartIcon.style.transform = "scale(1)"), 200);
  });
}
