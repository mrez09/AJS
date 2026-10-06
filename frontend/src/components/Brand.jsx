import { Link } from 'react-router-dom'

function Brand({ light = false }) {
  return (
    <Link
      className={`group inline-flex items-center gap-3 ${light ? 'text-white' : 'text-[#102b45]'}`}
      to="/#home"
      aria-label="AJS home"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[#0d7181] text-sm font-black tracking-tight text-white shadow-sm transition-transform group-hover:-translate-y-0.5">
        AJS
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-[0.12em]">ALTISAN JAYA</span>
        <span className={`mt-1 text-[10px] font-semibold tracking-[0.22em] ${light ? 'text-blue-100/70' : 'text-slate-500'}`}>
          SINERGI
        </span>
      </span>
    </Link>
  )
}

export default Brand
