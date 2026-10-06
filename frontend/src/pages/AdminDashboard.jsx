import { useAuth } from "../context/useAuth";

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          AJS Admin Portal
        </p>

        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>

        <p className="mt-3 text-slate-400">
          Manage order requests and commodity availability.
        </p>
      </div>
    </main>
  );
}

export default AdminDashboard;
