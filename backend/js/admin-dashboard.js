document.addEventListener("DOMContentLoaded", () => {
  // --- 安全性檢查 ---
  if (sessionStorage.getItem("isAdminAuthenticated") !== "true") {
    window.location.href = "/admin-login.html";
  }

  // --- DOM 元素 ---
  const elements = {
    statCardsContainer: document.getElementById("stat-cards-container"),
    productListBody: document.getElementById("product-list-body"),
    addProductForm: document.getElementById("add-product-form"),
    settingsForm: document.getElementById("settings-form"),
    saveSettingsButton: document.getElementById("save-settings-button"),
    userListTable: document.getElementById("user-list-table"),
    orderListTable: document.getElementById("order-list-table"),
  };

  // --- 全域狀態 ---
  let allProducts = [],
    allUsers = [],
    allOrders = [],
    siteSettings = {};

  // --- 主要資料載入函式 ---
  async function loadAllData() {
    try {
      const [productsRes, settingsRes, usersRes, ordersRes] = await Promise.all(
        [
          fetch("/api/products"),
          fetch("/api/settings"),
          fetch("/api/users"),
          fetch("/api/orders"),
        ]
      );

      if (!productsRes.ok || !settingsRes.ok || !usersRes.ok || !ordersRes.ok) {
        throw new Error("部分 API 請求失敗");
      }

      allProducts = await productsRes.json();
      siteSettings = await settingsRes.json();
      allUsers = await usersRes.json();
      allOrders = await ordersRes.json();

      renderAllSections();
    } catch (error) {
      console.error("載入儀表板資料失敗:", error);
      document.querySelector(
        ".main-content"
      ).innerHTML = `<h1>載入資料失敗，請確認後端伺服器是否正常運行。</h1>`;
    }
  }

  // --- 渲染函式 ---
  function renderAllSections() {
    renderStatCards();
    renderProductTable();
    renderAddProductForm();
    renderUserTable();
    renderOrderTable();
    renderSettingsForm();
  }

  function renderStatCards() {
    const analytics = JSON.parse(localStorage.getItem("siteAnalytics")) || {
      productViews: {},
      addToCartClicks: 0,
    };
    const totalSales = allOrders.reduce((sum, order) => sum + order.total, 0);
    elements.statCardsContainer.innerHTML = `
            <div class="card"><div class="title">總會員數</div><div class="value">${
              allUsers.length
            }</div></div>
            <div class="card"><div class="title">商品總數</div><div class="value">${
              allProducts.length
            }</div></div>
            <div class="card"><div class="title">總訂單數</div><div class="value">${
              allOrders.length
            }</div></div>
            <div class="card"><div class="title">總銷售額</div><div class="value">NT$ ${totalSales.toLocaleString()}</div></div>
        `;
  }

  function renderProductTable() {
    elements.productListBody.innerHTML = allProducts
      .map(
        (p) => `
            <tr data-product-id="${p.id}">
                <td><input type="text" name="name" value="${p.name}"></td>
                <td><input type="number" name="price" value="${p.price}"></td>
                <td><input type="text" name="category" value="${p.category}"></td>
                <td><button class="btn-delete">刪除</button></td>
            </tr>`
      )
      .join("");
  }

  function renderAddProductForm() {
    elements.addProductForm.innerHTML = `
            <div class="form-grid">
                <label>名稱</label><input type="text" name="name" required>
                <label>價格</label><input type="number" name="price" required>
                <label>分類</label><input type="text" name="category" required>
                <label>圖片URL</label><input type="url" name="image" required>
                <label>描述</label><textarea name="description" rows="3"></textarea>
                <div></div><button type="submit" class="btn-save">新增此商品</button>
            </div>
        `;
  }

  function renderUserTable() {
    elements.userListTable.innerHTML = `<thead><tr><th>名稱</th><th>Email</th><th>註冊時間</th></tr></thead>
            <tbody>${allUsers
              .map(
                (u) => `
                <tr><td>${u.name || "N/A"}</td><td>${
                  u.email
                }</td><td>${new Date(
                  u.createdAt
                ).toLocaleDateString()}</td></tr>
            `
              )
              .join("")}</tbody>`;
  }

  function renderOrderTable() {
    elements.orderListTable.innerHTML = `<thead><tr><th>訂單ID</th><th>顧客</th><th>總金額</th><th>狀態</th><th>下單時間</th></tr></thead>
            <tbody>${allOrders
              .map(
                (o) => `
                <tr><td>#${o.id}</td><td>${
                  o.user.name || o.user.email
                }</td><td>NT$ ${o.total.toLocaleString()}</td><td>${
                  o.status
                }</td><td>${new Date(o.createdAt).toLocaleString()}</td></tr>
            `
              )
              .join("")}</tbody>`;
  }

  function renderSettingsForm() {
    if (!settingsForm) return;
    settingsForm.innerHTML = `
            <fieldset class="fieldset-group"><legend>維護模式</legend><div class="form-row"><label for="maintenanceMode">啟用維護模式</label><select id="maintenanceMode"><option value="false">否</option><option value="true">是</option></select></div><div class="form-row"><label for="maintenanceMessage">維護模式訊息</label><textarea id="maintenanceMessage" rows="3"></textarea></div></fieldset>
            <fieldset class="fieldset-group"><legend>全域設定</legend><div class="form-row"><label for="websiteName">網站名稱</label><input type="text" id="websiteName"></div><div class="form-row"><label for="primaryColor">主題顏色</label><div class="color-picker-container"><input type="color" id="primaryColor"><input type="text" id="primaryColorText"></div></div><div class="form-row"><label for="fontFamily">網站字體</label><select id="fontFamily"><option value="'Noto Sans TC', sans-serif">思源黑體 (預設)</option><option value="'Times New Roman', serif">經典襯線體</option><option value="system-ui, -apple-system, sans-serif">系統預設字體</option></select></div><div class="form-row"><label for="enableDarkMode">啟用深色模式</label><select id="enableDarkMode"><option value="false">否</option><option value="true">是</option></select></div></fieldset>
            <fieldset class="fieldset-group"><legend>彈出式促銷公告</legend><div class="form-row"><label for="promoEnabled">啟用促銷公告</label><select id="promoEnabled"><option value="false">否</option><option value="true">是</option></select></div><div class="form-row"><label for="promoTitle">公告標題</label><input type="text" id="promoTitle"></div><div class="form-row"><label for="promoContent">公告內容</label><textarea id="promoContent" rows="2"></textarea></div><div class="form-row"><label for="promoButtonText">按鈕文字</label><input type="text" id="promoButtonText"></div><div class="form-row"><label for="promoButtonLink">按鈕連結</label><input type="url" id="promoButtonLink"></div></fieldset>
            <fieldset class="fieldset-group"><legend>首頁配置</legend><div class="form-row"><label for="showReminderBox">顯示「重要提醒」</label><select id="showReminderBox"><option value="true">是</option><option value="false">否</option></select></div><div class="form-row"><label for="heroImageUrl">主視覺背景圖 URL</label><input type="text" id="heroImageUrl"></div><div class="form-row"><label for="heroTitle">主視覺標題</label><input type="text" id="heroTitle"></div><div class="form-row"><label for="heroSubtitle">主視覺副標題</label><input type="text" id="heroSubtitle"></div></fieldset>
            <fieldset class="fieldset-group"><legend>「重要提醒」內容</legend><div class="form-row"><label for="reminderTitle">區塊標題</label><input type="text" id="reminderTitle"></div><div class="form-row"><label for="reminderItem1">提醒事項 1</label><textarea id="reminderItem1" rows="3"></textarea></div><div class="form-row"><label for="reminderItem2">提醒事項 2</label><textarea id="reminderItem2" rows="3"></textarea></div><div class="form-row"><label for="reminderItem3">提醒事項 3</label><textarea id="reminderItem3" rows="3"></textarea></div></fieldset>
            <fieldset class="fieldset-group"><legend>頁尾 & 社群</legend><div class="form-row"><label for="footerText">頁尾版權文字</label><input type="text" id="footerText"></div><div class="form-row"><label for="facebookLink">Facebook 網址</label><input type="url" id="facebookLink" placeholder="留空則不顯示"></div><div class="form-row"><label for="instagramLink">Instagram 網址</label><input type="url" id="instagramLink" placeholder="留空則不顯示"></div><div class="form-row"><label for="lineLink">LINE 網址</label><input type="url" id="lineLink" placeholder="留空則不顯示"></div></fieldset>
        `;
    // 將從 API 獲取的 siteSettings 資料填入表單
    document.getElementById("websiteName").value = siteSettings.websiteName;
    document.getElementById("primaryColor").value = siteSettings.primaryColor;
    document.getElementById("primaryColorText").value =
      siteSettings.primaryColor;
    document.getElementById("fontFamily").value = siteSettings.fontFamily;
    document.getElementById("enableDarkMode").value =
      siteSettings.enableDarkMode.toString();
    document.getElementById("maintenanceMode").value =
      siteSettings.maintenanceMode.toString();
    document.getElementById("maintenanceMessage").value =
      siteSettings.maintenanceMessage;
    document.getElementById("promoEnabled").value =
      siteSettings.promoPopup.enabled.toString();
    document.getElementById("promoTitle").value = siteSettings.promoPopup.title;
    document.getElementById("promoContent").value =
      siteSettings.promoPopup.content;
    document.getElementById("promoButtonText").value =
      siteSettings.promoPopup.buttonText;
    document.getElementById("promoButtonLink").value =
      siteSettings.promoPopup.buttonLink;
    document.getElementById("showReminderBox").value =
      siteSettings.showReminderBox.toString();
    document.getElementById("heroImageUrl").value = siteSettings.heroImageUrl;
    document.getElementById("heroTitle").value = siteSettings.heroTitle;
    document.getElementById("heroSubtitle").value = siteSettings.heroSubtitle;
    document.getElementById("reminderTitle").value = siteSettings.reminderTitle;
    // 將 JSON 字串解析回陣列來填入
    const reminderItems = JSON.parse(siteSettings.reminderItems || "[]");
    document.getElementById("reminderItem1").value = reminderItems[0] || "";
    document.getElementById("reminderItem2").value = reminderItems[1] || "";
    document.getElementById("reminderItem3").value = reminderItems[2] || "";
    document.getElementById("footerText").value = siteSettings.footerText;
    document.getElementById("facebookLink").value =
      siteSettings.socialLinks.facebook;
    document.getElementById("instagramLink").value =
      siteSettings.socialLinks.instagram;
    document.getElementById("lineLink").value = siteSettings.socialLinks.line;

    // 設定顏色選擇器的互動
    const colorPicker = document.getElementById("primaryColor");
    const colorText = document.getElementById("primaryColorText");
    colorPicker.addEventListener(
      "input",
      (e) => (colorText.value = e.target.value.toUpperCase())
    );
    colorText.addEventListener(
      "input",
      (e) => (colorPicker.value = e.target.value)
    );
  }

  // --- API 呼叫與事件處理 ---

  async function saveAllSettings() {
    const newSettings = {
      websiteName: document.getElementById("websiteName").value,
      primaryColor: document.getElementById("primaryColorText").value,
      fontFamily: document.getElementById("fontFamily").value,
      enableDarkMode:
        document.getElementById("enableDarkMode").value === "true",
      maintenanceMode:
        document.getElementById("maintenanceMode").value === "true",
      maintenanceMessage: document.getElementById("maintenanceMessage").value,
      showReminderBox:
        document.getElementById("showReminderBox").value === "true",
      heroImageUrl: document.getElementById("heroImageUrl").value,
      heroTitle: document.getElementById("heroTitle").value,
      heroSubtitle: document.getElementById("heroSubtitle").value,
      reminderTitle: document.getElementById("reminderTitle").value,
      reminderItems: JSON.stringify([
        // 儲存為 JSON 字串
        document.getElementById("reminderItem1").value,
        document.getElementById("reminderItem2").value,
        document.getElementById("reminderItem3").value,
      ]),
      footerText: document.getElementById("footerText").value,
      socialLinks: {
        facebook: document.getElementById("facebookLink").value,
        instagram: document.getElementById("instagramLink").value,
        line: document.getElementById("lineLink").value,
      },
      promoPopup: {
        enabled: document.getElementById("promoEnabled").value === "true",
        title: document.getElementById("promoTitle").value,
        content: document.getElementById("promoContent").value,
        buttonText: document.getElementById("promoButtonText").value,
        buttonLink: document.getElementById("promoButtonLink").value,
      },
    };
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("伺服器回應錯誤");
      alert("網站設定已成功儲存！");
      siteSettings = newSettings;
    } catch (error) {
      console.error("儲存設定失敗:", error);
      alert("儲存設定失敗: " + error.message);
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.price = parseFloat(data.price);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("新增失敗");
      alert("商品已新增！");
      event.target.reset(); // 清空表單
      loadAllData(); // 重新載入所有資料
    } catch (error) {
      alert(error.message);
    }
  }

  async function updateProduct(id, data) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("更新失敗");
      // 更新成功後，可以給一個細微的提示，例如讓儲存格閃一下
      return true;
    } catch (error) {
      console.error("更新商品失敗:", error);
      alert("更新失敗：" + error.message);
      return false;
    }
  }

  async function deleteProduct(id) {
    if (!confirm("確定要刪除此商品嗎？此操作無法復原。")) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("刪除失敗");
      alert("商品已刪除！");
      loadAllData(); // 重新載入所有資料
    } catch (error) {
      alert(error.message);
    }
  }

  function setupTabs() {
    const navLinks = document.querySelectorAll(".sidebar nav a");
    const sections = document.querySelectorAll(".main-content section");
    function showSection(hash) {
      const targetHash = hash || "#dashboard";
      sections.forEach((section) => {
        section.style.display =
          `#${section.id}` === targetHash ? "block" : "none";
      });
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === targetHash
        );
      });
    }
    navLinks.forEach((link) => {
      if (link.getAttribute("href").startsWith("#")) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const hash = e.currentTarget.getAttribute("href");
          window.location.hash = hash;
          showSection(hash);
        });
      }
    });
    showSection(window.location.hash);
  }

  // --- 事件監聽器 ---
  elements.productListBody.addEventListener("change", (event) => {
    const input = event.target;
    const tr = input.closest("tr");
    if (!tr || input.nodeName !== "INPUT") return;
    const id = tr.dataset.productId;
    const fieldName = input.name;
    const value =
      input.type === "number" ? parseFloat(input.value) : input.value;
    updateProduct(id, { [fieldName]: value });
  });
  elements.productListBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      deleteProduct(e.target.closest("tr").dataset.productId);
    }
  });
  elements.addProductForm.addEventListener("submit", handleAddProduct);
  elements.saveSettingsButton.addEventListener("click", saveAllSettings);

  // --- 程式執行入口 ---
  setupTabs();
  loadAllData();
});
