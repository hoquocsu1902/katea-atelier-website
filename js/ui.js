/**
 * KATÉA Atelier — UI Components & Interaction Engine
 */

// Optimize Cloudinary URLs for mobile performance (f_auto, q_auto, w)
function optimizeCloudinary(url, width = 600) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}

class UIManager {
  constructor() {
    this.currentHeroSlide = 0;
    this.heroInterval = null;
    this.announcementInterval = null;
    this.currentAnnouncement = 0;
  }

  init() {
    this.initAnnouncementBar();
    this.initHeroSlider();
    this.initHeaderScroll();
    this.initMobileMenu();
    this.initModals();
  }

  // ==========================================
  // Announcement Bar Slider
  // ==========================================
  initAnnouncementBar() {
    const items = document.querySelectorAll(".announcement-item");
    if (items.length <= 1) return;
    if (this.announcementInterval) clearInterval(this.announcementInterval);

    this.announcementInterval = setInterval(() => {
      if (document.hidden) return;
      items[this.currentAnnouncement].classList.remove("active");
      this.currentAnnouncement = (this.currentAnnouncement + 1) % items.length;
      items[this.currentAnnouncement].classList.add("active");
    }, 4000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      // ensure visible item stays in sync after tab switch
    });
  }

  // ==========================================
  // Hero Slideshow
  // ==========================================
  initHeroSlider() {
    const slider = document.querySelector(".hero-slider-section");
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (!slider || slides.length === 0) return;

    // The homepage is rendered by the SPA router, so safely dispose listeners
    // and timers from any previous hero instance before wiring a new one.
    if (this.heroAbort) this.heroAbort.abort();
    this.heroAbort = new AbortController();
    const { signal } = this.heroAbort;
    clearTimeout(this.heroInterval);

    const duration = 7400;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const currentEl = slider.querySelector(".hero-counter-current");
    const totalEl = slider.querySelector(".hero-counter-total");
    const pad = (n) => String(n).padStart(2, "0");

    slider.style.setProperty("--hero-duration", `${duration}ms`);
    if (totalEl) totalEl.textContent = pad(slides.length);

    let timerStartedAt = 0;
    let timerRemaining = duration;
    let isPaused = false;
    let touchStartX = 0;
    let touchStartY = 0;

    const updateCounter = (index) => {
      if (currentEl) currentEl.textContent = pad(index + 1);
    };

    const resetParallax = () => {
      slider.style.setProperty("--hero-parallax-x", "0px");
      slider.style.setProperty("--hero-parallax-y", "0px");
    };

    const schedule = (remaining = duration) => {
      clearTimeout(this.heroInterval);
      if (reduceMotion || document.hidden || isPaused || slides.length <= 1) return;
      timerRemaining = Math.max(250, remaining);
      timerStartedAt = performance.now();
      this.heroInterval = setTimeout(() => {
        showSlide((this.currentHeroSlide + 1) % slides.length, "next");
      }, timerRemaining);
    };

    const pause = () => {
      if (isPaused || reduceMotion) return;
      isPaused = true;
      slider.classList.add("is-paused");
      if (timerStartedAt) {
        timerRemaining = Math.max(250, timerRemaining - (performance.now() - timerStartedAt));
      }
      clearTimeout(this.heroInterval);
    };

    const resume = () => {
      if (!isPaused || reduceMotion) return;
      isPaused = false;
      slider.classList.remove("is-paused");
      schedule(timerRemaining);
    };

    const restartTimer = () => {
      timerRemaining = duration;
      if (!isPaused) schedule(duration);
    };

    const showSlide = (index, direction = "next") => {
      const normalized = (index + slides.length) % slides.length;
      const previous = this.currentHeroSlide;

      slides.forEach((slide, i) => {
        const active = i === normalized;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.classList.remove("from-next", "from-prev");
        if (active && i !== previous) slide.classList.add(direction === "prev" ? "from-prev" : "from-next");
      });

      dots.forEach((dot, i) => {
        const active = i === normalized;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });

      this.currentHeroSlide = normalized;
      updateCounter(normalized);
      resetParallax();
      restartTimer();
    };

    const nextSlide = () => showSlide(this.currentHeroSlide + 1, "next");
    const prevSlide = () => showSlide(this.currentHeroSlide - 1, "prev");

    slider.querySelector(".hero-next")?.addEventListener("click", nextSlide, { signal });
    slider.querySelector(".hero-prev")?.addEventListener("click", prevSlide, { signal });

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => showSlide(idx, idx < this.currentHeroSlide ? "prev" : "next"), { signal });
    });

    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevSlide();
      }
    }, { signal });

    // Pause editorial auto-rotation while the visitor is actively exploring.
    if (canHover) {
      slider.addEventListener("mouseenter", pause, { signal });
      slider.addEventListener("mouseleave", () => {
        resetParallax();
        resume();
      }, { signal });

      slider.addEventListener("pointermove", (event) => {
        if (reduceMotion) return;
        const rect = slider.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
        slider.style.setProperty("--hero-parallax-x", `${(x * -7).toFixed(2)}px`);
        slider.style.setProperty("--hero-parallax-y", `${(y * -5).toFixed(2)}px`);
      }, { signal });
    }

    // Native-feeling swipe navigation for phones and iPads.
    slider.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true, signal });

    slider.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dx < 0 ? nextSlide() : prevSlide();
      }
    }, { passive: true, signal });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    }, { signal });

    // Sync the markup's initial active state and start the progress indicator.
    this.currentHeroSlide = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));
    updateCounter(this.currentHeroSlide);
    slides.forEach((slide, i) => slide.setAttribute("aria-hidden", i === this.currentHeroSlide ? "false" : "true"));
    dots.forEach((dot, i) => dot.setAttribute("aria-current", i === this.currentHeroSlide ? "true" : "false"));
    schedule(duration);
  }

  // ==========================================
  // Sticky Header on Scroll
  // ==========================================
  initHeaderScroll() {
    const header = document.querySelector(".site-header");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header?.classList.add("scrolled");
      } else {
        header?.classList.remove("scrolled");
      }
    });
  }

  // ==========================================
  // Mobile Navigation Drawer
  // ==========================================
  initMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const drawer = document.getElementById("mobileDrawer");
    const overlay = document.getElementById("mobileDrawerOverlay");
    const closeBtn = document.getElementById("mobileDrawerClose");

    const openMenu = () => {
      drawer?.classList.add("active");
      overlay?.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
      drawer?.classList.remove("active");
      overlay?.classList.remove("active");
      document.body.style.overflow = "";
    };

    toggle?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);

    document.querySelectorAll(".mobile-nav-link, .mobile-sub-link").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  }

  // ==========================================
  // Modal Overlays
  // ==========================================
  initModals() {
    const overlay = document.getElementById("modalOverlay");
    overlay?.addEventListener("click", () => {
      window.Search?.close();
      this.closeQuickView();
      overlay.classList.remove("active");
    });
  }

  // ==========================================
  // Product Card Template
  // ==========================================
  renderProductCard(product) {
    const rawPrimary = product.images && product.images.length > 0 ? product.images[0] : "";
    const rawSecondary = product.images && product.images.length > 1 ? product.images[1] : rawPrimary;
    const primaryImg = optimizeCloudinary(rawPrimary, 600);
    const secondaryImg = optimizeCloudinary(rawSecondary, 600);
    const primarySrcSet = rawPrimary ? `${optimizeCloudinary(rawPrimary, 400)} 400w, ${primaryImg} 600w, ${optimizeCloudinary(rawPrimary, 800)} 800w` : "";
    const formattedPrice = window.Currency ? window.Currency.format(product.price) : `$${product.price}`;
    const comparePrice = product.compare_price ? (window.Currency ? window.Currency.format(product.compare_price) : `$${product.compare_price}`) : "";

    // Badges — unified to NEW ARRIVAL per request (preserve gold/dark styling for visual variety)
    let badgeHtml = "";
    if (product.is_new) {
      badgeHtml = `<span class="badge badge-gold">NEW ARRIVAL</span>`;
    } else if (product.is_best_seller) {
      badgeHtml = `<span class="badge badge-dark">NEW ARRIVAL</span>`;
    } else if (product.is_rose) {
      badgeHtml = `<span class="badge badge-rose">Rose Edition</span>`;
    }

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrap">
          <div class="product-badges">${badgeHtml}</div>
          <a href="#product/${product.handle}" style="display: block; width: 100%; height: 100%;">
            <img src="${primaryImg}" srcset="${primarySrcSet}" sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" alt="${product.title}" class="product-img" loading="lazy" decoding="async" fetchpriority="low" />
            <img src="${secondaryImg}" alt="${product.title}" class="product-img product-img-secondary" loading="lazy" decoding="async" />
          </a>
          <div class="product-card-actions">
            <button class="product-action-btn" onclick="window.UI.openQuickView(${product.id})">
              View Details
            </button>
            <button class="product-action-btn product-action-whatsapp" onclick="window.WhatsApp.orderProduct(${product.id})" title="Enquire via WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.808-.432-1.396-.566-2.316-1.99-2.386-2.084-.07-.093-.57-.758-.57-1.445 0-.688.355-1.027.481-1.167.126-.14.275-.175.367-.175.091 0 .183.001.263.005.084.004.197-.032.308.234.113.27.387.944.421 1.014.034.07.057.151.009.245-.047.094-.07.152-.14.233-.07.082-.148.182-.211.245-.07.07-.143.146-.062.285.082.139.363.598.779.969.536.478.988.626 1.127.696.14.07.221.058.303-.035.082-.093.35-.407.444-.547.093-.14.187-.117.315-.07.128.047.813.383.953.453.14.07.233.105.268.163.035.058.035.337-.109.742z"/></svg>
              Enquire
            </button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category.replace("-", " ")}</span>
          <a href="#product/${product.handle}" class="product-title">${product.title}</a>
          <div class="product-price-wrap">
            <span class="product-price" data-price-base="${product.price}">${formattedPrice}</span>
            ${comparePrice ? `<span class="product-compare-price">${comparePrice}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // View Details Modal
  // ==========================================
  openQuickView(productId) {
    const product = PRODUCTS_DATA.find(p => p.id == productId || p.handle === productId);
    if (!product) return;

    const modal = document.getElementById("quickViewModal");
    const overlay = document.getElementById("modalOverlay");
    if (!modal) return;

    const mainImg = product.images && product.images.length > 0 ? product.images[0] : "";
    const formattedPrice = window.Currency ? window.Currency.format(product.price) : `$${product.price}`;

    modal.innerHTML = `
      <button class="close-btn quickview-close" onclick="window.UI.closeQuickView()">✕</button>
      <div class="quickview-gallery">
        <img src="${mainImg}" alt="${product.title}" id="qvMainImg" class="quickview-main-img" />
      </div>
      <div class="quickview-info">
        <span class="section-subtitle" style="margin-bottom: 0;">Handcrafted Crystal Bag</span>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">${product.title}</h2>
        <div class="product-price" style="font-size: 1.25rem; color: var(--color-primary); font-weight: 500;">${formattedPrice}</div>
        
        <p style="font-size: 0.88rem; line-height: 1.6; color: var(--color-text-muted);">
          ${product.description.replace(/<[^>]*>?/gm, "").slice(0, 240)}...
        </p>

        <!-- Variants Selection -->
        <div style="margin-top: 8px;">
          <label class="form-label" style="margin-bottom: 8px; display: block;">Select Color Tone:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.variants.map((v, i) => `
              <button class="btn btn-sm ${i === 0 ? "btn-primary" : "btn-secondary"} qv-variant-btn" data-variant="${v.title.replace(/"/g, '&quot;')}">
                ${v.title}
              </button>
            `).join("")}
          </div>
          <input type="hidden" id="qvSelectedVariant" value="${(product.variants[0]?.title || "Standard").replace(/"/g, '&quot;')}" />
        </div>

        <div class="quickview-private-note">For availability and ordering, contact KATÉA Atelier directly with your selected finish.</div>
        <button class="btn btn-whatsapp btn-block qv-whatsapp-btn" data-product-id="${product.id}">
          Enquire & Order On WhatsApp
        </button>

        <a href="#product/${product.handle}" onclick="window.UI.closeQuickView()" style="text-align: center; font-size: 0.82rem; text-decoration: underline; color: var(--color-text-muted); margin-top: 4px;">
          View Complete Atelier Details →
        </a>
      </div>
    `;

    modal.classList.add("active");
    if (overlay) overlay.classList.add("active");

    requestAnimationFrame(() => {
      const qvVariantBtns = modal.querySelectorAll(".qv-variant-btn");
      const qvVariantInput = modal.querySelector("#qvSelectedVariant");
      qvVariantBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          qvVariantBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); });
          btn.classList.remove("btn-secondary"); btn.classList.add("btn-primary");
          if (qvVariantInput) qvVariantInput.value = btn.dataset.variant || "Standard";
        });
      });
      const qvWaBtn = modal.querySelector(".qv-whatsapp-btn");
      if (qvWaBtn) qvWaBtn.addEventListener("click", () => {
        const variant = modal.querySelector("#qvSelectedVariant")?.value || "Standard";
        const pid = qvWaBtn.dataset.productId;
        window.WhatsApp?.orderProduct(pid, variant, 1);
      });
    });
  }

  closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    if (modal) modal.classList.remove("active");
  }

  // ==========================================
  // Toast Notifications
  // ==========================================
  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.UI = new UIManager();
