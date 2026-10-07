import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "./Brand.jsx";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const sectionId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  const publicLinks = [
    { label: "Home", to: "/" },
    { label: "About AJS", to: "/#about" },
    { label: "Commodities", to: "/commodities" },
    { label: "Sourcing", to: "/#sourcing" },
    { label: "Contact", to: "/#contact" },
    { label: "Login", to: "/login" },
  ];
  const buyerLinks = [
    { label: "Dashboard", to: "/buyer" },
    { label: "Commodities", to: "/commodities" },
    { label: "Cart", to: "/cart" },
    { label: "My Requests", to: "/buyer/orders" },
  ];
  const adminLinks = [
    { label: "Dashboard", to: "/admin" },
    { label: "Commodities", to: "/admin/commodities" },
    { label: "Order Requests", to: "/admin/requests" },
  ];

  const links = !isAuthenticated
    ? publicLinks
    : user?.role === "admin"
      ? adminLinks
      : user?.role === "buyer"
        ? buyerLinks
        : [
            { label: "Home", to: "/" },
            { label: "Commodities", to: "/commodities" },
          ];

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#102b45] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Brand showCompanyName />

        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          className="grid size-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:border-cyan-300 hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:hidden"
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
          className={`${menuOpen ? "absolute inset-x-0 top-full flex flex-col border-b border-white/10 bg-[#102b45] px-5 py-5 shadow-lg sm:px-8" : "hidden"} md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="Main navigation"
        >
          {links.map(({ label, to }) => (
            <Link
              key={label}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:py-2"
              to={to}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              className="mt-2 rounded-lg border border-cyan-300/60 px-4 py-3 text-left text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-300 hover:text-[#102b45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:mt-0 md:ml-2 md:text-center"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
