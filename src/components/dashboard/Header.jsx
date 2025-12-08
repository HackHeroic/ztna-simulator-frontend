import { Clock, Shield, RefreshCcw, LogOut } from "lucide-react";

export default function Header({ lastRefreshed, loading, refreshAll, onLogout }) {
  return (
    <header className="bg-white border-b-4 border-orange-500 shadow-lg p-6 rounded-b-[2rem] flex justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center">
          <Shield />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ZTNA Security Console</h1>
          <p className="text-xs text-gray-500">Zero Trust • Continuous Risk</p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock size={14} />
          <span>Last sync: {lastRefreshed || "Loading..."}</span>
          {loading && <span className="animate-pulse text-orange-600">Refreshing…</span>}
        </div>

        <div className="flex gap-3 mt-2">
          <button onClick={refreshAll} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full flex gap-1 text-sm">
            <RefreshCcw size={14} /> Refresh
          </button>

          <button onClick={onLogout} className="bg-orange-500 text-white px-4 py-2 rounded-full flex gap-1 text-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
