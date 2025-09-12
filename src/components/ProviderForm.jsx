import { useEffect, useState } from "react";

function ProviderForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({ name: "", url: "", logo_url: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial)
      setForm({
        name: initial.name || "",
        url: initial.url || "",
        logo_url: initial.logo_url || "",
      });
  }, [initial]);

  function handleChange(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    onSubmit?.(form);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Netflix"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Website URL</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.url}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://www.netflix.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Logo URL</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.logo_url}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="https://cdn.example/logo.png"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-300 px-3 py-2"
        >
          Cancel
        </button>
        <button
          disabled={busy}
          className="rounded bg-indigo-600 px-3 py-2 text-white disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export default ProviderForm;
