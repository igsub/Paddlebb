export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 bg-gray-200 rounded-lg w-36" />
        <div className="h-4 bg-gray-100 rounded w-48" />
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        ))}
        <div className="h-11 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-11 bg-gray-100 rounded-xl" />
    </div>
  );
}
