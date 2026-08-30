const COLLECTIONS_DATA = [
  {
    id: "all-handbags",
    handle: "all-handbags",
    title: "All Handbags",
    subtitle: "Artisanal Handcrafted Crystal Creations",
    description: "Explore the complete KATÉA repertoire — each handbag is meticulously woven by hand with premium crystal beads to create radiant, timeless elegance.",
    image: "https://paleramilano.com/cdn/shop/files/3U7A0196.jpg?v=1771513557&width=1600",
    filter: (p) => true
  },
  {
    id: "identity",
    handle: "identity",
    title: "Identity",
    subtitle: "New Haute Couture Collection",
    description: "The Identity collection embodies architectural geometry, rich luminescence, and poetic craftsmanship — a signature expression of KATÉA Atelier.",
    image: "https://paleramilano.com/cdn/shop/files/Wood_Net_Hobo.jpg?v=1771512564&width=1600",
    filter: (p) => p.is_new || p.handle.includes("identity") || p.handle.includes("wood") || p.handle.includes("eclat")
  },
  {
    id: "mini-bags",
    handle: "mini-bags",
    title: "Mini Bags",
    subtitle: "Compact Brilliance & Evening Sophistication",
    description: "Petite silhouettes with luminous presence. Tailored for evening galas, cocktail events, and effortless styling.",
    image: "https://paleramilano.com/cdn/shop/files/Capri_Baby_Wood.jpg?v=1771513352&width=1600",
    filter: (p) => p.category === "mini-bags" || p.handle.includes("mini") || p.handle.includes("baby") || p.handle.includes("micro")
  },
  {
    id: "fits-a-phone",
    handle: "fits-a-phone",
    title: "Fits A Phone",
    subtitle: "Practical Luxury for Modern Living",
    description: "Expertly scaled crystal bags designed to comfortably fit all smartphone models, cardholders, lipstick, and keys without compromising on silhouette.",
    image: "https://paleramilano.com/cdn/shop/files/Maxi_Pouch_Wood.jpg?v=1771513295&width=1600",
    filter: (p) => p.fits_phone
  },
  {
    id: "card-holders",
    handle: "card-holders",
    title: "Card Holders",
    subtitle: "Sculptural Evening Card Holders",
    description: "Hand-sculpted card holders and soft-structured pouches that catch the light from every perspective.",
    image: "https://paleramilano.com/cdn/shop/files/Clutch-Mini-Brass-Silver-Blue-Silver.jpg?v=1771258106&width=1600",
    filter: (p) => p.category === "card-holders" || p.handle.includes("card-holder") || p.handle.includes("pouch")
  },
  {
    id: "best-sellers",
    handle: "best-sellers",
    title: "Best Sellers",
    subtitle: "Iconic Signature Pieces",
    description: "Discover our most sought-after crystal handbags, cherished by collectors worldwide.",
    image: "https://paleramilano.com/cdn/shop/files/Crystal-Pouch-Champagne_5e14a3e4-e732-4eca-9b3a-1cdf64ff77a2.jpg?v=1784816492&width=1600",
    filter: (p) => p.is_best_seller || p.price > 500
  }
];

if (typeof module !== "undefined") module.exports = { COLLECTIONS_DATA };
