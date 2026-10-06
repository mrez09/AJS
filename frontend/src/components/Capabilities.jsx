import { capabilities } from '../data/homepage.jsx'

function Capabilities() {
  return (
    <section className="bg-[#f5f8fa] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              How we support buyers
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102b45] sm:text-4xl">
              A supply partner, not just a point of purchase.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              We help businesses source fishery commodities with
              specification, consistency, and a direct line to our team.
            </p>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <article
                key={capability.number}
                className="border-t border-slate-200 py-6 sm:py-7"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-white text-[#0d7181] shadow-sm ring-1 ring-slate-200/80">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {capability.icon}
                    </svg>
                  </span>
                  <span className="pt-1 text-xs font-semibold tracking-widest text-slate-400">
                    {capability.number}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#102b45]">
                  {capability.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Capabilities
