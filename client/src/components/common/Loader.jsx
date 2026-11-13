import { DoodleLamp } from './Doodles'

function Loader({ fullPage = false, label = 'Loading...' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-muted ${fullPage ? 'min-h-screen pt-24' : 'py-16'}`}
      role="status"
    >
      <DoodleLamp size={30} className="text-terracotta motion-safe:animate-pulse" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export default Loader
