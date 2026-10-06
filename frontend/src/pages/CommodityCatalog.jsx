import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import { getProducts } from '../services/productService.js'

const quantityFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

function formatQuantity(quantity) {
  return `${quantityFormatter.format(quantity)} KG`
}

function ProductCard({ product }) {
  const isAvailable = product.Status?.toLowerCase() === 'available'

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_16px_40px_rgba(16,43,69,0.08)]"
      aria-labelledby={`product-${product.ID}-name`}
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-200">
        <div className="absolute -right-7 -top-12 size-36 rounded-full border border-white/50" />
        <div className="absolute -right-1 -top-6 size-24 rounded-full border border-white/50" />
        <div className="absolute -bottom-12 -left-7 size-36 rounded-full border border-white/50" />
        <span className="relative grid size-16 place-items-center rounded-2xl border border-white/70 bg-white/35 text-xl font-semibold tracking-wide text-[#16455d] shadow-sm backdrop-blur-sm">
          {product.Name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase()}
        </span>
        <span className="absolute left-4 top-4 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#174c62] backdrop-blur">
          {product.Grade}
        </span>
      </div>

      <div className="p-5">
        <h2
          id={`product-${product.ID}-name`}
          className="min-h-12 text-base font-semibold leading-6 text-[#102b45]"
        >
          {product.Name}
        </h2>
        <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Condition</dt>
            <dd className="font-semibold text-slate-700">{product.Condition}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Origin</dt>
            <dd className="font-semibold text-slate-700">{product.Origin}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Available quantity</dt>
            <dd className="font-semibold text-slate-700">
              {formatQuantity(product.AvailableQuantity)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">MOQ</dt>
            <dd className="font-semibold text-slate-700">
              {formatQuantity(product.MOQ)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold ${
              isAvailable ? 'text-[#0d7181]' : 'text-slate-500'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isAvailable ? 'bg-[#29a99e]' : 'bg-slate-400'
              }`}
            />
            {product.Status}
          </span>
          <Link
            to={`/commodities/${encodeURIComponent(product.ID)}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
          >
            View product details <ArrowIcon />
          </Link>
        </div>
      </div>
    </article>
  )
}

function CommodityCatalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const results = await getProducts({ signal: controller.signal })
        setProducts(results)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [])

  return (
    <div id="home" className="min-h-screen overflow-hidden bg-white text-[#102b45]">
      <Navbar />
      <main>
        <section id="commodities" className="scroll-mt-8 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
                AJS product catalog
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#102b45] sm:text-4xl">
                Explore our commodities
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Browse available fishery products, specifications, and supply
                quantities. Contact our team to confirm current availability.
              </p>
            </div>

            {loading && (
              <p
                className="rounded-2xl border border-slate-200 bg-[#f8fafb] px-6 py-10 text-center text-sm font-medium text-slate-600"
                role="status"
                aria-live="polite"
              >
                Loading products...
              </p>
            )}

            {!loading && error && (
              <div
                className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center"
                role="alert"
              >
                <h2 className="text-base font-semibold text-[#102b45]">
                  We couldn’t load the product catalog.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Make sure the product API is running, then refresh this page.
                </p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-[#f8fafb] px-6 py-10 text-center text-sm text-slate-600">
                No products are currently available.
              </p>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.ID} product={product} />
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
                to="/#buyer-cta"
              >
                Discuss your requirements <ArrowIcon diagonal />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default CommodityCatalog
