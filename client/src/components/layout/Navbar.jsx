import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, MessageCircle, X } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../../config/site'
import Logo from '../common/Logo'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/collections' },
  { label: 'Contact', to: '/contact-us' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-[0.95rem] font-semibold transition-colors ${
      isActive ? 'bg-butter text-ink' : 'text-muted hover:text-ink'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className="clay clay-paper mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pr-2 pl-4 sm:pl-5"
      >
        <Link to="/" aria-label={`${siteConfig.name} home`} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Phone par WhatsApp neeche wali bar mein hai. */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="btn clay clay-sage clay-press hidden min-h-11 px-4 text-sm md:inline-flex"
          >
            <MessageCircle size={18} strokeWidth={2.3} /> WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="clay clay-butter clay-press inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="clay clay-butter mx-auto mt-3 max-w-6xl rounded-[30px] p-6 md:hidden">
          <ul className="flex flex-col">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block py-2.5 font-display text-3xl font-semibold ${isActive ? 'text-terracotta' : 'text-ink'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar
