import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import productApi from "../../../api/productApi";
import reviewApi, { buildRatingBreakdown, normalizeReviewList } from "../../../api/reviewApi";
import storeApi from "../../../api/storeApi";
import { useAuth } from "../../../context/AuthContext";
import {
  DEFAULT_RATING_BREAKDOWN,
  buildWhatsappUrl,
  normalizeStore,
} from "./storeDetailUtils";

const WHATSAPP_MESSAGE =
  "Bonjour, je suis intéressé(e) par vos produits sur Equator Marketplace. Pouvez-vous m'en dire plus ?";

export default function useStoreDetailPage() {
  const { id } = useParams();
  const storeId = id;
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const storeFromNavigation = routerLocation.state?.store || null;
  const { isAuthenticated } = useAuth();

  const [apiStore, setApiStore] = useState(storeFromNavigation);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState(null);

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

    async function loadCatalogProducts() {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const response = await productApi.getProductsByStore(storeId, {
          pageSize: 100,
          readAll: true,
        });

        const items = Array.isArray(response)
          ? response
          : response?.items || [];

        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled) {
          console.warn("[StoreDetail] getProductsByStore failed:", err);
          setProductsError(err);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    if (storeId) loadCatalogProducts();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const store = useMemo(
    () => normalizeStore(apiStore, products.length),
    [apiStore, products.length]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReviewsFromStore() {
      const embeddedReviews = await reviewApi.getStoreReviews(store);
      if (!cancelled) setReviews(embeddedReviews);
    }

    if (store) loadReviewsFromStore();

    return () => {
      cancelled = true;
    };
  }, [store]);

  const notFound = !apiStore && !storeLoading && !storeError;

  const ratingBreakdown = useMemo(() => {
    if (reviews.length > 0) return buildRatingBreakdown(reviews);
    return store?.ratingBreakdown || DEFAULT_RATING_BREAKDOWN;
  }, [reviews, store]);

  const totalReviews = useMemo(() => {
    const totalFromBreakdown = Object.values(ratingBreakdown).reduce(
      (total, value) => total + Number(value || 0),
      0
    );

    return totalFromBreakdown || Number(store?.reviewCount || 0);
  }, [ratingBreakdown, store]);

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
        });

        const nextReviews = normalizeReviewList(response);
        if (nextReviews.length > 0) {
          setReviews((previous) => [...nextReviews, ...previous]);
        }

        setReviewSubmitMessage("Votre avis a été envoyé avec succès.");
        return { ok: true, response };
      } catch (err) {
        const message =
          err?.message ||
          "Impossible d'envoyer votre avis pour le moment.";

        setReviewSubmitError(message);
        return { ok: false, message };
      } finally {
        setReviewSubmitting(false);
      }
    },
    [storeId]
  );

  return {
    store: store ? { ...store, reviews } : store,
    products,
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
