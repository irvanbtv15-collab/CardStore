/* CONFIG DE BASE */

const TON_ADDRESS = "UQBTVuv4H6h-9wFxYSO1Z3w9IOAnz7_W-han4_";

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
      image: BRAND_IMAGES[brand],
      badge: "GIFT CARD"
    });
  });
});

/* PANIER */

const cart = {};

function adjustQty(productId, delta, valueElement, event) {
  const current = cart[productId] || 0;
  let next = current + delta;
  if (next < 0) next = 0;

  if (next === 0) delete cart[productId];
  else cart[productId] = next;

  valueElement.textContent = next;

  updateCartBadge();
  renderCartPage();
  updateCartFooterTotal();

  if (delta > 0 && event) {
    animateToCart(event);
  }
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  badge.textContent = count;
}

/* ORBE ANIMATION VERS PANIER */

function animateToCart(event) {
  const animContainer = document.getElementById("animContainer");
  const orb = document.createElement("div");
  orb.className = "orb";
  animContainer.appendChild(orb);

  const startX = event.clientX;
  const startY = event.clientY;
  orb.style.left = startX - 10 + "px";
  orb.style.top = startY - 10 + "px";

  const cartIcon = document.getElementById("cartIcon");
  const rect = cartIcon.getBoundingClientRect();
  const endX = rect.left + rect.width / 2;
  const endY = rect.top + rect.height / 2;

  requestAnimationFrame(() => {
    orb.style.left = endX + "px";
    orb.style.top = endY + "px";
    orb.style.transform = "scale(0.4)";
    orb.style.opacity = "0";
  });

  setTimeout(() => {
    orb.remove();
    cartIcon.classList.add("pulse-cart");
    setTimeout(() => cartIcon.classList.remove("pulse-cart"), 450);
  }, 350);
}

/* RENDER PRODUITS */

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
    img.src = product.image;
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    const title = document.createElement("div");
    title.className = "product-title";
    title.textContent = product.title;

    const subtitle = document.createElement("div");
    subtitle.className = "product-subtitle";
    subtitle.textContent = product.subtitle;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `${product.amount} €`;

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

    minus.addEventListener("click", (e) => adjustQty(product.id, -1, value, e));
    plus.addEventListener("click", (e) => adjustQty(product.id, 1, value, e));

    qtyControl.appendChild(minus);
    qtyControl.appendChild(value);
    qtyControl.appendChild(plus);

    bottom.appendChild(price);
    bottom.appendChild(qtyControl);

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(bottom);

    grid.appendChild(card);
  });
}

/* PAGE PANIER */

function renderCartPage() {
  const container = document.getElementById("cartContent");
  container.innerHTML = "";

  const items = Object.entries(cart);
  if (items.length === 0) {
    container.innerHTML = "<p style='opacity:0.7;font-size:14px;'>Ton panier est vide.</p>";
    return;
  }

  items.forEach(([id, qty]) => {
    const product = PRODUCTS.find(p => p.id === id);
    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <div class="cart-row-left">
        <img src="${product.image}" class="cart-img" />
        <div>
          <div class="cart-title">${product.title}</div>
          <div class="cart-qty">${qty} × ${product.amount} €</div>
        </div>
      </div>
      <div class="cart-total">${product.amount * qty} €</div>
    `;

    container.appendChild(row);
  });
}

function updateCartFooterTotal() {
  const items = Object.entries(cart);
  const total = items.reduce((acc, [id, qty]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return acc + product.amount * qty;
  }, 0);

  document.getElementById("cartTotalValue").textContent = `${total} €`;
}

/* NAVIGATION ENTRE PAGES */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
}

document.getElementById("btn-shop").addEventListener("click", () => {
  showPage("page-shop");
  document.getElementById("btn-shop").classList.add("active");
});

document.getElementById("btn-cart").addEventListener("click", () => {
  showPage("page-cart");
  document.getElementById("btn-cart").classList.add("active");
  renderCartPage();
});

document.getElementById("btn-profile").addEventListener("click", () => {
  showPage("page-profile");
  document.getElementById("btn-profile").classList.add("active");
});

/* INIT */

function initFilters() {
  const brandSelect = document.getElementById("brandFilter");
  BRANDS.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandSelect.appendChild(opt);
  });

  brandSelect.addEventListener("change", renderProducts);
  document.getElementById("amountFilter").addEventListener("change", renderProducts);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
  }

  initFilters();
  renderProducts();
  renderCartPage();
  updateCartBadge();
  updateCartFooterTotal();

  // Onglet par défaut : boutique
  document.getElementById("btn-shop").classList.add("active");
});
