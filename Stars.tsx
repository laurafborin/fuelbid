export function SkeletonCard() {
  return <div className="rounded-2xl h-24 bg-gray-100 animate-pulse" />
}

export function SkeletonMetric() {
  return <div className="rounded-2xl h-28 bg-gray-100 animate-pulse" />
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return <div className={`h-4 bg-gray-100 rounded animate-pulse ${width}`} />
}
