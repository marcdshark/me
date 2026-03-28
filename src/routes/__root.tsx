import { Outlet, createRootRoute } from '@tanstack/react-router'
import Nav from '../components/Nav'
import AsciiCanvas from '../components/AsciiCanvas'
import sharkSvg from '../assets/marcdshark-stroke.svg?raw'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="relative h-svh flex flex-col overflow-hidden">
      <AsciiCanvas svgSource={sharkSvg} />
      <main className="relative z-1 flex-1 w-full max-w-[1126px] mx-auto px-6 max-sm:px-4 pt-20 overflow-auto">
        <Outlet />
      </main>
      <Nav />
    </div>
  )
}
