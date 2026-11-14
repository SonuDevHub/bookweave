
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import logo from '../assets/bookweave-logo.png'

const navigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'Publishing Services', to: '/services' },
  { label: 'Our Books', to: '/books' },
  { label: 'About Us', to: '/about' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          aria-label="BookWeave home"
          className="flex shrink-0 items-center py-2"
        >
          <img
            src={logo}
            alt="BookWeave"
            className="h-auto w-36 object-contain sm:w-44"
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative inline-flex items-center py-5 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-primary transition-transform duration-300 ease-out ${
                      isActive
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <Link
          to="/contact"
          className="hidden items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover md:inline-flex"
        >
          Publish Your Book
          <ArrowUpRight size={16} />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-primary transition-colors hover:bg-cream md:hidden"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `relative rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cream text-primary'
                      : 'text-text-muted hover:bg-cream hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={`absolute bottom-1 left-3 h-[2px] rounded-full bg-primary transition-all duration-300 ${
                        isActive ? 'w-10' : 'w-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Publish Your Book
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
