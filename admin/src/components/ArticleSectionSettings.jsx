import { useEffect, useState } from "react";
import API, { assetUrl } from "../api/axios";
import { Button, Card, Field, Input } from "./ui";
import { useToast } from "../context/ToastContext";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { getErrorMessage } from "../utils/errors";
import { validateImageFiles } from "../utils/validation";

export default function ArticleSectionSettings() {
  const [banner, setBanner] = useState("");
  const [file, setFile] = useState(null);
  const [clearBanner, setClearBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const preview = useObjectUrl(file);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    API.get("/storefront-settings/articles")
      .then(({ data }) => { if (active) setBanner(data.data?.aboutLegendSlayerBanner || ""); })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError, "Banner settings could not be loaded.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const resetFile = () => { setFile(null); setInputKey((value) => value + 1); };
  const save = async () => {
    const validation = validateImageFiles(file ? [file] : [], { maxFiles: 1 });
    if (validation) return toast.error(validation);
    try {
      setSaving(true);
      const payload = new FormData();
      if (file) payload.append("banner", file);
      payload.append("clearBanner", String(clearBanner));
      const { data } = await API.put("/storefront-settings/articles", payload);
      setBanner(data.data?.aboutLegendSlayerBanner || "");
      resetFile();
      setClearBanner(false);
      toast.success("About Legend Slayer banner saved.");
    } catch (requestError) { toast.error(getErrorMessage(requestError, "Banner could not be saved.")); }
    finally { setSaving(false); }
  };

  return <Card className="space-y-4 p-5">
    <div>
      <h2 className="text-lg font-bold text-stone-950">About Legend Slayer: The Viper Protocol</h2>
      <p className="mt-1 text-sm text-stone-600">Add a banner above this section on the Articles page.</p>
    </div>
    {loading ? <p role="status" className="text-sm">Loading banner settings…</p> : error ? <p role="alert" className="text-sm text-red-700">{error}</p> : <>
      <Field label="Section banner image" hint="JPG, PNG or WEBP, up to 10 MB. Recommended width: 1920 px. The full image is displayed without cropping.">
        <Input key={inputKey} type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => {
          const selected = event.target.files?.[0] || null;
          const validation = validateImageFiles(selected ? [selected] : [], { maxFiles: 1 });
          if (validation) { toast.error(validation); event.target.value = ""; return; }
          setFile(selected);
        }} />
      </Field>
      {(preview || banner && !clearBanner) && <img src={preview || assetUrl(banner)} alt="About Legend Slayer banner preview" className="max-h-80 w-full rounded-lg border border-stone-200 object-contain" />}
      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving || !file && !clearBanner}>{saving ? "Saving…" : "Save section banner"}</Button>
        {file && <Button variant="secondary" disabled={saving} onClick={resetFile}>Discard replacement</Button>}
        {banner && <Button variant="secondary" disabled={saving} onClick={() => { resetFile(); setClearBanner((value) => !value); }}>{clearBanner ? "Undo removal" : "Remove banner"}</Button>}
      </div>
    </>}
  </Card>;
}
