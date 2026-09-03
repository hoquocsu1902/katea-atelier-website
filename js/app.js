/**
 * KATÉA Atelier — Master Application Controller & SPA Router
 */

function optimizeCloudinary(url, width = 800) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}

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

    const isEmpty = filteredProducts.length === 0;
    const gridHtml = isEmpty
      ? `<div class="collection-empty" style="text-align:center;padding:48px 0;color:var(--color-text-muted);">
           <p style="font-size:1.05rem;margin-bottom:12px;">No creations in this collection yet.</p>
           <p style="font-size:0.9rem;margin-bottom:20px;">All 4 handcrafted pieces are currently curated in All Handbags. Discover the full collection.</p>
           <a href="#collections/all-handbags" class="btn btn-primary">View All Handbags</a>
         </div>`
      : filteredProducts.map(p => window.UI ? window.UI.renderProductCard(p) : "").join("");

    // Preserve All Handbags invariant: COLLECTIONS_DATA[0] filter is () => true so it always shows 4
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
              <select class="form-control collection-sort-select" onchange="sortCollection(this.value, '${collection.handle}')">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div class="products-grid" id="collectionProductsGrid">
            ${gridHtml}
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
  try {
    if (typeof COLLECTIONS_DATA === "undefined" || typeof PRODUCTS_DATA === "undefined") return;
    const collection = COLLECTIONS_DATA.find(c => c.handle === handle) || COLLECTIONS_DATA[0];
    if (!collection || typeof collection.filter !== "function") return;
    let items = PRODUCTS_DATA.filter(p => {
      try { return collection.filter(p); } catch (_) { return false; }
    });

  if (criteria === "price-low") {
    items.sort((a, b) => a.price - b.price);
  } else if (criteria === "price-high") {
    items.sort((a, b) => b.price - a.price);
  } else if (criteria === "title") {
    items.sort((a, b) => a.title.localeCompare(b.title));
  }

  const grid = document.getElementById("collectionProductsGrid");
  if (grid) {
    if (items.length === 0) {
      grid.innerHTML = `<div class="collection-empty" style="text-align:center;padding:32px 0;color:var(--color-text-muted);">No creations to sort in this collection.</div>`;
    } else {
      grid.innerHTML = items.map(p => window.UI ? window.UI.renderProductCard(p) : "").join("");
    }
      if (window.Currency) window.Currency.updateDOM();
  }
  } catch (e) { console.error("sortCollection error:", e); }
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
              <img src="${optimizeCloudinary(product.images[0], 900)}" srcset="${optimizeCloudinary(product.images[0], 600)} 600w, ${optimizeCloudinary(product.images[0], 900)} 900w, ${optimizeCloudinary(product.images[0], 1200)} 1200w" sizes="(max-width: 900px) 100vw, 50vw" id="pdpMainImg" alt="${product.title}" class="pdp-main-image" loading="eager" decoding="async" fetchpriority="high" />
            </div>
            <div class="pdp-thumbnails">
              ${product.images.map((img, i) => `
                <img src="${optimizeCloudinary(img, 200)}" data-src="${optimizeCloudinary(img, 900)}" data-raw="${img}" class="pdp-thumb" style="border-color: ${i === 0 ? "var(--color-primary)" : "transparent"};" alt="${product.title} thumbnail ${i+1}" loading="lazy" decoding="async" />
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
              <label class="form-label" style="margin-bottom: 10px; display: block;">Select Color Tone:</label>
              <div class="pdp-variants">
                ${product.variants.map((v, i) => `
                  <button class="btn btn-sm ${i === 0 ? "btn-primary" : "btn-secondary"} pdp-variant-btn" data-variant="${v.title.replace(/"/g, '&quot;')}">
                    ${v.title}
                  </button>
                `).join("")}
              </div>
              <input type="hidden" id="pdpSelectedVariant" value="${(product.variants[0]?.title || "Standard").replace(/"/g, '&quot;')}" />
            </div>

            <!-- Primary Private Ordering Action -->
            <div class="pdp-private-order">
              <p class="pdp-private-order-note">Interested in this piece? Contact KATÉA Atelier directly for availability, finish guidance and private ordering assistance.</p>
              <button class="btn btn-whatsapp btn-block pdp-whatsapp-btn" data-product-id="${product.id}">
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

  // Bind PDP gallery and variant interactions — single-tap instant (pointerdown, no 300ms delay)
  requestAnimationFrame(() => {
    const pdpMainImg = document.getElementById("pdpMainImg");
    if (pdpMainImg) { pdpMainImg.style.willChange = "opacity"; pdpMainImg.style.transition = "opacity 0.12s ease"; }
    const pdpMainMedia = document.querySelector(".pdp-main-media");
    const pdpThumbs = document.querySelectorAll(".pdp-thumb");
    let currentIdx = 0;
    const total = pdpThumbs.length;
    const updateIdx = (idx) => {
      // lock scroll to prevent auto-zoom/scroll down after variant tap (keep full view like ảnh 1)
      const lockY = window.scrollY;
      currentIdx = (idx + total) % total;
      const thumb = pdpThumbs[currentIdx];
      const raw = thumb?.dataset.raw;
      const src = thumb?.dataset.src;
      if (pdpMainImg && src) {
        pdpMainImg.src = src;
        if (raw) {
          const s600 = raw.includes("res.cloudinary.com") ? raw.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_600/") : raw;
          const s900 = src;
          const s1200 = raw.includes("res.cloudinary.com") ? raw.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1200/") : raw;
          pdpMainImg.srcset = `${s600} 600w, ${s900} 900w, ${s1200} 1200w`;
        }
        // instant without zoom — contain keeps full bag visible
        pdpMainImg.style.opacity = "0.98";
        requestAnimationFrame(() => pdpMainImg.style.opacity = "1");
      }
      pdpThumbs.forEach((t,i) => t.style.borderColor = i===currentIdx ? "var(--color-primary)" : "transparent");
      document.querySelectorAll(".pdp-dot").forEach((d,i) => d.classList.toggle("active", i===currentIdx));
      // sync variant: SELENA has 6 images but 2 variants (0-2 Classic, 3-5 Noir) -> must map
      const vBtns = document.querySelectorAll(".pdp-variant-btn");
      if (vBtns.length > 0) {
        let vIdx = currentIdx;
        if (product.handle === "selena" && vBtns.length === 2 && total === 6) {
          vIdx = currentIdx < 3 ? 0 : 1;
        } else if (product.handle === "bella" && vBtns.length === 2 && total === 6) {
          vIdx = currentIdx < 3 ? 1 : 0; // 0-2 Teal Blue, 3-5 Pearl White
        } else if (vBtns.length !== total) {
          vIdx = Math.floor((currentIdx / total) * vBtns.length);
        }
        vBtns.forEach((b,i) => { b.classList.toggle("btn-primary", i===vIdx); b.classList.toggle("btn-secondary", i!==vIdx); });
        const vInput = document.getElementById("pdpSelectedVariant");
        if (vInput && vBtns[vIdx]) vInput.value = vBtns[vIdx].dataset.variant || "Standard";
      }
      // restore scroll to keep toàn cảnh như ảnh 1, không trượt xuống
      requestAnimationFrame(() => window.scrollTo({top: lockY, behavior: "auto"}));
      setTimeout(() => window.scrollTo({top: lockY, behavior: "auto"}), 80);
    };
    // Dots for mobile swipe indication
    if (total > 1 && pdpMainMedia && !document.querySelector(".pdp-dots")) {
      const dots = document.createElement("div");
      dots.className = "pdp-dots";
      dots.style.cssText = "display:flex;gap:6px;justify-content:center;margin-top:10px;";
      product.images.forEach((_,i) => {
        const dot = document.createElement("button");
        dot.className = "pdp-dot" + (i===0 ? " active" : "");
        dot.style.cssText = "width:14px;height:14px;padding:4px;background-clip:content-box;border-radius:50%;background-color:var(--color-border);border:4px solid transparent;transition:all 0.12s;touch-action:manipulation;";
        dot.setAttribute("aria-label", `View image ${i+1}`);
        let lastDotTap=0;
        const dotHandler = (e)=>{ const now=Date.now(); if(now-lastDotTap<350) return; lastDotTap=now; if(e && e.cancelable) e.preventDefault(); updateIdx(i); };
        dot.addEventListener("pointerdown", dotHandler, {passive:false});
        dot.addEventListener("click", dotHandler, {passive:true});
        dots.appendChild(dot);
      });
      pdpMainMedia.insertAdjacentElement("afterend", dots);
      // style active
      const style = document.createElement("style");
      style.textContent = ".pdp-dot.active{background:var(--color-primary)!important;width:18px!important;border-radius:999px!important;}";
      document.head.appendChild(style);
      // swipe
      let sx=0, sy=0;
      pdpMainMedia.addEventListener("touchstart", e=>{ sx=e.changedTouches[0].clientX; sy=e.changedTouches[0].clientY; }, {passive:true});
      pdpMainMedia.addEventListener("touchend", e=>{
        const dx=e.changedTouches[0].clientX - sx;
        const dy=e.changedTouches[0].clientY - sy;
        if (Math.abs(dx)>48 && Math.abs(dx) > Math.abs(dy)*1.2) { dx<0 ? updateIdx(currentIdx+1) : updateIdx(currentIdx-1); }
      }, {passive:true});
    }
    let lastThumbTap = 0;
    pdpThumbs.forEach((thumb, idx) => {
      const h = (e)=>{ const now=Date.now(); if(now-lastThumbTap<350) return; lastThumbTap=now; if(e && e.cancelable) e.preventDefault(); updateIdx(idx); };
      thumb.style.touchAction = "manipulation";
      thumb.style.cursor = "pointer";
      thumb.addEventListener("pointerdown", h, {passive:false});
      thumb.addEventListener("click", h, {passive:true});
    });
    // also make main image swipable via pointer
    if (pdpMainImg) {
      pdpMainImg.style.touchAction = "pan-y";
      pdpMainImg.style.cursor = "zoom-in";
      pdpMainImg.addEventListener("click", () => window.UI?.showToast("High Resolution Atelier Zoom"));
    }

    // Preload variant images for instant swap on mobile (remove perceived delay)
    product.images.forEach(src => {
      const raw = src;
      const opt = raw.includes("res.cloudinary.com") ? raw.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_900/") : raw;
      const img = new Image();
      img.decoding = "async";
      img.src = opt;
    });

    const variantBtns = document.querySelectorAll(".pdp-variant-btn");
    const variantInput = document.getElementById("pdpSelectedVariant");
    let lastVariantTap = 0;
    variantBtns.forEach((btn, vi) => {
      btn.setAttribute("tabindex", "-1");
      const vHandler = (e)=> {
        const now = Date.now();
        if (now - lastVariantTap < 350) return;
        lastVariantTap = now;
        if(e && e.cancelable) { e.preventDefault(); e.stopPropagation(); }
        // prevent focus scroll that causes viewport jump on mobile
        if (document.activeElement === btn) btn.blur();
        document.documentElement.style.scrollBehavior = "auto";
        variantBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); });
        btn.classList.remove("btn-secondary"); btn.classList.add("btn-primary");
        if (variantInput) variantInput.value = btn.dataset.variant || "Standard";
        if (typeof updateIdx === "function" && total>0) {
          let targetIdx = vi % total;
          if (product.handle === "selena" && total === 6) targetIdx = vi === 0 ? 0 : 3;
          else if (product.handle === "bella" && total === 6) targetIdx = vi === 0 ? 3 : 0; // Pearl White -> #4, Teal Blue -> #1
          updateIdx(targetIdx);
        }
        setTimeout(()=> document.documentElement.style.scrollBehavior = "", 300);
      };
      btn.style.touchAction = "manipulation";
      btn.addEventListener("pointerdown", vHandler, {passive:false});
      btn.addEventListener("click", vHandler, {passive:false});
    });

    const waBtn = document.querySelector(".pdp-whatsapp-btn");
    if (waBtn) waBtn.addEventListener("click", () => {
      const variant = document.getElementById("pdpSelectedVariant")?.value || "Standard";
      window.WhatsApp?.orderProduct(product.id, variant, 1);
    });
  });
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
      items = PRODUCTS_DATA.filter(p => p.is_new).slice(0, 8);
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
