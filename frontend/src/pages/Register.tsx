import { useState } from "react";
import api from "../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
    specialty: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        specialty:
          form.role === "CONSULTANT" ? form.specialty : undefined,
      });

      toast.success("Registration successful");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      {/* LEFT BRAND PANEL */}
      <div
        className="hidden lg:flex flex-col justify-center
        bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-gray-700
        text-white px-16 animate-fadeIn"
      >
        <h1 className="text-4xl font-serif mb-4 text-emerald-400 drop-shadow-lg">
          AppointEase
        </h1>
        <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
          Join AppointEase and start managing appointments, clients,
          and consultations with ease.
        </p>

        <div className="mt-12 space-y-4 text-m text-gray-300">
          <p>✔ Quick & secure registration</p>
          <p>✔ Client & Consultant roles</p>
          <p>✔ Smart scheduling tools</p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex items-center justify-center px-4 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8 animate-slideUp"
        >
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            It only takes a minute
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* NAME */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                Name
              </label>
              <span className="text-xs text-gray-400">
                {form.name.length}/50
              </span>
            </div>
            <input
              name="name"
              placeholder="Enter your name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              onChange={handleChange}
              value={form.name}
              maxLength={50}
              minLength={2}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <span className="text-xs text-gray-400">
                {form.email.length}/50
              </span>
            </div>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              onChange={handleChange}
              value={form.email}
              maxLength={50}
              minLength={5}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                onChange={handleChange}
                value={form.password}
                minLength={6}
                maxLength={20}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          {/* ROLE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              onChange={handleChange}
              value={form.role}
            >
              <option value="CLIENT">Client</option>
              <option value="CONSULTANT">Consultant</option>
            </select>
          </div>

          {/* SPECIALTY */}
          {form.role === "CONSULTANT" && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Specialty
                </label>
                <span className="text-xs text-gray-400">
                  {form.specialty.length}/50
                </span>
              </div>
              <input
                name="specialty"
                placeholder="Enter your specialty"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                onChange={handleChange}
                value={form.specialty}
                maxLength={50}
                minLength={2}
                required
              />
            </div>
          )}

          {/* LOGIN LINK */}
          <p className="text-sm text-gray-600 text-center mt-6 mb-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-emerald-600 hover:underline font-medium"
            >
              Login
            </button>
          </p>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition shadow-md"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
