
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  UsersRound,
  Pencil,
  Trash2,
  RefreshCw,
  LoaderCircle,
  X,
  ImagePlus,
  Save,
  BookOpen,
} from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getAdminAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../services/authorService'

const initialForm = {
  name: '',
  designation: '',
  bio: '',
  profileImage: null,
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [preview, setPreview] = useState('')

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAdminAuthors()
      setAuthors(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      toast.error(error.message || 'Unable to load authors.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    getAdminAuthors()
      .then((response) => {
        if (!cancelled) {
          setAuthors(Array.isArray(response.data) ? response.data : [])
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.message || 'Unable to load authors.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredAuthors = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return authors

    return authors.filter((author) =>
      [author.name, author.designation, author.bio]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [authors, search])

  const totalBooks = authors.reduce(
    (total, author) => total + (author.bookCount || 0),
    0
  )

  function openCreateModal() {
    setEditingAuthor(null)
    setForm(initialForm)
    setPreview('')
    setModalOpen(true)
  }

  function openEditModal(author) {
    setEditingAuthor(author)
    setForm({
      name: author.name || '',
      designation: author.designation || '',
      bio: author.bio || '',
      profileImage: null,
    })
    setPreview(author.profileImage?.url || '')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return

    setModalOpen(false)
    setEditingAuthor(null)
    setForm(initialForm)
    setPreview('')
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG and WebP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be under 5 MB.')
      event.target.value = ''
      return
    }

    setForm((previous) => ({
      ...previous,
      profileImage: file,
    }))

    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Author name is required.')
      return
    }

    if (!editingAuthor && !form.bio.trim()) {
      toast.error('Author biography is required.')
      return
    }

    if (!editingAuthor && !form.profileImage) {
      toast.error('Please upload an author profile photo.')
      return
    }

    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('designation', form.designation.trim())
    formData.append('bio', form.bio.trim())

    if (form.profileImage) {
      formData.append('profileImage', form.profileImage)
    }

    try {
      setSaving(true)

      if (editingAuthor) {
        await updateAuthor(editingAuthor._id, formData)
        toast.success('Author updated successfully.')
      } else {
        await createAuthor(formData)
        toast.success('Author added successfully.')
      }

      setModalOpen(false)
      setEditingAuthor(null)
      setForm(initialForm)
      setPreview('')

      await fetchAuthors()
    } catch (error) {
      toast.error(error.message || 'Unable to save author.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(author) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${author.name}?`
    )

    if (!confirmed) return

    try {
      await deleteAuthor(author._id)

      setAuthors((previous) =>
        previous.filter((item) => item._id !== author._id)
      )

      toast.success('Author deleted successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to delete author.')
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">
            Authors
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your publishing house authors.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Plus size={18} />
          Add Author
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Authors"
          value={authors.length}
          icon={<UsersRound size={23} />}
        />

        <StatCard
          label="Books by Authors"
          value={totalBooks}
          icon={<BookOpen size={23} />}
        />
      </div>

      {/* Authors List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text">All Authors</h2>
            <p className="mt-1 text-xs text-text-muted">
              {filteredAuthors.length} author(s) found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search authors..."
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={fetchAuthors}
              disabled={loading}
              aria-label="Refresh authors"
              className="rounded-xl border border-border p-2.5 text-text-muted transition hover:bg-cream hover:text-primary disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle className="animate-spin text-primary" size={30} />
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-5 text-center">
            <UsersRound size={38} className="text-text-muted/50" />
            <h3 className="mt-4 font-semibold text-text">
              {search ? 'No authors found' : 'No authors added yet'}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {search
                ? 'Try another search keyword.'
                : 'Add your first author to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-cream/60 text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Author</th>
                    <th className="px-6 py-4 font-semibold">Designation</th>
                    <th className="px-6 py-4 font-semibold">Books</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filteredAuthors.map((author) => (
                    <tr
                      key={author._id}
                      className="transition hover:bg-cream/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AuthorAvatar author={author} />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text">
                              {author.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-text-muted">
                              {author.bio || 'Biography not added'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-text-muted">
                        {author.designation || '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-cream px-3 py-1.5 text-sm font-medium text-primary">
                          {author.bookCount || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <ActionButtons
                          author={author}
                          onEdit={openEditModal}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-3 p-4 md:hidden">
              {filteredAuthors.map((author) => (
                <div
                  key={author._id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <AuthorAvatar author={author} size="large" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text">
                        {author.name}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {author.designation || 'Author'}
                      </p>

                      <p className="mt-2 line-clamp-2 text-xs text-text-muted">
                        {author.bio || 'Biography not added'}
                      </p>

                      <p className="mt-2 text-xs font-medium text-primary">
                        {author.bookCount || 0} book(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(author)}
                      className="inline-flex items-center gap-2 rounded-lg bg-cream px-3 py-2 text-xs font-medium text-primary"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(author)}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-text">
                  {editingAuthor ? 'Edit Author' : 'Add New Author'}
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  Enter the author's information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-text-muted transition hover:bg-cream"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Profile Photo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Profile Photo
                  {!editingAuthor && (
                    <span className="text-red-500"> *</span>
                  )}
                  {editingAuthor && (
                    <span className="text-text-muted"> (Optional)</span>
                  )}
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-cream">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Author preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={28} className="text-text-muted" />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:bg-cream">
                      <ImagePlus size={17} />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <p className="mt-2 text-xs text-text-muted">
                      JPEG, PNG or WebP. Maximum 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Author Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="Enter author name"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Designation
                  <span className="text-text-muted"> (Optional)</span>
                </label>

                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. Author, Poet, Writer"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </div>

              {/* Biography */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Biography
                  {!editingAuthor && (
                    <span className="text-red-500"> *</span>
                  )}
                  {editingAuthor && (
                    <span className="text-text-muted"> (Optional)</span>
                  )}
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={5}
                  required={!editingAuthor}
                  placeholder="Write a short biography about the author..."
                  className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />

                <p className="mt-1 text-right text-xs text-text-muted">
                  {form.bio.length}/2000
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text transition hover:bg-cream disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? 'Saving...'
                    : editingAuthor
                      ? 'Update Author'
                      : 'Save Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
        </div>

        <div className="rounded-xl bg-cream p-3 text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}

function AuthorAvatar({ author, size = 'normal' }) {
  const imageClass =
    size === 'large'
      ? 'h-14 w-14 text-lg'
      : 'h-12 w-12 text-sm'

  if (author.profileImage?.url) {
    return (
      <img
        src={author.profileImage.url}
        alt={author.name}
        className={`${imageClass} shrink-0 rounded-full border border-border object-cover`}
      />
    )
  }

  const initials = (author.name || 'A')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return (
    <div
      className={`${imageClass} flex shrink-0 items-center justify-center rounded-full border border-border bg-cream font-semibold text-primary`}
      aria-label={`${author.name} profile placeholder`}
    >
      {initials}
    </div>
  )
}

function ActionButtons({ author, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(author)}
        className="rounded-lg p-2 text-text-muted transition hover:bg-cream hover:text-primary"
        aria-label={`Edit ${author.name}`}
      >
        <Pencil size={17} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(author)}
        className="rounded-lg p-2 text-text-muted transition hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete ${author.name}`}
      >
        <Trash2 size={17} />
      </button>
    </div>
  )
}
