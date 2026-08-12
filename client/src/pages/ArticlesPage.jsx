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

        {loading ? (
          <PageLoading label="Loading fitness guides…" />
        ) : error ? (
          <Alert type="error" className="mt-8">{error}</Alert>
        ) : !articles.length ? (
          <div className="mt-8">
            <EmptyState
              title="Guides are being compiled"
              description="Check back soon for scientific training and sports nutrition guides from Legend Killer."
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
