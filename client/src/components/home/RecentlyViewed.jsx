import ProductCard from "../product/ProductCard";
import { useWishlist } from "../../context/WishlistContext";

export default function RecentlyViewed({ excludeId = "" }) {
  const { recentlyViewed } = useWishlist();
  const items = recentlyViewed.filter((item) => item._id !== excludeId).slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="container-page py-10 sm:py-20">
      <div className="mb-6 border-b border-slate-300 pb-4 sm:mb-8 sm:pb-5">
        <p className="section-eyebrow">Recently viewed</p>
        <h2 className="mt-3 font-display text-[1.75rem] text-slate-950 sm:mt-4 sm:text-4xl">Continue from your last visit.</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">{items.map((item) => <ProductCard key={`${item.itemType}-${item._id}`} product={item} />)}</div>
    </section>
  );
}
