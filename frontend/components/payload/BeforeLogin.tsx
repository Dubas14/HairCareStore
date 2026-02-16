import React from 'react'

const BeforeLogin = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <img
          src="/logo.png"
          alt="HAIR LAB"
          style={{ width: '48px', height: '48px' }}
        />
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1A1A1A',
              letterSpacing: '0.05em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            HAIR
          </span>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '0.05em',
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
      <p
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#717171',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          margin: 0,
        }}
      >
        Content Management System
      </p>
    </div>
  )
}

export default BeforeLogin
