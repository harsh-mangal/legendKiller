import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Zap,
  Brain,
  Flame,
  Droplets,
  Shield,
  Layers,
  Lock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import API from "../api/axios";
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
import { getErrorMessage } from "../utils/errors";

const ICON_OPTIONS = [
  { label: "Zap (Power / Bioenergetics)", value: "Zap" },
  { label: "Brain (Neural Drive / Focus)", value: "Brain" },
  { label: "Flame (Thermogenic / Metabolism)", value: "Flame" },
  { label: "Activity (Pump / Vasodilation)", value: "Activity" },
  { label: "Droplets (Hydration / Electrolytes)", value: "Droplets" },
  { label: "Shield (Bioavailability / Protection)", value: "Shield" },
];

const iconMap = {
  Zap,
  Brain,
  Flame,
  Activity,
  Droplets,
  Shield,
};

const blankArchitecture = {
  title: "",
  slug: "",
  subtitle: "",
  category: "Viper Protocol",
  badge: "5 Pillars",
  icon: "Zap",
  shortDescription: "",
  overview: "",
  pillars: [
    { name: "", ingredient: "", role: "" }
  ],
  emergentOutcomes: [""],
  chapters: [
    { number: 1, title: "", content: "" }
  ],
  sortOrder: 0,
  isActive: true,
};

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Architectures() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'pillars' | 'outcomes' | 'chapters'
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(blankArchitecture);
  const [saving, setSaving] = useState(false);
  const [deletingId, setEditingDeleteId] = useState("");
  const [seeding, setSeeding] = useState(false);
  const toast = useToast();

  const fetchArchitectures = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/architectures?admin=true");
      setItems(data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load architectures"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchArchitectures();
  }, [fetchArchitectures]);

  const handleOpenCreate = () => {
    setEditingId("");
    setForm(blankArchitecture);
    setActiveTab("general");
    setEditorOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      subtitle: item.subtitle || "",
      category: item.category || "Viper Protocol",
      badge: item.badge || "5 Pillars",
      icon: item.icon || "Zap",
      shortDescription: item.shortDescription || "",
      overview: item.overview || "",
      pillars: item.pillars?.length ? item.pillars : [{ name: "", ingredient: "", role: "" }],
      emergentOutcomes: item.emergentOutcomes?.length ? item.emergentOutcomes : [""],
      chapters: item.chapters?.length ? item.chapters : [{ number: 1, title: "", content: "" }],
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setActiveTab("general");
    setEditorOpen(true);
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editingId ? prev.slug : slugify(value),
    }));
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = !item.isActive;
      await API.put(`/architectures/${item._id}`, { isActive: updated });
      toast.success(`${item.title} is now ${updated ? "Active" : "Draft"}`);
      fetchArchitectures();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Architecture title is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Architecture slug is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        pillars: form.pillars.filter((p) => p.name.trim()),
        emergentOutcomes: form.emergentOutcomes.filter((o) => o.trim()),
        chapters: form.chapters
          .filter((c) => c.title.trim())
          .map((c, idx) => ({ ...c, number: idx + 1 })),
      };

      if (editingId) {
        await API.put(`/architectures/${editingId}`, payload);
        toast.success("Architecture updated successfully");
      } else {
        await API.post("/architectures", payload);
        toast.success("Architecture created successfully");
      }
      setEditorOpen(false);
      fetchArchitectures();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save architecture"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await API.delete(`/architectures/${deletingId}`);
      toast.success("Architecture deleted successfully");
      setEditingDeleteId("");
      fetchArchitectures();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete architecture"));
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      await API.post("/architectures/seed");
      toast.success("Default architectures re-seeded successfully!");
      fetchArchitectures();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to seed default architectures"));
    } finally {
      setSeeding(false);
    }
  };

  // Pillar Form Helpers
  const addPillar = () => {
    setForm((prev) => ({
      ...prev,
      pillars: [...prev.pillars, { name: "", ingredient: "", role: "" }],
    }));
  };

  const removePillar = (index) => {
    setForm((prev) => ({
      ...prev,
      pillars: prev.pillars.filter((_, idx) => idx !== index),
    }));
  };

  const updatePillar = (index, field, value) => {
    setForm((prev) => {
      const nextPillars = [...prev.pillars];
      nextPillars[index] = { ...nextPillars[index], [field]: value };
      return { ...prev, pillars: nextPillars };
    });
  };

  // Emergent Outcome Helpers
  const addOutcome = () => {
    setForm((prev) => ({
      ...prev,
      emergentOutcomes: [...prev.emergentOutcomes, ""],
    }));
  };

  const removeOutcome = (index) => {
    setForm((prev) => ({
      ...prev,
      emergentOutcomes: prev.emergentOutcomes.filter((_, idx) => idx !== index),
    }));
  };

  const updateOutcome = (index, value) => {
    setForm((prev) => {
      const nextOutcomes = [...prev.emergentOutcomes];
      nextOutcomes[index] = value;
      return { ...prev, emergentOutcomes: nextOutcomes };
    });
  };

  // Chapter Helpers
  const addChapter = () => {
    setForm((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        { number: prev.chapters.length + 1, title: "", content: "" },
      ],
    }));
  };

  const removeChapter = (index) => {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, idx) => idx !== index),
    }));
  };

  const updateChapter = (index, field, value) => {
    setForm((prev) => {
      const nextChapters = [...prev.chapters];
      nextChapters[index] = { ...nextChapters[index], [field]: value };
      return { ...prev, chapters: nextChapters };
    });
  };

  const moveChapter = (index, direction) => {
    setForm((prev) => {
      const nextChapters = [...prev.chapters];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= nextChapters.length) return prev;
      const temp = nextChapters[index];
      nextChapters[index] = nextChapters[targetIndex];
      nextChapters[targetIndex] = temp;
      return { ...prev, chapters: nextChapters };
    });
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.badge.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader
        title="Viper Protocol™ Architectures"
        description="Manage the 6 scientific performance architectures, pillars, chapters, and locked definitions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleSeedDefaults} loading={seeding}>
              <RefreshCw size={16} />
              Reset Defaults
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus size={16} />
              New Architecture
            </Button>
          </div>
        }
      />

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(event.target.value)}
              placeholder="Search architectures by name, category, or badge..."
              className="pl-9"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredItems.length} of {items.length} Architectures
          </span>
        </div>
      </Card>

      {/* Items Table / Cards */}
      {loading ? (
        <LoadingState label="Loading architectures..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No architectures found"
          description="Click 'New Architecture' or 'Reset Defaults' to populate the 6 Viper Protocol architectures."
          action={
            <Button onClick={handleSeedDefaults} loading={seeding}>
              Reset Default Architectures
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Zap;
            return (
              <Card key={item._id} className="relative flex flex-col justify-between p-5 border-slate-200">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center bg-slate-900 text-[#FFB800]">
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase text-[#FF5500]">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <Toggle
                      checked={item.isActive}
                      onChange={() => handleToggleActive(item)}
                      aria-label={`Toggle active state for ${item.title}`}
                    />
                  </div>

                  <h3 className="mt-3 text-lg font-black uppercase text-slate-900 tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">
                    {item.subtitle}
                  </p>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-3 font-medium">
                    {item.shortDescription || item.overview}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-3">
                    <span className="bg-slate-100 px-2 py-1 font-black text-slate-700">
                      {item.pillars?.length || 0} Pillars
                    </span>
                    <span className="bg-slate-100 px-2 py-1 font-black text-slate-700">
                      {item.chapters?.length || 0} Chapters
                    </span>
                    <span className="bg-[#FF5500]/10 text-[#FF5500] px-2 py-1 font-black">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <a
                    href={`https://legendbornnutrition.com/architectures/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-[#FF5500] transition flex items-center gap-1"
                  >
                    <BookOpen size={14} /> View Live Page
                  </a>

                  <div className="flex items-center gap-1">
                    <IconButton
                      icon={Pencil}
                      label="Edit Architecture"
                      onClick={() => handleOpenEdit(item)}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Delete Architecture"
                      variant="danger"
                      onClick={() => setEditingDeleteId(item._id)}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? `Edit ${form.title}` : "New Architecture"}
        size="2xl"
      >
        <div className="space-y-6">
          {/* Editor Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            {[
              { id: "general", label: "General Metadata" },
              { id: "pillars", label: `Pillars (${form.pillars.length})` },
              { id: "outcomes", label: `Outcomes (${form.emergentOutcomes.length})` },
              { id: "chapters", label: `Chapters (${form.chapters.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-[#FF5500] text-[#FF5500] bg-slate-50"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: GENERAL METADATA */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Architecture Title *">
                  <Input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. ATP Cellular Forge™"
                  />
                </Field>
                <Field label="URL Slug *">
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    placeholder="e.g. atp-cellular-forge"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Subtitle">
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Strength & Endurance Architecture"
                  />
                </Field>
                <Field label="Category">
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Bioenergetics & Power"
                  />
                </Field>
                <Field label="Badge Text">
                  <Input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. 5 Pillars • 19 Chapters"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Icon Style">
                  <Select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    options={ICON_OPTIONS}
                  />
                </Field>
                <Field label="Sort Order">
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label="Short Summary Description">
                <Textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  rows={2}
                  placeholder="Brief 2-sentence summary for architecture card..."
                />
              </Field>

              <Field label="Overview & Design Philosophy">
                <Textarea
                  value={form.overview}
                  onChange={(e) => setForm({ ...form, overview: e.target.value })}
                  rows={3}
                  placeholder="Detailed scientific overview..."
                />
              </Field>
            </div>
          )}

          {/* TAB 2: PILLARS */}
          {activeTab === "pillars" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Functional Pillars Configuration</p>
                <Button size="sm" onClick={addPillar}>
                  <Plus size={14} /> Add Pillar
                </Button>
              </div>

              {form.pillars.map((pillar, idx) => (
                <div key={idx} className="border border-slate-200 p-4 bg-slate-50 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#FF5500]">
                      Pillar {idx + 1}
                    </span>
                    {form.pillars.length > 1 && (
                      <IconButton
                        icon={Trash2}
                        label="Remove Pillar"
                        variant="danger"
                        size="sm"
                        onClick={() => removePillar(idx)}
                      />
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      value={pillar.name}
                      onChange={(e) => updatePillar(idx, "name", e.target.value)}
                      placeholder="Pillar Name (e.g. Intramuscular Buffering)"
                    />
                    <Input
                      value={pillar.ingredient}
                      onChange={(e) => updatePillar(idx, "ingredient", e.target.value)}
                      placeholder="Ingredient (e.g. Beta-Alanine)"
                    />
                    <Input
                      value={pillar.role}
                      onChange={(e) => updatePillar(idx, "role", e.target.value)}
                      placeholder="Role (e.g. Carnosine Synthesis)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: EMERGENT OUTCOMES */}
          {activeTab === "outcomes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Emergent Performance Outcomes</p>
                <Button size="sm" onClick={addOutcome}>
                  <Plus size={14} /> Add Outcome
                </Button>
              </div>

              <div className="space-y-2">
                {form.emergentOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                    <Input
                      value={outcome}
                      onChange={(e) => updateOutcome(idx, e.target.value)}
                      placeholder="e.g. High-Intensity Energy Availability"
                      className="flex-1"
                    />
                    {form.emergentOutcomes.length > 1 && (
                      <IconButton
                        icon={Trash2}
                        label="Remove Outcome"
                        variant="danger"
                        size="sm"
                        onClick={() => removeOutcome(idx)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHAPTERS */}
          {activeTab === "chapters" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Chapters Content Editor</p>
                  <p className="text-[11px] text-slate-400">
                    Include <code className="bg-slate-200 px-1 font-bold">🔒</code> anywhere in text to render as a Locked Scientific Definition badge.
                  </p>
                </div>
                <Button size="sm" onClick={addChapter}>
                  <Plus size={14} /> Add Chapter
                </Button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {form.chapters.map((chap, idx) => (
                  <div key={idx} className="border border-slate-200 p-4 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                        <Lock size={13} className="text-[#FF5500]" />
                        Chapter {idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <IconButton
                          icon={ChevronUp}
                          label="Move Up"
                          disabled={idx === 0}
                          onClick={() => moveChapter(idx, -1)}
                        />
                        <IconButton
                          icon={ChevronDown}
                          label="Move Down"
                          disabled={idx === form.chapters.length - 1}
                          onClick={() => moveChapter(idx, 1)}
                        />
                        {form.chapters.length > 1 && (
                          <IconButton
                            icon={Trash2}
                            label="Remove Chapter"
                            variant="danger"
                            size="sm"
                            onClick={() => removeChapter(idx)}
                          />
                        )}
                      </div>
                    </div>

                    <Input
                      value={chap.title}
                      onChange={(e) => updateChapter(idx, "title", e.target.value)}
                      placeholder="Chapter Title (e.g. Why ATP Cellular Forge™ Exists)"
                    />

                    <Textarea
                      value={chap.content}
                      onChange={(e) => updateChapter(idx, "content", e.target.value)}
                      rows={5}
                      placeholder="Chapter text content... (Supports linebreaks, lists with '-', and 🔒 definitions)"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Architecture
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onClose={() => setEditingDeleteId("")}
        onConfirm={handleDelete}
        title="Delete Architecture?"
        description="Are you sure you want to delete this architecture? This action cannot be undone."
      />
    </div>
  );
}
