// Adresse TON où tu reçois les paiements
const TON_ADDRESS = "UQBTVuv4H6h-9wFxYSO1Z3w9IOAnz7_W-han4_";

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

// Petit mapping marque → image
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


// Génération de la liste de produits (une carte par montant)
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

// État du panier : { productId: qty }
const cart = {};

function initTelegram() {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
}

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

    minus.addEventListener("click", () => adjustQty(product.id, -1, value));
    plus.addEventListener("click", () => adjustQty(product.id, 1, value));

    qtyControl.appendChild(minus);
    qtyControl.appendChild(value);
    qtyControl.appendChild(plus);

    bottom.appendChild(qtyControl);
    body.appendChild(bottom);

    card.appendChild(body);
    grid.appendChild(card);
  });
}

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
}

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
}

function initCartBar() {
  document.getElementById("payButton").addEventListener("click", openPaymentModal);
}

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

// INITIALISATION
document.addEventListener("DOMContentLoaded", () => {
  initTelegram();
  initFilters();
  renderProducts();
  updateCartBar();
  initCartBar();
  initModal();
});


