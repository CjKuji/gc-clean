"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TrashModal from "@/components/trash-modal";

interface TrashItem {
  id: string;
  trash_type: string;
  floor: string;
  room: string;
  time: string; // ISO string
  quantity?: number;
  photo_urls?: string[];
  user_id: string;
}

export default function HomePage() {
  const [trashList, setTrashList] = useState<TrashItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [editingTrash, setEditingTrash] = useState<TrashItem | null>(null);
  const [deleteTrash, setDeleteTrash] = useState<TrashItem | null>(null);
  const [photoModal, setPhotoModal] = useState<string[] | null>(null);
  const router = useRouter();

  // ✅ Auth check
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

  // ✅ Fetch user trash list
  useEffect(() => {
    if (!user) return;
    const fetchTrash = async () => {
      const { data, error } = await supabase
        .from("trash")
        .select("*")
        .eq("user_id", user.id)
        .order("time", { ascending: false });

      if (error) console.error("Error fetching trash:", error.message);
      else setTrashList(data || []);
    };
    fetchTrash();
  }, [user]);

  // ✅ Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTrash || !user) return;
    try {
      const { error } = await supabase
        .from("trash")
        .delete()
        .eq("id", deleteTrash.id)
        .eq("user_id", user.id);

      if (error) throw error;
      setTrashList(prev => prev.filter(t => t.id !== deleteTrash.id));
      setDeleteTrash(null);
    } catch (err: any) {
      alert("Failed to delete: " + (err.message || err));
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="w-full bg-green-600 text-white py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <Link href="/" className="font-bold text-lg flex items-center space-x-2">
            <span>♻️ GC Clean - Trash Tracker</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user && (
              <TrashModal
                onNew={(newItem: TrashItem) =>
                  setTrashList(prev => [newItem, ...prev])
                }
              />
            )}
            <Link
              href="/leaderboard"
              className="border border-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              🏆 Leaderboard
            </Link>
            <button
              onClick={handleLogout}
              className="border border-red-200 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
            >
              🔓 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto mt-10 bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Collected Trash
          </h2>
          <div className="text-green-700 font-semibold bg-green-50 px-4 py-2 rounded-lg shadow-sm">
            🌎 Total Collected: {trashList.length} items
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Floor</th>
                <th className="px-4 py-2 text-left font-semibold">Room</th>
                <th className="px-4 py-2 text-left font-semibold">Time</th>
                <th className="px-4 py-2 text-left font-semibold">Photo</th>
                <th className="px-4 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No records found. Start by submitting trash!
                  </td>
                </tr>
              ) : (
                trashList.map(item => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {item.trash_type}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.floor}</td>
                    <td className="px-4 py-3 text-gray-700">{item.room}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(item.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {item.photo_urls?.length ? (
                        <button
                          onClick={() => setPhotoModal(item.photo_urls!)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          View Photos ({item.photo_urls.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No photo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => setEditingTrash(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTrash(item)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTrash && (
        <TrashModal
          editData={editingTrash}
          onNew={updated =>
            setTrashList(prev =>
              prev.map(t => (t.id === updated.id ? updated : t))
            )
          }
          onClose={() => setEditingTrash(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTrash && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4">🗑️ Confirm Delete</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this record?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteTrash(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {photoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 overflow-auto relative">
            <button
              onClick={() => setPhotoModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              🖼 Trash Photos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photoModal.map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  alt={`Trash ${idx + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer shadow-sm hover:opacity-80 transition"
                  onClick={() => window.open(url, "_blank")}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
