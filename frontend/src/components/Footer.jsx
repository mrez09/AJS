import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f8fafb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <div>
          <Brand />
          <p className="mt-3 text-xs text-slate-500">
            Fishery commodity trading &amp; supply
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3">
          <Link className="text-sm font-medium text-slate-600 hover:text-[#0d7181]" to="/#home">
            Home
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-[#0d7181]" to="/commodities">
            Commodities
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-[#0d7181]" to="/#contact">
            Contact AJS
          </Link>
        </nav>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} PT Altisan Jaya Sinergi
        </p>
      </div>
    </footer>
  )
}

export default Footer
