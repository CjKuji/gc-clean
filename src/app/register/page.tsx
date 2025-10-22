"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "",
    department: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      minLength.test(password) &&
      upper.test(password) &&
      lower.test(password) &&
      number.test(password) &&
      special.test(password)
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("User ID not found after signup");

      // 2️⃣ Insert user metadata into profiles table (including email)
      const { error: dbError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_initial: formData.middle_initial,
        department: formData.department,
        email: formData.email,
        role: "user", // default role
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      alert(
        "Registration successful! Please check your email to confirm your account."
      );

      setFormData({
        first_name: "",
        last_name: "",
        middle_initial: "",
        department: "",
        email: "",
        password: "",
      });
    } catch (err: any) {
      console.error("Error registering user:", err);
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-amber-50 to-white px-4">
      <div className="flex flex-col md:flex-row bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full">
        {/* LEFT PANEL */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-100 to-amber-200 p-12 flex flex-col justify-center">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white font-bold rounded-xl w-14 h-14 flex items-center justify-center text-lg shadow-md">
              GC
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-green-800">Gordon College</h1>
              <p className="text-sm text-yellow-700 font-semibold mt-1">GC-Clean</p>
            </div>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed mt-2">
            Register now and become part of the{" "}
            <span className="text-green-700 font-semibold">GC-Clean initiative</span>.
            Together, let’s build a greener and more sustainable campus community.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold mb-6 text-center text-green-700">
            Create an Account
          </h2>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="first_name"
                placeholder="First Name"
                className={inputClass}
                onChange={handleChange}
                value={formData.first_name}
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                className={inputClass}
                onChange={handleChange}
                value={formData.last_name}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="middle_initial"
                placeholder="Middle Initial"
                className={inputClass}
                onChange={handleChange}
                value={formData.middle_initial}
              />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={`${inputClass} bg-white`}
              >
                <option value="" disabled>
                  Select Department
                </option>
                <option value="CCS">CCS</option>
                <option value="CBA">CBA</option>
                <option value="CHTM">CHTM</option>
                <option value="CEAS">CEAS</option>
                <option value="CAHS">CAHS</option>
              </select>
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email"
              className={inputClass}
              onChange={handleChange}
              value={formData.email}
              required
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={inputClass}
                onChange={handleChange}
                value={formData.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold py-3 rounded-xl shadow-lg transition transform hover:scale-105 hover:opacity-95"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
