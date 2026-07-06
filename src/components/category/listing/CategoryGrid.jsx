import CategoryCard from "./CategoryCard";

export default function CategoryGrid({ categories }) {
  return (
    <div data-testid="categories-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </div>
  );
}
