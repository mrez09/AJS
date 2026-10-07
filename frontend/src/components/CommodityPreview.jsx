import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon.jsx";
import CommodityImage from "./CommodityImage.jsx";
import { getCommodityFallbackImage } from "./commodityFallbackImage.js";
import { getProducts } from "../services/productService.js";

const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function CommodityPreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const result = await getProducts({ signal: controller.signal });
        setProducts(result);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadProducts();
    return () => controller.abort();
  }, [refreshKey]);

  const previewProducts = [...products]
    .sort((a, b) => Number(b.Status === "Available") - Number(a.Status === "Available"))
    .slice(0, 4);

  return (
    <section id="commodities" className="scroll-mt-24 bg-[#f3f7fa] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Core commodities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#102b45] sm:text-4xl">
              Explore the current catalog
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Product details and availability shown here come from the live AJS catalog.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
            to="/commodities"
          >
            View all commodities <ArrowIcon />
          </Link>
        </div>

        {loading && (
          <p className="mt-7 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600" role="status" aria-live="polite">
            Loading current commodities...
          </p>
        )}
        {!loading && error && (
          <div className="mt-7 rounded-xl border border-red-200 bg-white px-5 py-6 text-center" role="alert">
            <p className="text-sm font-semibold text-[#102b45]">We couldn’t load the current catalog.</p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="mt-4 rounded-lg bg-[#102b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174b68]"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <p className="mt-7 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600">
            No commodities are currently listed.
          </p>
        )}
        {!loading && !error && previewProducts.length > 0 && (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previewProducts.map((product) => {
              const available = product.Status === "Available";
              return (
                <article key={product.ID} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <CommodityImage
                    image={product.Image || getCommodityFallbackImage(product.Name)}
                    name={product.Name}
                    grade={product.Grade}
                    className="aspect-[4/3]"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-[#102b45]">
                      {product.Name || "Unnamed commodity"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {[product.Origin, product.Condition].filter(Boolean).join(" · ") || "Specifications available on request"}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <span className={`inline-flex items-center gap-2 text-xs font-semibold ${available ? "text-[#0d7181]" : "text-slate-500"}`}>
                        <span className={`size-1.5 rounded-full ${available ? "bg-[#29a99e]" : "bg-slate-400"}`} />
                        {product.Status || "Status unavailable"}
                      </span>
                      {available && Number.isFinite(Number(product.AvailableQuantity)) && (
                        <span className="text-xs font-medium text-slate-600">
                          {quantityFormatter.format(Number(product.AvailableQuantity))} KG
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/commodities/${encodeURIComponent(product.ID)}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0d7181] hover:text-[#102b45]"
                    >
                      View details <ArrowIcon diagonal />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CommodityPreview;
