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
      const res = await fetch("http://localhost/gc-clean/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // 🧠 Save user info locally
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect to home page
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-50 to-white">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden max-w-5xl w-full">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-50 to-white p-10 flex flex-col justify-center">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-yellow-400 text-white font-bold rounded-xl w-12 h-12 flex items-center justify-center">
              GC
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-green-700">Gordon College</h1>
              <p className="text-sm text-yellow-600 font-semibold">GC-Clean</p>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            A comprehensive waste management app for Gordon College that helps track,
            manage, and optimize recycling programs while educating students about
            environmental responsibility.
          </p>

          <p className="mt-3 text-sm text-gray-700">
            Join our green initiative and{" "}
            <span className="text-yellow-600 font-semibold">earn rewards</span> for
            contributing to a cleaner campus environment.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center mb-2">Welcome back</h2>
          <p className="text-center text-gray-500 mb-6">
            Enter your credentials to access your account
          </p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
              className={`w-full bg-gradient-to-r from-green-500 to-yellow-400 text-white font-semibold py-3 rounded-lg shadow-md transition ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600">
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
