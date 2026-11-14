import { useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

// (Screen ke neeche fixed message: page kahin bhi scroll ho, success/error hamesha dikhe.
//  Success 5 sec mein apne aap hat jata hai, error tab tak rehta hai jab tak band na karo.)
function AdminToast({ notice, problem, onClose }) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!notice || problem) return
    const timer = setTimeout(() => closeRef.current?.(), 5000)
    return () => clearTimeout(timer)
  }, [notice, problem])

  const message = problem || notice
  if (!message) return null
  const isError = Boolean(problem)

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-2 rounded-xl px-4 py-3 text-sm shadow-lg ${
        isError ? 'bg-danger-soft text-danger' : 'bg-ink text-white'
      }`}
      role={isError ? 'alert' : 'status'}
    >
      {isError ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
      <p className="min-w-0 flex-1">{message}</p>
      <button type="button" onClick={onClose} aria-label="Close message" className="-m-1 shrink-0 p-1 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  )
}

export default AdminToast
