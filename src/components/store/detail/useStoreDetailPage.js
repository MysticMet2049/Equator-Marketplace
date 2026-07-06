import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import productApi from "../../../api/productApi";
import reviewApi, {
  buildRatingBreakdown,
  normalizeReviewList,
} from "../../../api/reviewApi";
import storeApi from "../../../api/storeApi";
import { useAuth } from "../../../context/AuthContext";
import {
  DEFAULT_RATING_BREAKDOWN,
  buildWhatsappUrl,
  normalizeStore,
} from "./storeDetailUtils";

const WHATSAPP_MESSAGE =
  "Bonjour, je suis intéressé(e) par vos produits sur Equator Marketplace. Pouvez-vous m'en dire plus ?";

function getUserDisplayName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.customer?.fullName ||
    [user?.customer?.firstName, user?.customer?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Vous"
  );
}

function averageRating(reviews = [], fallback = 0) {
  const validRatings = reviews
    .map((review) => Number(review.rating || 0))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (validRatings.length === 0) return Number(fallback || 0);

  const total = validRatings.reduce((sum, rating) => sum + rating, 0);
  return Number((total / validRatings.length).toFixed(1));
}

export default function useStoreDetailPage() {
  const { id } = useParams();
  const storeId = id;
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const storeFromNavigation = routerLocation.state?.store || null;
  const { isAuthenticated, user } = useAuth();

  const [apiStore, setApiStore] = useState(storeFromNavigation);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState(null);

  const [promoProducts, setPromoProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");

  const [activeTab, setActiveTab] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [shared, setShared] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [showAllDesc, setShowAllDesc] = useState(false);

  const currentStoreName =
    apiStore?.name ||
    apiStore?.storeName ||
    apiStore?.storeHeaderInfoSummaryDto?.name ||
    storeFromNavigation?.name ||
    storeFromNavigation?.storeName ||
    storeFromNavigation?.storeHeaderInfoSummaryDto?.name ||
    "";

  useEffect(() => {
    let cancelled = false;

    async function loadStoreDetails() {
      setStoreLoading(true);
      setStoreError(null);

      try {
        const details = await storeApi.getStoreDetails(storeId);
        if (!cancelled) setApiStore(details);
      } catch (err) {
        if (!cancelled) {
          console.warn("[StoreDetail] getStoreDetails failed:", err);
          setStoreError(err);
          if (storeFromNavigation) setApiStore(storeFromNavigation);
        }
      } finally {
        if (!cancelled) setStoreLoading(false);
      }
    }

    if (storeId) loadStoreDetails();

    return () => {
      cancelled = true;
    };
  }, [storeId, storeFromNavigation]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const sections = await productApi.getStoreProductSections(storeId, {
          pageSize: 48,
          storeName: currentStoreName,
        });

        if (!cancelled) {
          setPromoProducts(sections.promoProducts || []);
          setFeaturedProducts(sections.featuredProducts || []);
          setCatalogProducts(sections.catalogProducts || []);
          setProducts(sections.allProducts || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[StoreDetail] loadProducts failed:", err);
          setProductsError(err);
          setPromoProducts([]);
          setFeaturedProducts([]);
          setCatalogProducts([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    if (storeId) loadProducts();

    return () => {
      cancelled = true;
    };
  }, [storeId, currentStoreName]);

  const storeBase = useMemo(
    () => normalizeStore(apiStore, products.length),
    [apiStore, products.length]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReviewsFromStore() {
      const embeddedReviews = await reviewApi.getStoreReviews(storeBase);
      if (!cancelled) setReviews(embeddedReviews);
    }

    if (storeBase) loadReviewsFromStore();

    return () => {
      cancelled = true;
    };
  }, [storeBase]);

  const notFound = !apiStore && !storeLoading && !storeError;

  const ratingBreakdown = useMemo(() => {
    if (reviews.length > 0) return buildRatingBreakdown(reviews);

    const fromStore = storeBase?.ratingBreakdown || DEFAULT_RATING_BREAKDOWN;
    const totalFromStore = Object.values(fromStore).reduce(
      (total, value) => total + Number(value || 0),
      0
    );

    if (totalFromStore > 0) return fromStore;

    const count = Number(storeBase?.reviewCount || 0);
    const rating = Math.round(Number(storeBase?.rating || 0));

    if (count > 0 && rating >= 1 && rating <= 5) {
      return {
        ...DEFAULT_RATING_BREAKDOWN,
        [rating]: count,
      };
    }

    return DEFAULT_RATING_BREAKDOWN;
  }, [reviews, storeBase]);

  const totalReviews = useMemo(() => {
    const totalFromBreakdown = Object.values(ratingBreakdown).reduce(
      (total, value) => total + Number(value || 0),
      0
    );

    return totalFromBreakdown || Number(storeBase?.reviewCount || 0);
  }, [ratingBreakdown, storeBase]);

  const store = useMemo(() => {
    if (!storeBase) return storeBase;

    const rating =
      reviews.length > 0
        ? averageRating(reviews, storeBase.rating)
        : Number(storeBase.rating || 0);

    return {
      ...storeBase,
      reviews,
      rating,
      reviewCount: totalReviews,
      productCount: products.length || storeBase.productCount || 0,
    };
  }, [storeBase, reviews, totalReviews, products.length]);

  const whatsappUrl = useMemo(
    () => buildWhatsappUrl(store?.contact?.whatsapp, WHATSAPP_MESSAGE),
    [store]
  );

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, text: store.tagline, url });
      } catch {
        return;
      }
      return;
    }

    await navigator.clipboard.writeText(url).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleSubmitReview = useCallback(
    async ({ rating, comment }) => {
      setReviewSubmitting(true);
      setReviewSubmitMessage("");
      setReviewSubmitError("");

      try {
        const response = await reviewApi.createStoreReview({
          storeId,
          rating,
          comment,
          authorName: getUserDisplayName(user),
        });

        const nextReviews = normalizeReviewList([response]);

        if (nextReviews.length > 0) {
          setReviews((previous) => [...nextReviews, ...previous]);
        }

        setReviewSubmitMessage("Votre avis a été ajouté.");
        return { ok: true, response };
      } catch (err) {
        const message = err?.message || "Impossible d'envoyer votre avis.";
        setReviewSubmitError(message);
        return { ok: false, message };
      } finally {
        setReviewSubmitting(false);
      }
    },
    [storeId, user]
  );

  return {
    store,
    products,
    promoProducts,
    featuredProducts,
    catalogProducts,
    storeLoading,
    storeError,
    productsLoading,
    productsError,
    notFound,
    isAuthenticated,
    activeTab,
    setActiveTab,
    followed,
    setFollowed,
    shared,
    contactOpen,
    setContactOpen,
    showAllDesc,
    setShowAllDesc,
    ratingBreakdown,
    totalReviews,
    reviews,
    reviewSubmitting,
    reviewSubmitMessage,
    reviewSubmitError,
    handleSubmitReview,
    whatsappUrl,
    handleShare,
    goBack: () => navigate(-1),
  };
}
