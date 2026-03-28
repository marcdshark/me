import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects')({
  component: ProjectsComponent,
})

function ProjectsComponent() {
  return (
    <section className="pt-12 pb-12">
      <h1 className="font-body font-extrabold text-[clamp(2rem,5vw,3.5rem)] uppercase text-[var(--text)] text-glow-sm mb-8 tracking-tight">
        Projects
      </h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        <article className="bg-[var(--bg-elevated)] backdrop-blur-sm border border-[var(--border)] rounded-lg p-6">
          <h2 className="font-body font-bold text-xl uppercase text-[var(--text)] mb-2">
            Coming Soon
          </h2>
          <p className="font-body text-sm text-[var(--text-muted)]">
            Projects will appear here.
          </p>
        </article>
      </div>
    </section>
  )
}
