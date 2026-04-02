export default function ComplexLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>

      {/* Map skeleton */}
      <div className="h-40 bg-gray-100 rounded-2xl" />

      {/* Date picker skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-14 w-12 bg-gray-100 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Court card skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
