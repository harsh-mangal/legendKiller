import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  Wand2,
  XCircle,
} from "lucide-react";
import API, { assetUrl } from "../api/axios";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Textarea,
  Toggle,
} from "../components/ui";
import { useToast } from "../context/ToastContext";
import { dateTime } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { validateImageFiles } from "../utils/validation";
import { useObjectUrl } from "../hooks/useObjectUrl";

const CATEGORIES = [
  "Sports Nutrition",
  "Protein Science",
  "Pre-Workout & Energy",
  "Creatine & Muscle Growth",
  "Supplement Authenticity & Lab Reports",
  "Workout & Recovery Protocols",
];

const DEFAULT_AUTHOR = "Legend Born Research Team";
const SITE_DOMAIN = "https://legendbornnutrition.com";

const blankForm = {
  title: "",
  slug: "",
  category: "Sports Nutrition",
  author: DEFAULT_AUTHOR,
  tags: "",
  excerpt: "",
  content: "",
  coverImage: "",
  imageAlt: "",
  focusKeyword: "",
  secondaryKeywords: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  readTimeMinutes: 4,
  isFeatured: false,
  isPublished: true,
  media: null,
};

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const countWords = (text) =>
  String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export default function Articles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // 'content' | 'seo'
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'mobile'
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(blankForm);
  const [existingImage, setExistingImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/blogs/admin/all");
      setItems(data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Articles could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId("");
    setForm(blankForm);
    setExistingImage("");
    setActiveTab("content");
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setExistingImage(item.coverImage || "");
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      category: item.category || "Sports Nutrition",
      author: item.author || DEFAULT_AUTHOR,
      tags: (item.tags || []).join(", "),
      excerpt: item.excerpt || "",
      content: item.content || "",
      coverImage: item.coverImage || "",
      imageAlt: item.imageAlt || item.title || "",
      focusKeyword: item.focusKeyword || "",
      secondaryKeywords: (item.secondaryKeywords || []).join(", "),
      metaTitle: item.metaTitle || item.title || "",
      metaDescription: item.metaDescription || item.excerpt || "",
      canonicalUrl: item.canonicalUrl || "",
      readTimeMinutes: item.readTimeMinutes || 4,
      isFeatured: item.isFeatured === true,
      isPublished: item.isPublished !== false,
      media: null,
    });
    setActiveTab("content");
    setEditorOpen(true);
  };

  const handleTitleChange = (val) => {
    setForm((current) => {
      const next = { ...current, title: val };
      if (!editingId && (!current.slug || current.slug === slugify(current.title))) {
        next.slug = slugify(val);
      }
      if (!current.metaTitle || current.metaTitle === current.title) {
        next.metaTitle = val;
      }
      if (!current.imageAlt || current.imageAlt === current.title) {
        next.imageAlt = val;
      }
      return next;
    });
  };

  const handleExcerptChange = (val) => {
    setForm((current) => {
      const next = { ...current, excerpt: val };
      if (!current.metaDescription || current.metaDescription === current.excerpt) {
        next.metaDescription = val.slice(0, 160);
      }
      return next;
    });
  };

  const autoGenerateSlug = () => {
    if (!form.title.trim()) {
      toast.info("Please enter an article title first.");
      return;
    }
    const slug = slugify(form.title);
    setForm((current) => ({ ...current, slug }));
    toast.success(`Generated SEO slug: /${slug}`);
  };

  const autoFillMeta = () => {
    setForm((current) => ({
      ...current,
      metaTitle: current.title ? `${current.title.trim()} | Legend Killer` : "",
      metaDescription: current.excerpt
        ? current.excerpt.trim().slice(0, 160)
        : current.content.trim().slice(0, 155).replace(/\s+/g, " "),
      imageAlt: current.title.trim() || current.imageAlt,
    }));
    toast.success("SEO Meta fields synchronized from content.");
  };

  // SEO Calculation Helpers
  const wordsCount = useMemo(() => countWords(form.content), [form.content]);
  const estimatedReadTime = useMemo(() => Math.max(1, Math.ceil(wordsCount / 200)), [wordsCount]);

  const seoScoreData = useMemo(() => {
    const checks = [];
    const title = form.metaTitle || form.title;
    const desc = form.metaDescription || form.excerpt;
    const focus = (form.focusKeyword || "").toLowerCase().trim();
    const slug = form.slug || "";
    const content = (form.content || "").toLowerCase();

    // 1. Title Length Check (50-65 optimal)
    const titleLen = title.length;
    if (titleLen >= 40 && titleLen <= 65) {
      checks.push({ label: "Title tag length is optimal (40-65 chars)", pass: true, weight: 15 });
    } else if (titleLen > 0 && titleLen < 40) {
      checks.push({ label: "Title tag is a bit short (<40 chars)", pass: false, weight: 8 });
    } else if (titleLen > 65) {
      checks.push({ label: "Title tag may truncate on Google (>65 chars)", pass: false, weight: 8 });
    } else {
      checks.push({ label: "Title tag is missing", pass: false, weight: 0 });
    }

    // 2. Meta Description Length Check (120-160 optimal)
    const descLen = desc.length;
    if (descLen >= 120 && descLen <= 160) {
      checks.push({ label: "Meta description length is optimal (120-160 chars)", pass: true, weight: 15 });
    } else if (descLen > 0 && descLen < 120) {
      checks.push({ label: "Meta description is short (<120 chars)", pass: false, weight: 8 });
    } else if (descLen > 160) {
      checks.push({ label: "Meta description exceeds 160 chars", pass: false, weight: 8 });
    } else {
      checks.push({ label: "Meta description is missing", pass: false, weight: 0 });
    }

    // 3. Focus Keyword Checks
    if (focus) {
      const inTitle = title.toLowerCase().includes(focus);
      checks.push({
        label: `Focus keyword "${focus}" present in Title`,
        pass: inTitle,
        weight: inTitle ? 15 : 0,
      });

      const inSlug = slug.toLowerCase().includes(slugify(focus));
      checks.push({
        label: `Focus keyword present in URL Slug`,
        pass: inSlug,
        weight: inSlug ? 15 : 0,
      });

      const inDesc = desc.toLowerCase().includes(focus);
      checks.push({
        label: `Focus keyword present in Meta Description`,
        pass: inDesc,
        weight: inDesc ? 15 : 0,
      });

      const inContent = content.includes(focus);
      checks.push({
        label: `Focus keyword found in body content`,
        pass: inContent,
        weight: inContent ? 15 : 0,
      });
    } else {
      checks.push({
        label: "Specify a Target Focus Keyword for search optimization",
        pass: false,
        weight: 0,
      });
    }

    // 4. Image Alt text
    if (form.media || existingImage) {
      const hasAlt = Boolean(form.imageAlt && form.imageAlt.trim().length >= 5);
      checks.push({
        label: "Cover image has descriptive Alt Text for Google Images",
        pass: hasAlt,
        weight: hasAlt ? 10 : 0,
      });
    }

    // 5. Content Depth Check
    if (wordsCount >= 600) {
      checks.push({ label: `In-depth content depth (${wordsCount} words)`, pass: true, weight: 15 });
    } else if (wordsCount >= 300) {
      checks.push({ label: `Good standard article length (${wordsCount} words)`, pass: true, weight: 10 });
    } else {
      checks.push({ label: `Content depth is light (<300 words)`, pass: false, weight: 0 });
    }

    const totalPassed = checks.reduce((acc, c) => acc + (c.pass ? c.weight : 0), 0);
    const maxPossible = 100;
    const score = Math.min(100, Math.round((totalPassed / maxPossible) * 100));

    return { checks, score };
  }, [form, existingImage, wordsCount]);

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Article Title is required.");
      return;
    }
    if (!form.content.trim() || form.content.trim().length < 50) {
      toast.error("Article content must have at least 50 characters.");
      return;
    }

    const finalSlug = slugify(form.slug || form.title);
    if (!finalSlug) {
      toast.error("Valid URL slug is required.");
      return;
    }

    const imageError = validateImageFiles(form.media ? [form.media] : [], { maxFiles: 1 });
    if (imageError) {
      toast.error(imageError);
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      const payload = {
        title: form.title.trim(),
        slug: finalSlug,
        category: form.category.trim() || "Sports Nutrition",
        author: form.author.trim() || DEFAULT_AUTHOR,
        tags: form.tags,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        imageAlt: form.imageAlt.trim() || form.title.trim(),
        focusKeyword: form.focusKeyword.trim(),
        secondaryKeywords: form.secondaryKeywords,
        metaTitle: form.metaTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
        canonicalUrl: form.canonicalUrl.trim() || `${SITE_DOMAIN}/articles/${finalSlug}`,
        readTimeMinutes: estimatedReadTime,
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
      };

      Object.entries(payload).forEach(([key, value]) => {
        fd.append(key, String(value));
      });

      if (form.media) {
        fd.append("media", form.media);
      }

      const { data } = editingId
        ? await API.put(`/blogs/${editingId}`, fd)
        : await API.post("/blogs", fd);

      setItems((current) =>
        editingId
          ? current.map((item) => (item._id === editingId ? data.data : item))
          : [data.data, ...current]
      );
      toast.success(data.message || "Article saved with SEO attributes.");
      setEditorOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Article could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    if (!archiveTarget) return;
    try {
      setSaving(true);
      const { data } = await API.delete(`/blogs/${archiveTarget._id}`);
      setItems((current) =>
        current.map((item) =>
          item._id === archiveTarget._id ? { ...item, isPublished: false } : item
        )
      );
      toast.success(data.message || "Article unpublished.");
      setArchiveTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const selectedPreview = useObjectUrl(form.media);
  const preview = selectedPreview || (existingImage ? assetUrl(existingImage) : "");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.focusKeyword || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.slug || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && item.isPublished) ||
        (statusFilter === "DRAFT" && !item.isPublished);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.isPublished).length;
    const drafts = total - published;
    const featured = items.filter((i) => i.isFeatured).length;
    return { total, published, drafts, featured };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SEO & Content Marketing"
        title="Articles & Knowledge Base"
        description="Publish search-optimized guides, scientific articles, and sports nutrition knowledge base posts to rank #1 on Google."
        actions={
          <>
            <Button variant="secondary" onClick={load}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} /> Create SEO Article
            </Button>
          </>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Guides</p>
              <p className="mt-1 text-2xl font-black text-stone-900">{stats.total}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-600">
              <FileText size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Live (Indexable)</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{stats.published}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Globe size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Drafts</p>
              <p className="mt-1 text-2xl font-black text-amber-600">{stats.drafts}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Layers size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Featured Stacks</p>
              <p className="mt-1 text-2xl font-black text-brand-700">{stats.featured}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <Sparkles size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input
              className="pl-9"
              placeholder="Search by article title, keyword, or slug…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-auto"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              className="w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Articles Table / List */}
      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="Loading articles catalogue…" />
        ) : filteredItems.length ? (
          <div className="divide-y divide-stone-100">
            {filteredItems.map((item) => (
              <article
                key={item._id}
                className="grid gap-4 p-5 transition hover:bg-stone-50/70 md:grid-cols-[140px_1fr_auto]"
              >
                {/* Thumbnail */}
                <div className="relative h-28 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  {item.coverImage ? (
                    <img
                      src={assetUrl(item.coverImage)}
                      alt={item.imageAlt || item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-stone-400">
                      <ImageIcon size={28} />
                    </div>
                  )}
                  {item.isFeatured && (
                    <span className="absolute left-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-white shadow">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-stone-950">{item.title}</h2>
                    <Badge tone={item.isPublished ? "success" : "neutral"}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">
                      {item.category || "Sports Nutrition"}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">
                    {item.metaDescription || item.excerpt || item.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <User size={13} /> {item.author || DEFAULT_AUTHOR}
                    </span>
                    <span>•</span>
                    <span>{dateTime(item.publishedAt || item.createdAt)}</span>
                    <span>•</span>
                    <span className="font-mono text-brand-700">/{item.slug}</span>
                    {item.focusKeyword && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
                          <Tag size={12} /> {item.focusKeyword}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>~{item.readTimeMinutes || 4} min read</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2">
                  <a
                    href={`${SITE_DOMAIN}/articles/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="View live on storefront"
                  >
                    <ExternalLink size={14} /> Live
                  </a>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  {item.isPublished && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setArchiveTarget(item)}
                      title="Unpublish article"
                    >
                      <Archive size={14} />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No matching articles found"
            description="Create high-ranking sports nutrition guides to build authority and drive organic traffic."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} /> Create First Article
              </Button>
            }
          />
        )}
      </Card>

      {/* Editor Modal with Dual Tab SEO Suite */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? "Edit SEO Article" : "Create New SEO Article"}
        size="xl"
        footer={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                  seoScoreData.score >= 80
                    ? "bg-emerald-100 text-emerald-800"
                    : seoScoreData.score >= 50
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <TrendingUp size={14} /> SEO Score: {seoScoreData.score}/100
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Publish & Save Article"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Tabs Switcher */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === "content"
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                1. Article Content & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === "seo"
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Sparkles size={16} /> 2. SEO Suite & Google SERP Preview
                <span className="rounded-full bg-white/30 px-1.5 py-0.2 text-xs font-black">
                  {seoScoreData.score}%
                </span>
              </button>
            </div>

            {activeTab === "seo" && (
              <Button size="sm" variant="secondary" onClick={autoFillMeta}>
                <Wand2 size={14} /> Auto-Fill SEO Fields
              </Button>
            )}
          </div>

          {/* TAB 1: CONTENT & MEDIA */}
          {activeTab === "content" && (
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Article Title (H1)" required className="md:col-span-2">
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., The Ultimate Whey Isolate vs Concentrate Guide: How to Avoid Amino Spiking"
                />
              </Field>

              <Field
                label="URL Slug (Permanent Path)"
                required
                hint={
                  <span className="font-mono text-stone-500">
                    URL: {SITE_DOMAIN}/articles/{form.slug || "your-slug"}
                  </span>
                }
              >
                <div className="flex gap-2">
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((c) => ({ ...c, slug: slugify(e.target.value) }))}
                    placeholder="whey-isolate-vs-concentrate-guide"
                  />
                  <Button variant="secondary" size="sm" onClick={autoGenerateSlug} title="Generate from title">
                    <Wand2 size={15} />
                  </Button>
                </div>
              </Field>

              <Field label="Category" required>
                <Select
                  value={form.category}
                  onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Author Name">
                <Input
                  value={form.author}
                  onChange={(e) => setForm((c) => ({ ...c, author: e.target.value }))}
                  placeholder={DEFAULT_AUTHOR}
                />
              </Field>

              <Field label="Tags (Comma Separated)" hint="For internal linking and related topics">
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))}
                  placeholder="whey protein, digezyme, muscle growth, amino spiking"
                />
              </Field>

              <Field
                label="Article Excerpt (Summary)"
                className="md:col-span-2"
                hint="Displayed in social previews, article listing cards, and search engine snippets."
              >
                <Textarea
                  rows="3"
                  maxLength="400"
                  value={form.excerpt}
                  onChange={(e) => handleExcerptChange(e.target.value)}
                  placeholder="Summarize the core takeaways in 2-3 compelling sentences..."
                />
              </Field>

              <Field
                label={
                  <div className="flex items-center justify-between">
                    <span>Article Content (Body) *</span>
                    <span className="text-xs font-normal text-stone-500">
                      {wordsCount} words • ~{estimatedReadTime} min read
                    </span>
                  </div>
                }
                required
                className="md:col-span-2"
              >
                <Textarea
                  rows="14"
                  value={form.content}
                  onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))}
                  placeholder="Write comprehensive, educational, science-backed content here. Use paragraphs and clear explanations..."
                />
              </Field>

              {/* Cover Image & Alt Text */}
              <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-stone-900">Cover Image & Visual SEO</p>
                  <span className="text-xs text-stone-500">JPG, PNG, WebP · Max 5MB</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Upload Image File">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((c) => ({ ...c, media: e.target.files?.[0] || null }))}
                    />
                  </Field>

                  <Field
                    label="Image Alt Text (Google Images SEO)"
                    hint="Describe the image using target keywords"
                  >
                    <Input
                      value={form.imageAlt}
                      onChange={(e) => setForm((c) => ({ ...c, imageAlt: e.target.value }))}
                      placeholder="e.g. Legend Killer pure whey protein isolate lab certificate"
                    />
                  </Field>
                </div>

                {preview && (
                  <div className="relative h-44 overflow-hidden rounded-xl border border-stone-200 bg-white">
                    <img src={preview} alt={form.imageAlt || "Preview"} className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Switches */}
              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                <div className="flex-1">
                  <Toggle
                    checked={form.isPublished}
                    onChange={(val) => setForm((c) => ({ ...c, isPublished: val }))}
                    label="Publish to Storefront"
                    description="When enabled, article is indexable and visible to Googlebot"
                  />
                </div>
                <div className="flex-1">
                  <Toggle
                    checked={form.isFeatured}
                    onChange={(val) => setForm((c) => ({ ...c, isFeatured: val }))}
                    label="Feature at Top"
                    description="Pinnable spotlight guide on the knowledge base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED SEO SUITE & SERP PREVIEW */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              {/* Live SERP Preview Card */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <GoogleIcon />
                    <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                      Google Search Result Snippet Preview
                    </h3>
                  </div>

                  <div className="flex rounded-lg border border-stone-200 bg-white p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`rounded px-2.5 py-1 ${
                        previewDevice === "desktop" ? "bg-stone-900 text-white" : "text-stone-600"
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`rounded px-2.5 py-1 ${
                        previewDevice === "mobile" ? "bg-stone-900 text-white" : "text-stone-600"
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Google Snippet Card Rendering */}
                <div
                  className={`mt-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm font-sans ${
                    previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <div className="grid h-5 w-5 place-items-center rounded-full bg-stone-100 text-[10px] font-black text-brand-700">
                      LK
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-800 leading-none">Legend Born Nutrition</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {SITE_DOMAIN} › articles › {form.slug || "sample-guide"}
                      </span>
                    </div>
                  </div>

                  <h4 className="mt-2 cursor-pointer text-lg font-medium text-[#1a0dab] hover:underline leading-snug">
                    {form.metaTitle || form.title || "Enter an article title to preview Google headline"}
                  </h4>

                  <p className="mt-1 text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                    {form.metaDescription ||
                      form.excerpt ||
                      form.content?.slice(0, 160) ||
                      "Enter a meta description or article excerpt to see how this guide will appear when prospective customers search on Google..."}
                  </p>
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Meta Title */}
                <Field
                  label={
                    <div className="flex items-center justify-between">
                      <span>SEO Title Tag (50-60 chars recommended)</span>
                      <span
                        className={`text-xs font-bold ${
                          (form.metaTitle || form.title).length >= 40 &&
                          (form.metaTitle || form.title).length <= 65
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {(form.metaTitle || form.title).length} / 65 chars
                      </span>
                    </div>
                  }
                  hint="Custom title shown on search engine result pages (SERPs)."
                >
                  <Input
                    value={form.metaTitle}
                    onChange={(e) => setForm((c) => ({ ...c, metaTitle: e.target.value }))}
                    placeholder={form.title || "SEO Title tag"}
                  />
                </Field>

                {/* Target Focus Keyword */}
                <Field
                  label="Target Focus Keyword"
                  hint="The #1 search term you want this article to rank for."
                >
                  <Input
                    value={form.focusKeyword}
                    onChange={(e) => setForm((c) => ({ ...c, focusKeyword: e.target.value }))}
                    placeholder="e.g. whey protein isolate india"
                  />
                </Field>

                {/* Meta Description */}
                <Field
                  label={
                    <div className="flex items-center justify-between">
                      <span>Meta Description (120-160 chars recommended)</span>
                      <span
                        className={`text-xs font-bold ${
                          (form.metaDescription || form.excerpt).length >= 120 &&
                          (form.metaDescription || form.excerpt).length <= 160
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {(form.metaDescription || form.excerpt).length} / 160 chars
                      </span>
                    </div>
                  }
                  className="md:col-span-2"
                  hint="Compelling snippet text to boost organic click-through rate (CTR)."
                >
                  <Textarea
                    rows="3"
                    maxLength="200"
                    value={form.metaDescription}
                    onChange={(e) => setForm((c) => ({ ...c, metaDescription: e.target.value }))}
                    placeholder="Provide a clear, high-CTR summary answering the user's search intent..."
                  />
                </Field>

                {/* Secondary Keywords */}
                <Field
                  label="Secondary Semantic Keywords"
                  hint="Comma-separated secondary search terms."
                >
                  <Input
                    value={form.secondaryKeywords}
                    onChange={(e) => setForm((c) => ({ ...c, secondaryKeywords: e.target.value }))}
                    placeholder="e.g. amino acid spiking, digezyme, pure whey"
                  />
                </Field>

                {/* Canonical URL */}
                <Field
                  label="Canonical URL Override (Optional)"
                  hint="Leave empty to use the standard canonical URL."
                >
                  <Input
                    value={form.canonicalUrl}
                    onChange={(e) => setForm((c) => ({ ...c, canonicalUrl: e.target.value }))}
                    placeholder={`${SITE_DOMAIN}/articles/${form.slug || "your-slug"}`}
                  />
                </Field>
              </div>

              {/* SEO Checklist Analysis */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h4 className="text-sm font-bold text-stone-900">SEO Audit Checklist</h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      seoScoreData.score >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Grade: {seoScoreData.score >= 80 ? "A (Pass)" : "Needs Optimization"}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {seoScoreData.checks.map((check, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium">
                      {check.pass ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-amber-500" />
                      )}
                      <span className={check.pass ? "text-stone-800" : "text-stone-500"}>
                        {check.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Unpublish Dialog */}
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={archive}
        loading={saving}
        dangerous
        title="Unpublish Article"
        confirmLabel="Unpublish"
        description={`Are you sure you want to unpublish "${archiveTarget?.title}"? It will no longer be visible or indexed on the storefront.`}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
      />
    </svg>
  );
}
