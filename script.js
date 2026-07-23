/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Track which products are selected */
let selectedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      /* Create a unique ID using product name and brand */
      const uniqueId = `${product.name}|${product.brand}`;
      return `
    <div class="product-card" data-product-id="${uniqueId}" data-product-name="${product.name}" data-product-brand="${product.brand}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `;
    })
    .join("");

  /* Add click event listeners to each product card */
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", toggleProductSelection);
  });
}

/* Toggle a product's selection when clicked */
function toggleProductSelection(e) {
  const card = e.currentTarget;
  const productId = card.getAttribute("data-product-id");
  const productName = card.getAttribute("data-product-name");
  const productBrand = card.getAttribute("data-product-brand");
  /* productId is already unique (name|brand), so we just use it directly */

  /* Check if product is already selected by comparing unique IDs */
  const isAlreadySelected = selectedProducts.some((p) => p.id === productId);

  if (isAlreadySelected) {
    /* Unselect: remove from array and remove visual indicator */
    selectedProducts = selectedProducts.filter((p) => p.id !== productId);
    card.classList.remove("selected");
  } else {
    /* Select: add to array and add visual indicator */
    selectedProducts.push({
      id: productId,
      name: productName,
      brand: productBrand,
    });
    card.classList.add("selected");
  }

  /* Update the selected products display */
  renderSelectedProducts();
}

/* Render the selected products list with remove buttons */
function renderSelectedProducts() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `<p style="color: #999; font-size: 14px;">No products selected</p>`;
  } else {
    selectedProductsList.innerHTML = selectedProducts
      .map(
        (product) => `
      <div class="selected-product-tag">
        <span>${product.name}</span>
        <button class="remove-product-btn" data-product-id="${product.id}" type="button" aria-label="Remove ${product.name}">×</button>
      </div>
    `,
      )
      .join("");

    /* Add event listeners to all remove buttons */
    document.querySelectorAll(".remove-product-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const productId = btn.getAttribute("data-product-id");
        /* Remove from selected products array */
        selectedProducts = selectedProducts.filter((p) => p.id !== productId);
        /* Remove visual indicator from product card */
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (card) card.classList.remove("selected");
        /* Re-render the selected products list */
        renderSelectedProducts();
      });
    });
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  displayProducts(filteredProducts);

  /* Re-apply selected styling to products currently visible and already selected */
  const visibleCards = document.querySelectorAll(".product-card");
  visibleCards.forEach((card) => {
    const cardId = card.getAttribute("data-product-id");
    const isSelected = selectedProducts.some((p) => p.id === cardId);
    if (isSelected) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
