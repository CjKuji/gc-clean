"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardRow {
  id: string;
  full_name: string;
  department: string;
  total: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const departments = ["CCS", "CBA", "CHTM", "CEAS", "CAHS", "COE", "CCJE", "CON", "SHS"];

  useEffect(() => {
    fetchLeaderboard();
  }, [deptFilter]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);

      const { data: trashData, error: trashError } = await supabase
        .from("trash")
        .select("user_id, quantity");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, department");

      if (trashError || profileError) throw trashError || profileError;

      const totals: Record<string, number> = {};
      trashData.forEach((t: any) => {
        totals[t.user_id] = (totals[t.user_id] || 0) + t.quantity;
      });

      let merged = profileData
        .filter((p: any) => totals[p.id])
        .map((p: any) => ({
          id: p.id,
          full_name: `${p.first_name} ${p.last_name}`,
          department: p.department,
          total: totals[p.id] || 0,
        }));

      if (deptFilter !== "all") {
        merged = merged.filter((r) => r.department === deptFilter);
      }

      merged.sort((a, b) => b.total - a.total);
      setRows(merged);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-green-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <a href="/" className="font-semibold text-lg tracking-wide">
            ♻️ GC Clean - Leaderboard
          </a>
          <a
            href="/"
            className="bg-white text-green-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-50 transition"
          >
            ⬅ Back
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-4 sm:mb-0 text-center sm:text-left">
            🏆 Top Trash Collectors
          </h1>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center text-gray-500 py-12 animate-pulse">Loading leaderboard...</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No contributions yet.</div>
        ) : (
          <>
            {/* Podium for top 3 */}
            <div className="grid grid-cols-3 gap-4 mb-10 text-center">
              {rows.slice(0, 3).map((row, i) => (
                <div
                  key={row.id}
                  className={`flex flex-col items-center justify-end pb-4 rounded-xl shadow-md border bg-white hover:scale-105 transition-all duration-300 ${
                    i === 0 ? "h-44 bg-gradient-to-t from-yellow-100 to-yellow-50" :
                    i === 1 ? "h-40 bg-gradient-to-t from-gray-100 to-gray-50" :
                    "h-36 bg-gradient-to-t from-amber-100 to-orange-50"
                  }`}
                >
                  <div className="text-3xl mb-1 animate-bounce">{getMedal(i + 1)}</div>
                  <p className="font-semibold text-lg text-gray-800">{row.full_name}</p>
                  <p className="text-sm text-gray-600">{row.department}</p>
                  <p className="font-bold text-green-700 mt-1">{row.total} bags</p>
                </div>
              ))}
            </div>

            {/* Remaining Collectors */}
            <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
              <table className="min-w-full text-left">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Collector</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-right">Total Bags</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(3).map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b hover:bg-green-50 transition duration-200 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        #{i + 4}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{row.full_name}</td>
                      <td className="py-3 px-4 text-gray-600">{row.department}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-700">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} GC Clean Project. All Rights Reserved.
      </footer>
    </div>
  );
}
