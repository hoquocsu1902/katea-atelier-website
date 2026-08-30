/**
 * KATÉA Atelier — Master Application Controller & SPA Router
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Core Systems
  if (window.UI) window.UI.init();
  if (window.Search) window.Search.init();
  if (window.Currency) window.Currency.updateDOM();

  // Set up Hash Router
  window.addEventListener("hashchange", handleRouting);
  handleRouting();

  // Initialize Homepage Tabs
  initProductTabs();

  // Setup Newsletter Submission
  setupNewsletter();
});

/**
 * SPA Hash Router
 */
function handleRouting() {
  try {
    const hash = window.location.hash || "#/";
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) {
      console.error("mainContent element not found");
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (hash === "#/" || hash === "") {
      renderHomeView();
    } else if (hash.startsWith("#collections")) {
      const handle = hash.replace("#collections/", "").replace("#collections", "") || "all-handbags";
      console.log("Routing to collection:", handle);
      renderCollectionView(handle);
    } else if (hash.startsWith("#product/")) {
      const handle = hash.replace("#product/", "");
      console.log("Routing to product:", handle);
      renderProductDetailView(handle);
    } else if (hash === "#about-us") {
      renderAboutUsView();
    } else if (hash === "#care-guide") {
      renderCareGuideView();
    } else if (hash === "#faqs") {
      renderFAQsView();
    } else if (hash.startsWith("#policies/")) {
      const policyType = hash.replace("#policies/", "");
      renderPolicyView(policyType);
    }

    if (window.Currency) window.Currency.updateDOM();
  } catch (error) {
    console.error("Routing error:", error);
    alert("Lỗi điều hướng: " + error.message);
  }
}

/**
 * 1. Home Page View
 */
function renderHomeView() {
  try {
    const homeView = document.getElementById("homeViewTemplate");
    const mainContent = document.getElementById("mainContent");
    if (!homeView) {
      console.error("homeViewTemplate not found");
      return;
    }
    if (!mainContent) {
      console.error("mainContent element not found in renderHomeView");
      return;
    }

    mainContent.innerHTML = homeView.innerHTML;
    initProductTabs();
    if (window.UI) window.UI.initHeroSlider();
  } catch (error) {
    console.error("renderHomeView error:", error);
    alert("Lỗi tải trang chủ: " + error.message);
  }
}

/**
 * 2. Collection Page View
 */
