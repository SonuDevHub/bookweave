
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus, Search, BookOpen, Pencil, Trash2, Eye, EyeOff,
  RefreshCw, LoaderCircle, X, ImagePlus, Save,
} from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getAdminBooks,
  createBook,
  updateBook,
  toggleBookPublish,
  deleteBook,
} from '../services/bookService'

const initialForm = {
  title: '',
  author: '',
  genre: '',
  description: '',
}

const inputClass =
  'w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [coverImage, setCoverImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const closeModal = useCallback(() => {
    if (saving) return
    setModalOpen(false)
    setEditingBook(null)
    setForm(initialForm)
    setCoverImage(null)
    setPreview('')
  }, [saving])

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminBooks()
      setBooks(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message || 'Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    getAdminBooks()
      .then((data) => {
        if (!cancelled) {
          setBooks(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.message || 'Failed to load books')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!modalOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event) {
      if (event.key === 'Escape' && !saving) closeModal()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [modalOpen, saving, closeModal])

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return books

    return books.filter((book) =>
      [book.title, book.author, book.genre]
        .some((value) => value?.toLowerCase().includes(term))
    )
  }, [books, search])

  const publishedCount = books.filter((book) => book.isPublished).length
  const draftCount = books.length - publishedCount

  function openAddModal() {
    setEditingBook(null)
    setForm(initialForm)
    setCoverImage(null)
    setPreview('')
    setModalOpen(true)
  }

  function openEditModal(book) {
    setEditingBook(book)
    setForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      description: book.description || '',
    })
    setCoverImage(null)
    setPreview(book.coverImage?.url || '')
    setModalOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WebP images are allowed')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB')
      event.target.value = ''
      return
    }

    setCoverImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!editingBook && !coverImage) {
      toast.error('Please select a book cover image')
      return
    }

    try {
      setSaving(true)

      if (editingBook) {
        await updateBook(editingBook._id, { ...form, coverImage })
        toast.success('Book updated successfully')
      } else {
        await createBook({ ...form, coverImage })
        toast.success('Book added successfully')
      }

      setModalOpen(false)
      setEditingBook(null)
      setForm(initialForm)
      setCoverImage(null)
      setPreview('')
      await fetchBooks()
    } catch (error) {
      toast.error(error.message || 'Unable to save book')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(book) {
    try {
      setActionId(book._id)
      await toggleBookPublish(book._id)

      toast.success(
        book.isPublished
          ? 'Book unpublished successfully'
          : 'Book published successfully'
      )

      await fetchBooks()
    } catch (error) {
      toast.error(error.message || 'Unable to update book status')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    )

    if (!confirmed) return

    try {
      setActionId(book._id)
      await deleteBook(book._id)
      setBooks((current) => current.filter((item) => item._id !== book._id))
      toast.success('Book deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Unable to delete book')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm text-text-muted">Manage your catalogue</p>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">
            Books
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Add, edit and manage your published books.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Books" value={books.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-primary">Book Catalogue</h2>
            <p className="mt-1 text-sm text-text-muted">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search books..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={fetchBooks}
              disabled={loading}
              title="Refresh books"
              className="shrink-0 rounded-xl border border-border p-2.5 text-text-muted transition hover:bg-background disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <LoaderCircle size={28} className="animate-spin text-primary" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <BookOpen size={38} className="mb-3 text-text-muted" />
            <h3 className="font-semibold text-text-primary">
              {search ? 'No books found' : 'No books added yet'}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {search
                ? 'Try searching with another title or author.'
                : 'Add your first book to get started.'}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Add your first book
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-3 py-4 font-medium">Book</th>
                    <th className="px-3 py-4 font-medium">Genre</th>
                    <th className="px-3 py-4 font-medium">Status</th>
                    <th className="px-3 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-background/60">
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage?.url}
                            alt={book.title}
                            className="h-16 w-12 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-text-primary">
                              {book.title}
                            </p>
                            <p className="mt-1 text-sm text-text-muted">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-text-secondary">
                        {book.genre}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge published={book.isPublished} />
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            title={book.isPublished ? 'Unpublish' : 'Publish'}
                            disabled={actionId === book._id}
                            onClick={() => handlePublish(book)}
                          >
                            {book.isPublished ? <EyeOff size={17} /> : <Eye size={17} />}
                          </ActionButton>

                          <ActionButton
                            title="Edit book"
                            onClick={() => openEditModal(book)}
                          >
                            <Pencil size={17} />
                          </ActionButton>

                          <ActionButton
                            title="Delete book"
                            danger
                            disabled={actionId === book._id}
                            onClick={() => handleDelete(book)}
                          >
                            <Trash2 size={17} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredBooks.map((book) => (
                <div key={book._id} className="rounded-xl border border-border p-3">
                  <div className="flex gap-3">
                    <img
                      src={book.coverImage?.url}
                      alt={book.title}
                      className="h-24 w-16 rounded-lg border border-border object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary">{book.title}</p>
                      <p className="mt-1 text-sm text-text-muted">{book.author}</p>
                      <p className="mt-1 text-xs text-text-muted">{book.genre}</p>

                      <div className="mt-2">
                        <StatusBadge published={book.isPublished} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
                    <ActionButton
                      title={book.isPublished ? 'Unpublish' : 'Publish'}
                      disabled={actionId === book._id}
                      onClick={() => handlePublish(book)}
                    >
                      {book.isPublished ? <EyeOff size={17} /> : <Eye size={17} />}
                    </ActionButton>

                    <ActionButton
                      title="Edit book"
                      onClick={() => openEditModal(book)}
                    >
                      <Pencil size={17} />
                    </ActionButton>

                    <ActionButton
                      title="Delete book"
                      danger
                      disabled={actionId === book._id}
                      onClick={() => handleDelete(book)}
                    >
                      <Trash2 size={17} />
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="flex max-h-[90dvh] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-7">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">
                  Enter the book details and upload its cover.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-background"
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-7">
                <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:gap-7">
                  <div className="min-w-0 space-y-5">
                    <FormField label="Book Title" required>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        maxLength={150}
                        placeholder="Enter book title"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Author Name" required>
                      <input
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Enter author name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Genre" required>
                      <input
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        required
                        maxLength={60}
                        placeholder="e.g. Fiction, Poetry, Personal Growth"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Description" required>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        maxLength={3000}
                        rows={6}
                        placeholder="Write a short description of the book..."
                        className={`${inputClass} min-h-36 resize-none leading-6`}
                      />

                      <p className="mt-1 text-right text-xs text-text-muted">
                        {form.description.length}/3000
                      </p>
                    </FormField>
                  </div>

                  <div className="min-w-0">
                    <FormField label="Book Cover" required={!editingBook}>
                      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-background p-3 text-center transition hover:border-primary sm:min-h-72">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Book cover preview"
                            className="max-h-64 w-full rounded-lg object-contain"
                          />
                        ) : (
                          <>
                            <ImagePlus size={36} className="mb-3 text-text-muted" />
                            <span className="text-sm font-medium text-text-primary">
                              Upload book cover
                            </span>
                            <span className="mt-1 text-xs text-text-muted">
                              JPG, PNG or WebP
                            </span>
                            <span className="mt-1 text-xs text-text-muted">
                              Maximum 5 MB
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {preview && (
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage(null)
                            setPreview('')
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:underline"
                        >
                          <X size={14} />
                          Remove image
                        </button>
                      )}

                      {editingBook && !coverImage && preview && (
                        <p className="mt-2 text-xs text-text-muted">
                          Leave unchanged to keep the current cover.
                        </p>
                      )}
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse justify-end gap-2 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:gap-3 sm:px-7 sm:py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text-secondary transition hover:bg-background disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        published
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

function ActionButton({ children, title, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-text-muted hover:bg-background hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function FormField({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
