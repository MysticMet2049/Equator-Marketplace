import { FiHeart } from "react-icons/fi";
import ProductCard from "../../product/ProductCard";
import EmptyState from "../shared/EmptyState";
import SectionError from "../shared/SectionError";

export default function FavoritesSection({ favoriteProducts, error }) {
  return (
    <section data-testid="account-favorites-section">
      <SectionError message={error} />
      {favoriteProducts.length === 0 ? (
        <EmptyState icon={FiHeart} text="Vous n'avez pas encore de produits favoris." actionLabel="Explorer" actionTo="/marketplace" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.productId || product.id} product={{ ...product, id: product.productId || product.id, productId: product.productId || product.id }} />
          ))}
        </div>
      )}
    </section>
  );
}
