import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommodityImage from "../components/CommodityImage.jsx";
import { getCommodityFallbackImage } from "../components/commodityFallbackImage.js";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/useAuth";
import { getProducts } from "../services/productService.js";

const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatQuantity(quantity) {
  const value = Number(quantity);
  return Number.isFinite(value) ? `${quantityFormatter.format(value)} KG` : "—";
}

function ProductCard({ product }) {
  const isAvailable = product.Status === "Available";
  const availabilityLabel =
    product.Status === "Available" || product.Status === "Unavailable"
      ? product.Status
      : "Status unavailable";

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby={`product-${product.ID}-name`}
    >
      <CommodityImage
        image={product.Image || getCommodityFallbackImage(product.Name)}
        name={product.Name}
        grade={product.Grade || "Grade not specified"}
        className="h-36"
      />

      <div className="flex flex-1 flex-col p-5">
          <h2
          id={`product-${product.ID}-name`}
          className="min-h-12 text-base font-semibold leading-6 text-[#102b45]"
        >
          {product.Name || "Unnamed commodity"}
        </h2>

        <dl className="mt-4 flex-1 space-y-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Condition</dt>
            <dd className="text-right font-semibold text-slate-700">
              {product.Condition || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Origin</dt>
            <dd className="text-right font-semibold text-slate-700">
              {product.Origin || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">
              {isAvailable ? "Available quantity" : "Stock on record"}
            </dt>
            <dd className="text-right font-semibold text-slate-700">
              {formatQuantity(product.AvailableQuantity)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">MOQ</dt>
            <dd className="text-right font-semibold text-slate-700">
              {formatQuantity(product.MOQ)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold ${
              isAvailable ? "text-[#0d7181]" : "text-slate-500"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isAvailable ? "bg-[#29a99e]" : "bg-slate-400"
              }`}
            />
            {availabilityLabel}
          </span>
          <Link
            to={`/commodities/${encodeURIComponent(product.ID)}`}
            className="inline-flex items-center rounded-lg bg-[#102b45] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#174b68]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function BuyerDashboard() {
  const { user } = useAuth();
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
        const results = await getProducts({ signal: controller.signal });
        setProducts(results);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [refreshKey]);

  const availableProducts = products.filter(
    (product) => product.Status === "Available",
  ).length;
  const unavailableProducts = products.filter(
    (product) => product.Status === "Unavailable",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-[#102b45]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <section className="rounded-3xl bg-[#102b45] px-6 py-8 text-white sm:px-10 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            AJS Buyer Portal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Welcome, {user?.name || "Buyer"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80">
            Source quality seafood commodities with the supply details your
            procurement team needs. Review current availability and product
            specifications below.
          </p>
        </section>

        <section
          className="mt-10 sm:mt-12"
          aria-labelledby="commodities-heading"
        >
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
                Sourcing opportunities
              </p>
        <h2
                id="commodities-heading"
                className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#102b45]"
              >
                All Commodities
              </h2>
              {!loading && !error && products.length > 0 && (
                <p className="mt-2 text-sm text-slate-600">
                  {availableProducts} available · {unavailableProducts} unavailable
                </p>
              )}
            </div>

            <Link
              to="/commodities"
              className="text-sm font-semibold text-[#0d7181] hover:text-[#102b45]"
            >
              Browse full catalog
            </Link>
          </div>

          {loading && (
            <p
              className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm font-medium text-slate-600"
              role="status"
              aria-live="polite"
            >
              Loading commodities...
            </p>
          )}

          {!loading && error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center"
              role="alert"
            >
              <h3 className="text-base font-semibold text-[#102b45]">
                We couldn’t load the commodities.
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
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
            <p className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
              No commodities are currently listed. Please check back later.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.ID} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default BuyerDashboard;
