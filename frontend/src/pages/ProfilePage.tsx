import { Mail, User, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
    user?.name || "user"
  )}`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= HEADER ================= */}
      <header className="bg-gradient-to-r from-[#0f172a] via-[#0b1220] to-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-3xl font-semibold text-emerald-400">
            My Profile
          </h1>
          
        </div>
      </header>

      {/* ================= PROFILE CARD ================= */}
      <main className="max-w-4xl mx-auto px-6 -mt-10">
        <div
          className="bg-white rounded-2xl p-8
                     border border-slate-200
                     shadow-[0_20px_40px_rgba(15,23,42,0.25)]
                     animate-fade-in"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center pb-8 border-b border-slate-200">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-slate-100 p-1">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-full w-full rounded-full object-cover bg-slate-200"
                />
              </div>

              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full 
                              bg-emerald-500 flex items-center justify-center shadow">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-slate-900">
              {user?.name}
            </h2>

            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 
                             rounded-full bg-emerald-100 text-emerald-700 
                             text-sm font-medium">
              <Shield className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>

          {/* Info Section */}
          <div className="pt-8 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Account Information
            </h3>

            <div className="grid gap-4">
              {[
                { icon: User, label: "Full Name", value: user?.name },
                { icon: Mail, label: "Email Address", value: user?.email },
                { icon: Shield, label: "Account Role", value: user?.role },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-xl
                             bg-slate-50
                             border border-slate-200
                             hover:shadow-sm transition"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 
                                  flex items-center justify-center">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="font-medium text-slate-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
