import FavoritesSection from "./sections/FavoritesSection";
import ProfileSection from "./sections/ProfileSection";
import StoreAccountsSection from "./sections/StoreAccountsSection";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";

export default function AccountSectionRenderer({ state }) {
  const { isAuthenticated } = useAuth();
  const { favoriteProducts: syncedFavoriteProducts } = useFavorites();
  const favoriteProducts = isAuthenticated ? syncedFavoriteProducts : state.favoriteProducts.items || [];
  const linkedCards = state.linkedCards.items || [];
  const purchases = state.purchases.items || [];
  const debtItems = state.purchasesInDebt.items || [];

  if (state.activeSection === "favorites") {
    return <FavoritesSection favoriteProducts={favoriteProducts} error={state.sectionErrors.favorites} />;
  }

  if (state.activeSection === "stores" || state.activeSection === "orders") {
    return (
      <StoreAccountsSection
        linkedCards={linkedCards}
        purchases={purchases}
        debtItems={debtItems}
        error={state.sectionErrors.linkedCards || state.sectionErrors.stores || state.sectionErrors.purchasesInDebt}
        purchasesError={state.sectionErrors.purchases || state.sectionErrors.orders}
      />
    );
  }

  return (
    <ProfileSection
      profile={state.profile}
      accountInitial={state.accountInitial}
      form={state.form}
      setForm={state.setForm}
      editMode={state.editMode}
      setEditMode={state.setEditMode}
      onSave={state.handleSave}
      favoriteProducts={favoriteProducts}
      purchases={purchases}
      linkedCards={linkedCards}
      setActiveSection={state.setActiveSection}
    />
  );
}
