import { getStats } from "@/lib/tracking";

export const dynamic = "force-dynamic";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const TYPE_COLORS: Record<string, string> = {
  page_view: "bg-blue-100 text-blue-800",
  no_hover: "bg-red-100 text-red-800",
  no_click: "bg-orange-100 text-orange-800",
  yes_click: "bg-green-100 text-green-800",
  mouse_move: "bg-gray-100 text-gray-600",
};

export default async function StatsPage() {
  const stats = await getStats();

  const cards = [
    { label: "Sessions", value: stats.sessions, color: "text-purple-600" },
    { label: "Page Views", value: stats.pageViews, color: "text-blue-600" },
    { label: "No Hovers", value: stats.noHoverCount, color: "text-red-600" },
    { label: "Yes Clicks", value: stats.yesClickCount, color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Tracking Stats</h1>
            <p className="mt-1 text-sm text-gray-500">
              Mouse movement & button interaction analytics
            </p>
          </div>
          <a
            href="/"
            className="rounded-lg bg-pink-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500"
          >
            ← Back to app
          </a>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className={`mt-1 text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Extra stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Events</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalEvents}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">No Clicks</p>
            <p className="text-xl font-bold text-gray-900">{stats.noClickCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Mouse Moves</p>
            <p className="text-xl font-bold text-gray-900">{stats.mouseMoveCount}</p>
          </div>
        </div>

        {/* Yes click details */}
        {stats.yesClicks.length > 0 && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="font-semibold text-gray-800">
                🩷 Yes Button Clicks ({stats.yesClicks.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">When</th>
                    <th className="px-5 py-2 font-medium">Session</th>
                    <th className="px-5 py-2 font-medium">No attempts at click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.yesClicks.map((yc, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-2 text-gray-700">{formatTime(yc.timestamp)}</td>
                      <td className="px-5 py-2 font-mono text-xs text-gray-500">{yc.sessionId}</td>
                      <td className="px-5 py-2 text-gray-700">{yc.attemptNumber ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent events */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3">
            <h2 className="font-semibold text-gray-800">
              Recent Events (last 50)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Type</th>
                  <th className="px-5 py-2 font-medium">Time</th>
                  <th className="px-5 py-2 font-medium">Session</th>
                  <th className="px-5 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      No events recorded yet
                    </td>
                  </tr>
                ) : (
                  stats.recentEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[e.type] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-gray-700">{formatTime(e.timestamp)}</td>
                      <td className="px-5 py-2 font-mono text-xs text-gray-500">{e.sessionId}</td>
                      <td className="px-5 py-2 text-gray-600">
                        {e.attemptNumber != null && `attempt #${e.attemptNumber}`}
                        {e.position && `(${e.position.x}, ${e.position.y})`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
