import React, { useEffect } from "react";
import api from "../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.role === "CLIENT") navigate("/client");
    else if (user.role === "CONSULTANT") navigate("/consultant");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/login", { email, password });
      await refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-gray-700 text-white px-16 animate-fadeIn">
        <h1 className="text-4xl font-serif mb-4 text-emerald-400">
          AppointEase
        </h1>
        <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
          Manage consultations, schedules, and client interactions effortlessly
          with our secure and modern appointment platform.
        </p>

        <div className="mt-12 space-y-4 text-m text-gray-400">
          <p>✔ Secure authentication</p>
          <p>✔ Consultant & Client dashboards</p>
          <p>✔ Real-time scheduling</p>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="flex items-center justify-center px-4 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8 animate-slideUp"
        >
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Please sign in to your account
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* EMAIL */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition shadow-md"
          >
            Sign In
          </button>

          <p className="text-sm text-gray-600 text-center mt-8">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-emerald-600 hover:underline font-medium"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
