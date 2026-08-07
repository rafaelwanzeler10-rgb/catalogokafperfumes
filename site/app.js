const state = {
  catalog: null,
  products: [],
  visible: 60,
};

const pageSize = 60;
const els = {
  logo: document.querySelector("#brandLogo"),
  headerWhatsapp: document.querySelector("#headerWhatsapp"),
  footerWhatsapp: document.querySelector("#footerWhatsapp"),
  search: document.querySelector("#searchInput"),
  brand: document.querySelector("#brandFilter"),
  category: document.querySelector("#categoryFilter"),
  price: document.querySelector("#priceFilter"),
  sort: document.querySelector("#sortFilter"),
  showAll: document.querySelector("#showAllButton"),
  clear: document.querySelector("#clearFiltersButton"),
  totalProducts: document.querySelector("#totalProducts"),
  totalBrands: document.querySelector("#totalBrands"),
  totalCategories: document.querySelector("#totalCategories"),
  resultCount: document.querySelector("#resultCount"),
  productsGrid: document.querySelector("#productsGrid"),
  brandList: document.querySelector("#brandList"),
  empty: document.querySelector("#emptyState"),
  loadMore: document.querySelector("#loadMoreButton"),
  template: document.querySelector("#productCardTemplate"),
  infoPanel: document.querySelector("#info-panel"),
  tabLinks: document.querySelectorAll("[data-tab]"),
  tabPanels: document.querySelectorAll("[data-panel]"),
};

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatPrice(price) {
  return priceFormatter.format(Number(price || 0));
}

function whatsappLink(product) {
  const text = product
    ? `Olá! Tenho interesse no produto ${product.name}, da marca ${product.brand}, por ${formatPrice(product.price)}. Poderia confirmar disponibilidade?`
    : "Olá! Gostaria de consultar os produtos da KAF Perfumes.";
  return `https://wa.me/${state.catalog.whatsapp}?text=${encodeURIComponent(text)}`;
}

function setOptions(select, items, getValue, getLabel, defaultLabel) {
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = defaultLabel;
  select.append(defaultOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    select.append(option);
  });
}

function matchesPrice(product) {
  if (els.price.value === "all") return true;
  const [min, max] = els.price.value.split("-").map(Number);
  return product.price >= min && product.price <= max;
}

function getFilteredProducts() {
  const query = normalizeText(els.search.value);
  const brand = els.brand.value;
  const category = els.category.value;

  let filtered = state.products.filter((product) => {
    const text = normalizeText(`${product.name} ${product.brand} ${product.description}`);
    const matchesQuery = !query || text.includes(query);
    const matchesBrand = brand === "all" || product.brand === brand;
    const matchesCategory = category === "all" || product.category === category;
    return matchesQuery && matchesBrand && matchesCategory && matchesPrice(product);
  });

  filtered = [...filtered].sort((a, b) => {
    if (els.sort.value === "name") return a.name.localeCompare(b.name, "pt-BR");
    if (els.sort.value === "priceAsc") return a.price - b.price;
    if (els.sort.value === "priceDesc") return b.price - a.price;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  return filtered;
}

function createCard(product) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  const imageLink = node.querySelector(".image-wrap");
  const image = node.querySelector("img");
  const title = node.querySelector("h3");
  const brand = node.querySelector(".brand-name");
  const description = node.querySelector(".description");
  const category = node.querySelector(".category-pill");
  const price = node.querySelector(".price");
  const buy = node.querySelector(".buy-button");

  image.src = product.image;
  image.alt = `${product.name} - ${product.brand}`;
  imageLink.href = whatsappLink(product);
  title.textContent = product.name;
  brand.textContent = product.brand;
  description.textContent = product.description || "Descrição em atualização. Consulte detalhes pelo WhatsApp.";
  category.textContent = product.categoryLabel;
  price.textContent = formatPrice(product.price);
  buy.href = whatsappLink(product);
  return node;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  const visibleProducts = filtered.slice(0, state.visible);
  els.productsGrid.replaceChildren(...visibleProducts.map(createCard));
  els.resultCount.textContent = `${filtered.length} produto${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}`;
  els.empty.hidden = filtered.length > 0;
  els.loadMore.hidden = filtered.length <= state.visible;
}

function createBrandButton(value, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", () => {
    els.brand.value = value;
    state.visible = pageSize;
    renderProducts();
    document.querySelector("#produtos").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return button;
}

function renderBrandList() {
  const buttons = state.catalog.brands.map((brand) => createBrandButton(brand, brand));
  els.brandList.replaceChildren(...buttons);
}

function syncModeButtons() {
  els.showAll.classList.add("active");
}

function resetFilters() {
  els.search.value = "";
  els.brand.value = "all";
  els.category.value = "all";
  els.price.value = "all";
  els.sort.value = "name";
  state.visible = pageSize;
  syncModeButtons();
  renderProducts();
}

function hideInfoPanel() {
  els.infoPanel.hidden = true;
  els.tabPanels.forEach((panel) => {
    panel.hidden = true;
    panel.classList.remove("is-active");
  });
  els.tabLinks.forEach((link) => link.classList.remove("active-tab"));
}

function showInfoPanel(tabName) {
  els.infoPanel.hidden = false;
  els.tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
  els.tabLinks.forEach((link) => {
    link.classList.toggle("active-tab", link.dataset.tab === tabName);
  });
  els.infoPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindEvents() {
  [els.search, els.brand, els.category, els.price, els.sort].forEach((control) => {
    control.addEventListener("input", () => {
      state.visible = pageSize;
      renderProducts();
    });
  });

  els.showAll.addEventListener("click", () => {
    state.visible = pageSize;
    syncModeButtons();
    renderProducts();
  });

  els.clear.addEventListener("click", resetFilters);
  els.loadMore.addEventListener("click", () => {
    state.visible += pageSize;
    renderProducts();
  });

  els.tabLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showInfoPanel(link.dataset.tab);
    });
  });

  document.querySelectorAll(".nav-links a:not([data-tab]), .brand").forEach((link) => {
    link.addEventListener("click", hideInfoPanel);
  });
}

async function init() {
  if (window.KAF_CATALOG) {
    state.catalog = window.KAF_CATALOG;
  } else {
    const response = await fetch("data/catalog.json");
    state.catalog = await response.json();
  }
  state.products = state.catalog.products;

  if (state.catalog.logo) {
    els.logo.src = state.catalog.logo;
  }

  [els.headerWhatsapp, els.footerWhatsapp].forEach((link) => {
    if (link) link.href = whatsappLink();
  });
  els.totalProducts.textContent = state.catalog.summary.totalProducts;
  els.totalBrands.textContent = state.catalog.summary.totalBrands;
  els.totalCategories.textContent = state.catalog.categories.length;

  setOptions(els.brand, state.catalog.brands, (brand) => brand, (brand) => brand, "Todas as marcas");
  setOptions(els.category, state.catalog.categories, (category) => category.value, (category) => category.label, "Todas as categorias");

  bindEvents();
  renderProducts();
  renderBrandList();
}

init().catch((error) => {
  console.error(error);
  els.resultCount.textContent = "Não foi possível carregar o catálogo.";
});
