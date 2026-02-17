import { useEffect } from 'react'

/**
 * Payload CMS injects `?columns=[...]&limit=10` into the URL for list views.
 * Custom views don't use these params, so this hook strips them on mount
 * and intercepts pushState/replaceState to prevent Payload from re-adding them.
 */
export function useCleanPayloadUrl() {
  useEffect(() => {
    const cleanUrl = () => {
      if (window.location.search.includes('columns')) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    // Clean immediately + after Payload's deferred URL update
    cleanUrl()
    const t1 = setTimeout(cleanUrl, 0)
    const t2 = setTimeout(cleanUrl, 100)
    const t3 = setTimeout(cleanUrl, 500)

    // Intercept pushState/replaceState calls from Payload's router
    const origPushState = window.history.pushState.bind(window.history)
    const origReplaceState = window.history.replaceState.bind(window.history)

    let cleaning = false
    const intercept = (orig: typeof window.history.pushState) =>
      function (this: History, data: any, unused: string, url?: string | URL | null) {
        if (cleaning) return orig.call(this, data, unused, url)
        const result = orig.call(this, data, unused, url)
        if (!cleaning && window.location.search.includes('columns')) {
          cleaning = true
          window.history.replaceState({}, '', window.location.pathname)
          cleaning = false
        }
        return result
      } as typeof window.history.pushState

    window.history.pushState = intercept(origPushState)
    window.history.replaceState = intercept(origReplaceState)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.history.pushState = origPushState
      window.history.replaceState = origReplaceState
    }
  }, [])
}
