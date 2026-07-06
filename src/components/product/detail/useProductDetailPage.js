import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../hooks/useCart";
import { useFavorites } from "../../../hooks/useFavorites";
import { useProducts } from "../../../hooks/useProducts";
import {
  getProductId,
  getProductImages,
  getSimilarProducts,
  normalizeProduct,
  productMatchesRoute,
} from "./productDetailUtils";

export default function useProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const productFromNavigation = routerLocation.state?.product || null;

  const { isAuthenticated } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  const {
    isProductFavorite,
    toggleFavorite,
    isProductFavoritePending,
    error: favoriteError,
  } = useFavorites();

  const {
    products: allProducts,
    loading,
    error,
  } = useProducts({ pageSize: 100 });

  const apiProduct = useMemo(() => {
    if (productMatchesRoute(productFromNavigation, id)) {
      return productFromNavigation;
    }

    return allProducts.find((item) => productMatchesRoute(item, id)) || null;
  }, [productFromNavigation, allProducts, id]);

  const product = useMemo(() => normalizeProduct(apiProduct), [apiProduct]);

  const similar = useMemo(
    () => getSimilarProducts(allProducts, product),
    [allProducts, product]
  );

  const images = useMemo(() => getProductImages(product), [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const productId = product ? getProductId(product) : null;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!productId || !product?.storeId) {
      console.warn("[ProductDetailPage] productId ou storeId manquant :", product);
      setCartMessage("Produit invalide.");
      setAdded(false);
      return;
    }

    try {
      setCartMessage("");

      /**
       * On n'utilise pas une boucle `for` avec qty.
       * Le backend refuse l'ajout multiple du même produit et renvoie :
       * "Le produit est déjà présent dans votre panier."
       *
       * Donc on appelle addToCart une seule fois, puis CartContext recharge
       * le vrai panier avec refreshCart(storeId).
       */
      const result = await addToCart(productId, product.storeId, product, qty);

      if (result?.noActiveCart) {
        setCartMessage(result.message || "Ce point de vente n'a pas de panier actif.");
        setAdded(false);
        return;
      }

      if (result?.alreadyExists) {
        setCartMessage(result.message || "Quantité mise à jour dans le panier.");
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        return;
      }

      if (result?.ok) {
        setCartMessage(result.message || "Produit ajouté au panier.");
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        return;
      }

      setCartMessage(result?.message || "Impossible d’ajouter au panier.");
      setAdded(false);
    } catch (err) {
      console.error("[ProductDetailPage] Erreur ajout panier :", err);
      setCartMessage("Impossible d’ajouter au panier.");
      setAdded(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await toggleFavorite(product);
    } catch (err) {
      console.error("[ProductDetailPage] Erreur favoris :", err);
    }
  };

  return {
    product,
    loading,
    error,
    images,
    similar,

    activeImg,
    setActiveImg,

    qty,
    setQty,

    activeTab,
    setActiveTab,

    added,
    cartMessage,
    cartLoading,

    wishlisted: product ? isProductFavorite(product) : false,
    favoritePending: product ? isProductFavoritePending(product) : false,
    favoriteError,

    handleAdd,
    toggleWishlist: handleToggleFavorite,

    goToMarketplace: () => navigate("/marketplace"),
  };
}
