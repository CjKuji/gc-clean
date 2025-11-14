"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface AttendanceRecord {
  id: string;
  class_name: string;
  date: string;
  status: "Present" | "Absent" | "Missed";
  notes?: string;
  user_id: string;
}

const COLORS = ["#16a34a", "#dc2626", "#facc15"]; // green, red, yellow

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/login");
      else setUser(data.session.user);
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
      else setUser(session.user);
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // Fetch attendance
  useEffect(() => {
    if (!user) return;
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) console.error("Error fetching records:", error.message);
      else setRecords(data || []);
    };
    fetchRecords();
  }, [user]);

  const totalPresent = records.filter(r => r.status === "Present").length;
  const totalAbsent = records.filter(r => r.status === "Absent").length;
  const totalMissed = records.filter(r => r.status === "Missed").length;
  const totalClasses = records.length;

  const chartData = [
    { name: "Present", value: totalPresent },
    { name: "Absent", value: totalAbsent },
    { name: "Missed", value: totalMissed },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col justify-between p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-green-700 mb-10 text-center">GC Attendance</h1>
          <nav className="flex flex-col gap-4">
            <button className="flex items-center gap-4 text-gray-700 font-semibold p-4 rounded-xl hover:bg-green-50 transition text-lg">
              📊 <span>Dashboard</span>
            </button>
            <button className="flex items-center gap-4 text-gray-700 font-semibold p-4 rounded-xl hover:bg-green-50 transition text-lg">
              📝 <span>Attendance History</span>
            </button>
            <button className="flex items-center gap-4 text-gray-700 font-semibold p-4 rounded-xl hover:bg-green-50 transition text-lg">
              👤 <span>Profile</span>
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-8 w-full py-4 text-red-700 font-bold rounded-xl hover:bg-red-50 transition text-lg flex justify-center items-center gap-2"
        >
          🔓 Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-10">Welcome, {user?.email}</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <span className="text-green-700 text-4xl font-extrabold">{totalPresent}</span>
            <span className="text-gray-700 mt-3 text-lg font-medium">Present</span>
          </div>
          <div className="bg-gradient-to-tr from-red-50 to-red-100 rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <span className="text-red-700 text-4xl font-extrabold">{totalAbsent}</span>
            <span className="text-gray-700 mt-3 text-lg font-medium">Absent</span>
          </div>
          <div className="bg-gradient-to-tr from-yellow-50 to-yellow-100 rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <span className="text-yellow-700 text-4xl font-extrabold">{totalMissed}</span>
            <span className="text-gray-700 mt-3 text-lg font-medium">Missed</span>
          </div>
          <div className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <span className="text-blue-700 text-4xl font-extrabold">{totalClasses}</span>
            <span className="text-gray-700 mt-3 text-lg font-medium">Total Classes</span>
          </div>
        </div>

        {/* Attendance chart */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6">Attendance Overview</h3>
          <div className="w-full h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} classes`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent classes */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6">Recent Classes</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-base sm:text-lg">
              <thead className="bg-gray-50 text-gray-800 uppercase text-sm sm:text-base">
                <tr>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 5).map(record => (
                  <tr key={record.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{record.class_name}</td>
                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1 rounded-full text-white text-sm sm:text-base font-semibold ${
                          record.status === "Present"
                            ? "bg-green-600"
                            : record.status === "Absent"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{record.notes || "-"}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500 text-lg">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
