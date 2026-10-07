function CompanyOverview() {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
            Who we are
          </p>
          <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102b45] sm:text-4xl">
            AJS brings a trading background to fish commodity supply.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
          <p>
            PT Altisan Jaya Sinergi is a fish commodity trading and supply
            company established in 2022. The company began in construction and
            later developed its business into fish commodity trading and
            supply.
          </p>
          <p>
            Based around Muara Baru, Jakarta, AJS works with the product
            specifications and procurement requirements relevant to each
            business conversation.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-slate-200 px-5 pt-8 sm:px-8 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
              Company journey
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#102b45]">2022—</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            <li className="border-l-2 border-cyan-500 pl-4">
              <p className="text-sm font-semibold text-[#102b45]">Established</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                PT Altisan Jaya Sinergi was founded in 2022.
              </p>
            </li>
            <li className="border-l-2 border-slate-300 pl-4">
              <p className="text-sm font-semibold text-[#102b45]">Early business</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The company began with construction activities.
              </p>
            </li>
            <li className="border-l-2 border-slate-300 pl-4">
              <p className="text-sm font-semibold text-[#102b45]">Business development</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                AJS expanded into fish commodity trading and supply.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default CompanyOverview;
