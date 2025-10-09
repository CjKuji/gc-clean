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

    const res = await fetch("http://localhost/gc-clean/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message || "Registration complete");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-50 to-white">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden max-w-5xl w-full">
        {/* LEFT */}
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
            Register now and become part of the{" "}
            <span className="text-green-600 font-semibold">GC-Clean initiative</span>.
            Together, let’s build a greener and more sustainable campus community.
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-4 text-center">Create an Account</h2>
          <form className="space-y-3" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="first_name"
                placeholder="First Name"
                className="p-3 border rounded-lg"
                onChange={handleChange}
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                className="p-3 border rounded-lg"
                onChange={handleChange}
                required
              />
            </div>
            <input
              name="middle_initial"
              placeholder="Middle Initial"
              className="p-3 border rounded-lg"
              onChange={handleChange}
            />
            <input
              name="course"
              placeholder="Course"
              className="p-3 border rounded-lg"
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              className="p-3 border rounded-lg"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="p-3 border rounded-lg"
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-yellow-400 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
            >
              Register
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
