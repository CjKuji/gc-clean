"use client";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "",
    course: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();

    const res = await fetch("http://localhost/gc-clean-api/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message || "Registration complete");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-amber-50 to-white px-4">
      <div className="flex flex-col md:flex-row bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full">
        {/* LEFT */}
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
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            Register now and become part of the{" "}
            <span className="text-green-600 font-semibold">GC-Clean initiative</span>.
            Together, let’s build a greener and more sustainable campus community.
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold mb-4 text-center text-green-700">
            Create an Account
          </h2>
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="first_name"
                placeholder="First Name"
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                onChange={handleChange}
                required
              />
            </div>

            <input
              name="middle_initial"
              placeholder="Middle Initial"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              onChange={handleChange}
            />
            <input
              name="course"
              placeholder="Course"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-yellow-400 text-white font-semibold py-3 rounded-xl shadow-lg transition transform hover:scale-105 hover:opacity-95"
            >
              Register
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
