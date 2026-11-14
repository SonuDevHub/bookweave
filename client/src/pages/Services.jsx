
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, PenLine, Palette, Compass } from 'lucide-react'

// Service details
const services = [
  {
    id: 'editing',
    title: 'Editing & Proofreading',
    description:
      'Improve clarity, grammar and readability while keeping your unique writing voice intact.',
    items: ['Grammar and proofreading', 'Clarity and flow', 'Manuscript consistency'],
    icon: PenLine,
  },
  {
    id: 'design',
    title: 'Book Cover & Design',
    description:
      'Present your book with a considered cover and a clean, professionally formatted interior.',
    items: ['Cover design', 'Interior typography', 'Print-ready formatting'],
    icon: Palette,
  },
  {
    id: 'publishing',
    title: 'Publishing Support',
    description:
      'Understand the publishing process and make informed decisions about preparing your book.',
    items: ['Manuscript preparation', 'Publishing guidance', 'Print and digital formats'],
    icon: BookOpen,
  },
  {
    id: 'distribution',
    title: 'Distribution Guidance',
    description:
      'Explore practical ways to make your finished book available to its intended readers.',
    items: ['Distribution options', 'Book availability', 'Reader reach planning'],
    icon: Compass,
  },
]

// Services page
export default function Services() {
  return (
    <main>
      {/* Page introduction */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            OUR SERVICES
          </p>

          <h1 className="mt-3 max-w-2xl font-serif text-3xl leading-tight text-text sm:text-4xl">
            Thoughtful support for every stage of your book.
          </h1>

          <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-text-muted">
              From refining your manuscript to preparing it for readers, find
              the support that suits your project.
            </p>

            <Link
              to="/contact"
              className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Discuss your book <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services list */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10 lg:px-8">
          <div className="grid gap-x-12 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon

              return (
                <article
                  id={service.id}
                  key={service.id}
                  className="border-b border-border py-6 sm:py-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0 text-primary">
                      <Icon size={21} strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-xl leading-snug text-text sm:text-2xl">
                        {service.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {service.description}
                      </p>

                      <ul className="mt-3 space-y-1.5">
                        {service.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm leading-5 text-text"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>

                      <Link
                        to="/contact"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                      >
                        Enquire about this service
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing section */}
      <section className="border-t border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10 lg:px-8">
          <div>
            <h2 className="font-serif text-2xl leading-snug text-text">
              Have a manuscript in mind?
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Tell us about your book. We’ll discuss the next steps with you.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Start an enquiry <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  )
}
