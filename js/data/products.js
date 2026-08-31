const PRODUCTS_DATA = [
  {
    "id": 10339370434907,
    "title": "Diamond Éclat",
    "handle": "product-1",
    "category": "handbags",
    "price": 1290.0,
    "compare_price": null,
    "is_new": false,
    "is_best_seller": true,
    "is_rose": false,
    "fits_phone": false,
    "tags": ["diamond", "eclat", "handbags", "crystal"],
    "description": "The Diamond Éclat collection embodies the perfect fusion of crystalline brilliance and architectural elegance. Each piece is meticulously handcrafted with premium crystal beads, creating a luminous masterpiece that captures light from every angle.",
    "details": {
      "materials": "Premium crystal beads, brass hardware, nappa leather lining",
      "dimensions": "W21cm x H12cm x D6cm",
      "craftsmanship": "Handcrafted by master artisans over 15 hours"
    },
    "images": [
      "https://res.cloudinary.com/uv5z26ah/image/upload/v1788063365/hinh1.png"
    ],
    "variants": [
      {
        "id": 1001,
        "title": "Crystal White / Silver",
        "price": 1290.0,
        "compare_at_price": null,
        "available": true,
        "sku": "DE-001-WH-SL"
      },
      {
        "id": 1002,
        "title": "Champagne / Gold",
        "price": 1290.0,
        "compare_at_price": null,
        "available": true,
        "sku": "DE-001-CH-GD"
      }
    ]
  },
  {
    "id": 10339370434908,
    "title": "Glacière Crystal Bag",
    "handle": "product-2",
    "category": "handbags",
    "price": 1190.0,
    "compare_price": null,
    "is_new": false,
    "is_best_seller": true,
    "is_rose": false,
    "fits_phone": false,
    "tags": ["glaciere", "crystal", "handbags"],
    "description": "The Glacière collection captures the ethereal beauty of frozen crystal. Each bag features a unique gradient of crystalline tones, handwoven with precision to create a mesmerizing play of light.",
    "details": {
      "materials": "Premium crystal beads, brass hardware, nappa leather lining",
      "dimensions": "W20cm x H13cm x D7cm",
      "craftsmanship": "Handcrafted by master artisans over 18 hours"
    },
    "images": [
      "https://res.cloudinary.com/uv5z26ah/image/upload/v1788065699/hinh2.png"
    ],
    "variants": [
      {
        "id": 2001,
        "title": "Glacière White / Silver",
        "price": 1190.0,
        "compare_at_price": null,
        "available": true,
        "sku": "GC-002-WH-SL"
      },
      {
        "id": 2002,
        "title": "Glacière Blue / Silver",
        "price": 1190.0,
        "compare_at_price": null,
        "available": true,
        "sku": "GC-002-BL-SL"
      }
    ]
  },
  {
    "id": 10339370434909,
    "title": "Glacière Mini",
    "handle": "product-3",
    "category": "handbags",
    "price": 890.0,
    "compare_price": null,
    "is_new": true,
    "is_best_seller": false,
    "is_rose": false,
    "fits_phone": false,
    "tags": ["glaciere", "mini", "mini-bags", "crystal"],
    "description": "A miniature masterpiece from the Glacière collection. Compact yet radiant, this mini bag brings crystalline elegance to evening occasions.",
    "details": {
      "materials": "Premium crystal beads, brass hardware, nappa leather lining",
      "dimensions": "W14cm x H9cm x D5cm",
      "craftsmanship": "Handcrafted by master artisans over 12 hours"
    },
    "images": [
      "https://res.cloudinary.com/uv5z26ah/image/upload/v1788065699/hinh3.png"
    ],
    "variants": [
      {
        "id": 3001,
        "title": "Glacière Crystal / Silver",
        "price": 890.0,
        "compare_at_price": null,
        "available": true,
        "sku": "GC-003-CR-SL"
      }
    ]
  },
  {
    "id": 10339370434910,
    "title": "Glacière Rosé",
    "handle": "product-4",
    "category": "handbags",
    "price": 1390.0,
    "compare_price": null,
    "is_new": true,
    "is_best_seller": false,
    "is_rose": true,
    "fits_phone": false,
    "tags": ["glaciere", "rose", "handbags", "crystal"],
    "description": "The Glacière Rosé edition captures the delicate blush of dawn. A romantic interpretation of the Glacière collection, featuring soft rose-gold crystalline tones.",
    "details": {
      "materials": "Premium crystal beads, rose-gold brass hardware, nappa leather lining",
      "dimensions": "W22cm x H14cm x D8cm",
      "craftsmanship": "Handcrafted by master artisans over 20 hours"
    },
    "images": [
      "https://res.cloudinary.com/uv5z26ah/image/upload/v1788065699/hinh4.png"
    ],
    "variants": [
      {
        "id": 4001,
        "title": "Glacière Rosé / Rose Gold",
        "price": 1390.0,
        "compare_at_price": null,
        "available": true,
        "sku": "GC-004-RS-RG"
      }
    ]
  }
];

if (typeof module !== "undefined") module.exports = { PRODUCTS_DATA };
