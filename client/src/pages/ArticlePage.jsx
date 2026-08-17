import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, Clock, Share2, Tag, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Seo, { absoluteUrl, breadcrumbSchema } from "../components/seo/Seo";
import Alert from "../components/ui/Alert";
import ProductImage from "../components/ui/ProductImage";
import { PageLoading } from "../components/ui/PageState";
import { SITE } from "../config/site";
import { articleApi, getErrorMessage } from "../services/api";
import { formatDate } from "../utils/format";

const contentBlocks = (content) =>
  String(content || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

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
    articleApi
      .getArticleBySlug(slug, { signal: controller.signal })
      .then((item) => {
        if (!item?._id) throw new Error("Article not found.");
        if (active) setArticle(item);
      })
      .catch((requestError) => {
        if (active && requestError?.name !== "AbortError") {
          setError(getErrorMessage(requestError, "This article could not be loaded."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  const blocks = useMemo(() => contentBlocks(article?.content), [article?.content]);

  if (loading) return <PageLoading label="Loading performance guide…" />;

  if (error || !article) {
    return (
      <section className="page-section bg-[#0A0A0C]">
        <Seo
          title={`Article Not Found | ${SITE.name}`}
          description="The requested sports nutrition article could not be found."
          canonicalPath={`/articles/${slug}`}
          indexable={false}
          structuredData={[]}
        />
        <div className="container-page max-w-2xl">
          <Alert type="error">{error || "Article not found."}</Alert>
          <Link to="/articles" className="btn-outline mt-6">
            Back to Articles
          </Link>
        </div>
      </section>
    );
  }

  const canonicalPath = `/articles/${article.slug}`;
  const metaTitle = article.metaTitle || `${article.title} | ${SITE.name}`;
  const description =
    article.metaDescription ||
    String(article.excerpt || blocks[0] || `Read ${article.title} from ${SITE.name}.`)
      .replace(/\s+/g, " ")
      .slice(0, 160);

  const words = String(article.content || "").split(/\s+/).filter(Boolean).length;
  const readTime = article.readTimeMinutes || Math.max(1, Math.ceil(words / 200));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(canonicalPath)}#article`,
    headline: article.title,
    alternativeHeadline: article.metaTitle || article.title,
    description,
    image: article.coverImage || absoluteUrl(SITE.ogImagePath),
    url: absoluteUrl(canonicalPath),
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    articleSection: article.category || "Sports Nutrition",
    keywords: [article.focusKeyword, ...(article.secondaryKeywords || []), ...(article.tags || [])]
      .filter(Boolean)
      .join(", "),
    wordCount: words,
    timeRequired: `PT${readTime}M`,
    inLanguage: "en-IN",
    author: {
      "@type": "Organization",
      name: article.author || "Legend Born Research Team",
      url: `${SITE.url}/about`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.companyName || "Legend Born Nutrition",
      legalName: SITE.legalEntity,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: absoluteUrl(canonicalPath),
    isPartOf: { "@id": `${SITE.url}/#website` },
  };

  return (
    <article className="page-section bg-[#0A0A0C] text-slate-100 py-12 sm:py-16 lg:py-20">
      <Seo
        title={metaTitle}
        description={description}
        canonicalPath={canonicalPath}
        image={article.coverImage || SITE.ogImagePath}
        imageAlt={article.imageAlt || article.title}
        type="article"
        indexable={article.isPublished !== false}
        structuredData={[
          schema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: article.title, path: canonicalPath },
          ]),
        ]}
      />

      <div className="container-page max-w-4xl">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5500] hover:text-[#FFB800] transition"
        >
          <ArrowLeft size={16} /> All Performance Guides
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-none bg-[#FF5500]/10 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[#FF5500] border border-[#FF5500]/30">
              {article.category || "Sports Nutrition"}
            </span>
            {article.focusKeyword && (
              <span className="rounded-none bg-[#FFB800]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#FFB800] border border-[#FFB800]/30">
                {article.focusKeyword}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 border-b border-slate-800 pb-5">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <UserRound size={15} className="text-[#FF5500]" /> {article.author || "Legend Born Research Team"}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} className="text-[#FFB800]" /> {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400" /> ~{readTime} min read
            </span>
          </div>

          {article.excerpt && (
            <p className="mt-6 text-base leading-8 text-slate-300 font-medium sm:text-lg sm:leading-8 bg-[#121216] border-l-4 border-[#FF5500] p-4">
              {article.excerpt}
            </p>
          )}
        </header>

        {article.coverImage && (
          <div className="mt-8 overflow-hidden border border-slate-800 shadow-2xl">
            <ProductImage
              src={article.coverImage}
              alt={article.imageAlt || article.title}
              className="aspect-[16/9] h-auto w-full object-cover"
              fallbackClassName="aspect-[16/9] h-auto w-full"
              loading="eager"
            />
          </div>
        )}

        <div className="mt-10 space-y-6 text-base leading-8 text-slate-300 font-normal">
          {blocks.map((block, index) => (
            <p key={`${index}-${block.slice(0, 24)}`} className="whitespace-pre-line">
              {block}
            </p>
          ))}
        </div>

        {!!article.tags?.length && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-6">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
              <Tag size={13} /> Topics:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-none bg-[#1A1A22] border border-slate-800 px-3 py-1 text-xs font-bold text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <aside className="mt-10 border border-[#FF5500]/30 bg-[#121216] p-5 text-xs leading-6 text-slate-400">
          <p className="font-bold text-[#FFB800] uppercase tracking-wider mb-1">Scientific Integrity & Wellness Advisory</p>
          This educational article is compiled by the Legend Born Nutrition Research Team for athletic performance and nutritional guidance. It does not substitute individualized medical advice or clinical diagnosis.
        </aside>
      </div>
    </article>
  );
}
