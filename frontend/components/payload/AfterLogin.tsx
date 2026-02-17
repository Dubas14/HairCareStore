import React from 'react'

const AfterLogin: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '24px',
        gap: '12px',
        animation: 'hl-fade-in 0.6s ease both',
      }}
    >
      {/* Separator */}
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(91,196,196,0.15) 30%, rgba(91,196,196,0.15) 70%, transparent)',
        }}
      />

      {/* Security notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '4px',
        }}
      >
        {/* Lock icon */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-base-400, #9aa5ab)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-base-400, #9aa5ab)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}
        >
          Захищене з&#39;єднання &bull; HAIR LAB CMS
        </span>
      </div>
    </div>
  )
}

export default AfterLogin
