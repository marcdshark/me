import { createFileRoute } from '@tanstack/react-router'
import ProjectCard from '../components/ProjectCard'
import * as m from '../paraglide/messages.js'

export const Route = createFileRoute('/projects')({
  component: ProjectsComponent,
})

const projects = [
  {
    title: () => m.project_openclaw_memory_cdc_title(),
    description: () => m.project_openclaw_memory_cdc_description(),
    links: {
      github: 'https://github.com/marcdshark/openclaw-memory-cdc',
    },
  },
  {
    title: () => m.project_draco_title(),
    description: () => m.project_draco_description(),
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
        {m.page_projects_title()}
      </h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        {projects.map((project, i) => (
          <ProjectCard
            key={i}
            title={project.title()}
            description={project.description()}
            links={project.links}
          />
        ))}
      </div>
    </section>
  )
}
