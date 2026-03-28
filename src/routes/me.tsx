import { createFileRoute } from '@tanstack/react-router'
import * as m from '../paraglide/messages.js'

export const Route = createFileRoute('/me')({
  component: MeComponent,
})

function MeComponent() {
  return (
    <section className="pt-12 pb-12">
      <h1 className="font-body font-extrabold text-[clamp(2rem,5vw,3.5rem)] text-[var(--text)] text-glow-sm mb-8 tracking-tight bg-[var(--bg)] inline-block px-1.5 py-0.5 rounded-sm">
        {m.page_about_title()}
      </h1>
      <div className="max-w-prose bg-[var(--bg)] backdrop-blur-sm border border-[var(--border)] rounded-lg p-8">
        <p className="font-body text-[0.9375rem] leading-relaxed text-[var(--text-muted)] whitespace-pre-line">
          {m.page_about_text()}
        </p>
        <a
          href="mailto:bite@marcdshark.com"
          className="inline-block mt-6 font-body text-sm font-medium text-[var(--accent)] border border-[var(--accent)] rounded-full px-5 py-2 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors hover:no-underline"
        >
          {m.contact_button()}
        </a>
      </div>
    </section>
  )
}
