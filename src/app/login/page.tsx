"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    // Optional: store user in localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to home
    router.push("/home");
    setLoading(false);
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
            A comprehensive waste management app for Gordon College that helps track,
            manage, and optimize recycling programs while educating students about
            environmental responsibility.
          </p>
          <p className="mt-2 text-sm text-gray-800">
            Join our green initiative and{" "}
            <span className="text-green-700 font-semibold">earn rewards</span> for
            contributing to a cleaner campus environment.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-3 text-green-700">
            Welcome back
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Enter your credentials to access your account
          </p>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={inputClass + " pr-12"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold py-3 rounded-xl shadow-lg transition transform ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:opacity-95"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 mt-2">
              Don’t have an account?{" "}
              <Link href="/register" className="text-green-600 font-medium hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
