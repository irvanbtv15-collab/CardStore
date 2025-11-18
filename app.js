// Adresse TON où tu reçois les paiements
const TON_ADDRESS = "UQBTVuv4H6h-9wFxYSO1Z3w9IOAnz7_W-han4_";

// === ANIMATION: FLY TO CART ===
function flyToCart(imgElement) {
  if (!imgElement) return;
  const imgRect = imgElement.getBoundingClientRect();
  const cartBar = document.querySelector(".cart-bar");
  if (!cartBar) return;
  const cartRect = cartBar.getBoundingClientRect();

  const clone = imgElement.cloneNode(true);
  clone.classList.add("fly-img");
  document.body.appendChild(clone);

  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${cartRect.left - imgRect.left + 40}px, ${cartRect.top - imgRect.top}px) scale(0.2)`;
    clone.style.opacity = "0";
  });

  setTimeout(() => clone.remove(), 700);
}

// Définition des marques et montants
const BRANDS = [
  "Amazon",
  "Netflix",
  "Zalando",
  "Spotify",
  "Airbnb",
  "Adidas",
  "Footlocker",
  "Flixbus",
  "Nintendo",
  "Xbox",
  "PlayStation"
];

const DEFAULT_AMOUNTS = [25, 50, 100];
const SPOTIFY_AMOUNTS = [11, 33, 66];

// Mapping marque → image
const BRAND_IMAGES = {
  Amazon: "amazon.png",
  Netflix: "netflix.png",
  Zalando: "zalando.png",
  Spotify: "spotify.png",
  Airbnb: "airbnb.png",
  Adidas: "adidas.png",
  Footlocker: "footlocker2.png",
  Flixbus: "flixbus.png",
  Nintendo: "nintendo.png",
  Xbox: "xbox.png",
  PlayStation: "playstation2.png"
};

// Génération des produits
const PRODUCTS = [];
BRANDS.forEach((brand) => {
  const amounts = brand === "Spotify" ? SPOTIFY_AMOUNTS : DEFAULT_AMOUNTS;
  amounts.forEach((amount) => {
    PRODUCTS.push({
      id: `${brand.toLowerCase()}-${amount}`,
      brand,
      amount,
      title: `${brand} ${amount}€`,
      subtitle: "Carte cadeau",
      image: BRAND_IMAGES[brand] || "",
      badge: "GIFT CARD"
    });
  });
});

// Panier : { productId: qty }
const cart = {};

// Telegram init
function initTelegram() {
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
}

// Filtres
function initFilters() {
  const brandSelect = document.getElementById("brandFilter");
  BRANDS.forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);
  });

  brandSelect.addEventListener("change", renderProducts);
  document.getElementById("amountFilter").addEventListener("change", renderProducts);
}

// Rendu des produits (boutique)
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  const brandFilter = document.getElementById("brandFilter").value;
  const amountFilter = document.getElementById("amountFilter").value;

  const filtered = PRODUCTS.filter((p) => {
    const brandOk = brandFilter === "all" || p.brand === brandFilter;
    const amountOk = amountFilter === "all" || p.amount === Number(amountFilter);
    return brandOk && amountOk;
  });

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const badge = document.createElement("div");
    badge.className = "product-badge";
    badge.textContent = product.badge;
    card.appendChild(badge);

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "product-image-wrapper";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src = product.image || "";
    img.alt = product.title;
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("div");
    title.className = "product-title";
    title.textContent = product.title;
    body.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.className = "product-subtitle";
    subtitle.textContent = product.subtitle;
    body.appendChild(subtitle);

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("div");
    price.className = "product-price";
    price.innerHTML = `${product.amount} € <span>carte</span>`;
    bottom.appendChild(price);

    const qtyControl = document.createElement("div");
    qtyControl.className = "qty-control";

    const minus = document.createElement("button");
    minus.className = "qty-btn";
    minus.textContent = "-";

    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = cart[product.id] || 0;

    const plus = document.createElement("button");
    plus.className = "qty-btn";
    plus.textContent = "+";

    minus.addEventListener("click", () => {
      adjustQty(product.id, -1, value);
    });

    plus.addEventListener("click", () => {
      adjustQty(product.id, 1, value);
      flyToCart(img);
    });

    qtyControl.appendChild(minus);
    qtyControl.appendChild(value);
    qtyControl.appendChild(plus);

    bottom.appendChild(qtyControl);
    body.appendChild(bottom);

    card.appendChild(body);
    grid.appendChild(card);
  });
}

// Ajustement quantité
function adjustQty(productId, delta, valueElement) {
  const current = cart[productId] || 0;
  let next = current + delta;
  if (next < 0) next = 0;

  cart[productId] = next;
  valueElement.textContent = next;

  if (next === 0) {
    delete cart[productId];
  }

  updateCartBar();
  renderCartView();
}

// Mise à jour barre panier + pulse + neon
function updateCartBar() {
  const cartItems = Object.entries(cart);
  const count = cartItems.reduce((acc, [, qty]) => acc + qty, 0);
  const total = cartItems.reduce((acc, [id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return acc + product.amount * qty;
  }, 0);

  const countEl = document.getElementById("cartItemsCount");
  const totalEl = document.getElementById("cartTotal");

  countEl.textContent = count === 1 ? "1 article" : `${count} articles`;
  totalEl.textContent = `${total} €`;

  // Neon boost sur les textes
  countEl.classList.remove("neon-boost");
  totalEl.classList.remove("neon-boost");
  void countEl.offsetWidth;
  void totalEl.offsetWidth;
  countEl.classList.add("neon-boost");
  totalEl.classList.add("neon-boost");

  const totalPage = document.getElementById("cartTotalPage");
  if (totalPage) {
    totalPage.textContent = `${total} €`;
  }

  // Animation pulse sur la barre
  const bar = document.querySelector(".cart-bar");
  if (bar) {
    bar.classList.remove("pulse");
    void bar.offsetWidth;
    bar.classList.add("pulse");
  }
}

// Rendu de la vue panier (page)
function renderCartView() {
  const container = document.getElementById("cartItemsList");
  container.innerHTML = "";

  const cartItems = Object.entries(cart);
  if (cartItems.length === 0) {
    container.innerHTML = `<p style="font-size:13px;color:#aaa;">Ton panier est vide. Ajoute des cartes depuis l’onglet boutique 🏪.</p>`;
    return;
  }

  cartItems.forEach(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item-row";

    const main = document.createElement("div");
    main.className = "cart-item-main";

    const brandEl = document.createElement("div");
    brandEl.className = "cart-item-brand";
    brandEl.textContent = product.brand;
    main.appendChild(brandEl);

    const meta = document.createElement("div");
    meta.className = "cart-item-meta";
    meta.textContent = `${product.amount}€ × ${qty}`;
    main.appendChild(meta);

    const total = document.createElement("div");
    total.className = "cart-item-total";
    total.textContent = `${product.amount * qty} €`;

    row.appendChild(main);
    row.appendChild(total);
    container.appendChild(row);
  });
}

// Init bouton payer (barre + page)
function initCartBar() {
  document.getElementById("payButton").addEventListener("click", openPaymentModal);
  const payPage = document.getElementById("payButtonPage");
  if (payPage) {
    payPage.addEventListener("click", openPaymentModal);
  }
}

// Modal paiement
function openPaymentModal() {
  const cartItems = Object.entries(cart);
  if (cartItems.length === 0) {
    alert("Ton panier est vide.");
    return;
  }

  const total = cartItems.reduce((acc, [id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return acc + product.amount * qty;
  }, 0);

  const lines = cartItems.map(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return `• ${product.brand} ${product.amount}€ × ${qty}`;
  });

  const summary = `Total : ${total} €\n\n${lines.join("\n")}`;
  document.getElementById("paymentSummary").textContent = summary;
  document.getElementById("tonAddress").textContent = TON_ADDRESS;

  document.getElementById("paymentModal").classList.add("active");
}

function initModal() {
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("paymentModal").classList.remove("active");
  });
}

// Onglets (nav métal argent)
function initTabs() {
  const views = {
    shop: document.getElementById("shopView"),
    cart: document.getElementById("cartView"),
    profile: document.getElementById("profileView")
  };

  const navButtons = document.querySelectorAll(".nav-btn");

  function setActiveTab(tab) {
    Object.keys(views).forEach((key) => {
      const view = views[key];
      if (!view) return;
      view.classList.toggle("view-active", key === tab);
      view.classList.toggle("view-hidden", key !== tab);
    });

    navButtons.forEach((btn) => {
      btn.classList.toggle("nav-btn-active", btn.dataset.tab === tab);
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
    });
  });

  // Onglet par défaut = panier
  setActiveTab("cart");
}

// INITIALISATION
document.addEventListener("DOMContentLoaded", () => {
  initTelegram();
  initFilters();
  renderProducts();
  updateCartBar();
  renderCartView();
  initCartBar();
  initModal();
  initTabs();
});
