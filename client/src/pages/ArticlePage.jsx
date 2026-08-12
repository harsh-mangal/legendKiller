import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import ProductImage from "../components/ui/ProductImage";
import { PageLoading } from "../components/ui/PageState";
import { SITE } from "../config/site";
import { articleApi, getErrorMessage } from "../services/api";
import { formatDate } from "../utils/format";

const contentBlocks = (content) => String(content || "").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setArticle(null);
    articleApi.getArticleBySlug(slug, { signal: controller.signal })
      .then((item) => {
        if (!item?._id) throw new Error("Article not found.");
        if (active) setArticle(item);
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") {
          setError(getErrorMessage(requestError, "This article could not be loaded."));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [slug]);

  const blocks = useMemo(() => contentBlocks(article?.content), [article?.content]);

  if (loading) return <PageLoading label="Loading article…" />;
  if (error || !article) {
    return (
      <section className="page-section">
        <Seo title={`Article Not Found | ${SITE.name}`} description="The requested wellness article could not be found." canonicalPath={`/articles/${slug}`} indexable={false} structuredData={[]} />
        <div className="container-page max-w-2xl"><Alert type="error">{error || "Article not found."}</Alert><Link to="/articles" className="btn-outline mt-6">Back to articles</Link></div>
      </section>
    );
  }

  const canonicalPath = `/articles/${article.slug}`;
  const description = String(article.excerpt || blocks[0] || `Read ${article.title} from ${SITE.name}.`).replace(/\s+/g, " ").slice(0, 180);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description,
    image: article.coverImage || absoluteUrl(SITE.ogImagePath),
    url: absoluteUrl(canonicalPath),
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: { "@type": "Person", name: article.author || SITE.name },
    publisher: { "@type": "Organization", "@id": `${SITE.url}/#organization`, name: SITE.name, logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") } },
    mainEntityOfPage: absoluteUrl(canonicalPath),
  };

  return (
    <article className="bg-white py-12 sm:py-16 lg:py-20">
      <Seo
        title={`${article.title} | ${SITE.name}`}
        description={description}
        canonicalPath={canonicalPath}
        image={article.coverImage || SITE.ogImagePath}
        imageAlt={article.title}
        type="article"
        indexable
        structuredData={[schema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Articles", path: "/articles" }, { name: article.title, path: canonicalPath }])]}
      />
      <div className="container-page max-w-4xl">
        <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> All articles</Link>
        <header className="mt-8">
          <p className="section-eyebrow">Wellness article</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2"><UserRound size={16} /> {article.author || SITE.name}</span>
            <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          {article.excerpt && <p className="mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p>}
        </header>
        {article.coverImage && <ProductImage src={article.coverImage} alt={article.title} className="mt-8 aspect-[16/9] h-auto w-full rounded-[8px] object-cover" fallbackClassName="mt-8 aspect-[16/9] h-auto w-full rounded-[8px]" loading="eager" />}
        <div className="mt-9 space-y-6 text-base leading-8 text-slate-700">
          {blocks.map((block, index) => <p key={`${index}-${block.slice(0, 24)}`} className="whitespace-pre-line">{block}</p>)}
        </div>
        {!!article.tags?.length && <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{tag}</span>)}</div>}
        <aside className="mt-10 border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          This article is for general wellness information and does not replace diagnosis, prescribed treatment or advice from a qualified healthcare professional.
        </aside>
      </div>
    </article>
  );
}
