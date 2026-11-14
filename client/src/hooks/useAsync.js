import { useCallback, useEffect, useState } from 'react'

// (Itne second ke baad bhi jawab na aaye toh `slow` true: Render free server ~50 sec mein jaagta hai.)
const SLOW_AFTER_MS = 6000

// (fetcher ek function hai jo promise deta hai. key badalte hi ya retry() par dobara fetch hota hai.)
export function useAsync(fetcher, key) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const [slowKey, setSlowKey] = useState(null)
  const fullKey = `${key}#${attempt}`

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) setSlowKey(fullKey)
    }, SLOW_AFTER_MS)
    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ key: fullKey, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: fullKey, data: null, error })
      })
      .finally(() => clearTimeout(timer))
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const loading = result.key !== fullKey
  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
    slow: loading && slowKey === fullKey,
    retry,
  }
}
