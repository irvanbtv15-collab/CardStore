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

const cart = {}; // { productId: qty }

/* MISE À JOUR PANIER (NOMBRE + TOTAL) */

function updateCartBar() {
  const items = Object.entries(cart);
  const count = items.reduce((acc, [, qty]) => acc + qty, 0);
  const total = items.reduce((acc, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return acc + p.amount * qty;
  }, 0);

  const summaryEl = document.getElementById("cartSummary");
  const totalEl = document.getElementById("cartTotal");

  summaryEl.textContent = count <= 1 ? `${count} article` : `${count} articles`;
  totalEl.textContent = `${total} €`;
}

/* ANIMATION ORBE VERS BARRE PANIER */

function animateToCart(event) {
  const animContainer = document.getElementById("animContainer");
  const orb = document.createElement("div");
  orb.className = "orb";
  animContainer.appendChild(orb);

  const startX = event.clientX;
  const startY = event.clientY;
  orb.style.left = startX - 9 + "px";
  orb.style.top = startY - 9 + "px";

  const cartBar = document.querySelector(".cart-bar");
  const rect = cartBar.getBoundingClientRect();
  const endX = rect.left + rect.width * 0.3;
  const endY = rect.top + rect.height / 2;

  requestAnimationFrame(() => {
    orb.style.left = endX + "px";
    orb.style.top = endY + "px";
    orb.style.transform = "scale(0.3)";
    orb.style.opacity = "0";
  });

  setTimeout(() => {
    orb.remove();
  }, 350);
}

/* AJUSTEMENT QUANTITÉ */

function adjustQty(productId, delta, valueElement, event) {
  const current = cart[productId] || 0;
  let next = current + delta;
  if (next < 0) next = 0;

  if (next === 0) {
    delete cart[productId];
  } else {
    cart[productId] = next;
  }

  valueElement.textContent = next;
  updateCartBar();

  if (delta > 0 && event) {
    animateToCart(event);
  }
}

/* AFFICHAGE PRODUITS */

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
    img.alt = product.title;
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
    price.innerHTML = `${product.amount} € <span>carte</span>`;

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

/* INIT FILTRES */

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

/* PAIEMENT TONKEEPER */

function initPayment() {
  const payBtn = document.getElementById("payButton");
  payBtn.addEventListener("click", () => {
    const items = Object.entries(cart);
    if (items.length === 0) {
      alert("Ton panier est vide.");
      return;
    }

    const total = items.reduce((acc, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return acc + product.amount * qty;
    }, 0);

    const tonAmount = total * 1e9; // en nanoTONs

    const tonUrl = `tonkeeper://send?to=${TON_ADDRESS}&amount=${tonAmount}&text=CardStore%20Achat%20${total}EUR`;

    if (/Android|iPhone/i.test(navigator.userAgent)) {
      // mobile
      window.location.href = tonUrl;
    } else {
      // desktop : show simple alert with ton:// link
      alert(
        "Scanne avec Tonkeeper :\n\n" +
          `ton://transfer/${TON_ADDRESS}?amount=${tonAmount}`
      );
    }
  });
}

/* INIT GLOBALE */

document.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
  }

  initFilters();
  renderProducts();
  updateCartBar();
  initPayment();
});
