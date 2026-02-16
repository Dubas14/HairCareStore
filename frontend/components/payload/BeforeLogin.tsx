import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2A9D8F, #48CAE4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '0.02em',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
            }}
          >
            HL
          </span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '34px',
              fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            HAIR
          </span>
          <span
            style={{
              fontSize: '34px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, sans-serif',
              background: 'linear-gradient(135deg, #2A9D8F, #48CAE4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LAB
          </span>
        </span>
      </div>
      <div
        style={{
          width: '40px',
          height: '2px',
          borderRadius: '1px',
          background: 'linear-gradient(90deg, #2A9D8F, #48CAE4)',
          marginBottom: '12px',
        }}
      />
      <p
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#9ca3af',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          margin: 0,
        }}
      >
        Панель управління
      </p>
    </div>
  )
}

export default BeforeLogin
