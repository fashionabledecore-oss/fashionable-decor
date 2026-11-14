import { RotateCw } from 'lucide-react'
import Loader from './Loader'
import { DoodleLamp } from './Doodles'

// (useAsync ka state lo aur sahi cheez dikhao: loader, dheema ho toh "Please wait", fail ho toh Retry.
//  Khaali-state ("We are adding photos here") yahan kabhi nahi: wo sirf successful khaali jawab par.)
function LoadState({ state, fullPage = false, label }) {
  if (state.error) return <WaitNotice fullPage={fullPage} failed onRetry={state.retry} />
  if (state.slow) return <WaitNotice fullPage={fullPage} onRetry={state.retry} />
  if (state.loading) return <Loader fullPage={fullPage} label={label} />
  return null
}

export function WaitNotice({ fullPage = false, failed = false, onRetry }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${fullPage ? 'min-h-screen pt-24' : 'py-16'}`}
      role={failed ? 'alert' : 'status'}
      aria-live="polite"
    >
      {!failed && <DoodleLamp size={30} className="mb-3 text-terracotta motion-safe:animate-pulse" aria-hidden="true" />}
      <p className="font-display text-2xl font-semibold">Please wait, loading...</p>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {failed
          ? 'We could not reach our server. It may be waking up, which can take up to a minute. Please tap Retry.'
          : 'Our server is waking up. This can take up to a minute.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn clay clay-coral clay-press mt-6">
          <RotateCw size={18} /> Retry
        </button>
      )}
    </div>
  )
}

export default LoadState
