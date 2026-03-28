import { getLocale, locales, localizeHref, deLocalizeHref } from '../paraglide/runtime.js'

export default function LocaleSwitch({ className = '' }: { className?: string }) {
  const currentLocale = getLocale()
  const otherLocale = locales.find((l: string) => l !== currentLocale) ?? locales[0]

  function switchLocale() {
    const cleanPath = deLocalizeHref(window.location.pathname)
    const newHref = localizeHref(cleanPath, { locale: otherLocale })
    window.location.assign(newHref)
  }

  return (
    <button
      onClick={switchLocale}
      className={`font-body text-xs font-medium uppercase tracking-wider cursor-pointer bg-[var(--bg-elevated)] backdrop-blur-xl border border-[var(--border)] rounded-full px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors ${className}`}
    >
      {otherLocale.toUpperCase()}
    </button>
  )
}
