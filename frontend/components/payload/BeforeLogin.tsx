import React from 'react'

// Keyframe animation injected once via a <style> tag.
// Safe here because Payload renders this inside the document body.
const KEYFRAMES = `
@keyframes hl-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hl-fade-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hl-badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(42, 157, 143, 0.35), 0 8px 24px rgba(42, 157, 143, 0.30); }
  50%       { box-shadow: 0 0 0 8px rgba(42, 157, 143, 0), 0 8px 24px rgba(42, 157, 143, 0.30); }
}
`

const BeforeLogin: React.FC = () => {
  return (
    <>
      {/* Inject keyframes — scoped by animation name prefix "hl-" */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '40px',
          animation: 'hl-fade-in 0.5s ease both',
        }}
      >
        {/* ── Decorative dot grid ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '80px',
            backgroundImage:
              'radial-gradient(circle, rgba(42,157,143,0.18) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Badge + wordmark row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            marginTop: '8px',
          }}
        >
          {/* Badge */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2A9D8F 0%, #3BB8A8 45%, #48CAE4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'hl-badge-pulse 3s ease-in-out infinite',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.04em',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              HL
            </span>
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '7px',
              }}
            >
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '-0.03em',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1,
                }}
              >
                HAIR
              </span>
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #2A9D8F 0%, #48CAE4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                LAB
              </span>
            </div>
            {/* Thin sub-wordmark label */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#9ca3af',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, system-ui, sans-serif',
                paddingLeft: '2px',
              }}
            >
              Admin Panel
            </span>
          </div>
        </div>

        {/* ── Animated shimmer divider ── */}
        <div
          aria-hidden="true"
          style={{
            width: '80px',
            height: '3px',
            borderRadius: '2px',
            background:
              'linear-gradient(90deg, #2A9D8F, #48CAE4, #2A9D8F, #48CAE4)',
            backgroundSize: '200% 200%',
            animation: 'hl-shimmer 3s ease infinite',
            marginBottom: '24px',
          }}
        />

        {/* ── Welcome copy ── */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.01em',
            fontFamily: 'Inter, system-ui, sans-serif',
            margin: '0 0 8px',
            textAlign: 'center',
          }}
        >
          Вітаємо в панелі управління
        </h2>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#6b7280',
            fontFamily: 'Inter, system-ui, sans-serif',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Введіть свої дані для входу в систему
        </p>

        {/* ── Bottom separator before the Payload form ── */}
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(42,157,143,0.25) 30%, rgba(72,202,228,0.25) 70%, transparent)',
            marginTop: '32px',
          }}
        />
      </div>
    </>
  )
}

export default BeforeLogin
