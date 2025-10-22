"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TrashModalProps {
  onNew?: (newItem: any) => void;
  editData?: any;
  onClose?: () => void;
}

export default function TrashModal({ onNew, editData, onClose }: TrashModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    trashType: "",
    customTrashType: "",
    quantity: "",
    floor: "",
    room: "",
    time: "",
    photos: [] as File[],
    existingPhotos: [] as string[],
  });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400";

  // ✅ Populate form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        trashType: editData.trash_type === "Other" ? "Other" : editData.trash_type,
        customTrashType: editData.trash_type === "Other" ? editData.custom_type || "" : "",
        quantity: editData.quantity?.toString() || "",
        floor: editData.floor || "",
        room: editData.room || "",
        time: editData.time || "",
        photos: [],
        existingPhotos: editData.photo_urls || [],
      });
      setPhotoPreviews(editData.photo_urls || []);
      setIsOpen(true);
    }
  }, [editData]);

  // ✅ Clean up URLs on unmount
  useEffect(() => {
    return () => photoPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [photoPreviews]);

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "photos" && files) {
      const fileArray = Array.from(files).slice(0, 10);
      setFormData(prev => ({ ...prev, photos: fileArray }));
      setPhotoPreviews([
        ...formData.existingPhotos,
        ...fileArray.map(f => URL.createObjectURL(f)),
      ]);
    } else if (name === "quantity") {
      setFormData(prev => ({ ...prev, quantity: value.replace(/\D/g, "") }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Remove photo preview
  const handleRemovePhoto = (src: string) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter(url => url !== src),
    }));
    setPhotoPreviews(prev => prev.filter(url => url !== src));
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (
        !formData.trashType ||
        (formData.trashType === "Other" && !formData.customTrashType.trim()) ||
        !formData.floor ||
        !formData.room ||
        !formData.time ||
        !formData.quantity
      )
        throw new Error("Please fill in all required fields.");

      if (Number(formData.quantity) <= 0)
        throw new Error("Quantity must be greater than 0.");

      // ✅ Upload photos first
      const uploadedPhotoUrls: string[] = [...formData.existingPhotos];
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) throw new Error("User not authenticated.");

      for (const photo of formData.photos) {
        const safeName = photo.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\.-]/g, "");
        const filePath = `trash_photos/user-${userId}/${Date.now()}_${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("trash")
          .upload(filePath, photo, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("trash").getPublicUrl(filePath);
        if (!urlData?.publicUrl) throw new Error("Failed to get photo URL.");
        uploadedPhotoUrls.push(urlData.publicUrl);
      }

      // ✅ Build payload (must include user_id for RLS)
      const payload = {
        trash_type:
          formData.trashType === "Other"
            ? formData.customTrashType
            : formData.trashType,
        quantity: Number(formData.quantity),
        floor: formData.floor,
        room: formData.room,
        time: new Date(formData.time).toISOString(),
        photo_urls: uploadedPhotoUrls,
        user_id: userId, // required for RLS insert
      };

      let responseData;
      if (editData) {
        const { data, error: updateError } = await supabase
          .from("trash")
          .update(payload)
          .eq("id", editData.id)
          .eq("user_id", userId)
          .select()
          .single();
        if (updateError) throw updateError;
        responseData = data;
        alert("Trash updated successfully!");
      } else {
        const { data, error: insertError } = await supabase
          .from("trash")
          .insert([payload])
          .select()
          .single();
        if (insertError) throw insertError;
        responseData = data;
        alert("Trash submitted successfully!");
      }

      onNew?.(responseData);
      resetForm();
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit trash.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      trashType: "",
      customTrashType: "",
      quantity: "",
      floor: "",
      room: "",
      time: "",
      photos: [],
      existingPhotos: [],
    });
    setPhotoPreviews([]);
    setIsOpen(false);
    onClose?.();
  };

  return (
    <>
      {!editData && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
        >
          ➕ Submit Trash
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-white/40">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-green-700 mb-5 text-center">
              {editData ? "✏️ Edit Trash Report" : "♻ Submit Trash Report"}
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Trash Type */}
              <div className="space-y-2">
                <select
                  name="trashType"
                  value={formData.trashType}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select Trash Type
                  </option>
                  <option value="Plastic">Plastic</option>
                  <option value="Can">Can</option>
                  <option value="Waste">Waste</option>
                  <option value="Paper">Paper</option>
                  <option value="Other">Other</option>
                </select>

                {formData.trashType === "Other" && (
                  <input
                    name="customTrashType"
                    placeholder="Specify trash type"
                    className={inputClass}
                    value={formData.customTrashType}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              {/* Quantity */}
              <input
                name="quantity"
                type="number"
                min="1"
                placeholder="Quantity (e.g., 3)"
                className={inputClass}
                onChange={handleChange}
                value={formData.quantity}
                required
              />

              {/* Floor & Room */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="floor"
                  placeholder="Floor Number"
                  className={inputClass}
                  onChange={handleChange}
                  value={formData.floor}
                  required
                />
                <input
                  name="room"
                  placeholder="Room Number"
                  className={inputClass}
                  onChange={handleChange}
                  value={formData.room}
                  required
                />
              </div>

              {/* Date */}
              <input
                name="time"
                type="date"
                className={inputClass}
                onChange={handleChange}
                value={formData.time ? formData.time.split("T")[0] : ""}
                required
              />

              {/* Photos */}
              <label className="block">
                <span className="text-gray-700 font-medium mb-1 block">
                  📸 Upload Photos
                </span>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-xl p-3 cursor-pointer hover:bg-green-50 transition text-sm">
                  <span className="text-green-600 font-semibold">
                    Click to Upload (max 10)
                  </span>
                  <input
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="block w-full text-sm text-gray-500"
                  />
                </label>
              </label>

              {/* Preview */}
              {photoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {photoPreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src}
                        alt="preview"
                        className="h-16 w-16 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80"
                        onClick={() => window.open(src, "_blank")}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(src)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit only (no delete button) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold py-2.5 rounded-xl shadow-md hover:scale-[1.02] transition-all"
              >
                {loading
                  ? editData
                    ? "Updating..."
                    : "Submitting..."
                  : editData
                  ? "Update"
                  : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
