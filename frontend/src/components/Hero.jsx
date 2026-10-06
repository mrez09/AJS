import ArrowIcon from './ArrowIcon.jsx'

function Hero() {
  return (
    <section className="relative isolate bg-[#0b2238] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_48%,rgba(23,115,137,0.32),transparent_38%),linear-gradient(115deg,#0b2238_0%,#0b2238_52%,#103a52_100%)]" />
      <div className="mx-auto grid min-h-[610px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-24">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-cyan-100">
            <span className="size-1.5 rounded-full bg-cyan-300" />
            Indonesian fishery commodity supply
          </div>
          <h1 className="max-w-[680px] text-4xl font-semibold leading-[1.12] tracking-[-0.04em] sm:text-5xl lg:text-[64px]">
            A trusted partner in{' '}
            <span className="text-cyan-300">fish commodity</span> trading and
            supply.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-blue-100/75 sm:text-lg sm:leading-8">
            PT Altisan Jaya Sinergi connects fishery commodity sources with
            domestic and international market demand — built for buyers who
            need dependable B2B supply.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#36c0c3] px-6 py-4 text-sm font-bold text-[#09273b] shadow-[0_12px_30px_rgba(25,188,192,0.16)] transition-colors hover:bg-cyan-200"
              href="#buyer-cta"
            >
              Request Order <ArrowIcon />
            </a>
            <a
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              href="#commodities"
            >
              Browse Commodities <ArrowIcon />
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium tracking-wide text-blue-100/70">
            <span className="inline-flex items-center gap-2">
              <svg className="size-4 text-cyan-300" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Buyer-focused procurement
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="size-4 text-cyan-300" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2.5 3.5 5v4.3c0 4.3 2.7 7.3 6.5 8.7 3.8-1.4 6.5-4.4 6.5-8.7V5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Quality-led sourcing
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
          <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/10 blur-2xl" />
          <div className="relative aspect-[1.04/1] overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#16445a] shadow-2xl">
            <img
              className="absolute inset-0 size-full object-cover opacity-75"
              src="https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh fish prepared for wholesale supply"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071c2f]/90 via-[#0b2238]/10 to-[#0b2238]/15" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0b2238]/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:left-7 sm:top-7">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              Supply built on trust
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="max-w-[330px] text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                From quality source to market-ready supply.
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-white/20 pt-4 text-xs font-medium text-white/75">
                <span className="grid size-8 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                  <svg className="size-4" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3 10h14M10 3a11 11 0 0 1 0 14M10 3a11 11 0 0 0 0 14" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
                Domestic &amp; international buyer network
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-2 rounded-xl border border-white/10 bg-white px-4 py-3 text-[#102b45] shadow-xl sm:-left-7 sm:px-5 sm:py-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Our focus
            </div>
            <div className="mt-1 text-sm font-semibold">Long-term supply partnerships</div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
    </section>
  )
}

export default Hero
