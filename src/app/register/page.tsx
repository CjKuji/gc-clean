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
      // Sign up user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("User ID not found after signup");

      // Insert profile data into 'profiles' table
      const { error: dbError } = await supabase.from("profiles").insert({
        id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_initial: formData.middle_initial,
        department: formData.department,
        email: formData.email,
        role: "user",
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
    "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-10">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl max-w-4xl w-full rounded-3xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SECTION */}
        <div className="w-full md:w-1/2 bg-blue-600 p-10 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Tracker</h1>
            <p className="opacity-90 text-sm mt-2">
              Efficient and accurate attendance monitoring for students and staff.
            </p>
          </div>

          <div className="mt-10">
            <p className="text-lg font-medium">Digital Attendance System</p>
            <p className="text-sm opacity-80 mt-1 leading-relaxed">
              Register now and gain access to our attendance monitoring portal.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
            Create Your Account
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center bg-red-100 py-2 rounded-lg">
              {error}
            </p>
          )}

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
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:scale-[1.02]"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
