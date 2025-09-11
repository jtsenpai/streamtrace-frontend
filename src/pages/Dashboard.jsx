import { useAuth } from "../context/AuthCtx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1 className="mx-auto max-w-3xl px-4 py-16">Dashboard</h1>
      <p className="mt-2">
        Welcome, <strong>{user?.username}</strong>!
      </p>
      <button
        className="mt-4 rounded bg-slate-800 px-4 py-2 text-white"
        onClick={logout}
      >
        Logout
      </button>
    </main>
  );
}
