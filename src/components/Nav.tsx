import { Link } from '@tanstack/react-router'
import SharkLogo from './SharkLogo'

export default function Nav() {
  return (
    <nav className="fixed top-3 left-3 right-3 z-10 flex items-center justify-around bg-[var(--bg-elevated)] backdrop-blur-xl border border-[var(--border)] rounded-2xl px-6 py-3">
      <Link
        to="/projects"
        activeProps={{ className: '!text-[var(--text)]' }}
        className="font-body text-sm sm:text-base font-medium tracking-wide text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:no-underline"
      >
        Projects
      </Link>

      <Link
        to="/"
        aria-label="Home"
        className="text-[var(--accent)] transition-opacity hover:opacity-70 hover:no-underline"
      >
        <SharkLogo size={48} />
      </Link>

      <Link
        to="/me"
        activeProps={{ className: '!text-[var(--text)]' }}
        className="font-body text-sm sm:text-base font-medium tracking-wide text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:no-underline"
      >
        About
      </Link>
    </nav>
  )
}
