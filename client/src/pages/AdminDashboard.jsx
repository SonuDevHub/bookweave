
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Leaf,
  Hourglass,
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  LoaderCircle,
  RefreshCw,
  Mail,
  Library,
  Eye,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getAdminBooks } from '../services/bookService'
import { API_URL, parseJsonSafe } from '../config/api'

const STATUS_LABELS = {
  new: 'New',
  'in-progress': 'In Progress',
  contacted: 'Contacted',
  closed: 'Closed',
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

function StatusBadge({ status }) {
  const styles = {
    new: 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-amber-50 text-amber-700',
    contacted: 'bg-primary/10 text-primary',
    closed: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || 'bg-background text-text-muted'
      }`}
    >
      {STATUS_LABELS[status] || 'Unknown'}
    </span>
  )
}

function PageHeading({ admin, onRefresh, loading }) {
  const name = admin?.name || admin?.fullName || 'Admin'

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold tracking-[0.2em] text-primary">
          OVERVIEW
        </p>

        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {name}
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Here's what's happening with your publishing business.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-background disabled:opacity-50 sm:self-auto"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, description }) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:shadow-sm sm:p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon size={20} />
      </span>

      <div className="min-w-0">
        <p className="text-xl font-semibold leading-tight tabular-nums">
          {value}
        </p>

        <p className="mt-1 truncate text-xs font-medium text-text-secondary sm:text-sm">
          {label}
        </p>

        {description && (
          <p className="mt-0.5 text-[11px] text-text-muted">
            {description}
          </p>
        )}
      </div>
    </article>
  )
}

function SectionHeading({ title, subtitle, to, linkText }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border p-4">
      <div>
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
        )}
      </div>

      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:opacity-75"
      >
        {linkText}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}

function RecentEnquiries({ items }) {
  if (!items.length) {
    return (
      <div className="px-4 py-12 text-center">
        <Mail size={30} className="mx-auto mb-3 text-text-muted" />
        <p className="text-sm font-medium">No enquiries yet</p>
        <p className="mt-1 text-xs text-text-muted">
          New author submissions will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-cream">
            <tr className="text-xs">
              {['Author', 'Book Title', 'Email', 'Status', 'Date'].map((heading) => (
                <th key={heading} className="px-3 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item._id} className="transition hover:bg-primary/5">
                <td className="px-3 py-4 text-sm font-medium">
                  {item.authorName || 'Unnamed author'}
                </td>

                <td className="px-3 py-4 text-sm">
                  {item.bookTitle || '—'}
                </td>

                <td className="max-w-40 truncate px-3 py-4 text-sm text-text-muted">
                  {item.email || '—'}
                </td>

                <td className="px-3 py-4">
                  <StatusBadge status={item.status} />
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-sm text-text-muted">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {items.map((item) => (
          <div key={item._id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold">
                  {item.authorName || 'Unnamed author'}
                </p>
                <p className="mt-1 break-all text-xs text-text-muted">
                  {item.email || '—'}
                </p>
              </div>

              <StatusBadge status={item.status} />
            </div>

            <div className="mt-3 flex justify-between gap-3 text-xs">
              <span className="min-w-0 break-words">
                {item.bookTitle || 'No book title'}
              </span>
              <span className="shrink-0 text-text-muted">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function RecentBooks({ items }) {
  if (!items.length) {
    return (
      <div className="px-4 py-12 text-center">
        <Library size={30} className="mx-auto mb-3 text-text-muted" />
        <p className="text-sm font-medium">No books added yet</p>
        <p className="mt-1 text-xs text-text-muted">
          Add your first book to build your catalogue.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {items.map((book) => (
        <div
          key={book._id}
          className="flex items-center gap-3 p-4"
        >
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={book.title}
              className="h-16 w-12 shrink-0 rounded-lg border border-border object-contain"
              loading="lazy"
            />
          ) : (
            <div className="grid h-16 w-12 shrink-0 place-items-center rounded-lg bg-background text-text-muted">
              <BookOpen size={20} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {book.title}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">
              {book.author || 'Unknown author'}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Added {formatDate(book.createdAt)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              book.isPublished
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {book.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      ))}
    </div>
  )
}

function QuickAction({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon size={19} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs text-text-muted">
          {description}
        </span>
      </span>

      <ArrowUpRight
        size={17}
        className="shrink-0 text-text-muted transition group-hover:text-primary"
      />
    </Link>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('bookweave_admin_token')

  const [summary, setSummary] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('bookweave_admin') || '{}')
    } catch {
      return {}
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bookweave_admin_token')
    localStorage.removeItem('bookweave_admin')
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const fetchDashboardData = useCallback(async () => {
    const [summaryResult, booksResult] = await Promise.all([
      fetch(`${API_URL}/enquiries/dashboard-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        const result = await parseJsonSafe(response)

        if (response.status === 401 || response.status === 403) {
          const error = new Error('SESSION_INVALID')
          error.status = response.status
          throw error
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load enquiries')
        }

        return result.data
      }),

      getAdminBooks(),
    ])

    return { summaryResult, booksResult }
  }, [token])

  const handleDashboardError = useCallback((error) => {
    if (error.status === 401 || error.status === 403 || error.message === 'SESSION_INVALID') {
      logout()
      toast.error('Session invalid. Please sign in again.')
    } else {
      setLoadError(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the backend. Please check your server.'
          : error.message || 'Unable to load dashboard.'
      )
      toast.error(error.message || 'Unable to load dashboard')
    }
  }, [logout])

  const loadDashboard = useCallback(async () => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    setLoading(true)
    setLoadError('')

    try {
      const { summaryResult, booksResult } = await fetchDashboardData()
      setSummary(summaryResult)
      setBooks(Array.isArray(booksResult) ? booksResult : [])
    } catch (error) {
      handleDashboardError(error)
    } finally {
      setLoading(false)
    }
  }, [token, navigate, fetchDashboardData, handleDashboardError])

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    let cancelled = false

    fetchDashboardData()
      .then(({ summaryResult, booksResult }) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setBooks(Array.isArray(booksResult) ? booksResult : [])
          setLoadError('')
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleDashboardError(error)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, navigate, fetchDashboardData, handleDashboardError])

  const counts = summary?.counts || {
    total: 0,
    new: 0,
    inProgress: 0,
    contacted: 0,
    closed: 0,
  }

  const publishedBooks = books.filter((book) => book.isPublished).length
  const draftBooks = books.length - publishedBooks

  const recentBooks = useMemo(
    () =>
      [...books]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [books]
  )

  const statCards = [
    { label: 'Total Enquiries', value: counts.total, icon: Mail },
    { label: 'New Enquiries', value: counts.new, icon: Leaf },
    { label: 'In Progress', value: counts.inProgress, icon: Hourglass },
    { label: 'Contacted', value: counts.contacted, icon: Users },
    { label: 'Closed', value: counts.closed, icon: FileText },
    { label: 'Total Books', value: books.length, icon: BookOpen },
    { label: 'Published Books', value: publishedBooks, icon: Eye },
    { label: 'Draft Books', value: draftBooks, icon: Library },
  ]

  if (loading && !summary) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3">
        <LoaderCircle size={30} className="animate-spin text-primary" />
        <p className="text-sm text-text-muted">Loading dashboard...</p>
      </div>
    )
  }

  if (loadError && !summary) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <Activity size={32} className="mx-auto mb-3 text-text-muted" />
        <h2 className="font-serif text-xl font-semibold">
          Dashboard unavailable
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
          {loadError}
        </p>
        <button
          type="button"
          onClick={loadDashboard}
          className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeading
        admin={admin}
        onRefresh={loadDashboard}
        loading={loading}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <SectionHeading
          title="Recent Enquiries"
          subtitle="Latest 5 author submissions"
          to="/admin/enquiries"
          linkText="Manage all"
        />

        <RecentEnquiries items={summary?.recentEnquiries || []} />
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <SectionHeading
          title="Recently Added Books"
          subtitle="Latest books in your catalogue"
          to="/admin/books"
          linkText="Manage books"
        />

        <RecentBooks items={recentBooks} />
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <h2 className="font-serif text-xl font-semibold">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Manage your publishing website.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <QuickAction
            to="/admin/enquiries"
            icon={Mail}
            title="Manage Enquiries"
            description="View submissions and update their status"
          />

          <QuickAction
            to="/admin/books"
            icon={BookOpen}
            title="Manage Books"
            description="Add, edit, publish or remove books"
          />
        </div>
      </section>
    </div>
  )
}
