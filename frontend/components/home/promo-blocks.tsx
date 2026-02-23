import Link from 'next/link'
import { PromoBlock, getImageUrl } from '@/lib/payload/types'
import { CountdownTimer } from '@/components/ui/countdown-timer'

interface PromoBlocksProps {
  blocks: PromoBlock[]
}

export function PromoBlocks({ blocks }: PromoBlocksProps) {
  if (blocks.length === 0) return null

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map((block) => {
            const imageUrl = getImageUrl(block.image)

            return (
              <div
                key={block.id}
                className="relative overflow-hidden rounded-2xl p-6 min-h-[200px] flex flex-col justify-between"
                style={{ backgroundColor: block.backgroundColor || '#1a1a1a' }}
              >
                {/* Background image if exists */}
                {imageUrl && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {block.title}
                  </h3>
                  {block.description && (
                    <p className="text-white/80 mb-4">
                      {typeof block.description === 'string'
                        ? block.description
                        : ''}
                    </p>
                  )}
                  {block.expiresAt && (
                    <CountdownTimer targetDate={block.expiresAt} className="mt-2" />
                  )}
                </div>

                {/* Button */}
                {block.buttonLink && block.buttonText && (
                  <div className="relative z-10">
                    <Link
                      href={block.buttonLink}
                      className="inline-block bg-white text-neutral-900 px-6 py-2 rounded-full font-medium hover:bg-neutral-100 transition-colors"
                    >
                      {block.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
