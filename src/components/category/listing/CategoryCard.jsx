import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import ApiImage from "../../common/ApiImage";

export default function CategoryCard({ category }) {
  return (
    <Link
      data-testid="category-card"
      data-category-slug={category.slug}
      to={`/categories/${category.slug}`}
      className="relative overflow-hidden rounded-2xl group"
      style={{
        height: "200px",
        background: "var(--color-equator-beige)",
      }}
    >
      {category.coverAssetId ? (
        <ApiImage
          assetId={category.coverAssetId}
          refType="PRODUCT"
          refEntityId={category.sampleProductId}
          type="PRODUCT_IMAGE"
          typeCandidates={["PRODUCT_IMAGE", "OTHER"]}
          fileSizeType="MEDIUM"
          fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-sm"
            style={{ color: "var(--color-equator-muted)" }}
          >
            {category.name}
          </span>
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p
          className="text-xs font-medium tracking-widest mb-1 opacity-80"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {category.description}
        </p>

        <h2
          className="text-xl font-light"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {category.name}
        </h2>

        <p className="text-xs mt-1 opacity-70">
          {category.count} produit{category.count > 1 ? "s" : ""}
        </p>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <FiChevronRight size={16} color="white" />
        </div>
      </div>
    </Link>
  );
}
