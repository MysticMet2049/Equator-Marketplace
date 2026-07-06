import { useCallback, useEffect, useState } from "react";
import {
  getAuthenticatedAccount,
  getFavoriteProducts,
  getLinkedCards,
  getPurchases,
  getPurchasesInDebt,
  getFinancialTransactions,
} from "../api/accountPageApi";

const EMPTY_PAGE = {
  items: [],
  totalItems: 0,
  totalPages: 0,
  page: 0,
};

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function pickCustomerAccountId(account, user, linkedCardsPage) {
  const linkedCards = linkedCardsPage?.items || [];

  return firstValue(
    account?.customerAccountId,
    account?.customerAccount?.id,
    account?.customerAccountSummaryDto?.id,
    account?.clientAccountId,
    account?.accountId,
    user?.customerAccountId,
    user?.customerAccount?.id,
    user?.customerAccountSummaryDto?.id,
    linkedCards[0]?.customerAccountId,
    linkedCards[0]?.customerAccount?.id,
    linkedCards[0]?.accountId,
    linkedCards[0]?.clientAccountId
  );
}

export function useAccountPageData({ enabled = true, user = null } = {}) {
  const [account, setAccount] = useState(null);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [linkedCards, setLinkedCards] = useState(EMPTY_PAGE);
  const [purchases, setPurchases] = useState(EMPTY_PAGE);
  const [purchasesInDebt, setPurchasesInDebt] = useState(EMPTY_PAGE);
  const [transactions, setTransactions] = useState(EMPTY_PAGE);
  const [customerAccountId, setCustomerAccountId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState({});

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setSectionErrors({});

    const nextErrors = {};

    try {
      let accountData = null;

      try {
        accountData = await getAuthenticatedAccount();
      } catch (error) {
        nextErrors.profile = error.message || "Impossible de charger le profil.";
      }

      const [favoritesResult, linkedCardsResult, transactionsResult] =
        await Promise.allSettled([
          getFavoriteProducts(),
          getLinkedCards({ pageSize: 50 }),
          getFinancialTransactions({ pageSize: 50 }),
        ]);

      const nextFavoriteProducts =
        favoritesResult.status === "fulfilled" ? favoritesResult.value : [];

      if (favoritesResult.status === "rejected") {
        nextErrors.favorites =
          favoritesResult.reason?.message || "Impossible de charger les favoris.";
      }

      const nextLinkedCards =
        linkedCardsResult.status === "fulfilled"
          ? linkedCardsResult.value
          : EMPTY_PAGE;

      if (linkedCardsResult.status === "rejected") {
        nextErrors.stores =
          linkedCardsResult.reason?.message ||
          "Impossible de charger les comptes enseignes.";
      }

      const nextTransactions =
        transactionsResult.status === "fulfilled"
          ? transactionsResult.value
          : EMPTY_PAGE;

      if (transactionsResult.status === "rejected") {
        nextErrors.transactions =
          transactionsResult.reason?.message ||
          "Impossible de charger l'activité.";
      }

      const nextCustomerAccountId = pickCustomerAccountId(
        accountData,
        user,
        nextLinkedCards
      );

      let nextPurchases = EMPTY_PAGE;
      let nextPurchasesInDebt = EMPTY_PAGE;

      if (nextCustomerAccountId) {
        const [purchasesResult, debtResult] = await Promise.allSettled([
          getPurchases(nextCustomerAccountId, { pageSize: 50 }),
          getPurchasesInDebt(nextCustomerAccountId, { pageSize: 50 }),
        ]);

        if (purchasesResult.status === "fulfilled") {
          nextPurchases = purchasesResult.value;
        } else {
          nextErrors.orders =
            purchasesResult.reason?.message ||
            "Impossible de charger l'historique d'achats.";
        }

        if (debtResult.status === "fulfilled") {
          nextPurchasesInDebt = debtResult.value;
        }
      } else {
        nextErrors.orders =
          "Aucun compte client lié n'a été trouvé pour charger les achats.";
      }

      setAccount(accountData);
      setFavoriteProducts(nextFavoriteProducts);
      setLinkedCards(nextLinkedCards);
      setPurchases(nextPurchases);
      setPurchasesInDebt(nextPurchasesInDebt);
      setTransactions(nextTransactions);
      setCustomerAccountId(nextCustomerAccountId || null);
      setSectionErrors(nextErrors);
    } finally {
      setLoading(false);
    }
  }, [enabled, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    account,
    favoriteProducts,
    linkedCards,
    purchases,
    purchasesInDebt,
    transactions,
    customerAccountId,
    loading,
    sectionErrors,
    refresh,
  };
}

export default useAccountPageData;
