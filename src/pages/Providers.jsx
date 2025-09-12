import { useEffect, useMemo, useState } from "react";
import {
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../lib/api";
import Modal from "../components/Modal";
import ProviderForm from "../components/ProviderForm";
import Toast from "../components/Toast";

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export default function ProvidersPage() {
  // Table state
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("name");

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState(false);
  const pageSize = 10;

  // Fetch list whenever filters change
  async function fetchList() {
    setLoading(true);
    try {
      const data = await listProviders({ search, ordering, page });
      setRows(data.results || []);
      setCount(data.count || 0);
    } catch {
      setToast({ message: "Failed to load providers", type: "error" });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchList();
  }, [search, ordering, page]);

  // Create
  async function onCreate(payload) {
    try {
      await createProvider(payload);
      setOpenCreate(false);
      setToast({ message: "Provider created", type: "success" });
      setPage(1);
      fetchList();
    } catch {
      setToast({ message: "Create failed (auth required?)", type: "error" });
    }
  }
  // Edit
  async function onEdit(payload) {
    try {
      await updateProvider(current.id, payload);
      setOpenEdit(false);
      setToast({ message: "Provider updated", type: "success" });
      fetchList();
    } catch {
      setToast({ message: "Update failed (auth required?)", type: "error" });
    }
  }

  // Delete
  async function onDelete() {
    try {
      await deleteProvider(false);
      setToast({ message: "Provider deleted", type: "success" });
      const lastPage = Math.max(1, Math.ceil((count - 1) / pageSize));
      setPage((p) => Math.min(p, lastPage));
      fetchList();
    } catch {
      setToast({ message: "Delete failed (auth required?)", type: "error" });
    }
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count]
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDone={() => setToast({ message: "" })}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Providers</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded bg-indigo-600 px-3 py-2 text-white"
          >
            Add Provider
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            className="w-64 rounded border border-slate-300 p-2"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="rounded border border-slate-300 p-2"
            value={ordering}
            onChange={(e) => {
              setPage(1);
              setOrdering(e.target.value);
            }}
          >
            <option value="name">Name (A+Z)</option>
            <option value="-name">Name (Z+A)</option>
            <option value="-created_at">Newest</option>
            <option value="+created_at">Oldest</option>
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
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
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              Logo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              Website
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
              Actions
            </th>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Loading....
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No providers found.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-slate-200" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">
                      Added: {fmtDate(p.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.url ? (
                      <a
                        className="text-indigo-600 hover:underline"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.url}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded border border-slate-300 px-3 py-1 text-sm"
                      onClick={() => {
                        setCurrent(p);
                        setOpenEdit(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 rounded bg-rose-600 px-3 py-1 text-sm text-white"
                      onClick={() => {
                        setCurrent(p);
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

      {/* Create Modal */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add Provider"
        footer={null}
      >
        <ProviderForm
          onSubmit={onCreate}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={`Edit: ${current?.name || ""}`}
        footer={null}
      >
        <ProviderForm
          initial={current}
          onSubmit={onEdit}
          onCancel={() => setOpenEdit(false)}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Provider"
      >
        <p>
          Are you sure you want to delete <strong>{current?.name}</strong>? This
          action cannot be undone.
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
