import React from "react";
import api from "../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/login", {
        email,
        password,
      });
      alert("Login successful");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md min-h-[440px] rounded-xl shadow-md border p-6 flex flex-col justify-between"
      >
        {/* Top section */}
        <div>
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Login
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              minLength={5}
              maxLength={50}
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
                className="w-full p-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Signup link */}
          <p className="text-sm text-gray-600 text-center mt-20">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-emerald-600 hover:underline font-medium"
            >
              Register
            </button>
          </p>
        </div>

        {/* Bottom section */}
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition mt-6"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
