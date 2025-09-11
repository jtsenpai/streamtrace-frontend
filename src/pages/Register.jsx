import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as apiRegister } from "../lib/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSubmit = async (e) => {
    e.preventDefault();
    setError();

    try {
      await apiRegister(form);
      nav("/login");
    } catch {
      setError("Could not register (Username/ Email may be taken).");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => onChange("username", e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="rounded bg-indigo-600 px-4 py-2 text-white">
          Create Account
        </button>
      </form>
    </main>
  );
}
