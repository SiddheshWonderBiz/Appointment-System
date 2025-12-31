import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, List, LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
    return (    
        <header className="bg-gradient-to-r from-[#0f172a] via-[#0b1220] to-gray-700 px-6 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-serif text-emerald-400">
            AppointEase
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-200 text-sm hidden sm:block">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>
    );
};

export default Header;