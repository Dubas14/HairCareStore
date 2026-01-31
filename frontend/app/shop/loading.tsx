import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <Skeleton className="h-6 w-24" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-44" />
            </div>

            {/* Product grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-card rounded-card p-4 shadow-soft">
                  <Skeleton className="aspect-square mb-4 rounded-card" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-full mb-1" />
                  <Skeleton className="h-5 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-20 mb-4" />
                  <Skeleton className="h-10 w-full rounded-button" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
