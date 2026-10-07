import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CommodityImage from "../components/CommodityImage.jsx";
import Navbar from "../components/Navbar.jsx";
import { getProduct, updateProduct } from "../services/productService.js";

const maxImageSize = 5 * 1024 * 1024;
const initialForm = {
  name: "",
  origin: "",
  grade: "",
  condition: "",
  available_quantity: "",
  moq: "",
  description: "",
  status: "Available",
};

function EditCommodity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [product, setProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await getProduct(id, { signal: controller.signal });
        setProduct(result);
        setForm({
          name: result.Name || "",
          origin: result.Origin || "",
          grade: result.Grade || "",
          condition: result.Condition || "",
          available_quantity: String(result.AvailableQuantity ?? ""),
          moq: String(result.MOQ ?? ""),
          description: result.Description || "",
          status: result.Status || "Available",
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [id]);

  useEffect(() => () => {
    if (previewURL) URL.revokeObjectURL(previewURL);
  }, [previewURL]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleImageSelection(event) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    setError("");
    setSuccess("");
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(extension) || (selected.type && !["image/jpeg", "image/png"].includes(selected.type))) {
      setError("Choose a valid JPEG or PNG image.");
      return;
    }
    if (selected.size > maxImageSize) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setFile(selected);
    setPreviewURL(URL.createObjectURL(selected));
  }

  function clearImageSelection() {
    setFile(null);
    setPreviewURL("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const availableQuantity = Number(form.available_quantity);
    const moq = Number(form.moq);
    if (!form.name.trim()) return setError("Commodity name is required.");
    if (!Number.isFinite(availableQuantity) || availableQuantity < 0) return setError("Available stock must be a non-negative number.");
    if (!Number.isFinite(moq) || moq < 0) return setError("MOQ must be a non-negative number.");
    if (!["Available", "Unavailable"].includes(form.status)) return setError("Choose a valid availability status.");

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProduct(id, {
        name: form.name.trim(),
        origin: form.origin.trim(),
        grade: form.grade.trim(),
        condition: form.condition.trim(),
        availableQuantity,
        moq,
        description: form.description,
        status: form.status,
        imageFile: file,
      });
      setProduct(updated);
      setForm({
        name: updated.Name || "", origin: updated.Origin || "", grade: updated.Grade || "",
        condition: updated.Condition || "", available_quantity: String(updated.AvailableQuantity ?? ""),
        moq: String(updated.MOQ ?? ""), description: updated.Description || "", status: updated.Status || "Available",
      });
      clearImageSelection();
      setSuccess("Commodity updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-4xl">
          <Link to="/admin/commodities" className="text-sm font-semibold text-cyan-300 hover:text-white">← Back to commodities</Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">AJS Admin Portal</p>
          <h1 className="mt-2 text-3xl font-bold">Edit Commodity</h1>
          {loading && <p className="mt-6 text-slate-300" role="status">Loading commodity...</p>}
          {!loading && error && !product && <p className="mt-6 text-red-300" role="alert">{error}</p>}
          {!loading && product && (
            <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {[ ["name", "Commodity Name"], ["origin", "Origin"], ["grade", "Grade"], ["condition", "Condition"] ].map(([name, label]) => (
                  <label key={name} className="text-sm text-slate-300">{label}
                    <input name={name} value={form[name]} onChange={handleChange} required maxLength={160} className={inputClass} />
                  </label>
                ))}
                <label className="text-sm text-slate-300">Available Stock (KG)
                  <input name="available_quantity" type="number" min="0" step="any" required value={form.available_quantity} onChange={handleChange} className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">MOQ (KG)
                  <input name="moq" type="number" min="0" step="any" required value={form.moq} onChange={handleChange} className={inputClass} />
                </label>
                <label className="text-sm text-slate-300">Availability
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    <option value="Available">Available</option><option value="Unavailable">Unavailable</option>
                  </select>
                </label>
                <div>
                  <p className="text-sm text-slate-300">Image</p>
                  <CommodityImage image={previewURL || product.Image} name={form.name} grade={form.grade} className="mt-2 h-44 rounded-lg" />
                  <label htmlFor="edit-commodity-image" className="mt-4 block text-sm text-slate-300">Choose a replacement image</label>
                  <input id="edit-commodity-image" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={handleImageSelection} className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-[#173d5f] file:px-4 file:py-3 file:font-semibold file:text-white" />
                  <p className="mt-2 text-xs text-slate-500">JPEG or PNG, up to 5 MB. Leave empty to keep the current image.</p>
                  {file && <button type="button" onClick={clearImageSelection} className="mt-2 text-xs font-semibold text-cyan-300 hover:text-white">Use current image</button>}
                </div>
              </div>
              <label className="mt-5 block text-sm text-slate-300">Description
                <textarea name="description" rows="4" value={form.description} onChange={handleChange} className={inputClass} />
              </label>
              {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
              {success && <p className="mt-4 text-sm text-emerald-300" role="status">{success}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" onClick={() => navigate("/admin/commodities")} className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default EditCommodity;
