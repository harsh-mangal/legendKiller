import { Heart, Trash2 } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { EmptyState } from "../components/ui/PageState";
import { useWishlist } from "../context/WishlistContext";

export default function WishlistPage() {
  const { wishlist, clearWishlist } = useWishlist();
  return (
    <section className="page-section bg-[#0A0A0C]">
      <div className="container-page">
        <div className="flex flex-col gap-4 border border-slate-800 bg-[#121216] p-5 shadow-2xl rounded-none sm:p-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Saved Supplement Stack</p>
            <h1 className="section-title mt-3">Your Wishlist Protocol</h1>
            <p className="mt-3 text-sm text-slate-300">Keep your target supplements in one place and add them to your shaker when ready.</p>
          </div>
          {wishlist.length > 0 && <button type="button" onClick={clearWishlist} className="btn-outline shrink-0"><Trash2 size={16} /> CLEAR WISHLIST</button>}
        </div>
        {!wishlist.length ? <div className="mt-10"><EmptyState icon={Heart} title="No Supplements Saved Yet" description="Tap the heart icon on any supplement to save it to your wishlist protocol." /></div> : <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">{wishlist.map((item) => <ProductCard key={`${item.itemType}-${item._id}`} product={item} />)}</div>}
      </div>
    </section>
  );
}
