import { Skeleton } from '@/components/ui/skeleton'

export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            <div className="flex lg:flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="flex-1 aspect-square rounded-card" />
          </div>

          {/* Buy Box Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />

            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-5 h-5 rounded-full" />
              ))}
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>

            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 rounded-lg" />
              ))}
            </div>

            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full rounded-button" />

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </div>
        </div>

        <hr className="my-12 border-border" />

        {/* Ingredients Skeleton */}
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-48 h-40 rounded-card flex-shrink-0" />
          ))}
        </div>
      </div>
    </main>
  )
}
