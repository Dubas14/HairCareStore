import React from 'react'

const Icon = () => {
  return (
    <span
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: 'linear-gradient(135deg, #2A9D8F, #48CAE4)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '0.02em',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1,
        }}
      >
        HL
      </span>
    </span>
  )
}

export default Icon
