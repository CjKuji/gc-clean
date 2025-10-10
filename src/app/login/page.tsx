"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost/gc-clean-api/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/home");
      } else {
        alert(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-amber-50 to-white px-4">
      <div className="flex flex-col md:flex-row bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-50 to-white p-12 flex flex-col justify-center">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-yellow-400 text-white font-bold rounded-xl w-14 h-14 flex items-center justify-center text-lg shadow-md">
              GC
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-green-700">Gordon College</h1>
              <p className="text-sm text-yellow-600 font-semibold mt-1">GC-Clean</p>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            A comprehensive waste management app for Gordon College that helps track,
            manage, and optimize recycling programs while educating students about
            environmental responsibility.
          </p>

          <p className="mt-2 text-sm text-gray-800">
            Join our green initiative and{" "}
            <span className="text-yellow-600 font-semibold">earn rewards</span> for
            contributing to a cleaner campus environment.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-3 text-green-700">
            Welcome back
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Enter your credentials to access your account
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right text-sm">
              <a href="#" className="text-green-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-500 to-yellow-400 text-white font-semibold py-3 rounded-xl shadow-lg transition transform ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:opacity-95"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-green-600 font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
