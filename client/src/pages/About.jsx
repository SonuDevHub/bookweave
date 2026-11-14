
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Feather, Users } from 'lucide-react'

// About page
export default function About() {
  return (
    <main>
      {/* Introduction */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            ABOUT BOOKWEAVE
          </p>

          <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-text sm:text-4xl lg:text-5xl">
            Every book begins with an idea. We help it find its way.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
            BookWeave is being built around a simple belief: authors deserve
            thoughtful guidance, clear communication and care for the stories
            they want to share.
          </p>
        </div>
      </section>

      {/* Our approach */}
      <section className="bg-background">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              OUR APPROACH
            </p>

            <h2 className="mt-3 font-serif text-2xl leading-snug text-text sm:text-3xl">
              Publishing should feel considered, not complicated.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-text-muted sm:text-base">
            <p>
              Writing a book takes time, effort and imagination. Turning that
              manuscript into a finished publication brings its own decisions
              about editing, design, preparation and distribution.
            </p>

            <p>
              Our aim is to make those steps easier to understand, helping
              authors explore their options and decide what makes sense for
              their individual projects.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-9 sm:py-11 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              WHAT MATTERS TO US
            </p>
            <h2 className="mt-3 font-serif text-2xl text-text sm:text-3xl">
              A thoughtful process, from start to finish.
            </h2>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-8">
            <article className="border-t border-border pt-4">
              <Feather size={22} strokeWidth={1.5} className="text-primary" />
              <h3 className="mt-3 font-serif text-xl text-text">
                Respect the story
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Every manuscript has its own voice, purpose and intended
                audience.
              </p>
            </article>

            <article className="border-t border-border pt-4">
              <Users size={22} strokeWidth={1.5} className="text-primary" />
              <h3 className="mt-3 font-serif text-xl text-text">
                Work with authors
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Clear conversations help authors understand their choices and
                next steps.
              </p>
            </article>

            <article className="border-t border-border pt-4">
              <BookOpen size={22} strokeWidth={1.5} className="text-primary" />
              <h3 className="mt-3 font-serif text-xl text-text">
                Care about details
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Good preparation brings together readability, presentation
                and consistency.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Closing section */}
      <section className="bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:py-11 lg:px-8">
          <div>
            <h2 className="font-serif text-2xl text-text">
              Tell us about the book you’re writing.
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Let’s discuss your manuscript and the support you may need.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Get in touch <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  )
}
