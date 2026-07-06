import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiProvider } from "./context/ApiContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const HomePage = lazy(() => import("./pages/HomePage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const StoresPage = lazy(() => import("./pages/StoresPage"));
const StoreDetailPage = lazy(() => import("./pages/StoreDetailPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterChoicePage = lazy(() => import("./pages/RegisterChoicePage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

function PlaceholderPage({ title }) {
  return (
    <div
      data-testid="placeholder-page"
      className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--color-equator-cream)" }}
    >
      <h1
        className="text-3xl font-light"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
      >
        {title}
      </h1>
      <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
        Page en cours de développement.
      </p>
    </div>
  );
}

function RouteLoadingState() {
  return (
    <div
      data-testid="route-loading-state"
      className="min-h-screen pt-24 flex items-center justify-center"
      style={{ background: "var(--color-equator-cream)", color: "var(--color-equator-muted)" }}
    >
      Chargement de la page...
    </div>
  );
}

/** Root application shell with providers, routes, Navbar and global Footer. */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiProvider>
          <FavoritesProvider>
            <CartProvider>
              <Navbar />
              <Suspense fallback={<RouteLoadingState />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:slug" element={<CategoriesPage />} />
                  <Route path="/stores" element={<StoresPage />} />
                  <Route path="/stores/:id" element={<StoreDetailPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/deals" element={<PlaceholderPage title="Deals & Offres" />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterChoicePage />} />
                  <Route path="/register/buyer" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<PlaceholderPage title="Mot de passe oublié" />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/about" element={<PlaceholderPage title="À Propos" />} />
                  <Route path="/sell" element={<PlaceholderPage title="Vendre sur Equator" />} />
                  <Route path="/careers" element={<PlaceholderPage title="Carrières" />} />
                  <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
                  <Route path="/privacy" element={<PlaceholderPage title="Politique de Confidentialité" />} />
                  <Route path="/terms" element={<PlaceholderPage title="Conditions d'Utilisation" />} />
                  <Route path="*" element={<PlaceholderPage title="Page introuvable" />} />
                </Routes>
              </Suspense>
              <Footer />
            </CartProvider>
          </FavoritesProvider>
        </ApiProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
