import { useEffect, useState } from "react";

const BILLING_CHOICES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom (days)" },
];

function SubscriptionForm({
  initial,
  providers = [],
  onSubmit,
  onCancel,
  busy,
}) {
  const [form, setForm] = useState({
    provider: "",
    plan_name: "",
    price: "0.00",
    currency: "USD",
    billing_cycle: "monthly",
    custom_cycle_days: 0,
    start_date: "",
    next_renewal_date: "",
    auto_renew: true,
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        provider: initial.provider || "",
        plan_name: initial.plan_name || "",
        price: String(initial.price ?? "0.00"),
        currency: initial.currency || "USD",
        billing_cycle: initial.billing_cycle || "monthly",
        custom_cycle_days: initial.billing_cycle || 0,
        start_date: initial.start_date || "",
        next_renewal_date: initial.next_renewal_date || "",
        auto_renew: Boolean(initial.auto_renew || true),
        notes: initial.notes || "",
      });
    }
  }, [initial]);

  function handle(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.provider) return setError("Provider is required.");
    if (!form.start_date) return setError("Start date is required.");
    if (
      !form.billing_cycle === "custom" &&
      (!form.custom_cycle_days || Number(form.custom_cycle_days) <= 0)
    ) {
      return setError("Custom cycle days must be > 0.");
    }
    const payload = {
      ...form,
      price: parseFloat(form.price),
      custom_cycle_days: Number(form.custom_cycle_days) || 0,
    };
    if (!payload.next_renewal_date) delete payload.next_renewal_date;
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Provider</label>
        <select
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.provider}
          onChange={(e) => handle("provider", e.target.value)}
        >
          <option value="">Select provider...</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Plan name</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={form.plan_name}
            onChange={(e) => handle("plan_name", e.target.value)}
            placeholder="Premium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={form.price}
            onChange={(e) => handle("price", e.target.value)}
            placeholder="9.99"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Currency</label>
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.currency}
          onChange={(e) => handle("currency", e.target.value)}
          placeholder="USD"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Billing Cycle</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={form.billing_cycle}
            onChange={(e) => handle("billing_cycle", e.target.value)}
          >
            {BILLING_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Custom cycle</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2"
            type="number"
            min="0"
            value={form.custom_cycle_days}
            onChange={(e) => handle("custom_cycle_days", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Start date</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={form.start_date}
            onChange={(e) => handle("start_date", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Next renewal (optional)
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={form.next_renewal_date}
            onChange={(e) => handle("next_renewal_date", e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="autoRenew"
          type="checkbox"
          checked={form.auto_renew}
          onChange={(e) => handle("auto_renew", e.target.checked)}
        />
        <label htmlFor="autoRenew" className="text-sm">
          Auto renew
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={form.notes}
          onChange={(e) => handle("notes", e.target.value)}
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

export default SubscriptionForm;
