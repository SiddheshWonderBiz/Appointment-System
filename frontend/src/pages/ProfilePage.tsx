import { Mail, User, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock useAuth for demo - replace with your actual auth context
import { useAuth } from "../context/AuthContext";
const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
    user?.name || "user",
  )}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f172a] via-[#0b1220] to-gray-700 px-6 py-4 shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-sm">Back</span>
          </button>
          <h1 className="font-display text-3xl text-emerald-500 font-semibold">
            My Profile
          </h1>
          <p className="font-body text-primary-foreground/70 mt-2 text-emerald-300">
            Manage your account information
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <main className="max-w-4xl mx-auto px-6 -mt-8">
        <div
          className="bg-white dark:bg-zinc-900 rounded-2xl p-8 
                  shadow-xl shadow-black/10 dark:shadow-black/50 
                  ring-1 ring-zinc-200 dark:ring-zinc-800
                  animate-fade-in"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-full w-full rounded-full object-cover bg-zinc-200"
                />
              </div>

              <div
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full 
                        bg-emerald-500 flex items-center justify-center shadow-md"
              >
                <User className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.name}
            </h2>

            <span
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 
                       rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                       text-emerald-600 dark:text-emerald-400 text-sm font-medium"
            >
              <Shield className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>

          {/* Info Section */}
          <div className="pt-8 space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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
                       bg-zinc-50 dark:bg-zinc-800/60 
                       border border-zinc-200 dark:border-zinc-700
                       hover:shadow-md transition"
                >
                  <div
                    className="h-10 w-10 rounded-full bg-emerald-100 
                            dark:bg-emerald-900/40 
                            flex items-center justify-center"
                  >
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">{label}</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
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
