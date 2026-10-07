import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon.jsx";

function BuyerCTA() {
  return (
    <section id="contact" className="scroll-mt-24 bg-ajs-mist px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl bg-ajs-navy p-6 text-white sm:p-9 lg:grid-cols-[1fr_0.9fr] lg:gap-12 lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Contact AJS
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
            Start a conversation about your supply requirements.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/75">
            Contact the AJS team to discuss fish commodity specifications and
            procurement requirements.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://wa.me/6285719123000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-[#09273b] transition-colors hover:bg-cyan-200"
            >
              WhatsApp AJS <ArrowIcon diagonal />
            </a>
            <a
              href="mailto:altisan.sinergi@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Email AJS <ArrowIcon diagonal />
            </a>
          </div>
        </div>
        <address className="not-italic lg:border-l lg:border-white/15 lg:pl-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            Office
          </p>
          <p className="mt-2 text-base font-semibold">MTH Square</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            WhatsApp
          </p>
          <a href="https://wa.me/6285719123000" target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-blue-100 hover:text-white">
            +62 857 1912 3000
          </a>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            Email
          </p>
          <a href="mailto:altisan.sinergi@gmail.com" className="mt-2 inline-block break-all text-sm text-blue-100 hover:text-white">
            altisan.sinergi@gmail.com
          </a>
          <Link to="/commodities" className="mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-white">
            Explore commodities <ArrowIcon />
          </Link>
        </address>
      </div>
    </section>
  );
}

export default BuyerCTA;
