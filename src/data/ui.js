import { FiUser, FiHeart, FiShoppingBag, FiBell, FiClock, FiPackage } from "react-icons/fi";
import { PiLeaf, PiSealCheck, PiTruck } from "react-icons/pi";

// ─── Sort options (shared by SearchResultsPage + CategoriesPage) ──────────────
export const SORT_OPTIONS = [
  { value: "pertinence",  label: "Pertinence" },
  { value: "price-asc",  label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "discount",   label: "Meilleures réductions" },
  { value: "rating",     label: "Mieux notés" },
  { value: "recent",     label: "Plus récents" },
];

// ─── Filter categories (SearchResultsPage sidebar) ───────────────────────────
export const FILTER_CATEGORIES = ["Électronique", "Maison & Jardin", "Mode", "Beauté"];

// ─── Store page category nav ─────────────────────────────────────────────────
export const STORE_CATEGORIES = ["Électronique", "Mode & Luxe", "Maison & Design", "Artisanat"];

// ─── Store page filter options ───────────────────────────────────────────────
export const STORE_FILTER_OPTIONS = [
  { id: "express",    label: "Livraison Express" },
  { id: "certified",  label: "Vendeurs Certifiés" },
  { id: "new",        label: "Nouveautés" },
];

// ─── Product detail page tabs ─────────────────────────────────────────────────
export const PRODUCT_TABS = ["Avis Clients", "Spécifications", "Livraison & Retours"];

// ─── Store detail page tabs ───────────────────────────────────────────────────
export const STORE_TABS = ["Produits", "Avis clients", "Informations"];

// ─── Order status styles (AccountPage) ───────────────────────────────────────
export const ORDER_STATUS_STYLES = {
  "Livré":    { bg: "#dcfce7", color: "#15803d" },
  "En cours": { bg: "#dbeafe", color: "#1d4ed8" },
  "Annulé":   { bg: "#fee2e2", color: "#dc2626" },
};

// ─── Account sidebar nav items ────────────────────────────────────────────────
export const ACCOUNT_NAV_ITEMS = [
  { id: "profile",   label: "Mon profil",           icon: FiUser },
  { id: "favorites", label: "Mes favoris",           icon: FiHeart },
  { id: "stores",    label: "Mes comptes enseignes", icon: FiPackage },
  { id: "notifs",    label: "Notifications",         icon: FiBell },
  { id: "orders",    label: "Historique d'achats",   icon: FiClock },
];

// ─── HomePage trust badges ────────────────────────────────────────────────────
export const TRUST_BADGES = [
  {
    Icon: PiLeaf,
    title: "Éco-responsable",
    desc: "Produits sélectionnés pour leur faible impact environnemental.",
  },
  {
    Icon: PiSealCheck,
    title: "Qualité Certifiée",
    desc: "Nous vérifions chaque créateur pour garantir l'excellence.",
  },
  {
    Icon: PiTruck,
    title: "Livraison Zéro Carbone",
    desc: "Expédition compensée et emballages 100% recyclables.",
  },
];

// ─── CartPage recommended products ───────────────────────────────────────────
export const CART_RECOMMENDED = [
  { id: 101, name: "Étui en cuir Premium",  store: "Accessoires",  price: 45,  image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",  category: "Mode",         rating: 4.7, reviewCount: 18 },
  { id: 102, name: "Batterie Externe Mag",  store: "Énergie",       price: 89,  image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80", category: "Électronique", rating: 4.5, reviewCount: 42 },
  { id: 103, name: "Écouteurs Air Pods Pro",store: "Audio",          price: 129, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", category: "Électronique", rating: 4.8, reviewCount: 95 },
  { id: 104, name: "Clavier Mécanique Air", store: "Bureautique",    price: 159, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80", category: "Électronique", rating: 4.6, reviewCount: 33 },
  { id: 105, name: "Tablette Créative S9",  store: "Informatique",   price: 599, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",  category: "Électronique", rating: 4.9, reviewCount: 67 },
];