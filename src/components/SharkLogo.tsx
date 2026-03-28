export default function SharkLogo({ size = 32 }: { size?: number }) {
  const height = Math.round(size * (162 / 174))
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 174 162"
      fill="currentColor"
      aria-label="marcdshark logo"
    >
      <path d="M137.407 51.5327C103.807 9.13269 54.4075 -0.133977 33.9075 0.53269C43.0741 13.6994 61.4075 45.4327 61.4075 67.0327L137.407 51.5327Z" />
      <path d="M171.907 58.0327L77.9075 116.533L115.407 121.033L124.407 159.533L171.907 58.0327Z" />
      <path d="M0.407471 159.033L59.4075 76.0327L87.9075 103.533L0.407471 159.033Z" />
      <path d="M64.9075 73.5327L169.907 51.5327L93.9075 100.533L64.9075 73.5327Z" />
    </svg>
  )
}
