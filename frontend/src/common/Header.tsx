import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogoClick = () => {
    if (!user) {
      navigate("/");
      return;
    }

    const redirectTo =
      location.state?.from?.pathname ||
      (user.role === "CLIENT" ? "/client" : "/consultant");

    navigate(redirectTo);
  };
  // Generate a random avatar if user.avatar not available
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
    user?.name || "user",
  )}`;

  return (
    <header className="bg-gradient-to-r from-[#0f172a] via-[#0b1220] to-gray-700 px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 hover:cursor-pointer" onClick={handleLogoClick}>
          <img
            src="/favicon.png"
            alt="AppointEase Logo"
            className="h-10 w-auto object-contain select-none"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Appoint<span className="text-emerald-500">Ease</span>
          </h1>
        </div>

        {/* User Info + Avatar */}
        <div className="flex items-center gap-4 relative">
          {user && (
            <>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-emerald-500 object-cover"
                />
              </div>

              {/* Optional small user info next to avatar */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-gray-200 text-sm font-medium">
                  {user.name}
                </span>
                <span className="text-gray-400 text-xs">{user.role}</span>
              </div>

              {/* Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-14 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
