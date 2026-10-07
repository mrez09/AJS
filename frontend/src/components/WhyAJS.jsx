const reasons = [
  {
    title: "Reliable supply",
    description:
      "A procurement conversation starts with clear requirements and supply coordination.",
  },
  {
    title: "Flexible sourcing",
    description:
      "Product specifications and quantities can be discussed around business needs.",
  },
  {
    title: "Trusted partnership",
    description:
      "AJS positions its work around an ongoing relationship with business buyers.",
  },
];

function WhyAJS() {
  return (
    <section className="bg-ajs-navy py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Why AJS
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
            A supply partner for business requirements.
          </h2>
        </div>
        <div className="mt-8 grid gap-6 border-t border-white/15 pt-6 md:grid-cols-3 md:gap-8">
          {reasons.map((reason, index) => (
            <article key={reason.title} className="border-l border-cyan-400/60 pl-4">
              <p className="text-xs font-bold tracking-widest text-cyan-300">0{index + 1}</p>
              <h3 className="mt-3 text-base font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-blue-100/75">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyAJS;
