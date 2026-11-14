import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  BookMarked,
  Clock3,
  Mail,
  MessageSquareText,
  LoaderCircle,
  Save,
  X,
  Trash2,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { API_URL, parseJsonSafe } from '../config/api'

const STATUSES = ['new', 'in-progress', 'contacted', 'closed']

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
  const safeStatus = STATUSES.includes(status) ? status : 'new'

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      <span className="size-2 rounded-full bg-current" />
      {STATUS_LABELS[safeStatus]}
    </span>
  )
}

function PageHeading() {
  return (
    <div className="mb-5">
      <p className="mb-1.5 text-[11px] font-semibold tracking-[0.2em] text-primary">
        MANAGEMENT
      </p>
      <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        Enquiries
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Search, review and manage author submissions.
      </p>
    </div>
  )
}

function EnquiryTable({ items, loading, selectedId, onSelect, startIndex }) {
  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-sm text-text-muted">
        <LoaderCircle size={20} className="mx-auto mb-2 animate-spin" />
        Loading enquiries...
      </div>
    )
  }

  if (!items.length) {
    return (
      <p className="px-4 py-12 text-center text-sm text-text-muted">
        No enquiries found.
      </p>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead className="bg-cream">
            <tr className="text-xs">
              {['No.', 'Author', 'Book Title', 'Email', 'Status', 'Date', 'Action'].map((heading) => (
                <th key={heading} className="px-3 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr
                key={item._id}
                onClick={() => onSelect(item._id)}
                className={`cursor-pointer transition hover:bg-primary/5 ${
                  selectedId === item._id ? 'bg-primary/10' : ''
                }`}
              >
                <td className="px-3 py-4 text-sm tabular-nums">
                  {startIndex + index + 1}
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-serif text-primary">
                      {(item.authorName || 'A').charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-32 truncate text-sm font-medium">
                      {item.authorName || 'Unnamed author'}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-4 text-sm">
                  {item.bookTitle || 'Untitled project'}
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

                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(item._id)
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-cream"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {items.map((item, index) => (
          <button
            key={item._id}
            type="button"
            onClick={() => onSelect(item._id)}
            className={`block w-full min-w-0 p-4 text-left transition hover:bg-primary/5 ${
              selectedId === item._id ? 'bg-primary/10' : ''
            }`}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-serif text-primary">
                  {(item.authorName || 'A').charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {startIndex + index + 1}. {item.authorName || 'Unnamed author'}
                  </p>
                  <p className="mt-1 break-all text-xs text-text-muted">
                    {item.email || '—'}
                  </p>
                </div>
              </div>

              <StatusBadge status={item.status} />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3 pl-12">
              <p className="min-w-0 break-words text-sm">
                {item.bookTitle || 'Untitled project'}
              </p>
              <span className="shrink-0 text-xs text-text-muted">
                {formatDate(item.createdAt)}
              </span>
            </div>

            <p className="mt-3 text-right text-xs font-semibold text-primary">
              View details →
            </p>
          </button>
        ))}
      </div>
    </>
  )
}

function DetailLine({ icon: Icon, title, children }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="break-words text-sm text-text-muted">{children || '—'}</p>
      </div>
    </div>
  )
}

function EnquiryDetails({
  selected,
  editStatus,
  setEditStatus,
  saving,
  saveStatus,
  deleting,
  openDeleteConfirm,
  close,
}) {
  if (!selected) {
    return (
      <aside className="rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
        Select an enquiry to view details.
      </aside>
    )
  }

  const services = Array.isArray(selected.services) ? selected.services : []

  return (
    <aside className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-serif text-lg font-semibold">Enquiry Details</h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close details"
          className="grid size-8 place-items-center rounded-lg transition hover:bg-primary/10"
        >
          <X size={17} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 font-serif text-xl text-primary">
            {(selected.authorName || 'A').charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">
              {selected.authorName || 'Unnamed author'}
            </h3>
            <p className="mt-1 break-words text-xs text-text-muted">
              {selected.email || '—'}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {selected.phone || 'No phone provided'}
            </p>
          </div>

          <StatusBadge status={selected.status} />
        </div>

        <DetailLine icon={BookOpen} title="Book Title">
          {selected.bookTitle || 'Untitled project'}
        </DetailLine>

        <DetailLine icon={BookMarked} title="Genre">
          {selected.genre || 'Not specified'}
        </DetailLine>

        <DetailLine icon={Clock3} title="Manuscript Status">
          {selected.manuscriptStatus || 'Not specified'}
        </DetailLine>

        <DetailLine icon={Mail} title="Received">
          {formatDate(selected.createdAt)}
        </DetailLine>

        <section>
          <p className="mb-2 text-sm font-semibold">Services Interested In</p>
          <div className="flex flex-wrap gap-1.5">
            {(services.length ? services : ['General enquiry']).map((service) => (
              <span key={service} className="rounded-full bg-cream px-2.5 py-1 text-xs">
                {service}
              </span>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <MessageSquareText size={16} className="text-primary" />
            <p className="text-sm font-semibold">Message</p>
          </div>
          <p className="whitespace-pre-wrap break-words rounded-lg bg-cream p-3 text-sm leading-5 text-text-muted">
            {selected.message || 'No message provided.'}
          </p>
        </section>

        <section>
          <label htmlFor="enquiry-status" className="mb-2 block text-sm font-semibold">
            Update Status
          </label>
          <select
            id="enquiry-status"
            value={editStatus}
            onChange={(event) => setEditStatus(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </section>

        <button
          type="button"
          onClick={saveStatus}
          disabled={saving || deleting || editStatus === selected.status}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-surface transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={openDeleteConfirm}
          disabled={deleting || saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-cream disabled:opacity-50"
        >
          <Trash2 size={15} />
          Delete Enquiry
        </button>
      </div>
    </aside>
  )
}

function DeleteConfirmation({ selected, deleting, onCancel, onConfirm }) {
  if (!selected) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => !deleting && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-enquiry-title"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-red-500/10 text-red-600">
          <AlertTriangle size={22} />
        </div>

        <h2 id="delete-enquiry-title" className="font-serif text-xl font-semibold">
          Delete Enquiry?
        </h2>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          Are you sure you want to delete the enquiry from{' '}
          <span className="font-semibold text-text">
            {selected.authorName || 'this author'}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-cream disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <LoaderCircle size={15} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminEnquiries() {
  const navigate = useNavigate()
  const token = localStorage.getItem('bookweave_admin_token')

  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [statusDrafts, setStatusDrafts] = useState({})
  const [page, setPage] = useState(1)
  const [detailOpen, setDetailOpen] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('bookweave_admin_token')
    localStorage.removeItem('bookweave_admin')
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const fetchEnquiriesData = useCallback(async () => {
    const response = await fetch(`${API_URL}/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const result = await parseJsonSafe(response)

    if (response.status === 401 || response.status === 403) {
      const error = new Error('SESSION_INVALID')
      error.status = response.status
      throw error
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to load enquiries')
    }

    return Array.isArray(result.data) ? result.data : []
  }, [token])

  const loadEnquiries = useCallback(async () => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    setLoading(true)

    try {
      const data = await fetchEnquiriesData()
      setEnquiries(data)
      setSelectedId((current) =>
        data.some((item) => item._id === current) ? current : data[0]?._id || ''
      )
    } catch (error) {
      if (error.status === 401 || error.status === 403 || error.message === 'SESSION_INVALID') {
        logout()
        toast.error('Session invalid. Please sign in again.')
      } else {
        toast.error(
          error.message === 'Failed to fetch'
            ? 'Backend connection failed'
            : error.message
        )
      }
    } finally {
      setLoading(false)
    }
  }, [token, navigate, logout, fetchEnquiriesData])

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    let cancelled = false

    fetchEnquiriesData()
      .then((data) => {
        if (!cancelled) {
          setEnquiries(data)
          setSelectedId((current) =>
            data.some((item) => item._id === current) ? current : data[0]?._id || ''
          )
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          if (error.status === 401 || error.status === 403 || error.message === 'SESSION_INVALID') {
            logout()
            toast.error('Session invalid. Please sign in again.')
          } else {
            toast.error(
              error.message === 'Failed to fetch'
                ? 'Backend connection failed'
                : error.message
            )
          }
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, navigate, logout, fetchEnquiriesData])

  const selected = enquiries.find((item) => item._id === selectedId) || null
  const editStatus = selected ? (statusDrafts[selected._id] ?? selected.status ?? 'new') : 'new'
  const setEditStatus = (value) => {
    if (!selected) return
    setStatusDrafts((current) => ({ ...current, [selected._id]: value }))
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return enquiries.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      const matchesSearch = !query || [
        item.authorName,
        item.email,
        item.phone,
        item.bookTitle,
        item.genre,
      ].some((value) => String(value || '').toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [enquiries, search, statusFilter])

  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  async function saveStatus() {
    if (!selected || saving || deleting || editStatus === selected.status) return

    setSaving(true)

    try {
      const response = await fetch(`${API_URL}/enquiries/${selected._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editStatus }),
      })

      const result = await parseJsonSafe(response)

      if (response.status === 401 || response.status === 403) {
        logout()
        toast.error('Session invalid. Please sign in again.')
        return
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update status')
      }

      setEnquiries((current) => current.map((item) =>
        item._id === selected._id
          ? { ...item, ...(result.data || {}), status: result.data?.status || editStatus }
          : item
      ))

      setStatusDrafts((current) => {
        const next = { ...current }
        delete next[selected._id]
        return next
      })

      toast.success('Enquiry status updated')
    } catch (error) {
      toast.error(
        error.message === 'Failed to fetch'
          ? 'Backend connection failed'
          : error.message
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteEnquiry() {
    if (!selected || deleting || saving) return

    setDeleting(true)

    try {
      const response = await fetch(`${API_URL}/enquiries/${selected._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await parseJsonSafe(response)

      if (response.status === 401 || response.status === 403) {
        logout()
        toast.error('Session invalid. Please sign in again.')
        return
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete enquiry')
      }

      const remaining = enquiries.filter((item) => item._id !== selected._id)

      setEnquiries(remaining)
      setSelectedId(remaining[0]?._id || '')
      setShowDeleteConfirm(false)

      setPage((current) => Math.max(
        1,
        Math.min(current, Math.ceil(Math.max(0, filtered.length - 1) / pageSize))
      ))

      toast.success('Enquiry deleted successfully')
    } catch (error) {
      toast.error(
        error.message === 'Failed to fetch'
          ? 'Backend connection failed'
          : error.message
      )
    } finally {
      setDeleting(false)
    }
  }

  function exportCSV() {
    if (!filtered.length) {
      toast.info('There are no enquiries to export.')
      return
    }

    const columns = [
      ['Author', 'authorName'],
      ['Email', 'email'],
      ['Phone', 'phone'],
      ['Book Title', 'bookTitle'],
      ['Genre', 'genre'],
      ['Manuscript Status', 'manuscriptStatus'],
      ['Services', 'services'],
      ['Message', 'message'],
      ['Status', 'status'],
      ['Received Date', 'createdAt'],
    ]

    const escapeCSV = (value) => {
      const text = Array.isArray(value) ? value.join(', ') : String(value ?? '')
      const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
      return `"${safeText.replace(/"/g, '""')}"`
    }

    const csv = [
      columns.map(([label]) => escapeCSV(label)).join(','),
      ...filtered.map((item) => columns.map(([, key]) =>
        escapeCSV(key === 'createdAt' ? formatDate(item[key]) : item[key])
      ).join(',')),
    ].join('\r\n')

    const url = URL.createObjectURL(
      new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
    )

    const link = document.createElement('a')
    link.href = url
    link.download = `bookweave-enquiries-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    toast.success('CSV exported successfully')
  }

  return (
    <>
      <PageHeading />

      <section className={`grid min-w-0 grid-cols-1 items-start gap-4 ${
        detailOpen ? '2xl:grid-cols-[minmax(0,1fr)_310px]' : ''
      }`}>
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <h2 className="font-serif text-lg sm:text-xl">
              Author enquiries{' '}
              <span className="font-sans text-sm text-text-muted">
                ({filtered.length})
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition hover:bg-primary/10"
              >
                <Download size={14} /> Export CSV
              </button>

              <button
                type="button"
                onClick={loadEnquiries}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition hover:bg-primary/10 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search author, email, book..."
                aria-label="Search enquiries"
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              aria-label="Filter by status"
              className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <EnquiryTable
            items={visible}
            startIndex={(currentPage - 1) * pageSize}
            loading={loading}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              setDetailOpen(true)
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-text-muted">
              {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="grid size-9 place-items-center rounded-lg border border-border transition hover:bg-cream disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-sm tabular-nums">
                {currentPage}/{pageCount}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="grid size-9 place-items-center rounded-lg border border-border transition hover:bg-cream disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {detailOpen && (
          <EnquiryDetails
            selected={selected}
            editStatus={editStatus}
            setEditStatus={setEditStatus}
            saving={saving}
            saveStatus={saveStatus}
            deleting={deleting}
            openDeleteConfirm={() => setShowDeleteConfirm(true)}
            close={() => setDetailOpen(false)}
          />
        )}
      </section>

      {showDeleteConfirm && (
        <DeleteConfirmation
          selected={selected}
          deleting={deleting}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={deleteEnquiry}
        />
      )}
    </>
  )
}