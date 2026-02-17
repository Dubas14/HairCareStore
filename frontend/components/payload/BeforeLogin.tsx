import React from 'react'

const KEYFRAMES = `
@keyframes hl-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hl-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hl-badge-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(91,196,196,0.4), 0 8px 32px rgba(91,196,196,0.2); }
  50%       { box-shadow: 0 0 0 10px rgba(91,196,196,0), 0 8px 32px rgba(91,196,196,0.2); }
}
`

const BeforeLogin: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '28px',
          animation: 'hl-fade-in 0.5s ease both',
        }}
      >
        {/* HL badge */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #5bc4c4, #4a9e9e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'hl-badge-glow 3s ease-in-out infinite',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.06em',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            HL
          </span>
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '34px',
              fontWeight: 800,
              color: 'var(--color-base-800, #1a2026)',
              letterSpacing: '0.04em',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
            }}
          >
            HAIR
          </span>
          <span
            style={{
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #5bc4c4, #4a9e9e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LAB
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--color-base-400, #9aa5ab)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            fontFamily: 'Inter, sans-serif',
            marginBottom: '20px',
          }}
        >
          Admin Panel
        </span>

        {/* Shimmer divider */}
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #5bc4c4, #7dd3d3, #5bc4c4, #7dd3d3)',
            backgroundSize: '200% 200%',
            animation: 'hl-shimmer 3s ease infinite',
            marginBottom: '24px',
          }}
        />

        {/* Welcome text */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-base-800, #1a2026)',
            margin: '0 0 8px 0',
            textAlign: 'center' as const,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          Вітаємо в панелі управління
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-base-400, #9aa5ab)',
            margin: '0',
            textAlign: 'center' as const,
            fontFamily: 'Inter, sans-serif',
            lineHeight: '1.5',
          }}
        >
          Введіть свої дані для входу в систему
        </p>

        {/* Bottom separator */}
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            height: '1px',
            marginTop: '28px',
            background:
              'linear-gradient(90deg, transparent, rgba(91,196,196,0.2) 30%, rgba(91,196,196,0.2) 70%, transparent)',
          }}
        />
      </div>
    </>
  )
}

export default BeforeLogin
