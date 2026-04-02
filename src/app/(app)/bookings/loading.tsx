export default function BookingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-36" />
      <div className="h-4 bg-gray-100 rounded w-24" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-3.5 bg-gray-100 rounded w-56" />
              <div className="h-3.5 bg-gray-100 rounded w-32 mt-2" />
              <div className="h-3.5 bg-gray-100 rounded w-48" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
