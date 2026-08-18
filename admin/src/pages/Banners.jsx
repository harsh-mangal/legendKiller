import { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import API, { assetUrl } from "../api/axios";
import { getErrorMessage } from "../utils/errors";
import { validateMediaFiles } from "../utils/validation";
import { useToast } from "../context/ToastContext";
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
  Toggle,
} from "../components/ui";

const PAGE_PRESETS = {
  home: {
    label: "Home page",
    description: "Primary campaign banners shown on the storefront landing page.",
    desktop: { width: 1920, height: 350 },
    mobile: { width: 750, height: 350 },
  },
  categories: {
    label: "Category page",
    description: "Wide banners used above category and catalogue discovery.",
    desktop: { width: 1920, height: 350 },
    mobile: { width: 750, height: 260 },
  },
};

const newForm = (page = "home") => ({
  page,
  title: "",
  link: "",
  sortOrder: 0,
  isActive: true,
  image: null,
  mobileImage: null,
});

const isVideoMedia = (target) => {
  if (!target) return false;
  if (typeof target === "string") {
    return /\.(mp4|webm|mov|ogg|mkv)($|\?)/i.test(target);
  }
  if (target?.type?.startsWith("video/")) return true;
  if (/\.(mp4|webm|mov|ogg|mkv)$/i.test(target?.name || "")) return true;
  return false;
};

