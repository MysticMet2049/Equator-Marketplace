import { useParams } from "react-router-dom";
import CategoryDetail from "./CategoryDetail";
import CategoryListing from "./CategoryListing";

export default function CategoriesPageContent() {
  const { slug } = useParams();

  return slug ? <CategoryDetail slug={slug} /> : <CategoryListing />;
}
