import React from 'react'

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
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        className="flex flex-col items-center pb-10"
        style={{ animation: 'hl-fade-in 0.5s ease both' }}
      >
        {/* Decorative dot grid */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(42,157,143,0.18) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage:
              'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 100% at 50% 0%, black 40%, transparent 100%)',
          }}
        />

        {/* Badge + wordmark row */}
        <div className="flex items-center gap-4 mb-5 mt-2">
          {/* Badge */}
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2A9D8F] via-[#3BB8A8] to-[#48CAE4] flex items-center justify-center flex-shrink-0"
            style={{ animation: 'hl-badge-pulse 3s ease-in-out infinite' }}
          >
            <span className="text-xl font-extrabold text-white tracking-wider font-sans leading-none select-none">
              HL
            </span>
          </div>

          {/* Wordmark */}
          <div className="flex flex-col gap-px">
            <div className="inline-flex items-baseline gap-[7px]">
              <span className="text-[42px] font-extrabold text-gray-900 tracking-tight font-sans leading-none">
                HAIR
              </span>
              <span className="text-[42px] font-extrabold tracking-tight font-sans leading-none bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] bg-clip-text text-transparent">
                LAB
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 tracking-[0.22em] uppercase font-sans pl-0.5">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Animated shimmer divider */}
        <div
          aria-hidden="true"
          className="w-20 h-[3px] rounded-sm mb-6"
          style={{
            background:
              'linear-gradient(90deg, #2A9D8F, #48CAE4, #2A9D8F, #48CAE4)',
            backgroundSize: '200% 200%',
            animation: 'hl-shimmer 3s ease infinite',
          }}
        />

        {/* Welcome copy */}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans m-0 mb-2 text-center">
          Вітаємо в панелі управління
        </h2>
        <p className="text-sm text-gray-500 font-sans m-0 text-center leading-relaxed">
          Введіть свої дані для входу в систему
        </p>

        {/* Bottom separator */}
        <div
          aria-hidden="true"
          className="w-full h-px mt-8"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(42,157,143,0.25) 30%, rgba(72,202,228,0.25) 70%, transparent)',
          }}
        />
      </div>
    </>
  )
}

export default BeforeLogin
