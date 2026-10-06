import { commodities } from '../data/homepage.jsx'
import { Link } from 'react-router-dom'
import ArrowIcon from './ArrowIcon.jsx'

function CommodityPreview() {
  return (
    <section id="commodities" className="scroll-mt-8 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Commodity preview
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#102b45] sm:text-4xl">
              Explore our current range
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              A starting point for your sourcing conversation. Availability
              and specifications can be confirmed with our team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
              href="#buyer-cta"
            >
              Discuss your requirements <ArrowIcon diagonal />
            </a>
            <Link
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0d7181] transition-colors hover:text-[#102b45]"
              to="/commodities"
            >
              View All Commodities <ArrowIcon />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {commodities.map((commodity) => (
            <article
              key={commodity.name}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_16px_40px_rgba(16,43,69,0.08)]"
            >
              <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${commodity.tone}`}>
                <div className="absolute -right-7 -top-12 size-36 rounded-full border border-white/50" />
                <div className="absolute -right-1 -top-6 size-24 rounded-full border border-white/50" />
                <div className="absolute -bottom-12 -left-7 size-36 rounded-full border border-white/50" />
                <span className="relative grid size-16 place-items-center rounded-2xl border border-white/70 bg-white/35 text-xl font-semibold tracking-wide text-[#16455d] shadow-sm backdrop-blur-sm">
                  {commodity.initials}
                </span>
                <span className="absolute left-4 top-4 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#174c62] backdrop-blur">
                  {commodity.grade}
                </span>
              </div>
              <div className="p-5">
                <h3 className="min-h-12 text-base font-semibold leading-6 text-[#102b45]">
                  {commodity.name}
                </h3>
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Condition</span>
                    <span className="font-semibold text-slate-700">{commodity.condition}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Origin</span>
                    <span className="font-semibold text-slate-700">{commodity.origin}</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-[#0d7181]">
                  <span className="size-1.5 rounded-full bg-[#29a99e]" />
                  {commodity.availability}
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Product availability may change. Contact us to confirm current
          supply and order requirements.
        </p>
      </div>
    </section>
  )
}

export default CommodityPreview
