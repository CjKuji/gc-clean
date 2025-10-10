"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submittedTrash, setSubmittedTrash] = useState([]);
  const [editingTrash, setEditingTrash] = useState(null); // for editing modal

  // 🔹 Categories and Points
  const categories = {
    Plastic: ["Bottles", "Bags"],
    Cans: ["Soda Can", "Beer Can"],
    Glass: ["Jars", "Bottles"],
  };

  const points = {
    Bottles: 10,
    Bags: 5,
    "Soda Can": 8,
    "Beer Can": 10,
    Jars: 12,
  };

  // 🧠 Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchSubmittedTrash(parsed.id);
    }
  }, []);

  // 📦 Fetch submitted trash
  const fetchSubmittedTrash = async (user_id) => {
    try {
      const res = await fetch(`http://localhost/gc-clean-api-api/api/get_trash.php?user_id=${user_id}`);
      const data = await res.json();
      setSubmittedTrash(data);
      const total = data.reduce((sum, t) => sum + Number(t.points), 0);
      setUserPoints(total);
    } catch (err) {
      console.error("Error fetching trash:", err);
    }
  };

  // ♻️ Add trash
  const handleItemClick = async (item) => {
    if (!user) return alert("Please log in first!");

    const newTrash = {
      user_id: user.id,
      category: selectedCategory,
      item_name: item,
      points: points[item],
    };

    try {
      const res = await fetch("http://localhost/gc-clean-api/api/add_trash.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrash),
      });
      const data = await res.json();

      if (data.success) {
        fetchSubmittedTrash(user.id);
        setSelectedCategory(null);
        setShowCategory(false);
      } else {
        alert("Failed to submit trash.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ Edit submitted trash
  const handleEditTrash = async () => {
    try {
      const res = await fetch("http://localhost/gc-clean-api/api/update_trash.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTrash),
      });
      const data = await res.json();

      if (data.success) {
        setEditingTrash(null);
        fetchSubmittedTrash(user.id);
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error("Error updating trash:", err);
    }
  };

  // 🗑️ Delete trash
  const handleDeleteTrash = async (id) => {
    try {
      const res = await fetch("http://localhost/gc-clean-api/api/delete_trash.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        setSubmittedTrash(submittedTrash.filter((t) => t.id !== id));
        fetchSubmittedTrash(user.id);
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting trash:", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* 🧭 Top Nav */}
      <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 shadow-md flex justify-between items-center px-6">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-white" />
          <span className="font-semibold text-lg">gc-clean-api</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <a href="#" className="hover:underline">🏠 Home</a>
          <a href="#" className="hover:underline">🎁 Rewards</a>
          <a href="#" className="hover:underline">👤 Profile</a>
          <a href="/" className="hover:underline" onClick={() => localStorage.removeItem("user")}>
            🔓 Logout
          </a>
        </div>
      </nav>

      {/* 🧍‍♂️ Profile Card */}
      <div className="mt-20 bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-sm text-gray-500 font-medium mb-3">
            Profile
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{user?.first_name || "Guest"}</h2>
          <p className="text-gray-500 text-sm">{user?.email || "Not logged in"}</p>
          <p className="text-gray-600 text-sm mt-1">{user?.course || "—"}</p>

          {/* 🌱 Points */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl py-4 px-6 mt-6 shadow-md w-full">
            <p className="text-sm font-medium uppercase">Earned Points</p>
            <p className="text-3xl font-bold mt-1">{userPoints.toLocaleString()}</p>
          </div>

          {/* ♻️ Submit + View Buttons */}
          <div className="flex flex-col gap-3 mt-8 w-full">
            <button
              onClick={() => setShowCategory(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Submit Trash
            </button>

            <button
              onClick={() => {
                if (submittedTrash.length === 0) {
                  alert("No trash submitted yet.");
                } else {
                  const section = document.getElementById("submitted-trash");
                  section?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium shadow hover:bg-gray-300 transition"
            >
              View Submitted Trash ({submittedTrash.length})
            </button>
          </div>
        </div>
      </div>

      {/* 🧾 Submitted Trash List */}
      {submittedTrash.length > 0 && (
        <div id="submitted-trash" className="mt-10 bg-white shadow-lg rounded-2xl p-6 w-full max-w-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Submitted Trash</h2>
          <ul className="space-y-3">
            {submittedTrash.map((trash) => (
              <li key={trash.id} className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">
                    {trash.item_name} ({trash.category})
                  </p>
                  <p className="text-gray-500 text-xs">
                    +{trash.points} pts • {new Date(trash.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingTrash(trash)}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTrash(trash.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🧩 Category Modal */}
      {showCategory && !selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCategory(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Select Category</h2>
            {Object.keys(categories).map((cat) => (
              <button key={cat} className="block w-full mb-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={() => setSelectedCategory(cat)}>
                {cat}
              </button>
            ))}
            <button onClick={() => setShowCategory(false)} className="mt-2 text-sm text-gray-500 hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🧃 Item Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCategory(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Select {selectedCategory} Item</h2>
            {categories[selectedCategory].map((item) => (
              <button key={item} className="block w-full mb-2 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition" onClick={() => handleItemClick(item)}>
                {item}
              </button>
            ))}
            <button className="mt-2 text-sm text-gray-500 hover:underline" onClick={() => setSelectedCategory(null)}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* ✏️ Edit Trash Modal */}
      {editingTrash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditingTrash(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Edit Submitted Trash</h2>
            <input
              type="text"
              className="w-full p-2 border rounded mb-3"
              value={editingTrash.item_name}
              onChange={(e) => setEditingTrash({ ...editingTrash, item_name: e.target.value })}
            />
            <input
              type="number"
              className="w-full p-2 border rounded mb-3"
              value={editingTrash.points}
              onChange={(e) => setEditingTrash({ ...editingTrash, points: e.target.value })}
            />
            <button
              onClick={handleEditTrash}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
            >
              Save Changes
            </button>
            <button className="mt-2 text-sm text-gray-500 hover:underline" onClick={() => setEditingTrash(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
