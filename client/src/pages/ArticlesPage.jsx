import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Seo, { absoluteUrl } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import ProductImage from "../components/ui/ProductImage";
import { EmptyState, PageLoading } from "../components/ui/PageState";
import { SITE } from "../config/site";
import { articleApi, getErrorMessage } from "../services/api";
import { formatDate } from "../utils/format";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    articleApi.getArticles({ signal: controller.signal })
      .then((items) => { if (active) setArticles(items); })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") {
          setError(getErrorMessage(requestError, "Fitness articles could not be loaded."));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, []);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Supplement & Bodybuilding Guides | ${SITE.name}`,
    description: `Scientific sports nutrition and fitness articles from ${SITE.name}.`,
    url: absoluteUrl("/articles"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: absoluteUrl(`/articles/${article.slug}`),
      })),
    },
  };

  return (
    <section className="page-section bg-[#0A0A0C]">
      <Seo
        title={`Bodybuilding & Supplement Guides | ${SITE.name}`}
        description={`Read scientific guides on whey protein timing, creatine loading, pre-workout nutrition, and muscle growth from ${SITE.name}.`}
        canonicalPath="/articles"
        indexable
        structuredData={[itemList]}
      />
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="section-eyebrow">The Viper Knowledge Base</p>
          <h1 className="section-title mt-3">Science-Backed Performance Nutrition</h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-8">
            Expert insights on protein synthesis, pre-workout timing, creatine loading, and muscle recovery.
          </p>
        </div>

        <section id="about-legend-slayer" aria-labelledby="about-legend-slayer-title" className="protocol-content mt-10 scroll-mt-36 rounded-xl p-6 sm:p-10">
          <p className="section-eyebrow">About the pre-workout</p>
          <h2 id="about-legend-slayer-title" className="mt-3 font-display text-2xl font-black uppercase sm:text-3xl">About Legend Slayer: <span className="text-[#FF5500]">The Viper Protocol</span></h2>
          <div className="mt-6 grid items-center gap-8 md:grid-cols-[180px_1fr]">
            <Link to="/products/legend-slayer-the-viper-protocol" aria-label="View Legend Slayer: The Viper Protocol"><img src="/viper-protocol-pre-workout.webp" alt="Legend Slayer: The Viper Protocol pre-workout" className="mx-auto h-auto w-full max-w-[220px]" loading="lazy" /></Link>
            <div className="space-y-4 text-sm leading-7 sm:text-base">
              <p><strong>Legend Slayer: The Viper Protocol</strong> is a pre-workout formulation featuring 56 ingredients, 9 globally patented ingredients, 7 functional matrices, and 6 integrated performance architectures.</p>
              <p>Explore the product description, What’s in it, Nutritional Facts, and How to Use for the complete product information.</p>
              <div className="flex flex-wrap gap-4"><Link to="/products/legend-slayer-the-viper-protocol" className="inline-flex min-h-11 items-center gap-2 font-bold">Explore the product <ArrowRight size={16} /></Link><Link to="/architectures" className="inline-flex min-h-11 items-center font-bold">Explore architectures</Link><Link to="/patents" className="inline-flex min-h-11 items-center font-bold">View patents</Link></div>
            </div>
          </div>
        </section>

        {loading ? (
          <PageLoading label="Loading fitness guides…" />
        ) : error ? (
          <Alert type="error" className="mt-8">{error}</Alert>
        ) : !articles.length ? (
          <div className="mt-8">
            <EmptyState
              title="Guides are being compiled"
              description="Check back soon for scientific training and sports nutrition guides from Legend Slayer."
              action={<Link to="/products" className="btn-primary">Explore Products</Link>}
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article._id || article.slug} className="flex h-full flex-col overflow-hidden border border-slate-800 bg-[#121216] shadow-2xl rounded-none">
                <Link to={`/articles/${article.slug}`} className="block border-b border-slate-800 bg-[#0A0A0C]">
                  {article.coverImage ? (
                    <ProductImage src={article.coverImage} alt={article.title} className="aspect-[16/9] h-auto w-full object-cover" fallbackClassName="aspect-[16/9] h-auto w-full" />
                  ) : (
                    <div className="grid aspect-[16/9] place-items-center text-[#FF5500]"><BookOpen size={34} /></div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-[#FFB800]">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </p>
                  <h2 className="mt-3 font-display text-xl font-black uppercase leading-snug text-white">
                    <Link to={`/articles/${article.slug}`} className="hover:text-[#FFB800]">{article.title}</Link>
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{article.excerpt || article.content}</p>
                  <Link to={`/articles/${article.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase text-[#FF5500] hover:text-[#FFB800]">
                    Read Guide <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
