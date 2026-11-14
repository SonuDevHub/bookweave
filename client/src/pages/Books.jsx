
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, X, RefreshCw } from 'lucide-react'
import { API_URL, parseJsonSafe } from '../config/api'

const filters = ['All Books', 'Fiction', 'Personal Growth', 'Poetry']

// Books page
export default function Books() {
  const [books, setBooks] = useState([])
  const [activeFilter, setActiveFilter] = useState('All Books')
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBooksData = useCallback(async () => {
    const response = await fetch(`${API_URL}/books`)
    const result = await parseJsonSafe(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to load books.')
    }

    return Array.isArray(result.data) ? result.data : []
  }, [])

  // Fetch published books
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await loadBooksData()
      setBooks(data)
    } catch (err) {
      setError(err.message || 'Something went wrong while loading books.')
    } finally {
      setLoading(false)
    }
  }, [loadBooksData])

  useEffect(() => {
    let cancelled = false

    loadBooksData()
      .then((data) => {
        if (!cancelled) {
          setBooks(data)
          setError('')
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Something went wrong while loading books.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [loadBooksData])

  // Filter books
  const filteredBooks = books.filter((book) => {
    const genre = (book.genre || '').toLowerCase()

    if (activeFilter === 'All Books') return true
    if (activeFilter === 'Fiction') return genre.includes('fiction')
    if (activeFilter === 'Personal Growth') {
      return genre.includes('personal growth')
    }
    return genre.includes(activeFilter.toLowerCase())
  })

  return (
    <main className="bg-background">
      {/* Page introduction */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-9 sm:py-11 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            THE BOOKSHELF
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl leading-tight text-text sm:text-4xl">
                Stories worth discovering.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
                Explore our published collection across different genres.
              </p>
            </div>

            <span className="text-sm text-text-muted">
              {filteredBooks.length} published titles
            </span>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                activeFilter === filter
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-background text-text hover:border-primary hover:text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-sm text-text-muted">
            Loading books...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-sm text-text-muted">{error}</p>
            <button
              type="button"
              onClick={fetchBooks}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Books */}
        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {filteredBooks.map((book) => (
              <article key={book._id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedBook(book)}
                  className="group block w-full text-left"
                  aria-label={`View details for ${book.title}`}
                >
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-border bg-cream shadow-sm transition-transform duration-200 group-hover:-translate-y-1">
                    {book.coverImage?.url ? (
                      <img
                        src={book.coverImage.url}
                        alt={`${book.title} book cover`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-text">
                        <BookOpen size={36} className="mb-4 text-primary" />
                        <span className="font-serif text-2xl">
                          {book.title?.charAt(0)}
                        </span>
                        <span className="mt-2 font-serif text-sm">
                          {book.title}
                        </span>
                        <span className="mt-3 text-xs text-text-muted">
                          {book.author}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                      {book.genre}
                    </p>
                    <h2 className="mt-1 font-serif text-base leading-snug text-text sm:text-lg">
                      {book.title}
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      by {book.author}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      View details <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen size={34} className="mx-auto text-text-muted" />
            <h2 className="mt-4 font-serif text-xl text-text">
              No books found
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              {books.length === 0
                ? 'Our published collection is coming soon.'
                : 'No books available in this category yet.'}
            </p>
          </div>
        )}
      </section>

      {/* Contact call to action */}
      <section className="border-t border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-serif text-2xl text-text">
              Have a book of your own?
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Tell us about your manuscript and publishing goals.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Contact us <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Book details dialog */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text/50 p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-dialog-title"
            className="relative w-full max-w-md rounded-xl bg-background p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-cream hover:text-text"
              aria-label="Close book details"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen size={15} />
              {selectedBook.genre}
            </div>

            <h2
              id="book-dialog-title"
              className="mt-4 pr-8 font-serif text-2xl text-text"
            >
              {selectedBook.title}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Written by {selectedBook.author}
            </p>

            {selectedBook.coverImage?.url && (
              <img
                src={selectedBook.coverImage.url}
                alt={`${selectedBook.title} book cover`}
                className="mt-4 max-h-56 w-auto rounded-md object-contain"
              />
            )}

            <p className="mt-4 text-sm leading-6 text-text-muted">
              {selectedBook.description}
            </p>

            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="mt-5 rounded-full border border-border px-4 py-2 text-sm font-medium text-text hover:bg-cream"
            >
              Close details
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
