const handlingStages = [
  "Sourcing",
  "Procurement",
  "Inspection, sorting & weighing",
  "Storage",
  "Distribution & supply",
];

function SourcingAndTraction() {
  return (
    <>
      <section id="sourcing" className="scroll-mt-24 bg-[#f3f7fa] py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Sourcing &amp; cold-chain
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102b45] sm:text-4xl">
              A considered flow from procurement to distribution.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
              AJS describes these handling activities as part of its fish
              commodity work. Specific facility arrangements, source coverage,
              and operating capacity are not stated here as fixed claims.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {handlingStages.map((stage, index) => (
              <li key={stage} className="flex items-start gap-4 bg-white p-5">
                <span className="text-xs font-bold tracking-widest text-[#0d7181]">
                  0{index + 1}
                </span>
                <span className="text-sm font-semibold leading-6 text-[#102b45]">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16" aria-labelledby="traction-heading">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Business traction
            </p>
            <h2 id="traction-heading" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102b45] sm:text-4xl">
              Selected transaction activity, with context.
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#f8fafb] p-5 sm:p-6">
            <p className="text-sm font-semibold text-[#102b45]">
              Each published transaction snapshot should carry its reporting period and measurement unit.
            </p>
            <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Reporting period</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-700">Shown with each figure</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Measurement unit</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-700">Shown with each figure</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Selected transaction figures describe selected activity and do
              not represent annual revenue.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default SourcingAndTraction;