function Preview({ src, label, ratio, icon: Icon, file }) {
  const isVideo = isVideoMedia(file) || isVideoMedia(src);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
          <Icon size={15} /> {label}
        </span>
        {src && (
          <Badge tone={isVideo ? "info" : "neutral"}>
            {isVideo ? <><Video size={12} className="mr-1" /> Video (Autoplay)</> : "Image"}
          </Badge>
        )}
      </div>
      <div
        className="overflow-hidden rounded-xl border border-stone-200 bg-stone-950"
        style={{ aspectRatio: ratio }}
      >
        {src ? (
          isVideo ? (
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={src}
              alt={`${label} banner preview`}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-center text-stone-400">
            <div>
              <ImagePlus size={28} className="mx-auto" />
              <p className="mt-2 text-xs font-semibold">No media selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Banners() {
  const toast = useToast();
  const desktopRef = useRef(null);
  const mobileRef = useRef(null);
  const [activePage, setActivePage] = useState("home");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(newForm());
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const preset = PAGE_PRESETS[form.page] || PAGE_PRESETS.home;
  const counts = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.isActive).length,
    }),
    [items]
  );

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/banners/admin/all", {
        params: { page: activePage },
      });
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      setItems([]);
      toast.error(getErrorMessage(error, "Unable to load banners."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      if (desktopPreview.startsWith("blob:")) URL.revokeObjectURL(desktopPreview);
      if (mobilePreview.startsWith("blob:")) URL.revokeObjectURL(mobilePreview);
    },
    [desktopPreview, mobilePreview]
  );

  const resetEditor = (page = activePage) => {
    setEditing(null);
    setForm(newForm(page));
    setDesktopPreview("");
    setMobilePreview("");
    if (desktopRef.current) desktopRef.current.value = "";
    if (mobileRef.current) mobileRef.current.value = "";
  };

  const openCreate = () => {
    resetEditor(activePage);
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      page: item.page || activePage,
      title: item.title || "",
      link: item.link || "",
      sortOrder: Number(item.sortOrder || 0),
      isActive: item.isActive !== false,
      image: null,
      mobileImage: null,
    });
    setDesktopPreview(assetUrl(item.image));
    setMobilePreview(assetUrl(item.mobileImage));
    setEditorOpen(true);
  };

  const changeFile = (field, file) => {
    if (!file) return;
    const mediaError = validateMediaFiles([file], { maxFiles: 1, maxMb: 100 });
    if (mediaError) {
      toast.error(mediaError);
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((current) => ({ ...current, [field]: file }));
    if (field === "image") setDesktopPreview(url);
    else setMobilePreview(url);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!editing && !form.image) {
      toast.error("A desktop banner image or video is required.");
      return;
    }
    if (form.title.trim().length > 160) {
      toast.error("Banner title must be 160 characters or fewer.");
      return;
    }
    if (!Number.isInteger(Number(form.sortOrder))) {
      toast.error("Banner sort order must be a whole number.");
      return;
    }
    if (form.link.trim()) {
      const value = form.link.trim();
      const isInternal = value.startsWith("/") && !value.startsWith("//");
      let isExternal = false;
      try {
        const url = new URL(value);
        isExternal = ["http:", "https:"].includes(url.protocol);
      } catch {
        isExternal = false;
      }
      if (!isInternal && !isExternal) {
        toast.error(
          "Banner link must be an internal path beginning with / or a valid http/https URL."
        );
        return;
      }
    }

    const body = new FormData();
    body.append("page", form.page);
    body.append("title", form.title.trim());
    body.append("link", form.link.trim());
    body.append("sortOrder", String(Number(form.sortOrder || 0)));
    body.append("isActive", String(form.isActive));
    body.append("width", String(preset.desktop.width));
    body.append("height", String(preset.desktop.height));
    body.append("mobileWidth", String(preset.mobile.width));
    body.append("mobileHeight", String(preset.mobile.height));
    if (form.image) body.append("image", form.image);
    if (form.mobileImage) body.append("mobileImage", form.mobileImage);

    try {
      setSaving(true);
      if (editing) await API.put(`/banners/admin/${editing._id}`, body);
      else await API.post("/banners/admin/create", body);
      toast.success(editing ? "Banner updated." : "Banner created.");
      setActivePage(form.page);
      setEditorOpen(false);
      resetEditor(form.page);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save banner."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      await API.patch(`/banners/admin/${item._id}/toggle-status`);
      setItems((current) =>
        current.map((banner) =>
          banner._id === item._id
            ? { ...banner, isActive: !banner.isActive }
            : banner
        )
      );
      toast.success(
        item.isActive
          ? "Banner hidden from the storefront."
          : "Banner is now live."
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to change banner status."));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await API.delete(`/banners/admin/${deleteTarget._id}`);
      setItems((current) =>
        current.filter((item) => item._id !== deleteTarget._id)
      );
      toast.success("Banner deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete banner."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Storefront content"
        title="Banners & Video Media"
        description="Manage high-performance 1920 × 350 desktop banners, mobile media, and looping MP4/WEBM video hero banners."
        actions={
          <>
            <Button variant="secondary" onClick={load}>
              <RefreshCw size={17} /> Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus size={17} /> Add banner
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(PAGE_PRESETS).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePage(key)}
            className={`rounded-2xl border p-4 text-left transition ${
              activePage === key
                ? "border-brand-700 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-stone-950">
                {value.label}
              </span>
              {activePage === key && <Badge tone="success">Selected</Badge>}
            </div>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              {value.description}
            </p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-base font-bold text-stone-950">
              {PAGE_PRESETS[activePage].label} banners
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {counts.active} live of {counts.total} total · displayed in
              sort-order sequence
            </p>
          </div>
          <div className="flex gap-2">
            <Badge tone="success">{counts.active} live</Badge>
            <Badge>{counts.total} total</Badge>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading banners…" />
        ) : items.length === 0 ? (
          <EmptyState
            title="No banners for this page"
            description="Create the first campaign banner or video hero and preview both desktop (1920×350) and mobile media."
            action={
              <Button onClick={openCreate}>
                <Plus size={17} /> Add banner
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {items.map((item) => {
              const isVideo =
                item.mediaType === "video" || isVideoMedia(item.image);
              return (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
                >
                  <div className="relative aspect-[1920/350] bg-stone-950">
                    {item.image ? (
                      isVideo ? (
                        <video
                          src={assetUrl(item.image)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={assetUrl(item.image)}
                          alt={item.title || "Storefront banner"}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="grid h-full place-items-center text-stone-400">
                        <ImagePlus size={30} />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge tone={item.isActive ? "success" : "neutral"}>
                        {item.isActive ? "Live" : "Hidden"}
                      </Badge>
                      {isVideo ? (
                        <Badge tone="info">
                          <Video size={12} className="mr-1 inline" /> Video
                        </Badge>
                      ) : (
                        <Badge tone="neutral">Image</Badge>
                      )}
                      <Badge>Order {Number(item.sortOrder || 0)}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-stone-950">
                          {item.title || "Untitled banner"}
                        </h3>
                        <p className="mt-1 truncate text-xs text-stone-500">
                          {item.link || "No click-through link"}
                        </p>
                      </div>
                      {item.mobileImage && (
                        <Badge tone="info">
                          <Smartphone size={13} className="mr-1" /> Mobile Media
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                      <p className="text-[11px] text-stone-500">
                        Recommended:{" "}
                        {PAGE_PRESETS[item.page]?.desktop.width || 1920} ×{" "}
                        {PAGE_PRESETS[item.page]?.desktop.height || 350}px
                      </p>
                      <div className="flex gap-1">
                        <IconButton
                          label={
                            item.isActive ? "Hide banner" : "Publish banner"
                          }
                          onClick={() => toggleStatus(item)}
                        >
                          {item.isActive ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </IconButton>
                        <IconButton
                          label="Edit banner"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil size={17} />
                        </IconButton>
                        <IconButton
                          label="Delete banner"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={17} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={editorOpen}
        onClose={() => !saving && setEditorOpen(false)}
        title={editing ? "Edit banner" : "Create banner"}
        description="Upload images (JPG, PNG, WEBP) or looping videos (MP4, WEBM, MOV) up to 100MB. Recommended resolution: 1920 × 350 px."
        size="xl"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setEditorOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="banner-form" disabled={saving}>
              {saving
                ? "Uploading & Saving…"
                : editing
                ? "Save changes"
                : "Create banner"}
            </Button>
          </div>
        }
      >
        <form
          id="banner-form"
          onSubmit={submit}
          className="grid gap-6 xl:grid-cols-[1fr_1.15fr]"
        >
          <div className="space-y-4">
            <Field label="Placement" required>
              <Select
                value={form.page}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    page: event.target.value,
                  }))
                }
              >
                {Object.entries(PAGE_PRESETS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Internal title"
              hint="Used in admin and as media alt/title context."
            >
              <Input
                value={form.title}
                maxLength={120}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: Raw Whey Isolate 1920x350 Promo"
              />
            </Field>
            <Field
              label="Click-through link"
              hint="Use an internal path such as /products or /categories/whey-protein."
            >
              <Input
                value={form.link}
                maxLength={300}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    link: event.target.value,
                  }))
                }
                placeholder="/products"
              />
            </Field>
            <Field
              label="Sort order"
              hint="Lower numbers appear first in the carousel."
            >
              <Input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </Field>
            <Toggle
              checked={form.isActive}
              onChange={(checked) =>
                setForm((current) => ({ ...current, isActive: checked }))
              }
              label="Publish banner"
              description="When disabled, the banner remains saved in database but is hidden from customers."
            />
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-5 text-stone-600">
              <p className="font-bold text-stone-900">
                Media &amp; Resolution Specs
              </p>
              <p className="mt-1">
                <strong>Desktop:</strong> {preset.desktop.width} ×{" "}
                {preset.desktop.height} px (Ratio: ~5.48:1)
                <br />
                <strong>Mobile:</strong> {preset.mobile.width} ×{" "}
                {preset.mobile.height} px
                <br />
                <strong>Supported formats:</strong> MP4, WEBM, MOV (Video) ·
                WebP, PNG, JPG (Image). Up to 100 MB.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Preview
              src={desktopPreview}
              label="Desktop preview (1920 × 350)"
              ratio={`${preset.desktop.width}/${preset.desktop.height}`}
              icon={Monitor}
              file={form.image}
            />
            <Field
              label="Desktop media (Image or Video)"
              required={!editing}
              hint="Image (WebP/PNG/JPG) or Video (MP4/WEBM/MOV). Maximum 100 MB."
            >
              <label className="btn btn-secondary btn-md w-full cursor-pointer">
                <Upload size={17} />{" "}
                {form.image
                  ? form.image.name
                  : editing
                  ? "Replace desktop media"
                  : "Choose desktop image or video"}
                <input
                  ref={desktopRef}
                  className="sr-only"
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,video/x-matroska,video/*"
                  onChange={(event) =>
                    changeFile("image", event.target.files?.[0])
                  }
                />
              </label>
            </Field>

            <Preview
              src={mobilePreview}
              label="Mobile preview (750 × 350)"
              ratio={`${preset.mobile.width}/${preset.mobile.height}`}
              icon={Smartphone}
              file={form.mobileImage}
            />
            <Field
              label="Mobile media (Optional)"
              hint="Recommended crop for mobile screens. Image or Video."
            >
              <label className="btn btn-secondary btn-md w-full cursor-pointer">
                <Upload size={17} />{" "}
                {form.mobileImage
                  ? form.mobileImage.name
                  : editing
                  ? "Replace mobile media"
                  : "Choose mobile image or video"}
                <input
                  ref={mobileRef}
                  className="sr-only"
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/ogg,video/x-matroska,video/*"
                  onChange={(event) =>
                    changeFile("mobileImage", event.target.files?.[0])
                  }
                />
              </label>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete banner?"
        description={`This permanently deletes ${
          deleteTarget?.title || "this banner"
        } and its uploaded files. This cannot be undone.`}
        confirmLabel="Delete banner"
        dangerous
        loading={deleting}
      />
    </div>
  );
}
