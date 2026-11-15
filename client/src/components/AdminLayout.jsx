
import { useEffect, useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  UsersRound,
  UserRound,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

import logo from '../assets/bookweave-logo.png'
import sidebarArt from '../assets/bookweave-sidebar-bg.png'
import { API_URL } from '../config/api'
import { clearAdminSession, getAdminToken, getStoredAdmin } from '../utils/adminAuth'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const token = getAdminToken()
  const admin = getStoredAdmin()

  useEffect(() => {
    if (!token) return

    const controller = new AbortController()

    fetch(`${API_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          clearAdminSession()
          navigate('/admin/login', { state: { from: location }, replace: true })
        }
      })
      .catch(() => {
        // Ignore transient network/abort errors; page-level requests handle connectivity feedback
      })

    return () => controller.abort()
  }, [token, navigate, location])

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Books', path: '/admin/books', icon: BookOpen },
    { label: 'Authors', path: '/admin/authors', icon: UsersRound },
  ]

  const handleLogout = () => {
    clearAdminSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream text-text">

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden border-r border-border bg-surface transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Sidebar Logo */}
        <div className="relative z-10 flex h-[76px] shrink-0 items-center border-b border-border bg-surface px-7">
          <img
            src={logo}
            alt="BookWeave"
            className="h-auto max-h-[48px] max-w-[190px] object-contain"
          />
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex-1 px-5 py-8">
          <p className="mb-5 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Workspace
          </p>

          <nav className="space-y-2">
            {navItems.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:bg-cream hover:text-primary'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Decorative Image */}
        <div className="pointer-events-none relative mt-auto h-[290px] shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${sidebarArt})`,
              backgroundPosition: 'center bottom',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/5 to-transparent" />
        </div>

        {/* Sidebar Footer */}
        <div className="relative z-10 border-t border-border bg-surface px-7 py-5">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} BookWeave
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-h-screen lg:pl-[280px]">

        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-border bg-surface px-5 sm:px-8">

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-text-muted hover:bg-cream lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-cream sm:px-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-primary">
                <UserRound size={20} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[150px] truncate text-sm font-semibold text-text">
                  {admin.name || 'Administrator'}
                </p>
                <p className="text-xs text-text-muted">Admin</p>
              </div>

              <ChevronDown
                size={17}
                className={`text-text-muted transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close profile menu"
                />

                <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">

                  <div className="border-b border-border px-4 py-4">
                    <p className="truncate text-sm font-semibold text-text">
                      {admin.name || 'Administrator'}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {admin.email || ''}
                    </p>
                  </div>

                  <div className="p-2">
                    <NavLink
                      to="/admin/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-muted transition hover:bg-cream hover:text-primary"
                    >
                      <UserRound size={17} />
                      Profile
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-76px)] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Close Button */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed right-4 top-4 z-[60] rounded-full bg-surface p-2 text-text shadow-md lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
