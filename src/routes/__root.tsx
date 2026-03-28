import { Outlet, createRootRoute } from '@tanstack/react-router'
import Nav from '../components/Nav'
// Toggle between these to compare:
import AsciiCanvas from '../components/AsciiCanvasScrolling'
// import AsciiCanvas from '../components/AsciiCanvasNoise'
// import AsciiCanvas from '../components/AsciiCanvasTiled'
import sharkSvg from '../assets/marcdshark-stroke.svg?raw'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="relative h-svh flex flex-col overflow-hidden">
      <AsciiCanvas svgSource={sharkSvg} />
      <main className="relative z-1 flex-1 w-full max-w-[1126px] mx-auto px-6 max-sm:px-4 pb-24 overflow-auto">
        <Outlet />
      </main>
      <Nav />
    </div>
  )
}
