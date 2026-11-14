import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  PenLine,
  FileText,
  Compass,
  Plus,
  Heart,
  Leaf,
  RefreshCw,
  Sparkles,
  Feather,
  Quote,
} from 'lucide-react'
import { homepageContent, publishingServices } from '../data/homepageData'
import { API_URL, parseJsonSafe } from '../config/api'

const steps = [
  {
    number: '01',
    title: 'Share your story',
    description: 'Tell us about your manuscript and the idea behind it.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Plan your journey',
    description: 'Explore the editing, design and publishing support you need.',
    icon: Compass,
  },
  {
    number: '03',
    title: 'Prepare your book',
    description: 'Refine your manuscript and bring your book identity together.',
    icon: PenLine,
  },
  {
    number: '04',
    title: 'Publish your book',
    description: 'Take the next steps towards sharing your work with readers.',
    icon: BookOpen,
  },
]

const benefits = [
  {
    icon: Feather,
    title: 'Your voice comes first',
    description: 'Your story stays at the heart of every publishing decision.',
  },
  {
    icon: PenLine,
    title: 'Thoughtful craftsmanship',
    description: 'Careful attention to the words, design and details.',
  },
  {
    icon: Compass,
    title: 'Guidance that matters',
    description: 'Clear direction throughout your publishing journey.',
  },
  {
    icon: Heart,
    title: 'Made for storytellers',
    description: 'A publishing experience that respects every story.',
  },
]

const faqs = [
  {
    question: 'Can I enquire before my manuscript is finished?',
    answer:
      'Yes. You can contact us while writing, editing or after completing your manuscript. Share your current stage so we can understand your requirements.',
  },
  {
    question: 'Which publishing services do you offer?',
    answer:
      'BookWeave offers manuscript editing and proofreading, cover and book design, ISBN assistance, printing and distribution guidance.',
  },
  {
    question: 'How do I start my publishing journey?',
    answer:
      'Visit the Contact page and submit an enquiry with your details, book information and the services you are interested in.',
  },
  {
    question: 'Can I see books published through BookWeave?',
    answer:
      'Yes. Visit the Our Books page to explore the published titles currently featured in our catalogue.',
  },
]

const serviceIcons = [FileText, PenLine, BookOpen, Compass]

