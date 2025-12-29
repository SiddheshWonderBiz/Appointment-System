import { useState } from "react";
import api from "../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

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

      alert("Registration successful");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-md border p-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Register
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Name */}
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
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={handleChange}
            value={form.name}
            maxLength={50}
            minLength={2}
            required
          />
        </div>

        {/* Email */}
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
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={handleChange}
            value={form.email}
            maxLength={50}
            minLength={5}
            required
          />
        </div>

        {/* Password (no counter usually) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full p-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onChange={handleChange}
            value={form.role}
          >
            <option value="CLIENT">Client</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
        </div>

        {/* Specialty */}
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
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleChange}
              value={form.specialty}
              maxLength={50}
              minLength={2}
              required
            />
          </div>
        )}

        {/* Login link */}
        <p className="text-sm text-gray-600 text-center mt-2 mb-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-emerald-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
