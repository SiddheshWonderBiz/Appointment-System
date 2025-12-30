import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {user?.name}
        </h1>

        <p className="text-gray-600 mt-2">
          Role: <span className="font-medium">{user?.role}</span>
        </p>

        <div className="mt-6 flex gap-4">
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg" onClick={() => navigate('/create-appointment')}>
            
            Book Appointment
          </button>

          <button className="bg-gray-200 px-4 py-2 rounded-lg" onClick={() => navigate("/my-appointments")}>
            My Appointments
          </button>

          <button
            onClick={logout}
            className="ml-auto bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
