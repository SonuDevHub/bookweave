
import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { API_URL, parseJsonSafe } from '../config/api'

// Form defaults
const initialForm = {
  authorName: '',
  email: '',
  phone: '',
  bookTitle: '',
  genre: '',
  manuscriptStatus: '',
  services: [],
  message: '',
}

const serviceOptions = [
  'Editing & Proofreading',
  'Book Design',
  'Publishing Support',
  'Distribution Guidance',
]

// Contact page
export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const toggleService = (service) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await parseJsonSafe(response)

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to submit enquiry.')
      }

      setForm(initialForm)
      toast.success('Thank you. Your enquiry has been submitted.')
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-text outline-none transition-colors focus:border-primary'

  return (
    <main className="bg-background">
      {/* Page introduction */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:py-20 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            GET IN TOUCH
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-text sm:text-5xl lg:text-6xl">
            Tell us about your book.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-muted">
            Every publishing journey starts somewhere. Share a little about
            your manuscript and what you hope to achieve.
          </p>
        </div>
      </section>

      {/* Enquiry form */}
      <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16 lg:py-20">
        <div className="mb-9 border-b border-border pb-6">
          <h2 className="font-serif text-2xl text-text sm:text-3xl">
            Your project details
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-9">
          {/* Contact details */}
          <fieldset>
            <legend className="mb-5 text-sm font-semibold uppercase tracking-wider text-text">
              01 — Your details
            </legend>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-text">
                Full name *
                <input
                  className={inputClass}
                  name="authorName"
                  value={form.authorName}
                  onChange={updateField}
                  autoComplete="name"
                  maxLength={100}
                  required
                  placeholder="Your full name"
                />
              </label>

              <label className="text-sm font-medium text-text">
                Email address *
                <input
                  className={inputClass}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="you@example.com"
                />
              </label>

              <label className="text-sm font-medium text-text sm:col-span-2">
                Phone number
                <input
                  className={inputClass}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  maxLength={25}
                  placeholder="Your contact number"
                />
              </label>
            </div>
          </fieldset>

          {/* Book details */}
          <fieldset className="border-t border-border pt-8">
            <legend className="mb-5 text-sm font-semibold uppercase tracking-wider text-text">
              02 — About your book
            </legend>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-text">
                Working title
                <input
                  className={inputClass}
                  name="bookTitle"
                  value={form.bookTitle}
                  onChange={updateField}
                  maxLength={150}
                  placeholder="Your book's title"
                />
              </label>

              <label className="text-sm font-medium text-text">
                Genre
                <select
                  className={inputClass}
                  name="genre"
                  value={form.genre}
                  onChange={updateField}
                >
                  <option value="">Choose a genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-fiction">Non-fiction</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Academic">Academic</option>
                  <option value="Children">Children’s books</option>
                  <option value="Memoir">Memoir</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="text-sm font-medium text-text sm:col-span-2">
                Manuscript stage
                <select
                  className={inputClass}
                  name="manuscriptStatus"
                  value={form.manuscriptStatus}
                  onChange={updateField}
                >
                  <option value="">Choose your current stage</option>
                  <option value="Idea">I have an idea</option>
                  <option value="In Progress">I'm still writing</option>
                  <option value="Editing">My manuscript needs editing</option>
                  <option value="Ready">My manuscript is ready</option>
                </select>
              </label>
            </div>
          </fieldset>

          {/* Requested services */}
          <fieldset className="border-t border-border pt-8">
            <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-text">
              03 — How can we help?
            </legend>

            <p className="mb-5 text-sm leading-6 text-text-muted">
              Select any services you would like to discuss.
            </p>

            <div className="grid gap-x-8 sm:grid-cols-2">
              {serviceOptions.map((service) => (
                <label
                  key={service}
                  className="flex cursor-pointer items-center gap-3 border-b border-border py-4 text-sm text-text"
                >
                  <input
                    type="checkbox"
                    checked={form.services.includes(service)}
                    onChange={() => toggleService(service)}
                    className="size-4 accent-primary"
                  />
                  {service}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Additional message */}
          <fieldset className="border-t border-border pt-8">
            <legend className="mb-5 text-sm font-semibold uppercase tracking-wider text-text">
              04 — Anything else?
            </legend>

            <label className="text-sm font-medium text-text">
              Tell us about your project
              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                name="message"
                value={form.message}
                onChange={updateField}
                rows={5}
                maxLength={3000}
                placeholder="Share your goals, questions or anything else we should know."
              />
            </label>
            <p className="mt-2 text-right text-xs text-text-muted">
              {form.message.length}/3000
            </p>
          </fieldset>

          {/* Submit */}
          <div className="border-t border-border pt-7">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Submitting enquiry…' : 'Send your enquiry'}
              {!submitting && <ArrowRight size={17} />}
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-muted">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" />
              Your enquiry will be used to understand your project and respond
              to your request.
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}
