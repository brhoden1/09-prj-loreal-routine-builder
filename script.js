/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const userInput = document.getElementById("userInput");
const generateRoutineButton = document.getElementById("generateRoutine");

const conversationMessages = [
  {
    role: "system",
    content:
      "You are a friendly, fun, and helpful assistant. You will answer questions about L'Oréal products and services. Ask relevant questions to continue the conversation, or otherwise offer more help. Include emojis if appropriate. If a user's question is unrelated to L'Oréal, please politely redirect them to the topic. Responses should be consise and clear. Use bullet points or numbers for lists when appropriate, and add line breaks and paragraphs for better readability.",
  },
  {
    role: "assistant",
    content: "Hello! Ask me about L'Oréal products or routines.",
  },
];

/* Track which products are selected */
let selectedProducts = [];
let allProducts = [];

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
  allProducts = data.products;
  return allProducts;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      /* Create a unique ID using product name and brand */
      const uniqueId = `${product.name}|${product.brand}`;
      return `
    <div class="product-card" data-product-id="${uniqueId}" data-product-name="${product.name}" data-product-brand="${product.brand}">
      <button class="info-btn" type="button" data-product-id="${uniqueId}" aria-label="More info about ${product.name}">
        <i class="fa-solid fa-circle-info"></i>
      </button>
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

  /* Add click listeners to each info button */
  document.querySelectorAll(".info-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = button.getAttribute("data-product-id");
      const product = allProducts.find(
        (item) => `${item.name}|${item.brand}` === productId,
      );

      if (product) {
        openProductModal(product);
      }
    });
  });
}

/* Toggle a product's selection when clicked */
function toggleProductSelection(e) {
  const card = e.currentTarget || e.target.closest(".product-card");
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

function formatCategory(category) {
  const categoryLabels = {
    cleanser: "Cleanser",
    moisturizer: "Moisturizer",
    skincare: "Skincare",
    haircare: "Haircare",
    makeup: "Makeup",
    "hair color": "Hair Color",
    "hair styling": "Hair Styling",
    "men's grooming": "Men's Grooming",
    suncare: "Suncare",
    fragrance: "Fragrance",
  };

  return categoryLabels[category] || category;
}

function openProductModal(product) {
  closeProductModal();

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalProductName">
      <button class="modal-close-btn" type="button" aria-label="Close product details">×</button>
      <img src="${product.image}" alt="${product.name}" class="modal-image">
      <div class="modal-body">
        <p class="modal-category">${formatCategory(product.category)}</p>
        <h3 id="modalProductName">${product.name}</h3>
        <p class="modal-brand">${product.brand}</p>
        <p class="modal-description">${product.description}</p>
      </div>
      <div class="modal-actions">
        <button class="modal-add-btn" type="button">Add to selected products</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeProductModal();
    }
  });

  modalOverlay
    .querySelector(".modal-close-btn")
    .addEventListener("click", closeProductModal);

  modalOverlay.querySelector(".modal-add-btn").addEventListener("click", () => {
    const productId = `${product.name}|${product.brand}`;
    const card = document.querySelector(`[data-product-id="${productId}"]`);

    if (card) {
      toggleProductSelection({ currentTarget: card });
    }

    closeProductModal();
  });

  document.addEventListener("keydown", handleModalKeydown);
}

function closeProductModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
  document.removeEventListener("keydown", handleModalKeydown);
}

function handleModalKeydown(e) {
  if (e.key === "Escape") {
    closeProductModal();
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

// Set initial message
renderMessages();

//Cloudfare worker URL
const workerUrl = "https://loreal-chatbot-worker.brhoden1.workers.dev/";

function buildRoutinePrompt() {
  if (selectedProducts.length === 0) {
    return "Create a simple beginner-friendly routine for me and ask me to choose products if needed.";
  }

  const productList = selectedProducts
    .map((product) => `${product.name} by ${product.brand}`)
    .join(", ");

  return `Create a personalized routine for me using these selected products: ${productList}. Keep the routine beginner-friendly, explain the order to use them, and mention what to use in the morning and at night.`;
}

async function sendMessageToWorker(messageText, shouldShowInChat = true) {
  conversationMessages.push({
    role: "user",
    content: messageText,
    hidden: !shouldShowInChat,
  });

  if (shouldShowInChat) {
    renderMessages();
  }

  // Show a loading message while the API responds
  const loadingMessage = { role: "assistant", content: "Thinking..." };
  conversationMessages.push(loadingMessage);
  renderMessages();

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationMessages,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      const assistantReply = data.choices[0].message.content;
      conversationMessages.splice(
        conversationMessages.indexOf(loadingMessage),
        1,
      );
      conversationMessages.push({ role: "assistant", content: assistantReply });
      renderMessages();
    } else {
      conversationMessages.splice(
        conversationMessages.indexOf(loadingMessage),
        1,
      );
      conversationMessages.push({
        role: "assistant",
        content: "No response received from the API.",
      });
      renderMessages();
    }
  } catch (error) {
    conversationMessages.splice(
      conversationMessages.indexOf(loadingMessage),
      1,
    );
    conversationMessages.push({
      role: "assistant",
      content: "Sorry, something went wrong. Please try again later.",
    });
    renderMessages();
    console.error(error);
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  userInput.value = "";
  await sendMessageToWorker(userText);
});

/* Build a routine from the selected products */
generateRoutineButton.addEventListener("click", async () => {
  const routinePrompt = buildRoutinePrompt();
  await sendMessageToWorker(routinePrompt, false);
});

function renderMessages() {
  chatWindow.innerHTML = "";

  conversationMessages
    .filter((message) => message.role !== "system" && !message.hidden)
    .forEach((message) => {
      const bubble = document.createElement("div");
      bubble.className = `msg ${message.role === "user" ? "user" : "ai"}`;
      bubble.textContent = message.content;
      chatWindow.appendChild(bubble);
    });

  chatWindow.scrollTop = chatWindow.scrollHeight;
}
