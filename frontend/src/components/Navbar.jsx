import { useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowIcon from './ArrowIcon.jsx'
import Brand from './Brand.jsx'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="relative z-20 border-b border-slate-200/70 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Brand />

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          className="grid size-11 place-items-center rounded-xl border border-slate-200 text-[#102b45] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {menuOpen ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <nav
          id="primary-navigation"
          className={`${menuOpen ? 'absolute inset-x-0 top-full flex flex-col border-b border-slate-200 bg-white px-5 py-5 shadow-lg sm:px-8' : 'hidden'} md:static md:flex md:flex-row md:items-center md:gap-9 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="Main navigation"
        >
          <Link
            className="py-3 text-sm font-semibold text-[#0d7181] md:py-2"
            to="/#home"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            className="py-3 text-sm font-medium text-slate-600 transition-colors hover:text-[#0d7181] md:py-2"
            to="/commodities"
            onClick={closeMenu}
          >
            Commodities
          </Link>
          <Link
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#102b45] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#174b68] md:mt-0"
            to="/#buyer-cta"
            onClick={closeMenu}
          >
            Request Order <ArrowIcon diagonal />
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
