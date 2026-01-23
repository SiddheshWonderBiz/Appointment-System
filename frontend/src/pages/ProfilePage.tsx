import { Mail, User, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock useAuth for demo - replace with your actual auth context
import { useAuth } from "../context/AuthContext";
const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
    user?.name || "user"
  )}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-corporate text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-sm">Back</span>
          </button>
          <h1 className="font-display text-3xl text-emerald-500 font-semibold">My Profile</h1>
          <p className="font-body text-primary-foreground/70 mt-2 text-emerald-300">
            Manage your account information
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <main className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="bg-card rounded-xl shadow-elevated p-8 animate-fade-in">
          {/* Avatar Section */}
          <div className="flex flex-col items-center pb-8 border-b border-border">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-accent/10 p-1">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-full w-full rounded-full bg-secondary object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <User className="h-4 w-4 text-accent-foreground " />
              </div>
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
              {user?.name}
            </h2>
            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <Shield className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>

          {/* Info Section */}
          <div className="pt-8 space-y-6">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Account Information
            </h3>

            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-body">Full Name</p>
                  <p className="font-medium text-foreground">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-body">Email Address</p>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-body">Account Role</p>
                  <p className="font-medium text-foreground">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
