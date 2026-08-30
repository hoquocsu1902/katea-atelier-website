/**
 * KATÉA Atelier — Multi-Currency Converter
 */

const CURRENCIES = {
  SGD: { code: "SGD", symbol: "S$", rate: 1.0, decimals: 2 },
  USD: { code: "USD", symbol: "$", rate: 0.75, decimals: 2 },
  EUR: { code: "EUR", symbol: "€", rate: 0.69, decimals: 2 },
  GBP: { code: "GBP", symbol: "£", rate: 0.59, decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", rate: 1.15, decimals: 2 },
  VND: { code: "VND", symbol: "₫", rate: 18500, decimals: 0 }
};

class CurrencyManager {
  constructor() {
    try {
      this.current = (typeof localStorage !== "undefined" && localStorage.getItem("katea_currency")) || "SGD";
    } catch (_) {
      this.current = "SGD";
    }
    if (!CURRENCIES[this.current]) this.current = "SGD";
  }

  setCurrency(code) {
    if (!CURRENCIES[code]) return;
    this.current = code;
    try { if (typeof localStorage !== "undefined") localStorage.setItem("katea_currency", code); } catch (_) {}
    this.updateDOM();
  }

  convert(amountInBaseSGD) {
    const curr = CURRENCIES[this.current] || CURRENCIES.SGD;
    return amountInBaseSGD * curr.rate;
  }

  format(amountInBaseSGD) {
    const curr = CURRENCIES[this.current] || CURRENCIES.SGD;
    const converted = this.convert(amountInBaseSGD);
    if (curr.code === "VND") {
      return `${converted.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}${curr.symbol}`;
    }
    return `${curr.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: curr.decimals, maximumFractionDigits: curr.decimals })}`;
  }

  updateDOM() {
    document.querySelectorAll("[data-price-base]").forEach(el => {
      const base = parseFloat(el.getAttribute("data-price-base"));
      if (!isNaN(base)) {
        el.textContent = this.format(base);
      }
    });

    const selects = document.querySelectorAll(".currency-select");
    selects.forEach(s => s.value = this.current);
  }
}

window.Currency = new CurrencyManager();
