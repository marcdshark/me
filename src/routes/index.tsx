import { createFileRoute } from '@tanstack/react-router'
import * as m from '../paraglide/messages.js'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100svh-80px)] text-center">
      <p className="font-body text-[clamp(1rem,2.5vw,1.25rem)] text-[var(--text-muted)] mt-3 tracking-wide bg-[var(--bg)] px-1.5 py-0.5 rounded-sm">
        {m.home_subtitle()}
      </p>
    </section>
  )
}
