import { Link } from "react-router-dom";
import cakalangImage from "../assets/image/01 Cakalang.jpg";
import ArrowIcon from "./ArrowIcon.jsx";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ajs-deep text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_45%,rgba(19,102,132,0.35),transparent_42%),linear-gradient(110deg,#0b2238_0%,#0b2238_48%,#123a55_100%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-12 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            PT Altisan Jaya Sinergi · Established 2022
          </p>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-blue-100/80">
            Fish Commodity Trading &amp; Supply
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[56px]">
            Reliable Supply.
            <span className="block text-cyan-300">Flexible Sourcing.</span>
            Trusted Partnership.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7">
            A fish commodity trading and supply company connecting procurement
            requirements with product specifications and supply coordination.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/commodities"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09273b] transition-colors hover:bg-cyan-200"
            >
              Explore Commodities <ArrowIcon />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contact AJS <ArrowIcon diagonal />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-xs font-medium text-blue-100/75">
            <span>Muara Baru</span>
            <span aria-hidden="true" className="text-cyan-300">•</span>
            <span>Jakarta, Indonesia</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto">
          <div className="absolute -inset-4 rounded-[1.75rem] bg-cyan-400/10 blur-2xl" />
          <figure className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#16445a] shadow-2xl">
            <img
              src={cakalangImage}
              alt="Cakalang fish presented on ice"
              className="aspect-[1.16/1] w-full object-cover"
              fetchPriority="high"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071c2f]/90 via-[#071c2f]/35 to-transparent px-5 pb-5 pt-20 sm:px-7 sm:pb-7">
              <span className="text-xs font-semibold uppercase tracking-[0.17em] text-cyan-200">
                Fish commodity supply
              </span>
              <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
                Sourcing and supply, shaped around business requirements.
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export default Hero;
