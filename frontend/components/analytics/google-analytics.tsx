'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

/**
 * Google Analytics 4 component.
 * The inline script content is static and uses only the server-provided
 * measurementId env var — no user input is interpolated.
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  )
}
