const activities = [
  "Sourcing",
  "Procurement",
  "Inspection",
  "Sorting & weighing",
  "Storage",
  "Distribution & supply",
];

function Capabilities() {
  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="what-we-do-heading">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7181]">
            What we do
          </p>
          <h2 id="what-we-do-heading" className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102b45] sm:text-4xl">
            Fish commodity trading and supply.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            The company profile describes activities across sourcing,
            procurement, product handling, storage, and distribution.
          </p>
        </div>
        <ol className="grid gap-x-8 sm:grid-cols-2">
          {activities.map((activity, index) => (
            <li key={activity} className="flex items-center gap-4 border-t border-slate-200 py-4">
              <span className="text-xs font-bold tracking-widest text-[#0d7181]">0{index + 1}</span>
              <span className="text-sm font-semibold text-[#102b45]">{activity}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Capabilities;
