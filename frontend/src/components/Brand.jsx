import { Link } from 'react-router-dom'
import ajsLogo from '../assets/ajs-logo.png'

function Brand({ showCompanyName = false }) {
  return (
    <Link
      className="group inline-flex min-w-0 items-center gap-2 text-white"
      to="/#home"
      aria-label="AJS home"
    >
      <img
        src={ajsLogo}
        alt="PT Altisan Jaya Sinergi logo"
        className={`object-contain ${showCompanyName ? 'size-9 shrink-0 sm:size-10' : 'h-10 w-40 sm:h-11 sm:w-44'}`}
      />
      {showCompanyName && (
        <span className="truncate text-xs font-semibold tracking-wide sm:text-sm">
          PT Altisan Jaya Sinergi
        </span>
      )}
    </Link>
  )
}

export default Brand
