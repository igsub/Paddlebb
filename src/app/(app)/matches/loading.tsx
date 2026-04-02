export default function MatchesLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-gray-100 rounded-full shrink-0" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
