import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-[#0f172a] via-[#0b1220] to-gray-700 px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="AppointEase Logo"
            className="h-10 w-auto object-contain select-none"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Appoint<span className="text-emerald-500">Ease</span>
          </h1>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-gray-200 text-sm font-medium">
                {user.name}
              </span>
              <span className="text-gray-400 text-xs">{user.role}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
