/**
 * KATÉA — Instant Predictive Search
 */

class SearchManager {
  constructor() {
    this.modal = null;
    this.input = null;
    this.resultsContainer = null;
  }

  init() {
    this.modal = document.getElementById("searchModal");
    this.input = document.getElementById("searchInput");
    this.resultsContainer = document.getElementById("searchResults");

    if (this.input) {
      this.input.addEventListener("input", (e) => this.handleSearch(e.target.value));
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.close();
      });
    }
  }

  open() {
    if (!this.modal) this.init();
    if (this.modal) {
      this.modal.classList.add("active");
      const overlay = document.getElementById("modalOverlay");
      if (overlay) overlay.classList.add("active");
      setTimeout(() => {
        if (this.input) this.input.focus();
      }, 100);
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove("active");
      const overlay = document.getElementById("modalOverlay");
      if (overlay && !document.querySelector(".quickview-modal.active")) {
        overlay.classList.remove("active");
      }
    }
  }

  handleSearch(query) {
    if (!this.resultsContainer) return;
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--color-text-light); padding: 30px;">
          <p>Type the name of a handbag, color, or style to search...</p>
        </div>
      `;
      return;
    }

    const matches = PRODUCTS_DATA.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(cleanQuery);
      const matchHandle = p.handle.toLowerCase().includes(cleanQuery);
      const matchCategory = p.category.toLowerCase().includes(cleanQuery);
      const matchTags = p.tags && p.tags.some(t => t.toLowerCase().includes(cleanQuery));
      return matchTitle || matchHandle || matchCategory || matchTags;
    });

    if (matches.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--color-text-muted); padding: 40px;">
          <p>No crystal pieces found matching "<strong>${query}</strong>".</p>
          <p style="font-size: 0.85rem; margin-top: 8px;">Try searching for "Clutch", "Mini", "Pouch", "Pink", "Gold" or "Roma".</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = `
      <div style="margin-bottom: 16px; font-size: 0.85rem; color: var(--color-text-muted);">
        Found <strong>${matches.length}</strong> creations matching "${query}":
      </div>
      <div class="search-results-grid">
        ${matches.map(p => {
          const img = p.images && p.images.length > 0 ? p.images[0] : "";
          const price = window.Currency ? window.Currency.format(p.price) : `$${p.price}`;
          return `
            <div class="product-card" style="border: 1px solid var(--color-border-light); padding: 12px; border-radius: 4px;">
              <a href="#product/${p.handle}" onclick="window.Search.close();" style="display: block;">
                <img src="${img}" alt="${p.title}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 2px; margin-bottom: 10px;" />
                <h4 style="font-size: 0.88rem; margin-bottom: 4px;">${p.title}</h4>
                <div style="color: var(--color-accent); font-weight: 500; font-size: 0.88rem;">${price}</div>
              </a>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }
}

window.Search = new SearchManager();
