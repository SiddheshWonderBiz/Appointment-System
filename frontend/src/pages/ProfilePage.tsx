import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  const avatarUrl = `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
    user?.name || "U",
  )}.svg`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md flex flex-col items-center">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="h-24 w-24 rounded-full border-2 border-emerald-500 object-cover"
        />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.name}</h2>
        <p className="text-gray-500">{user?.role}</p>

        {/* You can add more profile info here */}
        <div className="mt-6 w-full">
          <p className="text-gray-700 text-sm">
            Email: <span className="font-medium">{user?.email}</span>
          </p>
          {/* Add phone, bio, etc. */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
