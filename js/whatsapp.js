/**
 * KATÉA Atelier — WhatsApp Private Enquiry Integration
 * Phone: +65 93971166
 */

const WHATSAPP_CONFIG = {
  phoneNumber: "6593971166",
  displayPhone: "+65 93971166",
  brandName: "KATÉA Atelier"
};

/**
 * Build one universal WhatsApp link that works on mobile and desktop.
 */
function getWhatsAppUrl(text = "") {
  const cleanText = String(text || "").trim();
  if (!cleanText) return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}`;
  const encodedText = encodeURIComponent(cleanText);
  return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedText}`;
}

/**
 * Open a private WhatsApp conversation with an optional pre-filled message.
 */
function openWhatsApp(message) {
  // Keep the generic WhatsApp entry clean: no pre-filled message appears on the WhatsApp landing screen.
  window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

/**
 * Start a product-specific private enquiry.
 */
function orderProductViaWhatsApp(productId, variantTitle = "Standard", qty = 1) {
  const product = PRODUCTS_DATA.find(p => p.id == productId || p.handle === productId);
  if (!product) return;

  const formattedPrice = window.Currency ? window.Currency.format(product.price) : `S$${product.price}`;
  const pageBase = window.location.href.split("#")[0];

  const message = `*PRIVATE PRODUCT ENQUIRY — ${WHATSAPP_CONFIG.brandName}*\n\n` +
    `Hello, I am interested in the following handcrafted piece:\n\n` +
    `*Product:* ${product.title}\n` +
    `*Colour / Finish:* ${variantTitle}\n` +
    `*Quantity:* ${qty}\n` +
    `*Displayed Price:* ${formattedPrice}\n` +
    `*Product Link:* ${pageBase}#product/${product.handle}\n\n` +
    `Please let me know the current availability, finish options, delivery details and how I may proceed with the order. Thank you.`;

  openWhatsApp(message);
}

window.WhatsApp = {
  config: WHATSAPP_CONFIG,
  open: openWhatsApp,
  orderProduct: orderProductViaWhatsApp
};