function renderCollectionView(handle) {
  try {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) {
      console.error("mainContent element not found in renderCollectionView");
      return;
    }

    if (typeof COLLECTIONS_DATA === "undefined") {
      console.error("COLLECTIONS_DATA is not defined");
      return;
    }
    if (typeof PRODUCTS_DATA === "undefined") {
      console.error("PRODUCTS_DATA is not defined");
      return;
    }

    const collection = COLLECTIONS_DATA.find(c => c.handle === handle) || COLLECTIONS_DATA[0];
    if (!collection) {
      console.error("Collection not found:", handle);
      return;
    }

    const filteredProducts = PRODUCTS_DATA.filter(p => collection.filter(p));
    console.log("Rendering collection:", handle, "with", filteredProducts.length, "products");

    mainContent.innerHTML = `
      <div class="section-alt page-hero collection-hero">
        <div class="container text-center">
          <span class="section-subtitle">KATÉA Atelier</span>
          <h1 class="page-hero-title">${collection.title}</h1>
          <p class="section-desc">${collection.description}</p>
        </div>
      </div>

      <div class="section">
        <div class="container">
          <!-- Filter & Sorting Header -->
          <div class="collection-toolbar">
            <div class="collection-count">
              Showing <strong>${filteredProducts.length}</strong> handcrafted creations
            </div>
            <div class="collection-sort">
              <label class="collection-sort-label">Sort by:</label>
              <select class="form-control collection-sort-select" onchange="sortCollection(this.value, '${handle}')">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div class="products-grid" id="collectionProductsGrid">
            ${filteredProducts.map(p => window.UI ? window.UI.renderProductCard(p) : "").join("")}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("renderCollectionView error:", error);
    alert("Lỗi hiển thị collection: " + error.message);
  }
}

function sortCollection(criteria, handle) {
  const collection = COLLECTIONS_DATA.find(c => c.handle === handle) || COLLECTIONS_DATA[0];
  let items = PRODUCTS_DATA.filter(p => collection.filter(p));

  if (criteria === "price-low") {
    items.sort((a, b) => a.price - b.price);
  } else if (criteria === "price-high") {
    items.sort((a, b) => b.price - a.price);
  } else if (criteria === "title") {
    items.sort((a, b) => a.title.localeCompare(b.title));
  }

  const grid = document.getElementById("collectionProductsGrid");
  if (grid) {
    grid.innerHTML = items.map(p => window.UI ? window.UI.renderProductCard(p) : "").join("");
      if (window.Currency) window.Currency.updateDOM();
  }
}

/**
 * 3. Product Detail Page View
 */
function renderProductDetailView(handle) {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  const product = PRODUCTS_DATA.find(p => p.handle === handle);
  if (!product) {
    mainContent.innerHTML = `
      <div class="section text-center" style="padding: 100px 0;">
        <h2>Piece Not Found</h2>
        <p style="margin-top: 12px;">The handbag you are looking for is currently not in our catalog.</p>
        <button class="btn btn-primary mt-30" onclick="window.location.hash='#/'">Back to Home</button>
      </div>
    `;
    return;
  }

  const formattedPrice = window.Currency ? window.Currency.format(product.price) : `$${product.price}`;

  mainContent.innerHTML = `
    <div class="section pdp-section">
      <div class="container">
        <!-- Breadcrumb -->
        <div class="pdp-breadcrumb">
          <a href="#/" style="color: var(--color-text-muted);">Home</a> / 
          <a href="#collections/${product.category}" style="color: var(--color-text-muted);">${product.category.replace("-", " ")}</a> / 
          <span>${product.title}</span>
        </div>

        <div class="pdp-layout">
          <!-- Gallery -->
          <div class="pdp-gallery">
            <div class="pdp-main-media">
              <img src="${product.images[0]}" id="pdpMainImg" alt="${product.title}" class="pdp-main-image" onclick="window.UI.showToast('High Resolution Atelier Zoom')" />
            </div>
            <div class="pdp-thumbnails">
              ${product.images.map((img, i) => `
                <img src="${img}" class="pdp-thumb" style="border-color: ${i === 0 ? "var(--color-primary)" : "transparent"};" 
                     onclick="document.getElementById('pdpMainImg').src='${img}'; document.querySelectorAll('.pdp-thumb').forEach(t=>t.style.borderColor='transparent'); this.style.borderColor='var(--color-primary)';" />
              `).join("")}
            </div>
          </div>

          <!-- Product Details & Private Enquiry -->
          <div class="pdp-buybox">
            <div>
              <span class="section-subtitle" style="margin-bottom: 4px;">Handmade with Love</span>
              <h1 class="pdp-title">${product.title}</h1>
              <div class="product-price pdp-price">${formattedPrice}</div>
              <div class="badge badge-stock mt-20" style="display: inline-flex;">Availability confirmed by the atelier</div>
            </div>

            <div class="pdp-description">
              ${product.description}
            </div>

            <!-- Color Variants Selection -->
            <div>
              <label class="form-label" style="margin-bottom: 10px; display: block;">Select Finish & Color Tone:</label>
              <div class="pdp-variants">
                ${product.variants.map((v, i) => `
                  <button class="btn btn-sm ${i === 0 ? "btn-primary" : "btn-secondary"} pdp-variant-btn" 
                          onclick="document.querySelectorAll('.pdp-variant-btn').forEach(b => b.className='btn btn-sm btn-secondary pdp-variant-btn'); this.className='btn btn-sm btn-primary pdp-variant-btn'; document.getElementById('pdpSelectedVariant').value='${v.title}';">
                    ${v.title}
                  </button>
                `).join("")}
              </div>
              <input type="hidden" id="pdpSelectedVariant" value="${product.variants[0]?.title || "Standard"}" />
            </div>

            <!-- Primary Private Ordering Action -->
            <div class="pdp-private-order">
              <p class="pdp-private-order-note">Interested in this piece? Contact KATÉA Atelier directly for availability, finish guidance and private ordering assistance.</p>
              <button class="btn btn-whatsapp btn-block pdp-whatsapp-btn" onclick="
                const variant = document.getElementById('pdpSelectedVariant').value;
                window.WhatsApp.orderProduct(${product.id}, variant, 1);
              ">
                Enquire & Order On WhatsApp
              </button>
            </div>

            <!-- Atelier Specifications Accordion -->
            <div class="pdp-specs">
              <div>
                <strong>Materials:</strong> ${product.details.materials}
              </div>
              <div>
                <strong>Dimensions:</strong> ${product.details.dimensions}
              </div>
              <div>
                <strong>Craftsmanship:</strong> ${product.details.craftsmanship}
              </div>
              <div>
                <strong>Delivery:</strong> Timing, destination and presentation details are confirmed with our private client service.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. Our Story Page View
 */
function renderAboutUsView() {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <section class="story-hero">
      <div class="story-hero-inner container">
        <span class="story-kicker">The House of KATÉA Atelier</span>
        <h1>Our Story</h1>
        <div class="story-hero-rule" aria-hidden="true"></div>
        <p>Beauty · Craftsmanship · Crystal</p>
      </div>
    </section>

    <section class="story-editorial section">
      <div class="container">
        <header class="story-opening">
          <span class="section-subtitle">KATÉA Atelier</span>
          <h2>Crafted with crystal,<br><em>created with love.</em></h2>
          <p class="story-lead">KATÉA was born from a love for beauty, craftsmanship, and the art of turning delicate details into something truly special.</p>
        </header>

        <div class="story-grid">
          <aside class="story-visual">
            <div class="story-image-frame">
              <img src="assets/images/katea-our-story-logo.png" alt="KATÉA Atelier — Our Story" />
            </div>
          </aside>

          <div class="story-chapters">
            <article class="story-chapter">
              <span class="story-chapter-number">01</span>
              <div>
                <span class="story-chapter-label">The Craft</span>
                <p>Each KATÉA bag is thoughtfully designed and handcrafted with premium crystal beads, transforming countless shimmering beads into an elegant statement piece.</p>
              </div>
            </article>

            <article class="story-chapter">
              <span class="story-chapter-number">02</span>
              <div>
                <span class="story-chapter-label">Our Belief</span>
                <p>We believe luxury is not only about how something looks, but also about the details, craftsmanship, and feeling it brings to the woman who carries it.</p>
              </div>
            </article>

            <article class="story-chapter">
              <span class="story-chapter-number">03</span>
              <div>
                <span class="story-chapter-label">Created in Singapore</span>
                <p>Created in Singapore, KATÉA celebrates feminine elegance through distinctive designs that are made to be admired, cherished, and enjoyed.</p>
              </div>
            </article>
          </div>
        </div>

        <div class="story-signature-block">
          <span class="story-signature-mark" aria-hidden="true">K</span>
          <div>
            <span class="story-signature-eyebrow">Our Signature</span>
            <p>KATÉA — Crafted with crystal, created with love.</p>
          </div>
        </div>

        <div class="story-actions">
          <a href="#collections/all-handbags" class="btn btn-primary">Explore The Collection</a>
          <button class="btn btn-whatsapp" onclick="window.WhatsApp.open('Hello KATÉA Atelier, I would like to learn more about your creations and private ordering service.')">Speak With The Atelier</button>
        </div>
      </div>
    </section>
  `;
}

/**
 * 5. Care Guide View
 */
function renderCareGuideView() {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="section-alt" style="padding: 60px 0;">
      <div class="container text-center">
        <span class="section-subtitle">Preserving Brilliance</span>
        <h1>Crystal Bag Care Guide</h1>
      </div>
    </div>

    <div class="section">
      <div class="container-narrow" style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h3 style="margin-bottom: 10px;">1. Cleaning & Polishing</h3>
          <p>Gently wipe the crystal beads with a soft microfiber cloth to remove fingerprints and restore natural luminescence. For deeper cleaning, lightly dampen the cloth with lukewarm water.</p>
        </div>
        <div>
          <h3 style="margin-bottom: 10px;">2. Proper Storage</h3>
          <p>Always store your KATÉA bag in its provided luxury satin dustbag when not in use. Keep away from direct sunlight, extreme humidity, or damp environments.</p>
        </div>
        <div>
          <h3 style="margin-bottom: 10px;">3. Careful Handling</h3>
          <p>Avoid contact with sharp items, heavy abrasive surfaces, perfume sprays, or alcohol-based cosmetics to protect both the crystal beads and metal hardware finishes.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 6. FAQs View
 */
function renderFAQsView() {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="section-alt" style="padding: 60px 0;">
      <div class="container text-center">
        <span class="section-subtitle">Help & Support</span>
        <h1>Frequently Asked Questions</h1>
      </div>
    </div>

    <div class="section">
      <div class="container-narrow" style="display: flex; flex-direction: column; gap: 24px;">
        <div style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 18px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 8px;">How are KATÉA bags made?</h3>
          <p>Each KATÉA piece is hand-beaded with high-clarity crystal beads and high-tensile threading . A single handbag takes between 18 to 35 hours of dedicated handcrafting.</p>
        </div>
        <div style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 18px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 8px;">Do you offer custom / bespoke colors?</h3>
          <p>Yes! We welcome bespoke requests for custom color combinations, strap lengths, and bridal orders. Please contact KATÉA Atelier directly via WhatsApp at +65 93971166 for a private enquiry.</p>
        </div>
        <div style="border-bottom: 1px solid var(--color-border-light); padding-bottom: 18px;">
          <h3 style="font-size: 1.1rem; margin-bottom: 8px;">How long does shipping take?</h3>
          <p>International express shipping typically delivers within 3-7 business days.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 7. Policies View
 */
function renderPolicyView(type) {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  const titles = {
    terms: "Terms of Sale & Service",
    shipping: "Shipping & Delivery Policy",
    refund: "Returns & Refund Policy",
    privacy: "Privacy & Cookie Policy"
  };

  mainContent.innerHTML = `
    <div class="section-alt" style="padding: 60px 0;">
      <div class="container text-center">
        <span class="section-subtitle">Legal & Atelier Standards</span>
        <h1>${titles[type] || "Store Policy"}</h1>
      </div>
    </div>

    <div class="section">
      <div class="container-narrow" style="font-size: 0.95rem; line-height: 1.8;">
        <p style="margin-bottom: 20px;">
          At <strong>KATÉA Atelier</strong>, every creation is presented with careful attention to detail and supported through our private client service.
        </p>
        <p style="margin-bottom: 20px;">
          • <strong>Orders:</strong> Product availability, preparation time, delivery and payment details are confirmed directly with our team through WhatsApp before an order proceeds.
        </p>
        <p style="margin-bottom: 20px;">
          • <strong>Returns:</strong> Standard non-customized pieces can be exchanged or returned within 14 days of delivery in pristine, unworn condition with original packaging.
        </p>
        <p style="margin-bottom: 20px;">
          • <strong>Contact:</strong> For any inquiries or order assistance, contact us directly on WhatsApp at <strong>+65 93971166</strong>.
        </p>
      </div>
    </div>
  `;
}

/**
 * Homepage Tabs Switcher
 */
function initProductTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const container = document.getElementById("tabProductsGrid");
  if (!tabs.length || !container) return;

  const renderTab = (tabName) => {
    let items = [];
    if (tabName === "bestsellers") {
      items = PRODUCTS_DATA.filter(p => p.is_best_seller).slice(0, 8);
    } else {
      items = PRODUCTS_DATA.filter(p => p.is_new || !p.is_best_seller).slice(0, 8);
    }

    container.innerHTML = items.map(p => window.UI ? window.UI.renderProductCard(p) : "").join("");
      if (window.Currency) window.Currency.updateDOM();
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderTab(tab.getAttribute("data-tab"));
    });
  });

  // Render initial tab
  renderTab("bestsellers");
}

/**
 * Newsletter Form
 */
function setupNewsletter() {
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      if (input && input.value) {
        if (window.UI) window.UI.showToast('Welcome to KATÉA Community! Use code "KATEA10" for 10% off.', "success");
        input.value = "";
      }
    });
  });
}
