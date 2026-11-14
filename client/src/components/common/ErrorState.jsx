// (onRetry mile toh sirf wahi request dobara; warna poora page reload.)
function ErrorState({ message = 'Something went wrong.', fullPage = false, onRetry }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${fullPage ? 'min-h-screen pt-24' : 'py-16'}`}
      role="alert"
    >
      <p className="font-display text-2xl font-semibold">We could not load this right now.</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <button type="button" onClick={onRetry || (() => window.location.reload())} className="btn clay clay-coral clay-press mt-6">
        Try again
      </button>
    </div>
  )
}

export default ErrorState
