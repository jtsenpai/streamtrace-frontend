import { useEffect, useState } from "react";
import { getDashboardSummary } from "../lib/api";
import { Link } from "react-router-dom";

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export default function Dashboard() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await getDashboardSummary(days);
      setData(d);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [days]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Upcoming window</label>
          <select
            className="rounded border border-slate-300 p-2"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Total subscriptions">
          {loading ? "…" : data?.totals?.count ?? 0}
        </Card>
        <Card title="Monthly spend (est.)">
          {loading
            ? "…"
            : `USD ${Number(data?.totals?.monthly || 0).toFixed(2)}`}
        </Card>
        <Card title="Yearly spend (est.)">
          {loading
            ? "…"
            : `USD ${Number(data?.totals?.yearly || 0).toFixed(2)}`}
        </Card>
      </div>

      {/* Upcoming renewals */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Upcoming renewals</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Provider</Th>
                <Th>Plan</Th>
                <Th>Price</Th>
                <Th>Renewal</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <Row>
                  <Td colSpan={5}>Loading…</Td>
                </Row>
              )}
              {!loading && (data?.upcoming?.length ?? 0) === 0 && (
                <Row>
                  <Td colSpan={5}>Nothing due soon.</Td>
                </Row>
              )}
              {!loading &&
                data?.upcoming?.map((u) => (
                  <Row key={u.id}>
                    <Td>{u.provider_name}</Td>
                    <Td>
                      {u.plan_name || <span className="text-slate-400">—</span>}
                    </Td>
                    <Td>
                      {u.currency} {Number(u.price || 0).toFixed(2)}
                    </Td>
                    <Td>
                      {fmtDate(u.next_renewal_date)}{" "}
                      {!u.auto_renew && (
                        <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Manual
                        </span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <Link
                        className="text-indigo-600 hover:underline"
                        to="/subscriptions"
                      >
                        Manage
                      </Link>
                    </Td>
                  </Row>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* By provider */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">By provider</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Provider</Th>
                <Th>Count</Th>
                <Th>Monthly est.</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <Row>
                  <Td colSpan={3}>Loading…</Td>
                </Row>
              )}
              {!loading && (data?.by_provider?.length ?? 0) === 0 && (
                <Row>
                  <Td colSpan={3}>No data yet.</Td>
                </Row>
              )}
              {!loading &&
                data?.by_provider?.map((r) => (
                  <Row key={r.provider}>
                    <Td>{r.provider}</Td>
                    <Td>{r.count}</Td>
                    <Td>USD {Number(r.monthly || 0).toFixed(2)}</Td>
                  </Row>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{children}</div>
    </div>
  );
}
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
      {children}
    </th>
  );
}
function Row({ children }) {
  return <tr className="hover:bg-slate-50">{children}</tr>;
}
function Td({ children, colSpan, className = "" }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}
