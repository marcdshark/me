import { Link } from '@tanstack/react-router'
import SharkLogo from './SharkLogo'

export default function Nav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 flex items-center justify-around bg-[var(--bg-elevated)] backdrop-blur-xl border-t border-[var(--border)] rounded-t-2xl px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <Link
        to="/projects"
        activeProps={{ className: '!text-[var(--text)]' }}
        className="font-body text-sm sm:text-base font-medium uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:no-underline"
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
        className="font-body text-sm sm:text-base font-medium uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:no-underline"
      >
        Me
      </Link>
    </nav>
  )
}
