import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import ProductCard from "../../product/ProductCard";
import { formatMoney, getCardBalance, getCardName, getCardPoints } from "../accountUtils";

export default function ProfilePreview({ favoriteProducts, linkedCards, setActiveSection }) {
  return (
    <div className="space-y-8">
      <PreviewBlock title="Mes favoris" subtitle="Les articles que vous aimez." target="favorites" setActiveSection={setActiveSection}>
        {favoriteProducts.length === 0 ? <SmallEmpty message="Aucun favori" link="/marketplace" /> : <FavoritesPreview products={favoriteProducts} />}
      </PreviewBlock>

      <PreviewBlock title="Mes comptes enseignes" subtitle="Cliquez sur un compte enseigne pour consulter son historique d'achat." target="stores" setActiveSection={setActiveSection}>
        <CardsPreview linkedCards={linkedCards} setActiveSection={setActiveSection} />
      </PreviewBlock>
    </div>
  );
}

function PreviewBlock({ title, subtitle, target, setActiveSection, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>{title}</h3>
          {subtitle && <p className="text-xs" style={{ color: "var(--color-equator-muted)" }}>{subtitle}</p>}
        </div>
        <button onClick={() => setActiveSection(target)} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-equator-green)" }}>
          Voir tout <FiChevronRight size={12} />
        </button>
      </div>
      {children}
    </div>
  );
}

function getFavoriteProductId(product) {
  return (
    product?.productId ||
    product?.id ||
    product?.promoId ||
    product?.summaryId ||
    product?.refId ||
    product?.userPreferenceSummaryDto?.refId ||
    product?._raw?.id ||
    product?._raw?.productId ||
    product?._raw?.productPromoSummaryDto?.id ||
    product?._raw?.productPromoSummaryDto?.productId ||
    product?._raw?.productPromoHeaderSummaryDto?.id ||
    product?._raw?.productPromoHeaderSummaryDto?.productId ||
    product?._raw?.clientCatalogProductSummaryDto?.id ||
    product?._raw?.clientCatalogProductSummaryDto?.productId ||
    product?._raw?.catalogProductSummaryDto?.id ||
    product?._raw?.catalogProductSummaryDto?.productId ||
    product?._raw?.productHeaderSummaryDto?.id ||
    product?._raw?.productHeaderSummaryDto?.productId ||
    null
  );
}

function getFavoriteProductKey(product, index) {
  const productId = getFavoriteProductId(product);
  const assetId =
    product?.coverAssetId ||
    product?.imageAssetId ||
    product?.assetIds?.[0] ||
    product?._raw?.productPromoSummaryDto?.coverAssetId ||
    product?._raw?.productHeaderSummaryDto?.coverAssetId ||
    null;

  return productId ? `favorite-${productId}` : `favorite-${assetId || index}`;
}

function FavoritesPreview({ products }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.slice(0, 4).map((product, index) => {
        const productId = getFavoriteProductId(product);

        return (
          <ProductCard
            key={getFavoriteProductKey(product, index)}
            product={{
              ...product,
              ...(productId ? { id: productId, productId } : {}),
            }}
          />
        );
      })}
    </div>
  );
}

function CardsPreview({ linkedCards, setActiveSection }) {
  if (linkedCards.length === 0) return <SmallEmpty message="Aucun compte enseigne lié." />;

  return (
    <div className="space-y-2">
      {linkedCards.slice(0, 3).map((card, index) => (
        <button
          type="button"
          key={card.id || card.cardId || index}
          onClick={() => setActiveSection("stores")}
          className="w-full bg-white rounded-xl px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-stone-50"
          style={{ border: "1px solid var(--color-equator-beige)" }}
        >
          <div>
            <p className="text-sm font-medium">{getCardName(card)}</p>
            <p className="text-xs" style={{ color: "var(--color-equator-muted)" }}>Solde : {formatMoney(getCardBalance(card))}</p>
          </div>
          <p className="text-xs font-semibold">{getCardPoints(card).toLocaleString("fr-FR")} pts</p>
        </button>
      ))}
    </div>
  );
}

function SmallEmpty({ message, link }) {
  return (
    <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid var(--color-equator-beige)" }}>
      <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
        {message} {link && <Link to={link} className="underline" style={{ color: "var(--color-equator-green)" }}>explorer la marketplace</Link>}
      </p>
    </div>
  );
}
