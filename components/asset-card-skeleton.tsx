import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AssetCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Asset Info Skeleton */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Logo skeleton */}
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
              {/* Name skeleton */}
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
              {/* Symbol skeleton */}
              <Skeleton className="h-4 w-12 sm:w-16" />
            </div>
          </div>

          {/* Favorite Button Skeleton */}
          <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
        </div>

        {/* Price Info Skeleton */}
        <div className="mt-4 space-y-2">
          {/* Price skeleton */}
          <Skeleton className="h-8 sm:h-9 w-28 sm:w-36" />
          {/* Badge skeleton */}
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
