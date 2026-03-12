import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">E-commerce Admin Dashboard</h1>
        <p className="text-slate-600 max-w-md">
          Manage products, orders, customers, sellers, categories, brands, and payments in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
