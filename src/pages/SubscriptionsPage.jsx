import { useEffect, useMemo, useState } from "react";
import { listProviders } from "../lib/api";
import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../lib/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import SubscriptionForm from "../components/SubscriptionForm";

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}
function money(v, c = "USD") {
  const n = Number(v || 0);
  return isNaN(n) ? "-" : `${c} ${n.toFixed(2)}`;
}

export default function SubscriptionsPage() {
  // Data
  const [providers, setProviders] = useState([]);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  // Filters
  const [provider, setProvider] = useState("");
  const [dueIn, setDueIn] = useState(""); // 7|14|30
  const [ordering, setOrdering] = useState("next_renewal_date");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // UI
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState(null);

  // Derived totals
  const totals = useMemo(() => {
    const sum = rows.reduce((acc, r) => acc + Number(r.price || 0), 0);
    // This is just the current page sum; for full totals you’d fetch all or compute server-side.
    return { pageTotal: sum.toFixed(2) };
  }, [rows]);

  async function fetchProviders() {
    try {
      // Bring first 100 providers for the filter (paginate if you have more)
      const data = await listProviders({ page: 1, ordering: "name" });
      const all = data.results || [];
      setProviders(all);
    } catch {
      setProviders([]);
    }
  }

  async function fetchSubs() {
    setLoading(true);
    try {
      const data = await listSubscriptions({
        provider,
        due_in_days: dueIn,
        ordering,
        page,
      });
      setRows(data.results || []);
      setCount(data.count || 0);
    } catch {
      setToast({ message: "Failed to load subscriptions", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProviders();
  }, []);
  useEffect(() => {
    fetchSubs();
  }, [provider, dueIn, ordering, page]);

  // Handlers
  async function onCreate(payload) {
    try {
      await createSubscription(payload);
      setOpenCreate(false);
      setToast({ message: "Subscription created", type: "success" });
      setPage(1);
      fetchSubs();
    } catch {
      setToast({ message: "Create failed (auth?)", type: "error" });
    }
  }

  async function onEdit(payload) {
    try {
      await updateSubscription(current.id, payload);
      setOpenEdit(false);
      setToast({ message: "Subscription updated", type: "success" });
      fetchSubs();
    } catch {
      setToast({ message: "Update failed (auth?)", type: "error" });
    }
  }

  async function onDelete() {
    try {
      await deleteSubscription(current.id);
      setOpenDelete(false);
      setToast({ message: "Subscription deleted", type: "success" });
      const lastPage = Math.max(1, Math.ceil((count - 1) / pageSize));
      setPage((p) => Math.min(p, lastPage));
      fetchSubs();
    } catch {
      setToast({ message: "Delete failed (auth?)", type: "error" });
    }
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Toast
        message={toast.message}
        type={toast.type}
        onDone={() => setToast({ message: "" })}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="rounded bg-indigo-600 px-3 py-2 text-white"
        >
          + Add Subscription
        </button>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium">Provider</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={provider}
            onChange={(e) => {
              setPage(1);
              setProvider(e.target.value);
            }}
          >
            <option value="">All</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Due in</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={dueIn}
            onChange={(e) => {
              setPage(1);
              setDueIn(e.target.value);
            }}
          >
            <option value="">Any time</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Ordering</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={ordering}
            onChange={(e) => {
              setPage(1);
              setOrdering(e.target.value);
            }}
          >
            <option value="next_renewal_date">Renewal (Soonest)</option>
            <option value="-next_renewal_date">Renewal (Latest)</option>
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="price">Price (Low→High)</option>
            <option value="-price">Price (High→Low)</option>
          </select>
        </div>

        {/* Page controls */}
        <div className="flex items-end justify-start gap-2 sm:justify-end">
          <button
            className="rounded border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600 self-center">
            Page {page} / {totalPages}
          </span>
          <button
            className="rounded border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Start
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Next renewal
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No subscriptions found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {s.provider_name || s.provider}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.plan_name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">{money(s.price, s.currency)}</td>
                  <td className="px-4 py-3">{fmtDate(s.start_date)}</td>
                  <td className="px-4 py-3">
                    {fmtDate(s.next_renewal_date)}
                    {!s.auto_renew && (
                      <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded border border-slate-300 px-3 py-1 text-sm"
                      onClick={() => {
                        setCurrent(s);
                        setOpenEdit(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 rounded bg-rose-600 px-3 py-1 text-sm text-white"
                      onClick={() => {
                        setCurrent(s);
                        setOpenDelete(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Page totals (current page only for now) */}
      <div className="mt-3 text-sm text-slate-600">
        Page total:{" "}
        <span className="font-medium">
          {money(totals.pageTotal, rows[0]?.currency || "USD")}
        </span>
      </div>

      {/* Create */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add Subscription"
        footer={null}
      >
        <SubscriptionForm
          providers={providers}
          onSubmit={onCreate}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      {/* Edit */}
      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={`Edit Subscription`}
        footer={null}
      >
        <SubscriptionForm
          initial={current}
          providers={providers}
          onSubmit={onEdit}
          onCancel={() => setOpenEdit(false)}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Subscription"
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{current?.plan_name || "this subscription"}</strong>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded border border-slate-300 px-3 py-2"
            onClick={() => setOpenDelete(false)}
          >
            Cancel
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-2 text-white"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </Modal>
    </main>
  );
}
