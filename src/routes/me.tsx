import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/me')({
  component: MeComponent,
})

function MeComponent() {
  return (
    <section className="pt-12 pb-12">
      <h1 className="font-body font-extrabold text-[clamp(2rem,5vw,3.5rem)] text-[var(--text)] text-glow-sm mb-8 tracking-tight bg-[var(--bg)] inline-block px-1.5 py-0.5 rounded-sm">
        About
      </h1>
      <div className="max-w-prose bg-[var(--bg)] backdrop-blur-sm border border-[var(--border)] rounded-lg p-8">
        <p className="font-body text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
          Software engineer and builder. More details coming soon.
        </p>
      </div>
    </section>
  )
}
