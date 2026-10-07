import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommodityImage from "../components/CommodityImage.jsx";
import Navbar from "../components/Navbar";
import {
  createProduct,
  getProducts,
  updateProductAvailability,
} from "../services/productService";

const maxImageSize = 5 * 1024 * 1024;

function isSupportedImage(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const supportedByExtension = ["jpg", "jpeg", "png"].includes(extension);
  const supportedByType = ["image/jpeg", "image/png"].includes(file.type);
  return supportedByExtension && (!file.type || supportedByType);
}

function AdminCommodities() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createProductError, setCreateProductError] = useState("");
  const [createProductSuccess, setCreateProductSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewURL, setImagePreviewURL] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreviewURL) {
        URL.revokeObjectURL(imagePreviewURL);
      }
    };
  }, [imagePreviewURL]);

  function handleImageSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setCreateProductError("");
    setCreateProductSuccess("");

    if (!file) return;
    if (!isSupportedImage(file)) {
      setSelectedImage(null);
      setImagePreviewURL("");
      setCreateProductError("Choose a valid JPEG or PNG image.");
      return;
    }
    if (file.size > maxImageSize) {
      setSelectedImage(null);
      setImagePreviewURL("");
      setCreateProductError("Image must be 5 MB or smaller.");
      return;
    }

    setSelectedImage(file);
    setImagePreviewURL(URL.createObjectURL(file));
  }

  function clearSelectedImage() {
    setSelectedImage(null);
    setImagePreviewURL("");
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setProductsError(error.message);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  async function handleUpdateProduct(event, productId) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const availableQuantity = Number(formData.get("available_quantity"));
    const status = formData.get("status");

    if (!Number.isFinite(availableQuantity) || availableQuantity < 0) {
      setProductsError("Available stock cannot be negative.");
      return;
    }

    try {
      setProductsError("");
      setUpdatingProductId(productId);

      await updateProductAvailability(productId, availableQuantity, status);

      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setProductsError(error.message);
    } finally {
      setUpdatingProductId(null);
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const availableQuantity = Number(formData.get("available_quantity"));
    const moq = Number(formData.get("moq"));

    if (!Number.isFinite(availableQuantity) || availableQuantity < 0) {
      setCreateProductError("Available stock cannot be negative.");
      setCreateProductSuccess("");
      return;
    }

    if (!Number.isFinite(moq) || moq < 0) {
      setCreateProductError("MOQ cannot be negative.");
      setCreateProductSuccess("");
      return;
    }

    try {
      setCreatingProduct(true);
      setCreateProductError("");
      setCreateProductSuccess("");

      await createProduct({
        name: formData.get("name"),
        origin: formData.get("origin"),
        grade: formData.get("grade"),
        condition: formData.get("condition"),
        availableQuantity,
        moq,
        description: formData.get("description"),
        image: formData.get("image"),
        imageFile: selectedImage,
        status: formData.get("status"),
      });

      form.reset();
      clearSelectedImage();
      setCreateProductSuccess("Commodity created successfully.");
      try {
        const data = await getProducts();
        setProducts(data);
        setProductsError("");
      } catch (refreshError) {
        setProductsError(refreshError.message);
      }
    } catch (error) {
      setCreateProductError(error.message);
    } finally {
      setCreatingProduct(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            AJS Admin Portal
          </p>
          <h1 className="text-3xl font-bold">Commodity Management</h1>

          <section id="add-commodity" className="mt-8 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white">Add Commodity</h2>
            <p className="mt-2 text-slate-400">
              Add a new commodity to the AJS catalog.
            </p>

            <form
              onSubmit={handleCreateProduct}
              className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-400">
                    Commodity Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Sardines"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Origin</label>
                  <input
                    name="origin"
                    type="text"
                    required
                    placeholder="e.g. Indonesia"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Grade</label>
                  <input
                    name="grade"
                    type="text"
                    required
                    placeholder="e.g. Premium"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Condition</label>
                  <input
                    name="condition"
                    type="text"
                    required
                    placeholder="e.g. Frozen"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">
                    Available Stock (KG)
                  </label>
                  <input
                    name="available_quantity"
                    type="number"
                    min="0"
                    required
                    placeholder="500"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">MOQ (KG)</label>
                  <input
                    name="moq"
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label htmlFor="commodity-image-file" className="text-sm text-slate-400">
                    Upload Image
                  </label>
                  <input
                    id="commodity-image-file"
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    onChange={handleImageSelection}
                    className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-[#173d5f] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-[#20577d]"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    JPEG or PNG, up to 5 MB.
                  </p>
                  {selectedImage && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
                      <CommodityImage
                        image={imagePreviewURL}
                        name={selectedImage.name}
                        className="h-16 w-20 shrink-0 rounded-md"
                        fallbackClassName="size-8 rounded-lg text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {selectedImage.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="shrink-0 text-xs font-semibold text-cyan-300 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="commodity-image" className="text-sm text-slate-400">
                    Image Path or URL
                  </label>
                  <input
                    id="commodity-image"
                    name="image"
                    type="text"
                    placeholder="/images/sardines.jpg"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Kept for existing path or URL images; an uploaded file takes precedence.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Availability</label>
                  <select
                    name="status"
                    defaultValue="Available"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-400">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the commodity..."
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {createProductError && (
                <p className="mt-4 text-sm text-red-400">
                  {createProductError}
                </p>
              )}
              {createProductSuccess && (
                <p className="mt-4 text-sm text-emerald-400">
                  {createProductSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={creatingProduct}
                className="mt-6 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingProduct ? "Creating..." : "Create Commodity"}
              </button>
            </form>
          </section>

          <section id="inventory" className="mt-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white">
              Stock &amp; Availability
            </h2>
            <p className="mt-2 text-slate-400">
              Update commodity stock and availability.
            </p>

            {productsLoading && (
              <p className="mt-6 text-slate-400">Loading commodities...</p>
            )}
            {productsError && (
              <p className="mt-6 text-red-400">{productsError}</p>
            )}
            {!productsLoading && !productsError && products.length === 0 && (
              <p className="mt-6 text-slate-400">No commodities found.</p>
            )}
            {!productsLoading && !productsError && products.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <form
                    key={product.ID}
                    onSubmit={(event) =>
                      handleUpdateProduct(event, product.ID)
                    }
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {product.Name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {product.Grade} · {product.Condition}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-400">
                        {product.Status}
                      </span>
                    </div>

                    <Link
                      to={`/admin/commodities/${encodeURIComponent(product.ID)}/edit`}
                      className="mt-4 inline-flex rounded-lg border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-950"
                    >
                      Edit commodity
                    </Link>

                    <div className="mt-5">
                      <label
                        htmlFor={`stock-${product.ID}`}
                        className="text-sm text-slate-400"
                      >
                        Available Stock (KG)
                      </label>
                      <input
                        id={`stock-${product.ID}`}
                        name="available_quantity"
                        type="number"
                        min="0"
                        defaultValue={product.AvailableQuantity}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`status-${product.ID}`}
                        className="text-sm text-slate-400"
                      >
                        Availability
                      </label>
                      <select
                        id={`status-${product.ID}`}
                        name="status"
                        defaultValue={product.Status}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      >
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingProductId === product.ID}
                      className="mt-5 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingProductId === product.ID
                        ? "Updating..."
                        : "Update Stock"}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminCommodities;
