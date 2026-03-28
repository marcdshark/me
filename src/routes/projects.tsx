import { createFileRoute } from '@tanstack/react-router'
import ProjectCard from '../components/ProjectCard'

export const Route = createFileRoute('/projects')({
  component: ProjectsComponent,
})

const projects = [
  {
    title: 'Draco Platform',
    description:
      'A decentralized lottery system built on the Solana blockchain.\n\nThe purpose of this project was to explore Solana capabilities from local development to production, never to do any presale or make any money out of it.',
    links: {
      website: 'https://www.draco-platform.com/',
      github: 'https://github.com/draco-platform/protocol',
      x: 'https://x.com/dracoplatform',
      tiktok: 'https://www.tiktok.com/@dracoplatform',
      instagram: 'https://www.instagram.com/dracoplatform/',
      youtube: 'https://www.youtube.com/@dracoplatform',
      reddit: 'https://www.reddit.com/r/dracoplatform/',
    },
  },
]

function ProjectsComponent() {
  return (
    <section className="pt-12 pb-12">
      <h1 className="font-body font-extrabold text-[clamp(2rem,5vw,3.5rem)] text-[var(--text)] text-glow-sm mb-8 tracking-tight bg-[var(--bg)] inline-block px-1.5 py-0.5 rounded-sm">
        Projects
      </h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  )
}
