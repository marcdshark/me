import {
  GlobeIcon,
  GithubIcon,
  XIcon,
  TikTokIcon,
  InstagramIcon,
  YoutubeIcon,
  RedditIcon,
} from './SocialIcons'
import * as m from '../paraglide/messages.js'

interface ProjectCardProps {
  title: string
  description: string
  links?: {
    website?: string
    github?: string
    x?: string
    tiktok?: string
    instagram?: string
    youtube?: string
    reddit?: string
  }
}

const SOCIAL_ENTRIES = [
  { key: 'website', Icon: GlobeIcon, label: () => m.social_website() },
  { key: 'github', Icon: GithubIcon, label: () => m.social_github() },
  { key: 'x', Icon: XIcon, label: () => m.social_x() },
  { key: 'reddit', Icon: RedditIcon, label: () => m.social_reddit() },
  { key: 'tiktok', Icon: TikTokIcon, label: () => m.social_tiktok() },
  { key: 'instagram', Icon: InstagramIcon, label: () => m.social_instagram() },
  { key: 'youtube', Icon: YoutubeIcon, label: () => m.social_youtube() },
] as const

export default function ProjectCard({ title, description, links }: ProjectCardProps) {
  const activeLinks = links
    ? SOCIAL_ENTRIES.filter(({ key }) => links[key as keyof typeof links])
    : []

  return (
    <article className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-5 flex flex-col gap-3">
      <h2 className="font-body font-bold text-base text-[var(--text)]">
        {title}
      </h2>
      <p className="font-body text-sm leading-relaxed text-[var(--text-muted)] whitespace-pre-line">
        {description}
      </p>
      {activeLinks.length > 0 && (
        <div className="flex items-center gap-3 mt-1">
          {activeLinks.map(({ key, Icon, label }) => (
            <a
              key={key}
              href={links![key as keyof typeof links]!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label()}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors hover:no-underline"
            >
              <Icon />
            </a>
          ))}
        </div>
      )}
    </article>
  )
}
