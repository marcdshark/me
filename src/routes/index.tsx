import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100svh-80px)] text-center">
      <p className="font-body text-[clamp(1rem,2.5vw,1.25rem)] text-[var(--text-muted)] mt-3 tracking-wide">
        Software Engineer and builder
      </p>
    </section>
  )
}