// Scroll reveal using Tailwind transitions
function Reveal({ children, className = '', delay = '' }) {
  const elementRef = useRef(null)
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window)
  )

  useEffect(() => {
    const element = elementRef.current

    if (!element || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-5 opacity-0'
      } ${delay} ${className}`}
    >
      {children}
    </div>
  )
}

// FAQ item
function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false)
  const isTeal = index % 2 !== 0

  return (
    <article
      className={`group overflow-hidden rounded-lg border transition-all duration-300 ${
        open
          ? 'border-secondary/30 bg-cream shadow-sm'
          : 'border-border bg-surface hover:border-secondary/30 hover:shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
      >
        <span
          className={`font-serif text-sm ${
            isTeal ? 'text-secondary/80' : 'text-primary/70'
          }`}
        >
          0{index + 1}
        </span>

        <span className="flex-1 font-serif text-sm leading-snug text-text sm:text-base lg:text-lg">
          {question}
        </span>

        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
            open
              ? isTeal
                ? 'rotate-45 bg-secondary text-white'
                : 'rotate-45 bg-primary text-white'
              : isTeal
                ? 'border border-border bg-background text-secondary group-hover:border-secondary'
                : 'border border-border bg-background text-primary group-hover:border-primary'
          }`}
        >
          <Plus size={15} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`border-t px-4 pb-5 pt-3 pl-11 text-xs leading-6 text-text-muted sm:px-5 sm:pl-14 sm:text-sm ${
              isTeal ? 'border-secondary/15' : 'border-primary/10'
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </article>
  )
}

// Published book card
function BookCover({ book }) {
  return (
    <article className="group w-[140px] shrink-0 sm:w-[160px] lg:w-[175px]">
      <Link to="/books" className="block">
        <div className="flex h-[210px] items-center justify-center overflow-hidden border border-border bg-cream shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-[240px] lg:h-[260px]">
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={`${book.title} book cover`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-primary">
              <BookOpen size={24} />
              <span className="font-serif text-lg leading-tight">
                {book.title}
              </span>
              <small className="text-[10px] text-text-muted">
                {book.author}
              </small>
            </div>
          )}
        </div>

        <h3 className="mt-3 line-clamp-1 font-serif text-sm text-text transition-colors group-hover:text-primary sm:text-base">
          {book.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-text-muted">
          {book.author}
        </p>
      </Link>
    </article>
  )
}

// Homepage
export default function Home() {
  const [books, setBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [booksError, setBooksError] = useState('')
  const [featuredAuthors, setFeaturedAuthors] = useState([])

  // Fetch published books
  const loadBooksData = useCallback(async () => {
    const response = await fetch(`${API_URL}/books`)
    const result = await parseJsonSafe(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to load published books.')
    }

    return Array.isArray(result.data) ? result.data : []
  }, [])

  const fetchBooks = useCallback(async () => {
    try {
      setBooksLoading(true)
      setBooksError('')
      const data = await loadBooksData()
      setBooks(data)
    } catch (error) {
      setBooksError(error.message || 'Unable to load published books.')
    } finally {
      setBooksLoading(false)
    }
  }, [loadBooksData])

  useEffect(() => {
    let cancelled = false

    loadBooksData()
      .then((data) => {
        if (!cancelled) {
          setBooks(data)
          setBooksError('')
          setBooksLoading(false)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setBooksError(error.message || 'Unable to load published books.')
          setBooksLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [loadBooksData])

  // Fetch featured authors from Author collection
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`${API_URL}/authors`)
        const result = await parseJsonSafe(response)

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load authors.')
        }

        setFeaturedAuthors(
          Array.isArray(result.data) ? result.data.slice(0, 4) : []
        )
      } catch (error) {
        console.error('Featured authors error:', error)
      }
    }

    fetchAuthors()
  }, [])

  // Duplicate books for continuous marquee
  const marqueeBooks = useMemo(() => {
    if (!books.length) return []

    const result = []

    while (result.length < 8) {
      result.push(...books)
    }

    return result.slice(0, Math.max(8, books.length))
  }, [books])

  return (
    <main className="overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full border border-primary/10 sm:size-96" />
        <div className="pointer-events-none absolute -right-10 -top-8 size-56 rounded-full border border-secondary/10" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
              <Sparkles size={13} />
              {homepageContent.eyebrow}
            </p>

            <h1 className="mt-4 max-w-xl font-serif text-3xl font-normal leading-[1.12] tracking-tight text-text sm:text-5xl lg:text-[56px]">
              {homepageContent.title}
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-text-muted sm:text-base">
              {homepageContent.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-lg sm:text-sm"
              >
                Publish Your Book <ArrowRight size={15} />
              </Link>

              <Link
                to="/books"
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-3 text-xs font-semibold text-text transition-all duration-300 hover:bg-background sm:text-sm"
              >
                Explore Books
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-primary/15 pt-5 text-[11px] text-text-muted sm:text-xs">
              <span className="inline-flex items-center gap-2">
                <Leaf size={14} className="text-primary" />
                Author focused
              </span>
              <span className="inline-flex items-center gap-2">
                <BookOpen size={14} className="text-secondary" />
                Publishing support
              </span>
              <span className="inline-flex items-center gap-2">
                <Heart size={14} className="text-primary" />
                Stories that matter
              </span>
            </div>
          </Reveal>

          <Reveal delay="delay-200" className="relative mx-auto w-full max-w-lg">
            <div className="relative overflow-hidden rounded-t-[42%] rounded-b-md border-[6px] border-background shadow-xl transition-transform duration-700 hover:scale-[1.01]">
              <img
                src={homepageContent.heroImage.src}
                alt={homepageContent.heroImage.alt}
                fetchPriority="high"
                className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[390px]"
              />
            </div>

            <div className="absolute -bottom-4 -left-1 max-w-[190px] animate-[bounce_5s_ease-in-out_infinite] border border-border bg-background p-3 shadow-lg sm:-left-4 sm:max-w-[210px] sm:p-4">
              <Quote size={18} className="text-secondary" />
              <p className="mt-2 font-serif text-sm leading-snug text-text sm:text-base">
                Every book begins with a story worth telling.
              </p>
              <span className="mt-2 block text-[9px] font-semibold uppercase tracking-wider text-secondary">
                The BookWeave philosophy
              </span>
            </div>

            <div className="absolute -right-2 top-8 grid size-11 animate-pulse place-items-center rounded-full bg-secondary text-white shadow-lg sm:-right-4 sm:size-14">
              <Feather size={23} strokeWidth={1.3} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Discover Books */}
      <section id="featured-books" className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
                A SHELF FULL OF STORIES
              </p>

              <h2 className="mt-2 font-serif text-2xl text-text sm:text-3xl lg:text-4xl">
                Discover our books<span className="text-primary">.</span>
              </h2>

              <p className="mt-2 max-w-lg text-xs leading-6 text-text-muted sm:text-sm">
                Explore published books and discover the stories behind every cover.
              </p>
            </div>

            <Link
              to="/books"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-all hover:gap-3 sm:text-sm"
            >
              View all books <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>

        {booksLoading && (
          <div className="py-12 text-center text-xs text-text-muted">
            <span className="mx-auto mb-3 block size-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            Loading published books...
          </div>
        )}

        {!booksLoading && booksError && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-muted">{booksError}</p>
            <button
              onClick={fetchBooks}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs text-white transition-colors hover:bg-primary-hover"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {!booksLoading && !booksError && books.length > 0 && (
          <>
            <div className="book-marquee">
              <div className="book-marquee-track">
                {[0, 1].map((group) => (
                  <div
                    key={group}
                    aria-hidden={group === 1}
                    className="flex shrink-0 items-start gap-4 px-4 sm:gap-5 sm:px-5"
                  >
                    {marqueeBooks.map((book, index) => (
                      <BookCover
                        key={`${group}-${book._id || index}-${index}`}
                        book={book}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Hover over the books to pause
            </p>
          </>
        )}

        {!booksLoading && !booksError && books.length === 0 && (
          <div className="px-5 py-12 text-center">
            <BookOpen size={28} className="mx-auto text-primary" />
            <h3 className="mt-3 font-serif text-lg text-text">
              Our bookshelf is growing.
            </h3>
            <p className="mt-2 text-xs text-text-muted">
              Published books will appear here soon.
            </p>
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-20 -bottom-24 size-56 rounded-full border border-secondary/30" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 sm:py-12 lg:flex-row lg:items-center lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              YOUR STORY STARTS HERE
            </p>

            <h2 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
              Have a story to tell?{' '}
              <span className="italic text-white/75">Let’s publish it.</span>
            </h2>

            <p className="mt-3 max-w-xl text-xs leading-6 text-white/75 sm:text-sm">
              Tell us about your manuscript and your publishing goals. Let’s take the first step together.
            </p>
          </Reveal>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-xs font-semibold text-text transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:text-sm"
            >
              Start an Enquiry <ArrowUpRight size={15} />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-white/40 px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Publishing Services */}
      <section className="relative overflow-hidden bg-cream py-14 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full border border-secondary/10" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-64 rounded-full border border-primary/10" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          {/* Section Heading */}
          <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary">
              WHAT WE DO
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight text-text sm:text-4xl lg:text-[42px]">
              Everything your story needs.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-text-muted sm:text-sm">
              From the first manuscript edit to the finished book, thoughtful support at every stage.
            </p>

            <div className="mx-auto mt-5 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-primary/50" />
              <span className="size-1.5 rotate-45 bg-secondary" />
              <span className="h-px w-8 bg-secondary/50" />
            </div>
          </Reveal>

          {/* Service Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {publishingServices.map((service, index) => {
              const Icon = serviceIcons[index % serviceIcons.length]
              const isTeal = index % 2 !== 0

              return (
                <Reveal
                  key={service.id || service.title}
                  delay={index % 2 === 0 ? 'delay-100' : 'delay-200'}
                >
                  <article className="group relative flex h-full flex-col overflow-hidden border border-border bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                    {/* Top Accent */}
                    <div
                      className={`absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                        isTeal ? 'bg-secondary' : 'bg-primary'
                      }`}
                    />

                    {/* Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-serif text-4xl transition-colors duration-300 ${
                          isTeal
                            ? 'text-secondary/70 group-hover:text-secondary'
                            : 'text-primary/70 group-hover:text-primary'
                        }`}
                      >
                        0{index + 1}
                      </span>

                      <span
                        className={`grid size-11 place-items-center rounded-full transition-all duration-300 group-hover:rotate-6 group-hover:text-white ${
                          isTeal
                            ? 'bg-secondary/10 text-secondary group-hover:bg-secondary'
                            : 'bg-primary/10 text-primary group-hover:bg-primary'
                        }`}
                      >
                        <Icon size={19} strokeWidth={1.5} />
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mt-7 font-serif text-lg leading-snug text-text sm:text-xl">
                      {service.title}
                    </h3>

                    <p className="mt-3 flex-1 text-xs leading-6 text-text-muted sm:text-sm">
                      {service.description}
                    </p>

                    {/* Link */}
                    <Link
                      to="/services"
                      className={`mt-6 inline-flex w-fit items-center gap-2 border-b pb-1 text-[10px] font-semibold uppercase tracking-[0.13em] transition-all duration-300 group-hover:gap-3 sm:text-[11px] ${
                        isTeal
                          ? 'border-secondary/30 text-secondary group-hover:border-secondary'
                          : 'border-primary/30 text-primary group-hover:border-primary'
                      }`}
                    >
                      Explore service
                      <ArrowRight size={13} />
                    </Link>

                    {/* Bottom Accent */}
                    <div
                      className={`mt-5 h-px w-8 transition-all duration-500 group-hover:w-14 ${
                        isTeal ? 'bg-secondary/40' : 'bg-primary/40'
                      }`}
                    />
                  </article>
                </Reveal>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <Reveal className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
            <p className="text-center text-xs text-text-muted sm:text-sm">
              Have a specific publishing requirement?
            </p>

            <Link
              to="/services"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-lg sm:text-sm"
            >
              Explore All Services
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Publishing Journey */}
      <section className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute -right-40 top-10 size-96 rounded-full border border-secondary/10" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          {/* Heading */}
          <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary">
              YOUR PUBLISHING JOURNEY
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight text-text sm:text-4xl lg:text-[42px]">
              One story. Four meaningful steps.
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-text-muted sm:text-sm">
              Every stage brings your manuscript closer to becoming a book.
            </p>

            <div className="mx-auto mt-5 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-primary/50" />
              <span className="size-1.5 rotate-45 bg-secondary" />
              <span className="h-px w-8 bg-secondary/50" />
            </div>
          </Reveal>

          {/* Timeline */}
          <div className="relative grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 lg:gap-8">
            {/* Connecting line - desktop */}
            <div className="absolute left-[12.5%] right-[12.5%] top-[25px] hidden h-px bg-border lg:block">
              <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-primary opacity-70" />
            </div>

            {steps.map(({ number, title, description, icon: Icon }, index) => {
              const isTeal = index % 2 !== 0

              return (
                <Reveal
                  key={number}
                  delay={index % 2 === 0 ? 'delay-100' : 'delay-200'}
                  className="relative"
                >
                  <article className="group">
                    {/* Timeline Node */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`grid size-[50px] place-items-center rounded-full border bg-background transition-all duration-500 group-hover:scale-110 group-hover:text-white ${
                          isTeal
                            ? 'border-secondary/40 text-secondary group-hover:border-secondary group-hover:bg-secondary'
                            : 'border-primary/40 text-primary group-hover:border-primary group-hover:bg-primary'
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.5} />
                      </div>

                      <span
                        className={`mt-3 text-[10px] font-semibold tracking-[0.2em] ${
                          isTeal ? 'text-secondary' : 'text-primary'
                        }`}
                      >
                        STEP {number}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="mt-6 text-center">
                      <h3 className="font-serif text-lg leading-snug text-text transition-colors duration-300 group-hover:text-primary sm:text-xl">
                        {title}
                      </h3>

                      <p className="mx-auto mt-3 max-w-[260px] text-xs leading-6 text-text-muted sm:text-sm">
                        {description}
                      </p>

                      <div
                        className={`mx-auto mt-5 h-[2px] w-7 transition-all duration-500 group-hover:w-14 ${
                          isTeal ? 'bg-secondary/50' : 'bg-primary/50'
                        }`}
                      />
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          {/* Closing Message */}
          <Reveal className="mt-14 border-t border-border pt-7 text-center sm:mt-16">
            <p className="font-serif text-base italic text-text-muted sm:text-lg">
              Your story deserves a beautiful beginning.
              <span className="ml-2 not-italic text-secondary">— BookWeave</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Why BookWeave */}
      <section className="relative isolate overflow-hidden bg-cream py-14 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -right-28 -top-24 -z-10 size-72 rounded-full border border-secondary/10 sm:size-96" />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 xl:gap-20">
          {/* Intro */}
          <Reveal className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary sm:text-xs">
              WHY AUTHORS CHOOSE BOOKWEAVE
            </p>

            <h2 className="mt-4 max-w-xl font-serif text-3xl leading-[1.18] text-text sm:text-4xl md:text-[42px] lg:text-[44px]">
              Your words deserve more than just a publisher.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-text-muted sm:text-base sm:leading-8">
              From the first manuscript review to the final printed pages, we bring
              the care, creativity and publishing guidance to help your book take shape.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
              <span className="h-px w-9 bg-secondary" />
              <span className="font-serif text-base italic text-secondary sm:text-lg">
                Your story. Your vision. Your book.
              </span>
            </div>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-lg sm:px-7"
            >
              Start Your Publishing Journey
              <ArrowRight size={17} />
            </Link>
          </Reveal>

          {/* Benefits */}
          <div className="grid w-full grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:gap-x-10">
            {benefits.map(({ icon: Icon, title, description }, index) => {
              const isTeal = index % 2 !== 0

              return (
                <Reveal
                  key={title}
                  delay={index % 2 === 0 ? 'delay-100' : 'delay-200'}
                >
                  <article
                    className={`group flex h-full flex-col items-center border-t py-6 text-center transition-all duration-300 sm:items-start sm:text-left ${
                      isTeal ? 'border-secondary/40' : 'border-primary/30'
                    }`}
                  >
                    <div
                      className={`mb-5 flex size-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:text-white ${
                        isTeal
                          ? 'bg-secondary/10 text-secondary group-hover:bg-secondary'
                          : 'bg-primary/10 text-primary group-hover:bg-primary'
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </div>

                    <h3 className="font-serif text-lg leading-snug text-text sm:text-xl">
                      {title}
                    </h3>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                      {description}
                    </p>

                    <div
                      className={`mt-5 h-px w-8 transition-all duration-500 group-hover:w-14 ${
                        isTeal ? 'bg-secondary' : 'bg-primary'
                      }`}
                    />
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
              A LITTLE CLARITY
            </p>

            <h2 className="mt-3 font-serif text-2xl leading-tight text-text sm:text-3xl lg:text-4xl">
              Questions before the first page?
            </h2>

            <p className="mt-3 text-xs leading-6 text-text-muted sm:text-sm sm:leading-7">
              Find answers to common questions about starting your publishing journey.
            </p>

            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-secondary transition-all hover:gap-3 sm:text-sm"
            >
              Talk to us <ArrowRight size={14} />
            </Link>
          </Reveal>

          <Reveal delay="delay-100">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Featured Authors */}
      <section className="bg-cream px-5 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-9 max-w-xl text-center sm:mb-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary">
              THE PEOPLE BEHIND THE PAGES
            </p>

            <h2 className="mt-3 font-serif text-3xl text-text sm:text-4xl">
              Meet our authors<span className="text-secondary">.</span>
            </h2>

            <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-text-muted sm:text-sm">
              Discover the voices and minds behind the books we publish.
            </p>

            <div className="mx-auto mt-5 h-px w-12 bg-secondary/60" />
          </Reveal>

          {featuredAuthors.length > 0 ? (
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {featuredAuthors.map((author, index) => (
                <Reveal
                  key={author._id || author.name}
                  delay={index % 2 === 0 ? 'delay-100' : 'delay-200'}
                  className="w-[calc(50%-8px)] max-w-[230px] sm:w-[calc(33.333%-16px)] sm:max-w-[250px]"
                >
                  <article className="group text-center">
                    <div className="relative aspect-[4/4.5] overflow-hidden bg-cover-mist shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                      {author.profileImage?.url ? (
                        <img
                          src={author.profileImage.url}
                          alt={author.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-cover-mist to-cream font-serif text-5xl text-secondary">
                          {author.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 font-serif text-base text-text transition-colors duration-300 group-hover:text-secondary sm:text-lg">
                      {author.name}
                    </h3>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              Authors will appear here soon.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}