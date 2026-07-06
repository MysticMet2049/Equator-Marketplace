import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { normalizeCartItems } from "./cartPageUtils";

const DEFAULT_MODAL_STATE = {
  open: false,
  mode: "select",
  accounts: [],
  customerId: null,
  storeId: null,
  message: "",
};

// Hook de coordination de la page panier : il isole la logique métier du rendu JSX.
export function useCartPageController() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    submitCart,
    requestCustomerAccountLinkCode,
    linkCustomerAccountByPhoneCode,
    createCustomerAccountForCurrentStore,
    loading,
    error,
    refreshActiveCart,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [orderMessage, setOrderMessage] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [customerAccountModal, setCustomerAccountModal] = useState(
    DEFAULT_MODAL_STATE
  );
  const [selectedCustomerAccountId, setSelectedCustomerAccountId] = useState("");
  const [linkPhoneNumber, setLinkPhoneNumber] = useState("");
  const [linkVerificationCode, setLinkVerificationCode] = useState("");
  const [linkStep, setLinkStep] = useState("phone");
  const [linkMessage, setLinkMessage] = useState(null);
  const [linkError, setLinkError] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      refreshActiveCart?.();
    }
  }, [cartItems.length, refreshActiveCart]);

  const cart = normalizeCartItems(cartItems);
  const subtotal =
    cartTotal || cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const resetCustomerAccountModal = () => {
    setCustomerAccountModal(DEFAULT_MODAL_STATE);
    setSelectedCustomerAccountId("");
    setLinkPhoneNumber("");
    setLinkVerificationCode("");
    setLinkStep("phone");
    setLinkMessage(null);
    setLinkError(null);
  };

  const openSelectionModal = (result) => {
    setCustomerAccountModal({
      open: true,
      mode: "select",
      accounts: result.customerAccounts ?? [],
      customerId: result.customerId ?? null,
      storeId: result.storeId ?? null,
      message: result.message ?? "Sélectionnez le compte client à utiliser.",
    });
    setSelectedCustomerAccountId("");
    setLinkError(null);
    setOrderError(null);
  };

  const openCreationModal = (result) => {
    setCustomerAccountModal({
      open: true,
      mode: "create",
      accounts: [],
      customerId: result.customerId ?? null,
      storeId: result.storeId ?? null,
      message: result.message ?? "Aucun compte client trouvé pour cette enseigne.",
    });
    setSelectedCustomerAccountId("");
    setLinkPhoneNumber(result.phoneNumber ?? "");
    setLinkStep("phone");
    setLinkMessage(null);
    setLinkError(null);
    setOrderError(null);
  };

  const finishSubmitCart = async (customerAccountId) => {
    const result = await submitCart({
      customerAccountId,
      successRedirect: "/account",
    });

    if (result?.ok) {
      resetCustomerAccountModal();
      setOrderMessage(result.message || "Commande validée avec succès.");

      if (result.redirectTo) {
        navigate(result.redirectTo);
      }

      return result;
    }

    if (result?.needsCustomerAccountSelection) {
      openSelectionModal(result);
      return result;
    }

    if (result?.needsCustomerAccountCreation) {
      openCreationModal(result);
      return result;
    }

    setOrderError(result?.message || "Impossible de valider le panier.");
    return result;
  };

  const updateQty = async (item, delta) => {
    setOrderError(null);

    const result = await updateQuantity(item.id, item.qty + delta);

    if (result?.ok === false) {
      setOrderError(result.message || "Impossible de modifier la quantité.");
    }
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "EQUATOR10") {
      setPromoApplied(true);
      setPromoError(null);
      return;
    }

    setPromoError("Code invalide.");
    setPromoApplied(false);
  };

  const handleSubmitCart = async () => {
    setOrderError(null);
    setOrderMessage(null);

    if (!isAuthenticated) {
      navigate("/login?next=cart");
      return;
    }

    await finishSubmitCart();
  };

  const handleSubmitWithSelectedCustomerAccount = async () => {
    setOrderError(null);

    if (!selectedCustomerAccountId) {
      setOrderError("Sélectionnez un compte client avant de valider le panier.");
      return;
    }

    await finishSubmitCart(selectedCustomerAccountId);
  };

  const handleRequestLinkCode = async () => {
    setLinkError(null);
    setLinkMessage(null);

    const result = await requestCustomerAccountLinkCode?.({
      phoneNumber: linkPhoneNumber,
    });

    if (result?.phoneNumber) {
      setLinkPhoneNumber(result.phoneNumber);
    }

    if (result?.ok) {
      setLinkStep("code");
      setLinkMessage(result.message || "Code envoyé. Vérifiez votre téléphone.");
      return;
    }

    if (result?.needsCustomerAccountCreation) {
      setLinkStep("create");
      setLinkMessage(
        result.message || "L’option création de compte n’est pas disponible pour ce store."
      );
      setLinkError(null);
      return;
    }

    setLinkError(result?.message || "Impossible d'envoyer le code de vérification.");
  };

  const handleLinkAccountAndSubmit = async () => {
    setLinkError(null);
    setLinkMessage(null);

    const result = await linkCustomerAccountByPhoneCode?.({
      phoneNumber: linkPhoneNumber,
      code: linkVerificationCode,
    });

    if (result?.ok && result.customerAccountId) {
      setLinkMessage(result.message || "Compte client lié avec succès.");
      await finishSubmitCart(result.customerAccountId);
      return;
    }

    if (Array.isArray(result?.customerAccounts) && result.customerAccounts.length > 0) {
      openSelectionModal({
        ...result,
        message: "Sélectionnez le compte client nouvellement lié.",
      });
      return;
    }

    if (result?.needsCustomerAccountCreation) {
      setLinkStep("create");
      setLinkMessage(
        result.message || "L’option création de compte n’est pas disponible pour ce store."
      );
      setLinkError(null);
      return;
    }

    setLinkError(
      result?.message ||
        "Impossible de lier ou créer le compte client pour cette enseigne."
    );
  };

  const handleCreateCustomerAccountAndSubmit = async () => {
    setLinkError(null);
    setLinkMessage(null);

    const result = await createCustomerAccountForCurrentStore?.();

    if (result?.ok && result.customerAccountId) {
      setLinkMessage(result.message || "Compte client créé avec succès.");
      await finishSubmitCart(result.customerAccountId);
      return;
    }

    setLinkError(
      result?.message || "L’option création de compte n’est pas disponible pour ce store."
    );

    if (result?.backendRequest) {
      console.warn(
        "[CartPage] Endpoint backend requis pour créer le compte client",
        result.backendRequest
      );
    }
  };

  return {
    cart,
    cartCount,
    subtotal,
    discount,
    total,
    promoCode,
    promoApplied,
    promoError,
    orderMessage,
    orderError,
    customerAccountModal,
    selectedCustomerAccountId,
    linkPhoneNumber,
    linkVerificationCode,
    linkStep,
    linkMessage,
    linkError,
    loading,
    error,
    isAuthenticated,
    isInitialLoading: loading && cartCount === 0,
    isEmptyCart: !loading && cartCount === 0,
    removeFromCart,
    updateQty,
    applyPromo,
    handleSubmitCart,
    handleSubmitWithSelectedCustomerAccount,
    handleRequestLinkCode,
    handleLinkAccountAndSubmit,
    handleCreateCustomerAccountAndSubmit,
    closeCustomerAccountModal: resetCustomerAccountModal,
    setPromoCode,
    setSelectedCustomerAccountId,
    setLinkPhoneNumber,
    setLinkVerificationCode,
  };
}
