import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import { getProduct } from '../services/productService.js'

const quantityFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

function formatQuantity(quantity) {
  return `${quantityFormatter.format(quantity)} KG`
}

function ProductImage({ product }) {
  const initials = product.Name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-slate-200 sm:min-h-96">
      <div className="absolute -right-12 -top-16 size-64 rounded-full border border-white/60" />
      <div className="absolute -right-2 -top-8 size-44 rounded-full border border-white/60" />
      <div className="absolute -bottom-24 -left-12 size-64 rounded-full border border-white/60" />
      <span className="relative grid size-28 place-items-center rounded-3xl border border-white/70 bg-white/40 text-3xl font-semibold tracking-wide text-[#16455d] shadow-sm backdrop-blur-sm sm:size-36 sm:text-4xl">
        {initials}
      </span>
      {product.Image && (
        <img
          src={product.Image}
          alt={product.Name}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#174c62] backdrop-blur">
        {product.Grade}
      </span>
    </div>
  )
}

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProduct() {
      setLoading(true)
      setProduct(null)
      setError(null)

      try {
        const result = await getProduct(id, { signal: controller.signal })
        setProduct(result)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => controller.abort()
  }, [id])

  const isAvailable = product?.Status?.toLowerCase() === 'available'

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#102b45]">
      <Navbar />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
            to="/commodities"
          >
            <span className="rotate-180">
              <ArrowIcon />
            </span>
            Back to Commodities
          </Link>

          {loading && (
            <p
              className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafb] px-6 py-12 text-center text-sm font-medium text-slate-600"
              role="status"
              aria-live="polite"
            >
              Loading product details...
            </p>
          )}

          {!loading && error?.status === 404 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafb] px-6 py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
                Product not found
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-[#102b45]">
                This commodity isn’t available.
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                The product may have been removed or the link may be incorrect.
              </p>
              <Link
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#102b45] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#174b68]"
                to="/commodities"
              >
                Browse commodities
              </Link>
            </section>
          )}

          {!loading && error && error.status !== 404 && (
            <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
              <h1 className="text-xl font-semibold text-[#102b45]">
                We couldn’t load this product.
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {error.message}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Make sure the product API is running, then try again.
              </p>
            </section>
          )}

          {!loading && !error && product && (
            <article className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <ProductImage product={product} />

              <div className="flex flex-col">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
                  AJS commodity details
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#102b45] sm:text-4xl">
                  {product.Name}
                </h1>
                <span
                  className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {product.Status || 'Status unavailable'}
                </span>

                <div className="mt-7">
                  <h2 className="text-sm font-semibold text-[#102b45]">
                    Description
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {product.Description || 'No description is available for this product.'}
                  </p>
                </div>

                <dl className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
                  <div className="bg-white p-4">
                    <dt className="text-xs text-slate-500">Grade</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#102b45]">
                      {product.Grade || '—'}
                    </dd>
                  </div>
                  <div className="bg-white p-4">
                    <dt className="text-xs text-slate-500">Condition</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#102b45]">
                      {product.Condition || '—'}
                    </dd>
                  </div>
                  <div className="bg-white p-4">
                    <dt className="text-xs text-slate-500">Origin</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#102b45]">
                      {product.Origin || '—'}
                    </dd>
                  </div>
                  <div className="bg-white p-4">
                    <dt className="text-xs text-slate-500">Available quantity</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#102b45]">
                      {formatQuantity(product.AvailableQuantity)}
                    </dd>
                  </div>
                  <div className="bg-white p-4 sm:col-span-2">
                    <dt className="text-xs text-slate-500">Minimum order quantity (MOQ)</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#102b45]">
                      {formatQuantity(product.MOQ)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-7 rounded-2xl bg-[#f8fafb] p-5">
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#102b45] px-5 py-3.5 text-sm font-semibold text-white opacity-75 sm:w-auto"
                    aria-describedby="order-coming-soon"
                  >
                    Request Order <ArrowIcon diagonal />
                  </button>
                  <p id="order-coming-soon" className="mt-3 text-xs leading-5 text-slate-500">
                    Ordering is coming in the next step. Contact our team to
                    discuss this product in the meantime.
                  </p>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProductDetail
