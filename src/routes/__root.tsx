import { useEffect } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Nav from '../components/Nav'
import AsciiCanvas from '../components/AsciiCanvas'
import LocaleSwitch from '../components/LocaleSwitch'
import sharkSvg from '../assets/marcdshark-stroke.svg?raw'
import { getLocale } from '../paraglide/runtime.js'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const locale = getLocale()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="relative h-svh flex flex-col overflow-hidden">
      <AsciiCanvas svgSource={sharkSvg} />
      <main className="relative z-1 flex-1 w-full max-w-[1126px] mx-auto px-6 max-sm:px-4 pt-20 overflow-auto">
        <Outlet />
      </main>
      <Nav />

      <LocaleSwitch className="fixed bottom-4 right-4 z-20" />
    </div>
  )
}
