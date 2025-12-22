"use client";

export default function ProfileError({ error, reset }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Error loading profile</h1>
      <p className="mt-2 text-sm text-red-600">{error?.message || "Something went wrong."}</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
