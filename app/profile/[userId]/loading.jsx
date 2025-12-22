export default function LoadingProfile() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-6 grid gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
