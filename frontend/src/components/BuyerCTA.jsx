import ArrowIcon from './ArrowIcon.jsx'

function BuyerCTA() {
  return (
    <section id="buyer-cta" className="scroll-mt-8 px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#102b45] px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div className="absolute -right-16 -top-32 size-80 rounded-full border border-cyan-200/10" />
        <div className="absolute -right-4 -top-20 size-56 rounded-full border border-cyan-200/10" />
        <div className="absolute bottom-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#0d7181]/20 to-transparent" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              For business buyers
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
              Let’s build a dependable supply relationship.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/75">
              Tell us what your business needs. Our team can discuss
              specifications, availability, and the right next steps.
            </p>
          </div>
          <a
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-[#36c0c3] px-6 py-4 text-sm font-bold text-[#09273b] transition-colors hover:bg-cyan-200"
            href="#commodities"
          >
            Browse Commodities <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

export default BuyerCTA
